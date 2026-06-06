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

record ProductInfo(string ProductName, string ProductImage, decimal CurrentPrice, decimal SalePrice);

ProductInfo? GetProductFromWoolworthsURL(string url)
{
    // Mock implementation for development
    return new ProductInfo("Woolies Mock Product", "https://example.com/woolies-mock.jpg", 5.00m, 4.00m);
}

ProductInfo? GetProductFromColesURL(string url)
{
    // Mock implementation for development
    return new ProductInfo("Coles Mock Product", "https://example.com/coles-mock.jpg", 5.50m, 4.50m);
}

IEnumerable<ProductInfo> SearchWoolworths(string name)
{
    return new List<ProductInfo>
    {
        new ProductInfo(name, "https://example.com/w.jpg", 10.00m, 8.00m),
        new ProductInfo(name + " alt", "https://example.com/w2.jpg", 15.00m, 12.00m)
    };
}

IEnumerable<ProductInfo> SearchColes(string name)
{
    return new List<ProductInfo>
    {
        new ProductInfo(name, "https://example.com/c.jpg", 9.50m, 8.50m),
        new ProductInfo(name + " alt", "https://example.com/c2.jpg", 14.50m, 11.50m)
    };
}

ProductInfo? GetProductFromWoolworthsName(string name)
{
    var results = SearchWoolworths(name);
    return results.FirstOrDefault(p => p.ProductName.Equals(name, StringComparison.OrdinalIgnoreCase));
}

ProductInfo? GetProductFromColesName(string name)
{
    var results = SearchColes(name);
    return results.FirstOrDefault(p => p.ProductName.Equals(name, StringComparison.OrdinalIgnoreCase));
}
