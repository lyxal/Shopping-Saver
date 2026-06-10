using HtmlAgilityPack;
using System.Text.Json;
using System.Text.RegularExpressions;

public static class WoolworthsScraper
{
    public static PricedProduct ExtractPricedProduct(string html)
    {
        // Parse __NEXT_DATA__ JSON which contains the richest structured data
        var nextDataMatch = Regex.Match(html, @"<script id=""__NEXT_DATA__""[^>]*>(.*?)</script>", RegexOptions.Singleline);
        if (nextDataMatch.Success)
        {
            var json = nextDataMatch.Groups[1].Value;
            return ExtractPricedFromNextData(json);
        }

        throw new InvalidOperationException("Failed to extract product information");
    }

    private static PricedProduct ExtractPricedFromNextData(string json)
    {
        using var doc = JsonDocument.Parse(json);
        var root = doc.RootElement;

        if (!root.TryGetProperty("props", out var props) ||
            !props.TryGetProperty("pageProps", out var pageProps) ||
            !pageProps.TryGetProperty("pdDetails", out var pdDetails) ||
            !pdDetails.TryGetProperty("Product", out var p))
            throw new InvalidOperationException("Failed to extract product information");

        // Details
        // TODO
        var product = new PricedProduct(
            ProductID: GetString(p, "ProductID") ?? Guid.NewGuid().ToString(),
            Store: "Woolworths",
            NormalPrice: GetDecimal(p, "WasPrice"),
            SalePrice: GetDecimal(p, "InstorePrice"),
            LastChecked: DateTime.UtcNow,
            ProductLink: ""
        );

        return product;
    }

    public static FactProduct ExtractFactProduct(string html)
    {
        // Similar to above, but extract the product name and image link instead of price info.
        var nextDataMatch = Regex.Match(html, @"<script id=""__NEXT_DATA__""[^>]*>(.*?)</script>", RegexOptions.Singleline);
        if (nextDataMatch.Success)
        {
            var json = nextDataMatch.Groups[1].Value;
            return ExtractFactFromNextData(json);
        }

        throw new InvalidOperationException("Failed to extract product information");
    }

    private static FactProduct ExtractFactFromNextData(string json)
    {
        using var doc = JsonDocument.Parse(json);
        var root = doc.RootElement;

        if (!root.TryGetProperty("props", out var props) ||
            !props.TryGetProperty("pageProps", out var pageProps) ||
            !pageProps.TryGetProperty("pdDetails", out var pdDetails) ||
            !pdDetails.TryGetProperty("Product", out var p))
            throw new InvalidOperationException("Failed to extract product information");

        var product = new FactProduct(
            ProductID: GetString(p, "ProductID") ?? Guid.NewGuid().ToString(),
            Name: GetString(p, "Name") ?? "Unknown Product",
            Store: "Woolworths",
            Link: GetString(p, "ProductLink") ?? "",
            ImageLink: GetString(p, "ImageLink") ?? ""
        );

        return product;
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private static string? GetString(JsonElement el, string key) =>
        el.TryGetProperty(key, out var v) && v.ValueKind == JsonValueKind.String ? v.GetString() : null;

    private static decimal GetDecimal(JsonElement el, string key) =>
        el.TryGetProperty(key, out var v) && v.TryGetDecimal(out var d) ? d : 0m;

    private static double? GetDouble(JsonElement el, string key) =>
        el.TryGetProperty(key, out var v) && v.TryGetDouble(out var d) ? d : null;

    private static int? GetInt(JsonElement el, string key) =>
        el.TryGetProperty(key, out var v) && v.TryGetInt32(out var i) ? i : null;

    private static bool GetBool(JsonElement el, string key) =>
        el.TryGetProperty(key, out var v) && v.ValueKind == JsonValueKind.True;

    private static string StripHtml(string html) =>
        Regex.Replace(html, "<.*?>", " ").Replace("&amp;", "&").Trim();
}