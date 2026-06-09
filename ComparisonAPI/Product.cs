public record PricedProduct(
    string ProductID,
    string Store,
    decimal NormalPrice,
    decimal SalePrice,
    DateTime LastChecked,
    string ProductLink
);

public record FactProduct(
    string ProductID,
    string Name,
    string Store,
    string Link,
    string ImageLink
);

public record ProductComparison(
    FactProduct WoolworthsProduct,
    PricedProduct WoolworthsPrice,
    FactProduct ColesProduct,
    PricedProduct ColesPrice,
    decimal PriceDifference,
    decimal PercentageDifference,
    string CheaperStore
);

public record FactProductPair(
    FactProduct Woolworths,
    FactProduct Coles
);