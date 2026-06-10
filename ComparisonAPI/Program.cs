using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using MongoDB.Bson.Serialization.Serializers;
using MongoDB.Driver;


HashSet<string> SupportedStores = ["Woolworths", "Coles"];

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var config = new ConfigurationBuilder()
    .AddUserSecrets<Program>()
    .Build();

BsonSerializer.RegisterSerializer(new DateTimeSerializer(DateTimeKind.Utc));

var connectionUri = config["MongoDB:ConnectionString"];

var settings = MongoClientSettings.FromConnectionString(connectionUri);
settings.ServerApi = new ServerApi(ServerApiVersion.V1);

var client = new MongoClient(settings);

// Ping the database to ensure a connection is established before handling requests.
try
{
    client.GetDatabase("admin").RunCommand<BsonDocument>(new BsonDocument { { "ping", 1 } });
    Console.WriteLine("Successfully connected to MongoDB.");
}
catch (Exception ex)
{
    Console.WriteLine($"Error connecting to MongoDB: {ex.Message}");
    throw; // Re-throw the exception to prevent the application from starting without a database connection.
}

var usersDb = new UsersDatabase(client);
var listsDb = new ListsDatabase(client);
var factProductsDb = new FactProductsDatabase(client);
var pricedProductsDb = new PricedProductsDatabase(client);

builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.PropertyNamingPolicy = null;
});

var app = builder.Build();
app.UseCors("AllowAll");
app.UseHttpsRedirection();

app.MapGet("/", () => "I think you meant to call an API route.");

app.MapPost("/signin", async (SigninRequest request) =>
{
    var userID = usersDb.UserIDFromEmail(request.Email);
    return Results.Ok(new { UserID = userID });
});

app.MapPost("/createlist", async (CreateListRequest request) =>
{
    var listID = listsDb.CreateList(request.UserID, request.ListName);
    return Results.Ok(new { ListID = listID });
});

app.MapGet("/getlist/{userID}/{listID}", async (string userID, string listID) =>
{
    var productIDs = listsDb.GetListForUser(userID, listID);
    if (productIDs == null) { return Results.BadRequest("List not found."); }
    return Results.Ok(factProductsDb.GetProductsByIDs(productIDs));
});

app.MapPost("/addProductFromLink", async ([FromBody] AddProductLinkRequest request) =>
{
    var links = request.ProductLinks;
    FactProduct woolworthsProduct;
    FactProduct colesProduct;

    links.TryGetValue("Woolworths", out string? wLink);
    links.TryGetValue("Coles", out string? cLink);

    // Make sure that both links definitely map to a FactProduct,
    // and then get the product IDs of both products.

    if (wLink != null && cLink != null)
    {
        // We know both links, so just ensure the fact products exist.
        woolworthsProduct = factProductsDb.GetOrFetchFromWoolworthsLink(wLink);
        colesProduct = factProductsDb.GetOrFetchFromColesLink(cLink);
    }
    else if (wLink != null)
    {
        // Only know woolworths link, so ensure the woolworths product, and then
        // use its name to find the coles link and product.
        woolworthsProduct = factProductsDb.GetOrFetchFromWoolworthsLink(wLink);
        var potentialColesProducts = SupermarketAPI.SearchColes(woolworthsProduct.Name);
        if (potentialColesProducts.Count != 1) return Results.Ok(new
        {
            Success = false,
            Message = "Multiple or no products found for the given Woolworths product name. Please refine your search.",
            ColesOptions = potentialColesProducts.Select(p => new { p.Name, p.Link })
        });
        colesProduct = factProductsDb.GetOrFetchFromColesLink(potentialColesProducts.First().Link);
    }
    else if (cLink != null)
    {
        // Only know coles link, so ensure the coles product, and then
        // use its name to find the woolworths link and product.
        colesProduct = factProductsDb.GetOrFetchFromColesLink(cLink);
        var potentialWoolworthsProducts = SupermarketAPI.SearchWoolworths(colesProduct.Name);
        if (potentialWoolworthsProducts.Count != 1) return Results.Ok(new
        {
            Success = false,
            Message = "Multiple or no products found for the given Coles product name. Please refine your search.",
            WoolworthsOptions = potentialWoolworthsProducts.Select(p => new { p.Name, p.Link })
        });
        woolworthsProduct = factProductsDb.GetOrFetchFromWoolworthsLink(potentialWoolworthsProducts.First().Link);
    }
    else
    {
        return Results.BadRequest("No product links provided.");
    }

    listsDb.AddComparisonToList(request.UserID, request.ListID, colesProduct, woolworthsProduct);

    return Results.Ok(new { Success = true, Message = "Product added successfully." });
});

app.MapPost("/addProductFromName", async (AddProductNameRequest request) =>
{
    var names = request.ProductNames;
    FactProduct woolworthsProduct;
    FactProduct colesProduct;

    names.TryGetValue("Woolworths", out string? wName);
    names.TryGetValue("Coles", out string? cName);

    // Similar logic to the /addProductFromLink endpoint, but with product names instead of links.

    if (wName != null && cName != null)
    {
        var potentialWoolworthsProducts = SupermarketAPI.SearchWoolworths(wName);
        var potentialColesProducts = SupermarketAPI.SearchColes(cName);

        if (potentialColesProducts.Count != 1 || potentialWoolworthsProducts.Count != 1)
        {
            return Results.Ok(
                new
                {
                    Success = false,
                    Message = "Multiple or no products found for the given names. Please refine your search.",
                    WoolworthsOptions = potentialWoolworthsProducts.Select(p => new { p.Name, p.Link }),
                    ColesOptions = potentialColesProducts.Select(p => new { p.Name, p.Link })
                }
            );
        }


        woolworthsProduct = factProductsDb.GetOrFetchFromWoolworthsLink(potentialWoolworthsProducts.First().Link);
        colesProduct = factProductsDb.GetOrFetchFromColesLink(potentialColesProducts.First().Link);
    }
    else if (wName != null)
    {
        var potentialWoolworthsProducts = SupermarketAPI.SearchWoolworths(wName);
        if (potentialWoolworthsProducts.Count != 1)
        {
            return Results.Ok(
                new
                {
                    Success = false,
                    Message = "Multiple or no products found for the given Woolworths name. Please refine your search.",
                    WoolworthsOptions = potentialWoolworthsProducts.Select(p => new { p.Name, p.Link })
                }
            );
        }
        woolworthsProduct = factProductsDb.GetOrFetchFromWoolworthsLink(potentialWoolworthsProducts.First().Link);
        var potentialColesProducts = SupermarketAPI.SearchColes(woolworthsProduct.Name);
        if (potentialColesProducts.Count != 1)
        {
            return Results.Ok(
                new
                {
                    Success = false,
                    Message = "Multiple or no products found for the given Coles name. Please refine your search.",
                    ColesOptions = potentialColesProducts.Select(p => new { p.Name, p.Link })
                }
            );
        }
        colesProduct = factProductsDb.GetOrFetchFromColesLink(potentialColesProducts.First().Link);
    }
    else if (cName != null)
    {
        var potentialColesProducts = SupermarketAPI.SearchColes(cName);
        if (potentialColesProducts.Count != 1)
        {
            return Results.Ok(
                new
                {
                    Success = false,
                    Message = "Multiple or no products found for the given Coles name. Please refine your search.",
                    ColesOptions = potentialColesProducts.Select(p => new { p.Name, p.Link })
                }
            );
        }
        colesProduct = factProductsDb.GetOrFetchFromColesLink(potentialColesProducts.First().Link);
        var potentialWoolworthsProducts = SupermarketAPI.SearchWoolworths(colesProduct.Name);
        if (potentialWoolworthsProducts.Count != 1)
        {
            return Results.Ok(
                new
                {
                    Success = false,
                    Message = "Multiple or no products found for the given Woolworths name. Please refine your search.",
                    WoolworthsOptions = potentialWoolworthsProducts.Select(p => new { p.Name, p.Link })
                }
            );
        }
        woolworthsProduct = factProductsDb.GetOrFetchFromWoolworthsLink(potentialWoolworthsProducts.First().Link);
    }
    else
    {
        return Results.BadRequest("No product names provided.");
    }

    listsDb.AddComparisonToList(request.UserID, request.ListID, colesProduct, woolworthsProduct);

    return Results.Ok(new { Success = true, Message = "Product added successfully." });
});

app.MapPost("/removeProduct", async (RemoveProductRequest request) =>
{
    listsDb.RemoveComparisonFromList(request.UserID, request.ListID, request.ProductID);
    return Results.Ok(new { Message = "Product removed successfully." });
});

app.MapGet("/getLists/{userID}", async (string userID) =>
{
    return Results.Ok(listsDb.GetListsForUser(userID));
});

// The big one - this is the meat of the application.
app.MapPost("/compare", async (CompareRequest request) =>
{
    var list = listsDb.GetListForUser(request.UserID, request.ListID);
    if (list == null) return Results.Problem("List not found.");

    var factProducts = factProductsDb.GetProductsByIDs(list);

    var flatProducts = factProducts.SelectMany(p => new[] { p.Woolworths, p.Coles }).ToList();
    var flatProductHashmap = flatProducts.ToDictionary(p => p.ProductID, p => p);
    Dictionary<string, PricedProduct> prices = pricedProductsDb.GetPricesForProducts(flatProducts);

    // Technically a list of (PricedProduct|FactProduct). `object` because C#
    // doesn't have union types.
    List<object> needingRescrape = [];
    DateTime nextWednesday = SupermarketAPI.GetNextWednesday();

    // Add to rescrape all products in prices which haven't been checked since the last price update.
    foreach (var kvp in prices)
    {
        if (kvp.Value.LastChecked < nextWednesday)
        {
            needingRescrape.Add(kvp.Value);
        }

        // Remove this product from the hashset, so that at the end of this loop the hashset only contains products which aren't in the database at all.
        flatProductHashmap.Remove(kvp.Key);
    }

    // Add to rescrape all products which aren't in the database at all.
    foreach (var kvp in flatProductHashmap)
    {
        needingRescrape.Add(kvp.Value);
    }

    // Now, rescrape all products which need it, and update the database with the new prices.
    // Also update the local `prices` variable.
    foreach (var product in needingRescrape)
    {
        switch (product)
        {
            case FactProduct p when p.Store == "Woolworths":
                var woolworthsPrice = SupermarketAPI.GetWoolworthsPriceFor(p.Link, p.ProductID);
                pricedProductsDb.UpsertPrice(woolworthsPrice);
                prices[p.ProductID] = woolworthsPrice;
                break;
            case FactProduct p when p.Store == "Coles":
                var colesPrice = SupermarketAPI.GetColesPriceFor(p.Link, p.ProductID);
                pricedProductsDb.UpsertPrice(colesPrice);
                prices[p.ProductID] = colesPrice;
                break;
            case PricedProduct p when p.Store == "Woolworths":
                var updatedWoolworthsPrice = SupermarketAPI.GetWoolworthsPriceFor(p.ProductLink, p.ProductID);
                pricedProductsDb.UpsertPrice(updatedWoolworthsPrice);
                prices[p.ProductID] = updatedWoolworthsPrice;
                break;
            case PricedProduct p when p.Store == "Coles":
                var updatedColesPrice = SupermarketAPI.GetColesPriceFor(p.ProductLink, p.ProductID);
                pricedProductsDb.UpsertPrice(updatedColesPrice);
                prices[p.ProductID] = updatedColesPrice;
                break;
        }
    }

    // Now for the actual comparing! 217 lines and we're finally at the whole point of this
    // entire application.

    var totalNormalPrice = new Dictionary<string, decimal>
    {
        { "Woolworths", 0m },
        { "Coles", 0m }
     };

    var totalSalePrice = new Dictionary<string, decimal>
    {
        { "Woolworths", 0m },
        { "Coles", 0m }
    };

    var totalSavings = new Dictionary<string, decimal>
    {
        { "Woolworths", 0m },
        { "Coles", 0m }
    };

    var comparisons = new List<ProductComparison>();

    foreach (var comparison in factProducts)
    {
        var woolworthsPrice = prices[comparison.Woolworths.ProductID];
        var colesPrice = prices[comparison.Coles.ProductID];

        comparisons.Add(new ProductComparison(
            comparison.Woolworths,
            woolworthsPrice,
            comparison.Coles,
            colesPrice,
            Math.Abs(woolworthsPrice.SalePrice - colesPrice.SalePrice),
            (woolworthsPrice.SalePrice - colesPrice.SalePrice) / Math.Max(woolworthsPrice.SalePrice, colesPrice.SalePrice) * 100,
            woolworthsPrice.SalePrice < colesPrice.SalePrice ? "Woolworths" : "Coles"
        ));

        totalNormalPrice["Woolworths"] += woolworthsPrice.NormalPrice;
        totalNormalPrice["Coles"] += colesPrice.NormalPrice;

        totalSalePrice["Woolworths"] += woolworthsPrice.SalePrice;
        totalSalePrice["Coles"] += colesPrice.SalePrice;

        totalSavings["Woolworths"] += woolworthsPrice.NormalPrice - woolworthsPrice.SalePrice;
        totalSavings["Coles"] += colesPrice.NormalPrice - colesPrice.SalePrice;
    }

    return Results.Ok(new
    {
        Comparisons = comparisons,
        TotalNormalPrice = totalNormalPrice,
        TotalSalePrice = totalSalePrice,
        TotalSavings = totalSavings,
        CheaperStore = totalSalePrice["Woolworths"] < totalSalePrice["Coles"] ? "Woolworths" : "Coles"
    });

});

app.MapPost("/testScrapeW", async (JsonElement body) =>
{
    var link = body.GetProperty("link").GetString()!;
    var price = SupermarketAPI.GetWoolworthsPriceFor(link, "test");
    return Results.Ok(price);
});

app.MapPost("/testScrapeC", async (JsonElement body) =>
{
    var link = body.GetProperty("link").GetString()!;
    var price = SupermarketAPI.GetColesPriceFor(link, "test");
    return Results.Ok(price);
});

app.MapPost("/testSearchC", async (JsonElement body) =>
{
    var query = body.GetProperty("query").GetString()!;
    var results = SupermarketAPI.SearchColes(query);
    return Results.Ok(new { Products = results });
});

app.MapPost("/testSearchW", async (JsonElement body) =>
{
    var query = body.GetProperty("query").GetString()!;
    var results = SupermarketAPI.SearchWoolworths(query);
    return Results.Ok(new { Products = results });
});


app.Use(async (context, next) =>
{
    context.Request.EnableBuffering();
    var body = await new StreamReader(context.Request.Body).ReadToEndAsync();
    context.Request.Body.Position = 0;
    Console.WriteLine($"Request path: {context.Request.Path}");
    Console.WriteLine($"Raw body: {body}");

    try
    {
        await next();
    }
    catch (BadHttpRequestException ex) when (ex.StatusCode == 400)
    {
        Console.WriteLine($"Bad request: {ex.Message}");
        context.Response.StatusCode = 400;
        await context.Response.WriteAsJsonAsync(new { error = ex.Message });
    }
});
app.Run();
