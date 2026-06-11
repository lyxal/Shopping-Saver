using System.Text.Json;
using Microsoft.Playwright;

public static class ColesScraper
{

  public static string GetBuildID()
  {
    return GetBuildIDAsync().GetAwaiter().GetResult();
  }

  private static async Task<string> GetBuildIDAsync()
  {
    // This is a two-step process.
    // 1. Load coles.com.au with JavaScript active to get the script tag which references a script which contains the build ID in its file.
    // This will be from `<script src="/_next/static/chunks/pages/_app-<SOMEID>.js" defer=""></script>`
    // 2. Fetch that script to extract the build ID from the filename.
    // Looking for `console.log("Build ID","<buildID>)`

    // This is crucial because it defines where you find the search API endpoint.

    using var playwright = await Playwright.CreateAsync();
    await using var browser = await playwright.Chromium.LaunchAsync(new BrowserTypeLaunchOptions
    {
      Headless = true
    });
    await using var context = await browser.NewContextAsync(new BrowserNewContextOptions
    {
      UserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:151.0) Gecko/20100101 Firefox/151.0"
    });

    var page = await context.NewPageAsync();
    var response = await page.GotoAsync("https://www.coles.com.au/", new PageGotoOptions
    {
      WaitUntil = WaitUntilState.Load,
      Timeout = 60000
    });

    if (response == null || !response.Ok)
      throw new InvalidOperationException($"Failed to fetch Coles homepage: {response?.StatusText ?? "No response"}");

    var scriptSources = await page.Locator("script[src]").EvaluateAllAsync<string[]>(
      "scripts => scripts.map(script => script.getAttribute('src')).filter(Boolean)"
    );
    var scriptURL = scriptSources.FirstOrDefault(src =>
      src.Contains("/_next/static/chunks/pages/_app-") && src.EndsWith(".js")
    );

    if (scriptURL == null)
      throw new InvalidOperationException("Failed to find Coles _app script on homepage");

    var absoluteScriptURL = new Uri(new Uri("https://www.coles.com.au/"), scriptURL).ToString();
    Console.WriteLine($"Extracted script URL: {absoluteScriptURL}");

    var scriptResponse = await context.APIRequest.GetAsync(absoluteScriptURL);
    if (!scriptResponse.Ok)
      throw new InvalidOperationException($"Failed to fetch Coles _app script: {scriptResponse.Status} {scriptResponse.StatusText}");

    var rawScriptResponse = await scriptResponse.TextAsync();
    if (!rawScriptResponse.Contains("console.log(\"Build ID\",\""))
      throw new InvalidOperationException("Failed to find build ID in script response");
    var buildIDStart = rawScriptResponse.IndexOf("console.log(\"Build ID\",\"") + "console.log(\"Build ID\",\"".Length;
    Console.WriteLine($"Raw script response length: {rawScriptResponse.Length}");
    Console.WriteLine($"Index of 'console.log(\"Build ID\",\"': {rawScriptResponse.IndexOf("console.log(\"Build ID\",\"")}");
    var buildIDEnd = rawScriptResponse.IndexOf("\")", buildIDStart);
    Console.WriteLine($"Start index of build ID in script: {buildIDStart}, End index: {buildIDEnd}");
    var buildID = rawScriptResponse[buildIDStart..buildIDEnd];
    Console.WriteLine($"Extracted Coles build ID: {buildID}");
    return buildID;
  }
  public static Dictionary<string, JsonElement> ExtractProductDataFor(string colesProductUrl)
  {
    var colesProductID = colesProductUrl.Split("/").Last().Split('-').Last(); // Coles product links end with the product ID, so we can extract it from the link.
    Console.WriteLine($"Extracted Coles product ID: {colesProductID} from link: {colesProductUrl}");
    var apiURL = "https://www.coles.com.au/api/graphql";

    var payload = new
    {
      query = @"query GetProductsInfo($productIds: [String!]!, $brandedStoreId: BrandedId!, $shoppingMethod: ShoppingMethod, $filters: ProductsInfoFilters) {
  productsInfo(
    productIds: $productIds
    brandedStoreId: $brandedStoreId
    shoppingMethod: $shoppingMethod
    filters: $filters
  ) {
    count: noOfResults
    invalidProductIds: invalidProducts
    results {
      ...productsInfoFields
    }
  }
}

fragment productsInfoFields on InfoProduct {
  id
  name
  brand
  description
  internalDescription
  size
  imageUris {
    altText
    type
    uri
  }
  restrictions {
    retailLimit
    promotionalLimit
    liquorAgeRestrictionFlag
    tobaccoAgeRestrictionFlag
    delivery
    restrictedByOrganisation
  }
  continuity {
    continuityPromotionId
    creditsToRedeem
    bonusAvailable
    bonusTimes
    bonusPromoName
    bonusRoundelDisplayable
    bonusRoundelDescription
  }
  collectableCampaign
  lastUpdated
  availability
  availabilityType
  availabilityStatus
  merchandiseHeir {
    tradeProfitCentre
    categoryGroup
    category
    subCategory
    className
  }
  onlineHeirs {
    aisle
    category
    subCategory
    categoryId
    aisleId
    subCategoryId
  }
  pricing {
    now
    was
    saveAmount
    saveStatement
    unit {
      quantity
      ofMeasureQuantity
      ofMeasureUnits
      price
      ofMeasureType
      isWeighted
      isIncremental
    }
    comparable
    promotionType
    onlineSpecial
    multiBuyPromotion {
      type
      id
      minQuantity
      reward
      unitPriceDisplay
      instruction
    }
    priceDescription
    savePercent
    specialType
    offerDescription
  }
  minGuarantee
}",
      variables = new
      {
        productIds = new[] { colesProductID },
        brandedStoreId = "COL:7674",
        filters = new
        {
          availability = true,
          hasPricing = true
        }
      },
      operationName = "GetProductsInfo"
    };

    var json = JsonSerializer.Serialize(payload);
    var content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");
    var client = new HttpClient();
    client.DefaultRequestHeaders.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:151.0) Gecko/20100101 Firefox/151.0");
    client.DefaultRequestHeaders.Add("ocp-apim-subscription-key", "eae83861d1cd4de6bb9cd8a2cd6f041e");
    var response = client.PostAsync(apiURL, content);
    response.Wait();

    if (!response.Result.IsSuccessStatusCode)
    {
      throw new InvalidOperationException($"Failed to fetch product info: {response.Result.StatusCode}");
    }

    var rawResponse = response.Result.Content.ReadAsStringAsync().Result;
    return JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(rawResponse) ?? throw new InvalidOperationException("Failed to parse product info response");
  }
}
