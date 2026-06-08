using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using MongoDB.Bson.Serialization.Serializers;
using MongoDB.Driver;


HashSet<string> SupportedStores = ["Woolworths", "Coles"];

var builder = WebApplication.CreateBuilder(args);

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

var app = builder.Build();
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
    return Results.Ok(listsDb.GetListForUser(userID, listID));
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
        var colesLink = SupermarketAPI.FindProductByNameAtColes(woolworthsProduct.Name);
        if (colesLink == null) return Results.Problem("Could not find product at Coles.");
        colesProduct = factProductsDb.GetOrFetchFromColesLink(colesLink);

    }
    else if (cLink != null)
    {
        // Only know coles link, so ensure the coles product, and then
        // use its name to find the woolworths link and product.
        colesProduct = factProductsDb.GetOrFetchFromColesLink(cLink);
        var woolworthsLink = SupermarketAPI.FindProductByNameAtWoolworths(colesProduct.Name);
        if (woolworthsLink == null) return Results.Problem("Could not find product at Woolworths.");
        woolworthsProduct = factProductsDb.GetOrFetchFromWoolworthsLink(woolworthsLink);
    }
    else
    {
        return Results.BadRequest("No product links provided.");
    }

    listsDb.AddComparisonToList(request.UserID, request.ListID, colesProduct, woolworthsProduct);

    return Results.Ok(new { Message = "Product added successfully." });
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
        woolworthsProduct = factProductsDb.GetOrFetchFromWoolworthsLink(SupermarketAPI.FindProductByNameAtWoolworths(wName) ?? "");
        colesProduct = factProductsDb.GetOrFetchFromColesLink(SupermarketAPI.FindProductByNameAtColes(cName) ?? "");
    }
    else if (wName != null)
    {
        woolworthsProduct = factProductsDb.GetOrFetchFromWoolworthsLink(SupermarketAPI.FindProductByNameAtWoolworths(wName) ?? "");
        var colesLink = SupermarketAPI.FindProductByNameAtColes(woolworthsProduct.Name);
        if (colesLink == null) return Results.Problem("Could not find product at Coles.");
        colesProduct = factProductsDb.GetOrFetchFromColesLink(colesLink);
    }
    else if (cName != null)
    {
        colesProduct = factProductsDb.GetOrFetchFromColesLink(SupermarketAPI.FindProductByNameAtColes(cName) ?? "");
        var woolworthsLink = SupermarketAPI.FindProductByNameAtWoolworths(colesProduct.Name);
        if (woolworthsLink == null) return Results.Problem("Could not find product at Woolworths.");
        woolworthsProduct = factProductsDb.GetOrFetchFromWoolworthsLink(woolworthsLink);
    }
    else
    {
        return Results.BadRequest("No product names provided.");
    }

    listsDb.AddComparisonToList(request.UserID, request.ListID, colesProduct, woolworthsProduct);

    return Results.Ok(new { Message = "Product added successfully." });
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
    return Results.Ok(new { Message = "This endpoint is a placeholder and does not yet have functionality." });
});

app.Use(async (context, next) =>
{
    context.Request.EnableBuffering();
    var body = await new StreamReader(context.Request.Body).ReadToEndAsync();
    context.Request.Body.Position = 0;
    Console.WriteLine($"Raw body: {body}");

    try
    {
        await next();
    }
    catch (BadHttpRequestException ex) when (ex.StatusCode == 400)
    {
        context.Response.StatusCode = 400;
        await context.Response.WriteAsJsonAsync(new { error = ex.Message });
    }
});
app.Run();
