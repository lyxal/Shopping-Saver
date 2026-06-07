record SigninRequest(string Email);
record CreateListRequest(string UserID, string ListName);
record GetListRequest(string UserID, string ListID);

public record UserProductList(string ListID, string ListName, List<ProductInfo> Products);
public record ProductInfo(string ProductID, string StoreID, string Name, decimal Was, decimal Now, decimal Diff, DateTime DateLastChecked);
public record DisplayProductInfo(string ProductID, string Name, string StoreLocation, string StoreLink, string ImageLink);
record AddProductLinkRequest(string UserID, string ListID, List<Dictionary<string, string>> ProductLinks);

record AddProductNameRequest(string UserID, string ListID, List<Dictionary<string, string>> ProductNames);

record CompareRequest(string UserID, string ListID);