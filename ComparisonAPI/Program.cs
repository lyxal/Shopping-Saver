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
    return Results.Ok("Hello World!");
})
.WithName("Index");


// Receive an incoming `{key: value}` json body and store it in Redis.
app.MapPost("/set-key", async (IConnectionMultiplexer redis, [FromBody] Dictionary<string, string> keyValuePairs) =>
{
    var db = redis.GetDatabase();
    Console.WriteLine("Received key-value pairs:");
    Console.WriteLine(JsonSerializer.Serialize(keyValuePairs, new JsonSerializerOptions { WriteIndented = true }));
    foreach (var kvp in keyValuePairs)
    {
        await db.StringSetAsync("goofy:" + kvp.Key, kvp.Value);
    }
    return Results.Ok("Keys set successfully");
}).WithName("SetKey");


app.MapGet("/get-the-whole-database", async (IConnectionMultiplexer redis) =>
{
    var db = redis.GetDatabase();
    var server = redis.GetServer(redis.GetEndPoints().First());
    var keys = server.Keys().ToArray();

    var result = new Dictionary<string, string>();
    foreach (var key in keys)
    {
        var value = await db.StringGetAsync(key);
        result[key] = value;
    }

    return Results.Ok(result);
}).WithName("GetWholeDatabase");

app.Run();

record Product(string ProductID, string StoreID, decimal Was, decimal Now, decimal Diff, DateTime DateLastChecked);