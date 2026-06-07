static class ProductHelpers
{
    public static Tuple<ProductInfo?, ProductInfo?> GetProductsFromOnlyWoolworthsLink(string url)
    {
        var woolworthsProduct = GetProductFromWoolworthsURL(url);
        // Need to look for a matching product on Coles.
        // It's okay if this returns null - we just won't have a comparison for the user.
        // After all, one store might have an exclusive product that the other doesn't carry.
        var colesProduct = woolworthsProduct != null ? GetProductFromColesURL(url) : null;
        return Tuple.Create(woolworthsProduct, colesProduct);
    }

    public static Tuple<ProductInfo?, ProductInfo?> GetProductsFromOnlyColesLink(string url)
    {
        var colesProduct = GetProductFromColesURL(url);
        var woolworthsProduct = colesProduct != null ? GetProductFromWoolworthsURL(url) : null;
        return Tuple.Create(woolworthsProduct, colesProduct);
    }

    public static ProductInfo? GetProductFromWoolworthsURL(string url)
    {
        // Mock implementation for development
        return new ProductInfo("Woolies-Mock-ProductInfo", "Woolworths", "Mock Product 1", 5.00m, 4.00m, 1.00m, DateTime.UtcNow);
    }

    public static ProductInfo? GetProductFromColesURL(string url)
    {
        // Mock implementation for development
        return new ProductInfo("Coles-Mock-ProductInfo", "Coles", "Mock Product 2", 5.50m, 4.50m, 1.00m, DateTime.UtcNow);
    }

    private static List<ProductInfo> SearchWoolworths(string name)
    {
        return
    [
        new ProductInfo("Woolies-" + name, "Woolworths", "Mock Product 3", 10.00m, 8.00m, 2.00m, DateTime.UtcNow),
        new ProductInfo("Woolies-" + name + "-alt", "Woolworths", "Mock Product 4", 15.00m, 12.00m, 3.00m, DateTime.UtcNow)
    ];
    }

    private static List<ProductInfo> SearchColes(string name)
    {
        return
    [
        new ProductInfo("Coles-" + name, "Coles", "Mock Product 5", 9.50m, 8.50m, 1.00m, DateTime.UtcNow),
        new ProductInfo("Coles-" + name + "-alt", "Coles", "Mock Product 6", 14.50m, 11.50m, 3.00m, DateTime.UtcNow)];
    }


    public static ProductInfo? GetProductFromWoolworthsName(string name)
    {
        var results = SearchWoolworths(name);
        return results.FirstOrDefault(p => p.ProductID.Equals(name, StringComparison.OrdinalIgnoreCase));
    }

    public static ProductInfo? GetProductFromColesName(string name)
    {
        var results = SearchColes(name);
        return results.FirstOrDefault(p => p.ProductID.Equals(name, StringComparison.OrdinalIgnoreCase));
    }
}