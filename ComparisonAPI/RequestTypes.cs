record SigninRequest(string Email);
record CreateListRequest(string UserID, string ListName);
record GetListRequest(string UserID, string ListID);
record AddProductLinkRequest(string UserID, string ListID, Dictionary<string, string> ProductLinks);
record AddProductNameRequest(string UserID, string ListID, Dictionary<string, string> ProductNames);
record CompareRequest(string UserID, string ListID);