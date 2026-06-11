using System.Text.Json;
using Microsoft.Playwright;

public static class ColesScraper
{
  private const string BuildIDMarker = "console.log(\"Build ID\",\"";
  private static readonly SemaphoreSlim BuildCacheLock = new(1, 1);
  private static readonly HttpClient ColesScriptClient = CreateColesScriptClient();
  private static ColesBuildCache? InMemoryBuildCache;

  private record ColesBuildCache(string? BuildID, string AppScriptURL);

  public static string GetBuildID()
  {
    return GetBuildIDAsync().GetAwaiter().GetResult();
  }

  private static async Task<string> GetBuildIDAsync()
  {
    await BuildCacheLock.WaitAsync();
    try
    {
      var cachedBuild = LoadBuildCache();
      if (cachedBuild != null)
      {
        var cachedBuildID = await TryFetchBuildIDFromScriptAsync(cachedBuild.AppScriptURL);
        if (cachedBuildID != null)
        {
          SaveBuildCache(cachedBuild with { BuildID = cachedBuildID });
          Console.WriteLine($"Using cached Coles _app script URL: {cachedBuild.AppScriptURL}");
          return cachedBuildID;
        }

        Console.WriteLine("Cached Coles _app script URL failed. Scraping homepage with Playwright.");
      }
      else
      {
        Console.WriteLine("No Coles build cache found. Scraping homepage with Playwright.");
      }

      var scrapedBuild = await ScrapeBuildCacheWithPlaywrightAsync();
      SaveBuildCache(scrapedBuild);
      return scrapedBuild.BuildID ?? throw new InvalidOperationException("Failed to scrape Coles build ID");
    }
    finally
    {
      BuildCacheLock.Release();
    }
  }

  private static async Task<ColesBuildCache> ScrapeBuildCacheWithPlaywrightAsync()
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
    {
      Console.WriteLine("Failed to find Coles _app script on homepage. Scraped HTML:");
      var htmlContent = await page.ContentAsync();
      Console.WriteLine(htmlContent);
      throw new InvalidOperationException("Failed to find Coles _app script on homepage");
    }

    var absoluteScriptURL = new Uri(new Uri("https://www.coles.com.au/"), scriptURL).ToString();
    Console.WriteLine($"Extracted script URL: {absoluteScriptURL}");

    var scriptResponse = await context.APIRequest.GetAsync(absoluteScriptURL);
    if (!scriptResponse.Ok)
      throw new InvalidOperationException($"Failed to fetch Coles _app script: {scriptResponse.Status} {scriptResponse.StatusText}");

    var rawScriptResponse = await scriptResponse.TextAsync();
    var buildID = ExtractBuildIDFromScript(rawScriptResponse);
    Console.WriteLine($"Raw script response length: {rawScriptResponse.Length}");
    Console.WriteLine($"Extracted Coles build ID: {buildID}");
    return new ColesBuildCache(buildID, absoluteScriptURL);
  }

  private static async Task<string?> TryFetchBuildIDFromScriptAsync(string scriptURL)
  {
    try
    {
      using var response = await ColesScriptClient.GetAsync(scriptURL);
      if (!response.IsSuccessStatusCode)
      {
        Console.WriteLine($"Cached Coles _app script returned {(int)response.StatusCode} {response.ReasonPhrase}: {scriptURL}");
        return null;
      }

      var rawScriptResponse = await response.Content.ReadAsStringAsync();
      return ExtractBuildIDFromScript(rawScriptResponse);
    }
    catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException or InvalidOperationException)
    {
      Console.WriteLine($"Cached Coles _app script could not be used: {ex.Message}");
      return null;
    }
  }

  private static string ExtractBuildIDFromScript(string rawScriptResponse)
  {
    var buildIDStart = rawScriptResponse.IndexOf(BuildIDMarker, StringComparison.Ordinal);
    if (buildIDStart < 0)
      throw new InvalidOperationException("Failed to find build ID in script response");

    buildIDStart += BuildIDMarker.Length;
    var buildIDEnd = rawScriptResponse.IndexOf("\")", buildIDStart, StringComparison.Ordinal);
    if (buildIDEnd < 0)
      throw new InvalidOperationException("Failed to find end of build ID in script response");

    return rawScriptResponse[buildIDStart..buildIDEnd];
  }

  private static ColesBuildCache? LoadBuildCache()
  {
    if (InMemoryBuildCache != null)
      return InMemoryBuildCache;

    var cachePath = GetBuildCachePath();
    if (!File.Exists(cachePath))
      return null;

    try
    {
      var rawCache = File.ReadAllText(cachePath);
      InMemoryBuildCache = JsonSerializer.Deserialize<ColesBuildCache>(rawCache);
      return InMemoryBuildCache;
    }
    catch (Exception ex) when (ex is IOException or JsonException or UnauthorizedAccessException)
    {
      Console.WriteLine($"Failed to read Coles build cache: {ex.Message}");
      return null;
    }
  }

  private static void SaveBuildCache(ColesBuildCache cache)
  {
    InMemoryBuildCache = cache;

    var cachePath = GetBuildCachePath();
    try
    {
      Directory.CreateDirectory(Path.GetDirectoryName(cachePath)!);
      File.WriteAllText(cachePath, JsonSerializer.Serialize(cache));
    }
    catch (Exception ex) when (ex is IOException or UnauthorizedAccessException)
    {
      Console.WriteLine($"Failed to save Coles build cache: {ex.Message}");
    }
  }

  private static string GetBuildCachePath()
  {
    var localAppData = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
    if (string.IsNullOrWhiteSpace(localAppData))
      localAppData = AppContext.BaseDirectory;

    return Path.Combine(localAppData, "ComparisonAPI", "coles-build-cache.json");
  }

  private static HttpClient CreateColesScriptClient()
  {
    var client = new HttpClient
    {
      Timeout = TimeSpan.FromSeconds(30)
    };
    client.DefaultRequestHeaders.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:151.0) Gecko/20100101 Firefox/151.0");
    client.DefaultRequestHeaders.Add("Host", "www.coles.com.au");
    client.DefaultRequestHeaders.Add("Origin", "https://www.coles.com.au");
    return client;
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
