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
        var filter = Builders<BsonDocument>.Filter.Eq("email", email);
        var userDoc = _usersCollection.Find(filter).FirstOrDefault();
        if (userDoc != null && userDoc.Contains("userID"))
        {
            return userDoc["userID"].AsString;
        }
        else
        {
            // Create new user
            var newUserID = Guid.NewGuid().ToString();
            var newUserDoc = new BsonDocument
            {
                { "email", email },
                { "userID", newUserID }
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
            { "userID", userID },
            { "listName", listName },
            { "listID", newListID },
            { "products", new BsonArray() }
        };
        _listsCollection.InsertOne(newListDoc);
        return newListID;
    }

    public List<FactProductPair>? GetListForUser(string userID, string listID)
    {
        var filter = Builders<BsonDocument>.Filter.Eq("userID", userID) & Builders<BsonDocument>.Filter.Eq("listID", listID);
        var listDoc = _listsCollection.Find(filter).FirstOrDefault();

        if (listDoc == null)
        {
            return null;
        }

        var products = new List<FactProductPair>();
        foreach (var productDoc in listDoc["products"].AsBsonArray)
        {
            var woolworthsProductDoc = productDoc["woolworths"].AsBsonDocument;
            var colesProductDoc = productDoc["coles"].AsBsonDocument;

            var woolworthsProduct = new FactProduct(
                woolworthsProductDoc["productID"].AsString,
                woolworthsProductDoc["name"].AsString,
                woolworthsProductDoc["store"].AsString,
                woolworthsProductDoc["link"].AsString,
                woolworthsProductDoc["imageLink"].AsString
            );

            var colesProduct = new FactProduct(
                colesProductDoc["productID"].AsString,
                colesProductDoc["name"].AsString,
                colesProductDoc["store"].AsString,
                colesProductDoc["link"].AsString,
                colesProductDoc["imageLink"].AsString
            );

            products.Add(new FactProductPair(woolworthsProduct, colesProduct));
        }
        return products;
    }

    public void AddComparisonToList(string userID, string listID, FactProduct colesProduct, FactProduct woolworthsProduct)
    {
        var filter = Builders<BsonDocument>.Filter.Eq("userID", userID) & Builders<BsonDocument>.Filter.Eq("listID", listID);
        var update = Builders<BsonDocument>.Update.Push("products", new BsonDocument
        {
            { "woolworths", new BsonDocument
                {
                    { "productID", woolworthsProduct.ProductID },
                    { "name", woolworthsProduct.Name },
                    { "store", woolworthsProduct.Store },
                    { "link", woolworthsProduct.Link },
                    { "imageLink", woolworthsProduct.ImageLink }
                }
            },
            { "coles", new BsonDocument
                {
                    { "productID", colesProduct.ProductID },
                    { "name", colesProduct.Name },
                    { "store", colesProduct.Store },
                    { "link", colesProduct.Link },
                    { "imageLink", colesProduct.ImageLink }
                }
            }
        });
        _listsCollection.UpdateOne(filter, update);
    }

    public List<String> GetListsForUser(string userID)
    {
        var filter = Builders<BsonDocument>.Filter.Eq("userID", userID);
        var listDocs = _listsCollection.Find(filter).ToList();
        return listDocs.Select(doc => doc["listID"].AsString).ToList();
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
                productDoc["productID"].AsString,
                productDoc["name"].AsString,
                productDoc["store"].AsString,
                productDoc["link"].AsString,
                productDoc["imageLink"].AsString
            );
        }
        else
        {
            return SupermarketAPI.GetWoolworthsProductFor(productLink);
        }
    }

    public FactProduct GetOrFetchFromColesLink(string productLink)
    {
        var filter = Builders<BsonDocument>.Filter.Eq("link", productLink);
        var productDoc = _productsCollection.Find(filter).FirstOrDefault();
        if (productDoc != null)
        {
            return new FactProduct(
                productDoc["productID"].AsString,
                productDoc["name"].AsString,
                productDoc["store"].AsString,
                productDoc["link"].AsString,
                productDoc["imageLink"].AsString
            );
        }
        else
        {
            return SupermarketAPI.GetColesProductFor(productLink);
        }
    }


}