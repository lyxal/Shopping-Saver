`<>` around a value means "will be replaced with value"

## Prices Table

```json
{
    "<productID>": {
        "coles": {
            "<storeID>": {
                "$was": "<price>",
                "$now": "<price>",
                "$diff": "<price>",
                "dateLastChecked": "<date>"
            }
        },
        "woolworths": {
            "<storeID>": {
                "$was": "<price>",
                "$now": "<price>",
                "$diff": "<price>",
                "dateLastChecked": "<date>"
            }
        },
        "image": "imageSource"
    }
}
```

## Locations Table

```json
{
    "coles": {
        "<storeName>": "<storeID>"
    },
    "woolworths": {
        "<storeName>": "<storeID>"
    }
}
```

## Products Table

```json
{
    "<productID>": {
        "productName": "<name>",
        "aliases": ["<alias1>", "<alias2>"]
    }
}
```

## Users Table

```json
{
    "<email>": "<userID>"
}
```

## User Lists Table

- Each `product` in `products` has a `colesID` and a `woolworthsID` to allow for "closest substitute" comparisons. These must be explicitly added by the user. The system must never automatically create a "closest substitute" comparison. The system must only automatically create "exact" comparisons, where both stores have the exact same product.
- `colesID` and `woolworthsID` will always refer to a `productID` in the Products Table.
- Product ids are not specific to a store. In this table, it's more "here's the ID to use when looking up the product for the store".
```json
{
    "<userID>": {
        "<listID>":  [
                {"colesID": "<colesID>", "woolworthsID": "<woolworthsID>"}
            ]
    }
}
```

## Routes

### `POST /compare`

#### Params

```json
{
listID: "<listID>",
userID: "<userID>"
}
```

#### Responses

- 403 - List does not belong to user
- 200:

```json
{
    "items": [
        {
            "productName": "<name>",
            "productImage": "<source>",
            "colesWasPrice": "<colesWasPrice>",
            "colesNowPrice": "<colesNowPrice>",
            "colesSaving": "<colesSaving>",
            "woolworthsWasPrice": "<woolworthsWasPrice>",
            "woolworthsNowPrice": "<woolworthsNowPrice>",
            "woolworthsSaving": "<woolworthsSaving>",
            "winnerStore": "coles|woolworths",
            "winnerBy": "<amount>"
        }
    ],
    "colesTotalCost": "<amount>",
    "colesTotalSavings": "<amount>",
    "woolworthsTotalAmount": "<amount>",
    "woolworthsTotalSavings": "<amount>",
    "winnerStore": "coles|woolworths",
    "winnerBy": "<amount>"
}
```

## Product Addition Routes

4 input methods:

1. Two store links - user provides links to the product on both stores. System extracts product info and prices from the links. The products may be different.
2. One store link - user provides a link to the product on one store. System extracts product info and price from the link, then tries to find the exact product on the other store. If the product is not stocked in the other store, the user is informed that this will not be included in price comparisons.
3. Two product names - user provides the product name for both stores. System tries to find the exact product at each store. The products may be different. If a product is not found at a store, the user is informed that this will not be included in price comparisons.
4. One product name - user provides the product name for one store. System tries to find the exact product at that store, then tries to find the exact product at the other store. If a product is not found at a store, the user is informed that this will not be included in price comparisons.

### `POST /addProductFromLink`

#### Params

```json
{
    "userID": "<userID>",
    "listID": "<listID>",
    "links": {
        [
            {
                "store": "coles|woolworths",
                "url": "<productURL>"
            }
        ]
    }
}
```

#### Responses

- 403 - List does not belong to user
- 200:

```json
{
    "products": [
        {
            "productName": "<name>",
            "productImage": "<source>",
            "colesID": "<colesID>",
            "woolworthsID": "<woolworthsID>"
        }
    ],
    "message": "<informationalMessage>"
}
```

### `POST /addProductFromName`

#### Params

```json
{
    "userID": "<userID>",
    "listID": "<listID>",
    "productNames": {
        [
            {
                "store": "coles|woolworths",
                "name": "<productName>"
            }
        ]
    }
}
```

#### Responses

- 403 - List does not belong to user
- 200:

```json
{
    "products": [
        {
            "productName": "<name>",
            "productImage": "<source>",
            "colesID": "<colesID>",
            "woolworthsID": "<woolworthsID>"
        }
    ],
    "message": "<informationalMessage>"
}
```

### `GET /listsForUser`

#### Params

```
{
    "userID": "<userID>"
}
```

#### Responses

- 200:

```json
{
    "lists": [
        {
            "listID": "<listID>",
            "products": [
                {
                    "productName": "<name>",
                    "productImage": "<source>",
                    "colesID": "<colesID>",
                    "woolworthsID": "<woolworthsID>"
                }
            ]
        }
    ]
}
```

## External API Integration

- `getProductFromWoolworthsURL(url) -> {productName, productImage, currentPrice, salePrice}`
- `getProductFromColesURL(url) -> {productName, productImage, currentPrice, salePrice}`
- `getProductFromWoolworthsName(name) = searchWoolworths(name) |> if (exactMatch) return exactMatch else return null`
- `getProductFromColesName(name) = searchColes(name) |> if (exactMatch) return exactMatch else return null`