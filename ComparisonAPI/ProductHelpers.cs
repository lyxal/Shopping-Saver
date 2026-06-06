record AddProductLinkRequest(string UserID, string ListID, List<Dictionary<string, string>> ProductLinks);


static class ProductHelpers
{
    record Product(string ProductID, string StoreID, decimal Was, decimal Now, decimal Diff, DateTime DateLastChecked);

    static Product? GetProductFromWoolworthsURL(string url)
    {
        // Mock implementation for development
        return new Product("Woolies-Mock-Product", "Woolworths", 5.00m, 4.00m, 1.00m, DateTime.UtcNow);
    }

    static Product? GetProductFromColesURL(string url)
    {
        // Mock implementation for development
        return new Product("Coles-Mock-Product", "Coles", 5.50m, 4.50m, 1.00m, DateTime.UtcNow);
    }

    private static List<Product> SearchWoolworths(string name)
    {
        return
    [
        new Product("Woolies-" + name, "Woolworths", 10.00m, 8.00m, 2.00m, DateTime.UtcNow),
        new Product("Woolies-" + name + "-alt", "Woolworths", 15.00m, 12.00m, 3.00m, DateTime.UtcNow)
    ];
    }

    private static List<Product> SearchColes(string name)
    {
        return
    [
        new Product("Coles-" + name, "Coles", 9.50m, 8.50m, 1.00m, DateTime.UtcNow),
        new Product("Coles-" + name + "-alt", "Coles", 14.50m, 11.50m, 3.00m, DateTime.UtcNow)];
    }


    static Product? GetProductFromWoolworthsName(string name)
    {
        var results = SearchWoolworths(name);
        return results.FirstOrDefault(p => p.ProductID.Equals(name, StringComparison.OrdinalIgnoreCase));
    }

    static Product? GetProductFromColesName(string name)
    {
        var results = SearchColes(name);
        return results.FirstOrDefault(p => p.ProductID.Equals(name, StringComparison.OrdinalIgnoreCase));
    }
}