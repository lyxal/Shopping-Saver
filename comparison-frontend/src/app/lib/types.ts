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
  }

  export type ProductListSummary = {
    ListID: string,
    ListName: string,
    ProductCount: number,
    LastEdited: string,
    CreatedAt: string
  }

  export type FactProductPair = {
    Coles: FactProduct,
    Woolworths: FactProduct
  }