static class SupermarketAPI
{
    static public PricedProduct GetWoolworthsPriceFor(string productLink)
    {
        // Placeholder implementation
        return new PricedProduct(Guid.NewGuid().ToString(), "Woolworths", 10.00m, 8.00m, DateTime.UtcNow, productLink);
    }

    static public PricedProduct GetColesPriceFor(string productLink)
    {
        // Placeholder implementation
        return new PricedProduct(Guid.NewGuid().ToString(), "Coles", 9.50m, 7.50m, DateTime.UtcNow, productLink);
    }

    static public FactProduct GetWoolworthsProductFor(string productLink)
    {
        // Placeholder implementation
        var productName = Uri.UnescapeDataString(productLink.AsSpan(productLink.LastIndexOf('/') + 1));
        return new FactProduct(Guid.NewGuid().ToString(), productName, "Woolworths", productLink, "https://example.com/image.jpg");
    }

    static public FactProduct GetColesProductFor(string productLink)
    {
        // Placeholder implementation
        var productName = Uri.UnescapeDataString(productLink.AsSpan(productLink.LastIndexOf('/') + 1));
        return new FactProduct(Guid.NewGuid().ToString(), productName, "Coles", productLink, "https://example.com/image.jpg");
    }

    static public string? FindProductByNameAtWoolworths(string productName)
    {
        // Get the product link for the given product name from Woolworths. 
        // Returns an optional because Woolworths might not stock the product.
        // Placeholder implementation - in a real implementation, this would search the Woolworths website for the product and return a link if found.
        return "https://www.woolworths.com.au/product/" + Uri.EscapeDataString(productName);
    }

    static public string? FindProductByNameAtColes(string productName)
    {
        // Get the product link for the given product name from Coles. 
        // Returns an optional because Coles might not stock the product.
        // Placeholder implementation - in a real implementation, this would search the Coles website for the product and return a link if found.
        return "https://www.coles.com.au/product/" + Uri.EscapeDataString(productName);
    }

    static public DateTime GetNextWednesday()
    {
        // Coles and Woolworths both update their prices on Wednesdays, so this helper
        // function determines when the next price update will be. Obviously helpful
        // for determining if a rescrape is needed.
        var today = DateTime.Today;
        int daysUntilWednesday = ((int)DayOfWeek.Wednesday - (int)today.DayOfWeek + 7) % 7;
        return today.AddDays(daysUntilWednesday);
    }

}