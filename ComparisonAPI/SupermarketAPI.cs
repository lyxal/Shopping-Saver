using System.Net;
using System.Net.Http;
using System.Text.Json;

static class SupermarketAPI
{

    static private string COLES_IMAGE_BASE = "https://cdn.productimages.coles.com.au/productimages";
    static private bool UseProductionMocks = false;

    static public void ConfigureProductionMocks(bool enabled)
    {
        UseProductionMocks = enabled;
        Console.WriteLine($"Supermarket scraping mode: {(UseProductionMocks ? "production demo mock data" : "live scraper")}");
    }

    static private CookieContainer GetWoolworthsCookies()
    {
        var cookies = new CookieContainer(); // These are the OUTPUT cookies.
        var handler = new HttpClientHandler(); // Cookieless because we need to capture the cookies from the initial request.
        var client = new HttpClient(handler);
        client.DefaultRequestHeaders.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:151.0) Gecko/20100101 Firefox/151.0");
        client.DefaultRequestHeaders.Add("Host", "www.woolworths.com.au");
        client.DefaultRequestHeaders.Add("Origin", "https://www.woolworths.com.au");
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
        if (UseProductionMocks)
        {
            return MockPriceFor("Woolworths", productLink, productID);
        }

        Console.WriteLine($"Fetching Woolworths price for {productLink}...");
        var cookies = GetWoolworthsCookies(); // Need to get cookies every time because they expire.
        var handler = new HttpClientHandler { CookieContainer = cookies };
        var client = new HttpClient(handler);

        client.DefaultRequestHeaders.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:151.0) Gecko/20100101 Firefox/151.0");
        client.DefaultRequestHeaders.Add("Host", "www.woolworths.com.au");
        client.DefaultRequestHeaders.Add("Origin", "https://www.woolworths.com.au");

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
        if (UseProductionMocks)
        {
            return MockPriceFor("Coles", productLink, productID);
        }

        var jsonResponse = ColesScraper.ExtractProductDataFor(productLink);
        var productInfo = (jsonResponse?["data"].GetProperty("productsInfo").GetProperty("results")[0]) ?? throw new InvalidOperationException("Product not found in Coles API response");
        var wasPrice = productInfo.GetProperty("pricing").GetProperty("was");
        // Sometimes, was is `null` (i.e. not currently on sale), so we need to handle that case.
        if (wasPrice.ValueKind == JsonValueKind.Null)
        {
            wasPrice = productInfo.GetProperty("pricing").GetProperty("now");
        }
        return new PricedProduct(
            ProductID: productID,
            Store: "Coles",
            NormalPrice: wasPrice.GetDecimal(),
            SalePrice: productInfo.GetProperty("pricing").GetProperty("now").GetDecimal(),
            LastChecked: DateTime.UtcNow,
            ProductLink: productLink
        );
    }

    static public FactProduct GetWoolworthsProductFor(string productLink, string productID)
    {
        if (UseProductionMocks)
        {
            return MockProductFor("Woolworths", productLink, productID);
        }

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
        return factProduct with { ProductID = productID, Link = productLink };
    }

    static public FactProduct GetColesProductFor(string productLink, string productID)
    {
        if (UseProductionMocks)
        {
            return MockProductFor("Coles", productLink, productID);
        }

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
        if (UseProductionMocks)
        {
            return MockSearchResults("Coles", query);
        }

        var BUILD_ID = ColesScraper.GetBuildID();
        var API_URL = $"https://www.coles.com.au/_next/data/{BUILD_ID}/en/search/products.json?q={Uri.EscapeDataString(query)}";
        var client = new HttpClient();
        client.DefaultRequestHeaders.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:151.0) Gecko/20100101 Firefox/151.0");
        client.DefaultRequestHeaders.Add("Host", "www.coles.com.au");
        client.DefaultRequestHeaders.Add("Origin", "https://www.coles.com.au");
        client.DefaultRequestHeaders.Add("Referer", "https://www.coles.com.au/shop/search/products?searchTerm=" + Uri.EscapeDataString(query));

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
        if (UseProductionMocks)
        {
            return MockSearchResults("Woolworths", query);
        }

        var cookies = GetWoolworthsCookies();
        var API_URL = "https://www.woolworths.com.au/apis/ui/Search/products";
        var client = new HttpClient(new HttpClientHandler { CookieContainer = cookies });

        client.DefaultRequestHeaders.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:151.0) Gecko/20100101 Firefox/151.0");
        client.DefaultRequestHeaders.Add("Host", "www.woolworths.com.au");
        client.DefaultRequestHeaders.Add("Origin", "https://www.woolworths.com.au");
        client.DefaultRequestHeaders.Add("Referer", "https://www.woolworths.com.au/shop/search/products?searchTerm=" + Uri.EscapeDataString(query));

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

    static private List<FactProduct> MockSearchResults(string store, string query)
    {
        var cleanQuery = CleanProductName(query);
        var random = new Random(StableSeed($"{store}:{cleanQuery}"));
        var resultCount = random.Next(4, 9);
        var results = new List<FactProduct>();
        var usedNames = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        for (var i = 0; i < resultCount; i++)
        {
            var name = BuildMockProductName(cleanQuery, store, random, i);
            while (!usedNames.Add(name))
            {
                name = BuildMockProductName(cleanQuery, store, random, i + usedNames.Count);
            }

            var link = BuildMockProductLink(store, cleanQuery, name, i);
            results.Add(new FactProduct(
                ProductID: "",
                Name: name,
                Store: store,
                Link: link,
                ImageLink: PlaceholderImageFor(cleanQuery)
            ));
        }

        return results;
    }

    static private FactProduct MockProductFor(string store, string productLink, string productID)
    {
        var name = QueryParameter(productLink, "name");
        var query = QueryParameter(productLink, "q");

        if (string.IsNullOrWhiteSpace(name))
        {
            name = CleanProductName(query);
        }

        if (string.IsNullOrWhiteSpace(name))
        {
            name = "Demo Product";
        }

        return new FactProduct(
            ProductID: productID,
            Name: name,
            Store: store,
            Link: productLink,
            ImageLink: PlaceholderImageFor(name)
        );
    }

    static private PricedProduct MockPriceFor(string store, string productLink, string productID)
    {
        var random = new Random(StableSeed($"{store}:{productLink}:{productID}"));
        var dollars = random.Next(2, 36);
        var cents = random.Next(0, 20) * 5;
        var normalPrice = dollars + cents / 100m;
        var hasSpecial = random.NextDouble() < 0.55;
        var discount = hasSpecial ? random.Next(5, 31) / 100m : 0m;
        var salePrice = Math.Max(0.50m, Math.Round(normalPrice * (1 - discount), 2));

        return new PricedProduct(
            ProductID: productID,
            Store: store,
            NormalPrice: normalPrice,
            SalePrice: salePrice,
            LastChecked: DateTime.UtcNow,
            ProductLink: productLink
        );
    }

    static private string BuildMockProductName(string query, string store, Random random, int index)
    {
        string[] descriptors =
        [
            "Classic",
            "Family Pack",
            "Organic",
            "No Added Sugar",
            "Australian",
            "Large-Sized",
            "Value Pack",
            "Premium",
            "Fresh",
            "Everyday"
        ];

        string[] sizes =
        [
            "350g",
            "500g",
            "750g",
            "1kg",
            "2L",
            "6 Pack",
            "12 Pack",
            "Large",
            "Twin Pack",
            "Mini"
        ];

        var descriptor = descriptors[(random.Next(descriptors.Length) + index) % descriptors.Length];
        var size = sizes[(random.Next(sizes.Length) + index) % sizes.Length];
        var storeBrand = store == "Coles" ? "Coles" : "Woolworths";

        if (index % 3 == 0)
        {
            return $"{storeBrand} {query} {size}";
        }

        if (index % 3 == 1)
        {
            return $"{descriptor} {query} {size}";
        }

        return $"{query} {descriptor} {size}";
    }

    static private string BuildMockProductLink(string store, string query, string name, int index)
    {
        var storePath = store.ToLowerInvariant();
        var slug = Slugify(name);
        return $"https://demo.shopping-saver.local/{storePath}/product/{slug}-{index + 1}?q={Uri.EscapeDataString(query)}&name={Uri.EscapeDataString(name)}";
    }

    static private string PlaceholderImageFor(string text)
    {
        var label = CleanProductName(text);
        return $"https://placehold.co/80x80?text={Uri.EscapeDataString(label)}";
    }

    static private string CleanProductName(string value)
    {
        var cleaned = string.Join(" ", (value ?? "").Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries));
        if (string.IsNullOrWhiteSpace(cleaned))
        {
            return "Demo Product";
        }

        return char.ToUpperInvariant(cleaned[0]) + cleaned[1..];
    }

    static private string QueryParameter(string url, string parameterName)
    {
        if (!Uri.TryCreate(url, UriKind.Absolute, out var uri))
        {
            return "";
        }

        var query = uri.Query.TrimStart('?').Split('&', StringSplitOptions.RemoveEmptyEntries);
        foreach (var part in query)
        {
            var keyValue = part.Split('=', 2);
            if (keyValue.Length == 2 && keyValue[0] == parameterName)
            {
                return Uri.UnescapeDataString(keyValue[1].Replace("+", " "));
            }
        }

        return "";
    }

    static private string Slugify(string value)
    {
        var chars = value.ToLowerInvariant()
            .Select(c => char.IsLetterOrDigit(c) ? c : '-')
            .ToArray();
        var slug = string.Join("-", new string(chars).Split('-', StringSplitOptions.RemoveEmptyEntries));
        return string.IsNullOrWhiteSpace(slug) ? "demo-product" : slug;
    }

    static private int StableSeed(string value)
    {
        unchecked
        {
            var hash = 23;
            foreach (var character in value)
            {
                hash = hash * 31 + character;
            }

            return hash;
        }
    }
}
