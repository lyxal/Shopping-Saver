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

    public UserProductList? GetListForUser(string userID, string listID)
    {
        var filter = Builders<BsonDocument>.Filter.Eq("userID", userID) & Builders<BsonDocument>.Filter.Eq("listID", listID);
        var listDoc = _listsCollection.Find(filter).FirstOrDefault();

        if (listDoc == null)
        {
            return null;
        }

        var products = new List<ProductInfo>();
        foreach (var productDoc in listDoc["products"].AsBsonArray)
        {
            products.Add(new ProductInfo(
                productDoc["productID"].AsString,
                productDoc["storeID"].AsString,
                productDoc["was"].AsDecimal,
                productDoc["now"].AsDecimal,
                productDoc["diff"].AsDecimal,
                (DateTime)productDoc["dateLastChecked"]
            ));
        }
        return new UserProductList(listDoc["listID"].AsString, listDoc["listName"].AsString, products);
    }
}