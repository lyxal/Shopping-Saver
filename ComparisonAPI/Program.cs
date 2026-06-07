using System.Text.Json;
using MongoDB.Driver;
using MongoDB.Bson;
using Microsoft.AspNetCore.Mvc;

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

app.Run();
