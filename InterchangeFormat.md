# Mongo Schema for ComparisonAPI

`<>` around a value indicates that the value will be replaced with actual values.

All keys must start with a capital letter.

## Database: `Users`
### Collection: `users`
```json
{
    "Email": "<user email>",
    "UserID": "<user ID>",
}
```

## Database: `Lists`
### Collection: `lists`

```json
{
    "UserID": "<user ID>",
    "ListID": "<list ID>",
    "Products": [
        {
            "Coles": "<product ID of coles product>",
            "Woolworths": "<product ID of woolworths product>"
        },
        ...
    ],
    "ListName": "<list name>",
    "CreatedAt": "<utc timestamp of when the list was created>",
    "LastEdited": "<utc timestamp of when the list was last edited>"
}
```

## Database: `Products`
### Collection: `factProducts`

```json
{
    "ProductID": "<product ID>",
    "Name": "<product name>",
    "Store": "<store name>",
    "Link": "<link to product page>",
    "ImageLink": "<link to product image>"
}
```

### Collection: `pricedProducts`

```json
{
    "ProductID": "<product ID>",
    "Store": "<store name>",
    "NormalPrice": <normal price as a number>,
    "CurrentPrice": <current price as a number>,
    "LastUpdated": "<utc timestamp of when the price was last updated>",
    "ProductLink": "<link to product page>"
}
```

# API Endpoints

## `POST /signin`

### Request Body
```json
{
    "Email": "<user email>"
}
```

### Response
```json
{
    "UserID": "<user ID>"
}
```

## `POST /createlist`

### Request Body
```json
{
    "UserID": "<user ID>",
    "ListName": "<list name>"
}
```

### Response
```json
{
    "ListID": "<list ID>"
}
```

## `GET /getlist/{userID}/{listID}`

### Response
```json
{
    "Products": [
        {
            "Coles": {
                "ProductID": "<product ID>",
                "Name": "<product name>",
                "Store": "<store name>",
                "Link": "<link to product page>",
                "ImageLink": "<link to product image>"
            },
            "Woolworths": {
                "ProductID": "<product ID>",
                "Name": "<product name>",
                "Store": "<store name>",
                "Link": "<link to product page>",
                "ImageLink": "<link to product image>"
            }
        },
        ...
    ]
}
```

## `POST /addProductFromLink`

### Request Body

NOTE: `ProductLinks` can contain either a Coles link, a Woolworths link, or both. If both are provided, the API will add both products to the database and link them together in the list. If only one is provided, the API will attempt to find a match for the product in the other store and add it to the list if found. If no match is found, no pairing will be created, and no product will be added for either store.

TODO: Make it so that if only one link is provided, the API will still add the product to the database and the list, but without a pairing. When comparing prices, just add to the total, but don't call it
a saving. Still get the current price for the product though.

```json
{
    "UserID": "<user ID>",
    "ListID": "<list ID>",
    "ProductLinks": {
        "Coles": "<link to coles product page>",
        "Woolworths": "<link to woolworths product page>"
    }
}
```

### Response
```json
{
    "Message": "<response message>"
}
```

## `POST /addProductFromName`

### Request Body

NOTE: Like with `addProductFromLink`, `ProductNames` can contain either a Coles product name, a Woolworths product name, or both. The same logic applies for how the API will handle the request.

TODO: Same as with `addProductFromLink`, if only one product name is provided, the API should still add the product to the database and the list, but without a pairing.

```json
{
    "UserID": "<user ID>",
    "ListID": "<list ID>",
    "ProductNames": {
        "Coles": "<name of coles product>",
        "Woolworths": "<name of woolworths product>"
    }
}
```

### Response
```json
{
    "Message": "<response message>"
}
```

## `GET /getlists/{userID}`

### Response
```json
{
    "Lists": [
        {
            "ListID": "<list ID>",
            "ListName": "<list name>"
        },
        ...
    ]
}
```

## `POST /compare`

### Request Body
```json
{
    "UserID": "<user ID>",
    "ListID": "<list ID>"
}
```

### Response
```json
{
    "TotalNormalPrice": {
        "Coles": <total normal price of all coles products in the list as a number>,
        "Woolworths": <total normal price of all woolworths products in the list as a number>
    },
    "TotalCurrentPrice": {
        "Coles": <total current price of all coles products in the list as a number>,
        "Woolworths": <total current price of all woolworths products in the list as a number>
    },
    "TotalSavings": {
        "Coles": <total savings of all coles products in the list as a number>,
        "Woolworths": <total savings of all woolworths products in the list as a number>
    },
    "Products": [
        {
            "Coles": {
                "ProductID": "<product ID>",
                "Name": "<product name>",
                "Store": "<store name>",
                "Link": "<link to product page>",
                "ImageLink": "<link to product image>",
                "NormalPrice": <normal price as a number>,
                "CurrentPrice": <current price as a number>,
                "Savings": <savings as a number>
            },
            "Woolworths": {
                "ProductID": "<product ID>",
                "Name": "<product name>",
                "Store": "<store name>",
                "Link": "<link to product page>",
                "ImageLink": "<link to product image>",
                "NormalPrice": <normal price as a number>,
                "CurrentPrice": <current price as a number>,
                "Savings": <savings as a number>
            }
        },
        ...
    ]
}
```