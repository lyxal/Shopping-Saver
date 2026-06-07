record SigninRequest(string Email);
record CreateListRequest(string UserID, string ListName);
record GetListRequest(string UserID, string ListID);

public record UserProductList(string ListID, string ListName, List<ProductInfo> Products);
public record ProductInfo(string ProductID, string StoreID, decimal Was, decimal Now, decimal Diff, DateTime DateLastChecked);