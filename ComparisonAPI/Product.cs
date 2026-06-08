public record PricedProduct(
    string ProductID,
    string StoreID,
    decimal NormalPrice,
    decimal SalePrice
);

public record FactProduct(
    string ProductID,
    string Name,
    string Store,
    string Link,
    string ImageLink
);

public record FactProductPair(
    FactProduct WoolworthsProduct,
    FactProduct ColesProduct
);