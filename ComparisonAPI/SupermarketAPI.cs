using System.Net;
using System.Net.Http;
using System.Text.Json;

static class SupermarketAPI
{

    static private string COLES_IMAGE_BASE = "https://cdn.productimages.coles.com.au/productimages";
    static private CookieContainer GetWoolworthsCookies()
    {
        var cookies = new CookieContainer(); // These are the OUTPUT cookies.
        var handler = new HttpClientHandler(); // Cookieless because we need to capture the cookies from the initial request.
        var client = new HttpClient(handler);
        var response = client.GetAsync("https://woolworths.com.au");
        response.Wait();
        var setCookieHeaders = response.Result.Headers.GetValues("Set-Cookie");
        foreach (var header in setCookieHeaders)
        {
            cookies.SetCookies(new Uri("https://woolworths.com.au"), header);
        }
        return cookies;
    }
    static public PricedProduct GetWoolworthsPriceFor(string productLink, string productID)
    {
        var cookies = GetWoolworthsCookies(); // Need to get cookies every time because they expire.
        var handler = new HttpClientHandler { CookieContainer = cookies };
        var client = new HttpClient(handler);

        var productPageResponse = client.GetAsync(productLink);
        productPageResponse.Wait();

        if (!productPageResponse.Result.IsSuccessStatusCode)
        {
            throw new InvalidOperationException($"Failed to fetch product page: {productPageResponse.Result.StatusCode}");
        }


        // Extract the HTML content from the response
        var htmlTask = productPageResponse.Result.Content.ReadAsStringAsync();
        htmlTask.Wait();
        var htmlContent = htmlTask.Result;
        // Parse the HTML content to extract the product price
        var pricedProduct = WoolworthsScraper.ExtractPricedProduct(htmlContent);
        return pricedProduct with { ProductID = productID, ProductLink = productLink };
    }

    static public PricedProduct GetColesPriceFor(string productLink, string productID)
    {
        var jsonResponse = ColesScraper.ExtractProductDataFor(productLink);
        var productInfo = (jsonResponse?["data"].GetProperty("productsInfo").GetProperty("results")[0]) ?? throw new InvalidOperationException("Product not found in Coles API response");
        return new PricedProduct(
            ProductID: productID,
            Store: "Coles",
            NormalPrice: productInfo.GetProperty("pricing").GetProperty("was").GetDecimal(),
            SalePrice: productInfo.GetProperty("pricing").GetProperty("now").GetDecimal(),
            LastChecked: DateTime.UtcNow,
            ProductLink: productLink
        );
    }

    static public FactProduct GetWoolworthsProductFor(string productLink, string productID)
    {
        var cookies = GetWoolworthsCookies();
        var handler = new HttpClientHandler { CookieContainer = cookies };
        var client = new HttpClient(handler);
        var productPageResponse = client.GetAsync(productLink);
        productPageResponse.Wait();
        if (!productPageResponse.Result.IsSuccessStatusCode)
        {
            throw new InvalidOperationException($"Failed to fetch product page: {productPageResponse.Result.StatusCode}");
        }
        var htmlTask = productPageResponse.Result.Content.ReadAsStringAsync();
        htmlTask.Wait();
        var htmlContent = htmlTask.Result;
        var factProduct = WoolworthsScraper.ExtractFactProduct(htmlContent);
        return factProduct with { ProductID = productID };
    }

    static public FactProduct GetColesProductFor(string productLink, string productID)
    {
        var jsonResponse = ColesScraper.ExtractProductDataFor(productLink);
        var productInfo = (jsonResponse?["data"].GetProperty("productsInfo").GetProperty("results")[0]) ?? throw new InvalidOperationException("Product not found in Coles API response");
        var id = productID;
        var name = productInfo.GetProperty("brand").GetString() + " " + productInfo.GetProperty("name").GetString() + " | " + productInfo.GetProperty("size").GetString() ?? "Unknown Product";
        var link = "https://www.coles.com.au/product/" + productInfo.GetProperty("id").GetInt32().ToString();
        var image = COLES_IMAGE_BASE + productInfo.GetProperty("imageUris").EnumerateArray().FirstOrDefault().GetProperty("uri").GetString();
        return new FactProduct(id, name, "Coles", link, image);
    }

    static public DateTime GetNextWednesday()
    {
        // Coles and Woolworths both update their prices on Wednesdays, so this helper
        // function determines when the next price update will be. Obviously helpful
        // for determining if a rescrape is needed.
        var today = DateTime.Today;
        int daysUntilWednesday = ((int)DayOfWeek.Wednesday - (int)today.DayOfWeek + 7) % 7;
        return today.AddDays(daysUntilWednesday);
    }

    static public List<FactProduct> SearchColes(string query)
    {
        var API_URL = $"https://www.coles.com.au/_next/data/20260528.5-2fe21bafe8ec119eaa36ff296d6f5b95a2f6e138/en/search/products.json?q={Uri.EscapeDataString(query)}";
        var client = new HttpClient();
        client.DefaultRequestHeaders.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:151.0) Gecko/20100101 Firefox/151.0");

        var response = client.GetAsync(API_URL);
        var rawResponse = response.Result.Content.ReadAsStringAsync().Result;
        var jsonResponse = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(rawResponse) ?? throw new InvalidOperationException("Failed to parse Coles search response");
        var products = jsonResponse["pageProps"].GetProperty("searchResults").GetProperty("results").EnumerateArray();
        var results = new List<FactProduct>();
        foreach (var product in products)
        {
            if (product.GetProperty("_type").GetString() != "PRODUCT") continue; // The search results can contain non-product items like ads
            var id = "";
            var name = product.GetProperty("brand").GetString() + " " + product.GetProperty("name").GetString() + " | " + product.GetProperty("size").GetString() ?? "Unknown Product";
            var link = "https://www.coles.com.au/product/" + product.GetProperty("id").GetInt32().ToString();
            var image = COLES_IMAGE_BASE + product.GetProperty("imageUris").EnumerateArray().FirstOrDefault().GetProperty("uri").GetString();
            results.Add(new FactProduct(id, name, "Coles", link, image));
        }
        return results;
    }

    static public List<FactProduct> SearchWoolworths(string query)
    {
        var cookies = GetWoolworthsCookies();
        var API_URL = "https://www.woolworths.com.au/apis/ui/Search/products";
        var client = new HttpClient(new HttpClientHandler { CookieContainer = cookies });

        client.DefaultRequestHeaders.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:151.0) Gecko/20100101 Firefox/151.0");

        var payload = new
        {
            EnableAdReRanking = false,
            ExcludeSearchTypes = new[] { "UntraceableVendors" },
            Filters = new object[] { },
            GpBoost = 0,
            IsHideEverydayMarketProducts = false,
            IsHideUnavailableProducts = false,
            IsRegisteredRewardCardPromotion = false,
            IsSpecial = false,
            Location = "/shop/search/products?searchTerm=milk",
            PageNumber = 1,
            PageSize = 36,
            SearchTerm = query,
            SortType = "TraderRelevance"
        };

        var json = JsonSerializer.Serialize(payload);
        var content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");
        var response = client.PostAsync(API_URL, content);
        var rawResponse = response.Result.Content.ReadAsStringAsync().Result;
        var jsonResponse = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(rawResponse) ?? throw new InvalidOperationException("Failed to parse Woolworths search response");
        List<FactProduct> results = new List<FactProduct>();

        foreach (var product in jsonResponse["Products"].EnumerateArray())
        {
            var productInfo = product.GetProperty("Products").EnumerateArray().First();
            var id = ""; // This id is the product ID in our database. needs to be set later.
            var name = product.GetProperty("DisplayName").GetString() ?? "Unknown Product";
            var link = "https://www.woolworths.com.au/shop/productdetails/" + productInfo.GetProperty("Stockcode").GetInt32().ToString();
            var image = productInfo.GetProperty("MediumImageFile").GetString()!;
            results.Add(new FactProduct(id, name, "Woolworths", link, image));
        }
        return results;
    }
}