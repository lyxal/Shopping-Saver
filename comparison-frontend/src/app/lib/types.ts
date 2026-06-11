export type ApiConfig = {
  baseUrl: string;
};

export type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONValue[]
  | { [key: string]: JSONValue };

export type SigninResponse = {
    UserID: string;
  };

export type FactProduct = {
    ProductID: string,
    Name: string,
    Store: string,
    Link: string,
    ImageLink: string
  };

export type ProductListSummary = {
    ListID: string,
    ListName: string,
    ProductCount: string,
    LastEdited: string,
    CreatedAt: string
  };

export type FactProductPair = {
    Coles: FactProduct,
    Woolworths: FactProduct
  };

export type PricedProduct = {
    ProductID: string,
    Store: string,
    NormalPrice: number,
    SalePrice: number,
    LastChecked: string,
    ProductLink: string
  };

export type ProductComparison = {
    WoolworthsProduct: FactProduct,
    WoolworthsPrice: PricedProduct,
    ColesProduct: FactProduct,
    ColesPrice: PricedProduct,
    PriceDifference: number,
    PercentageDifference: number,
    CheaperStore: string
}

export type ComparisonResponse = {
    Comparisons: ProductComparison[],
    TotalNormalPrice: {
        Woolworths: number,
        Coles: number
    },
    TotalSalePrice: {
        Woolworths: number,
        Coles: number
    },
    TotalSavings: {
        Woolworths: number,
        Coles: number
    },
    CheaperStore: string
}