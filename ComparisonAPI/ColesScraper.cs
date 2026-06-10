using System.Text.Json;

public static class ColesScraper
{
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