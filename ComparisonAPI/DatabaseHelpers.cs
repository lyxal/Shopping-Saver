using MongoDB.Bson;
using MongoDB.Driver;

public class UsersDatabase
{
    private readonly MongoClient _client;
    private readonly IMongoDatabase _database;
    private readonly IMongoCollection<BsonDocument> _usersCollection;
    public UsersDatabase(MongoClient client)
    {
        _client = client;
        _database = _client.GetDatabase("Users");
        _usersCollection = _database.GetCollection<BsonDocument>("users");
    }

    public string UserIDFromEmail(string email)
    {
        var filter = Builders<BsonDocument>.Filter.Eq("Email", email);
        var userDoc = _usersCollection.Find(filter).FirstOrDefault();
        if (userDoc != null && userDoc.Contains("UserID"))
        {
            return userDoc["UserID"].AsString;
        }
        else
        {
            // Create new user
            var newUserID = Guid.NewGuid().ToString();
            var newUserDoc = new BsonDocument
            {
                { "Email", email },
                { "UserID", newUserID }
            };
            _usersCollection.InsertOne(newUserDoc);
            return newUserID;
        }
    }
}

public class ListsDatabase
{
    // In this system, a user's product list is always product facts.
    // The comparison endpoint will get pricing from the PricedProducts collection.
    // Lists thus do not need to store pricing information. In fact, it would be
    // incorrect to store pricing in the user lists - that would lead to stale data and incorrect comparisons.
    private readonly MongoClient _client;
    private readonly IMongoDatabase _database;
    private readonly IMongoCollection<BsonDocument> _listsCollection;
    public ListsDatabase(MongoClient client)
    {
        _client = client;
        _database = _client.GetDatabase("Lists");
        _listsCollection = _database.GetCollection<BsonDocument>("lists");
    }

    public string CreateList(string userID, string listName)
    {
        var newListID = Guid.NewGuid().ToString();
        var newListDoc = new BsonDocument
        {
            { "UserID", userID },
            { "ListName", listName },
            { "ListID", newListID },
            { "Products", new BsonArray() }
        };
        _listsCollection.InsertOne(newListDoc);
        return newListID;
    }

    public List<FactProductPair>? GetListForUser(string userID, string listID)
    {
        var filter = Builders<BsonDocument>.Filter.Eq("UserID", userID) & Builders<BsonDocument>.Filter.Eq("ListID", listID);
        var listDoc = _listsCollection.Find(filter).FirstOrDefault();

        if (listDoc == null)
        {
            return null;
        }

        /*
        There is a problem here: I need the API to return a list of FactProduct items.
        But this class only ever has access to product IDs. I can return a list of
        product IDs, but something still needs to take those product IDs and
        transform them. That is for another day. This function will thus not
        return anything so that it registers as a compile error and something that I need
        to look at before continuing any further. Okay thank you, have good day.
        */
    }

    public void AddComparisonToList(string userID, string listID, FactProduct colesProduct, FactProduct woolworthsProduct)
    {
        var filter = Builders<BsonDocument>.Filter.Eq("UserID", userID) & Builders<BsonDocument>.Filter.Eq("ListID", listID);
        var update = Builders<BsonDocument>.Update.Push("Products", new BsonDocument
        {
            {"Coles", colesProduct.ProductID},
            {"Woolworths", woolworthsProduct.ProductID}
        });
        _listsCollection.UpdateOne(filter, update);
    }

    public List<Dictionary<string, string>> GetListsForUser(string userID)
    {

        var filter = Builders<BsonDocument>.Filter.Eq("UserID", userID);
        var listDocs = _listsCollection.Find(filter).ToList();
        return [.. listDocs.Select(doc => new Dictionary<string, string>
        {
            { "ListID", doc["ListID"].AsString },
            { "ListName", doc["ListName"].AsString }
        })];
    }
}

public class FactProductsDatabase
{
    private readonly MongoClient _client;
    private readonly IMongoDatabase _database;
    private readonly IMongoCollection<BsonDocument> _productsCollection;
    public FactProductsDatabase(MongoClient client)
    {
        _client = client;
        _database = _client.GetDatabase("Products");
        _productsCollection = _database.GetCollection<BsonDocument>("factProducts");
    }

    public FactProduct GetOrFetchFromWoolworthsLink(string productLink)
    {
        var filter = Builders<BsonDocument>.Filter.Eq("link", productLink);
        var productDoc = _productsCollection.Find(filter).FirstOrDefault();
        if (productDoc != null)
        {
            return new FactProduct(
                productDoc["ProductID"].AsString,
                productDoc["Name"].AsString,
                productDoc["Store"].AsString,
                productDoc["Link"].AsString,
                productDoc["ImageLink"].AsString
            );
        }
        else
        {
            var woolworthsProduct = SupermarketAPI.GetWoolworthsProductFor(productLink);
            _productsCollection.InsertOne(new BsonDocument
            {
                { "ProductID", woolworthsProduct.ProductID },
                { "Name", woolworthsProduct.Name },
                { "Store", woolworthsProduct.Store },
                { "Link", woolworthsProduct.Link },
                { "ImageLink", woolworthsProduct.ImageLink }
            });
            return woolworthsProduct;
        }
    }

    public FactProduct GetOrFetchFromColesLink(string productLink)
    {
        var filter = Builders<BsonDocument>.Filter.Eq("Link", productLink);
        var productDoc = _productsCollection.Find(filter).FirstOrDefault();
        if (productDoc != null)
        {
            return new FactProduct(
                productDoc["ProductID"].AsString,
                productDoc["Name"].AsString,
                productDoc["Store"].AsString,
                productDoc["Link"].AsString,
                productDoc["ImageLink"].AsString
            );
        }
        else
        {
            var colesProduct = SupermarketAPI.GetColesProductFor(productLink);
            _productsCollection.InsertOne(new BsonDocument
            {
                { "ProductID", colesProduct.ProductID },
                { "Name", colesProduct.Name },
                { "Store", colesProduct.Store },
                { "Link", colesProduct.Link },
                { "ImageLink", colesProduct.ImageLink }
            });
            return colesProduct;
        }
    }


}

public class PricedProductsDatabase
{
    private readonly MongoClient _client;
    private readonly IMongoDatabase _database;
    private readonly IMongoCollection<BsonDocument> _productsCollection;
    public PricedProductsDatabase(MongoClient client)
    {
        _client = client;
        _database = _client.GetDatabase("Products");
        _productsCollection = _database.GetCollection<BsonDocument>("pricedProducts");
    }

    public Dictionary<string, PricedProduct> GetPricesForProducts(List<FactProduct> productIDs)
    {
        var filter = Builders<BsonDocument>.Filter.In("ProductID", productIDs.Select(p => p.ProductID));
        var productDocs = _productsCollection.Find(filter).ToList();
        var prices = new Dictionary<string, PricedProduct>();
        foreach (var productDoc in productDocs)
        {
            var pricedProduct = new PricedProduct(
                productDoc["ProductID"].AsString,
                productDoc["Store"].AsString,
                productDoc["NormalPrice"].AsDecimal,
                productDoc["SalePrice"].AsDecimal,
                productDoc["LastChecked"].ToUniversalTime(),
                productDoc["ProductLink"].AsString
            );
            prices[pricedProduct.ProductID] = pricedProduct;
        }
        return prices;
    }

    public void UpsertPrice(PricedProduct pricedProduct)
    {
        var filter = Builders<BsonDocument>.Filter.Eq("ProductID", pricedProduct.ProductID);
        var update = Builders<BsonDocument>.Update
            .Set("Store", pricedProduct.Store)
            .Set("NormalPrice", pricedProduct.NormalPrice)
            .Set("SalePrice", pricedProduct.SalePrice)
            .Set("LastChecked", pricedProduct.LastChecked)
            .Set("ProductLink", pricedProduct.ProductLink);
        _productsCollection.UpdateOne(filter, update, new UpdateOptions { IsUpsert = true });
    }
}