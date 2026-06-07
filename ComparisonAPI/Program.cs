using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

var builder = WebApplication.CreateBuilder(args);

var config = new ConfigurationBuilder()
    .AddUserSecrets<Program>()
    .Build();

var connectionUri = config["MongoDB:ConnectionString"];

var settings = MongoClientSettings.FromConnectionString(connectionUri);
settings.ServerApi = new ServerApi(ServerApiVersion.V1);

var client = new MongoClient(settings);

var usersDb = new UsersDatabase(client);
var listsDb = new ListsDatabase(client);

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
    var list = listsDb.GetListForUser(userID, listID);
    if (list != null)
    {
        return Results.Ok(list);
    }
    else
    {
        return Results.NotFound();
    }
});

app.MapPost("/addProductFromLink", async ([FromBody] AddProductLinkRequest request) =>
{
    if (request.ProductLinks == null || request.ProductLinks.Count == 0)
    {
        return Results.BadRequest(new { Message = "ProductLinks list cannot be empty." });
    }
    if (request.ProductLinks.Count == 1)
    {
        if (request.ProductLinks[0].ContainsKey("Woolworths"))
        {
            var products = ProductHelpers.GetProductsFromOnlyWoolworthsLink(request.ProductLinks[0]["Woolworths"]);
            // Add products.Item1 and products.Item2 to the list in the database, handling nulls appropriately.
        }
        else if (request.ProductLinks[0].ContainsKey("Coles"))
        {
            var products = ProductHelpers.GetProductsFromOnlyColesLink(request.ProductLinks[0]["Coles"]);
            // Add products.Item1 and products.Item2 to the list in the database, handling nulls appropriately.
        }
        else
        {
            return Results.BadRequest(new { Message = "Unsupported store link. Only Woolworths and Coles links are supported." });
        }
    }
    else
    {
        // The best case - we have both links, so we can be confident in our product matching
        // TODO: Cache based on link. Like (url -> product info)
        var woolworthsLink = request.ProductLinks[0].ContainsKey("Woolworths") ? request.ProductLinks[0]["Woolworths"] : request.ProductLinks[1]["Woolworths"];
        var colesLink = request.ProductLinks[0].ContainsKey("Coles") ? request.ProductLinks[0]["Coles"] : request.ProductLinks[1]["Coles"];
        var productsFromWoolworthsLink = ProductHelpers.GetProductFromWoolworthsURL(woolworthsLink);
        var productsFromColesLink = ProductHelpers.GetProductFromColesURL(colesLink);
        // If both are null, we have a problem - return an error                
    }
    return Results.Ok(new { Message = "This endpoint is a placeholder and does not yet have functionality." });
});

app.MapPost("/addProductFromName", async (AddProductNameRequest request) =>
{
    return Results.Ok(new { Message = "This endpoint is a placeholder and does not yet have functionality." });
});

app.MapGet("/getLists/{userID}", async (string userID) =>
{
    return Results.Ok(listsDb.GetListsForUser(userID));
});

// The big one - this is the meat of the application.
app.MapPost("/compare", async (CompareRequest request) =>
{
    return Results.Ok(new { Message = "This endpoint is a placeholder and does not yet have functionality." });
});

app.Use(async (context, next) =>
{
    context.Request.EnableBuffering();
    var body = await new StreamReader(context.Request.Body).ReadToEndAsync();
    context.Request.Body.Position = 0;
    Console.WriteLine($"Raw body: {body}");
    await next();
});

app.Run();
