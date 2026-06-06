using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using StackExchange.Redis;


var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSingleton<IConnectionMultiplexer>(
    ConnectionMultiplexer.Connect(builder.Configuration["Redis"]!));

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.MapGet("/", () =>
{
    return Results.Ok("There's a 67% chance you meant to use the API. Maybe go do that.");
})
.WithName("Index");


app.MapPost("/addProductFromLink", async (AddProductLinkRequest req, IConnectionMultiplexer redis) =>
{
    var db = redis.GetDatabase();
    var userid = req.UserID;
    if (string.IsNullOrEmpty(userid))
    {
        return Results.BadRequest("UserID is required.");
    }
    var listid = req.ListID;
    if (string.IsNullOrEmpty(listid))
    {
        return Results.BadRequest("ListID is required.");
    }
    if (db.StringGet($"lists:{userid}:{listid}") == RedisValue.Null)
    {
        return Results.BadRequest("List does not exist for user.");
    }
    return Results.Ok("This endpoint is not implemented yet, but the request was valid. Here's what we got: " + JsonSerializer.Serialize(req));
}).WithName("AddProductFromLink");

app.MapPost("/newListForUser", async (String userID, IConnectionMultiplexer redis) =>
{

}).WithName("Create new list for user");

app.Run();
