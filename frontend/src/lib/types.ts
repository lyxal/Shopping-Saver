export type Store = "Coles" | "Woolworths";

export type ThemeMode = "dark" | "light";

export type Screen = "landing" | "pickList" | "modifyList" | "loadingResults" | "results";

export type EntryMode = "name" | "link";

export type EntryCoverage = "both" | "coles" | "woolworths";

export type ListSummary = {
  ListID: string;
  ListName: string;
  ProductCount: number;
  CreatedAt: string;
  LastEdited: string;
};

export type ProductRecord = {
  ProductID: string;
  Name: string;
  Store: Store | string;
  Link: string;
  ImageLink: string;
};

export type PricedProduct = {
  ProductID: string;
  Store: Store | string;
  NormalPrice: number;
  SalePrice: number;
  LastChecked: string;
  ProductLink: string;
};

export type ComparisonRow = {
  WoolworthsProduct: ProductRecord;
  WoolworthsPrice: PricedProduct;
  ColesProduct: ProductRecord;
  ColesPrice: PricedProduct;
  PriceDifference: number;
  PercentageDifference: number;
  CheaperStore: Store | string;
};

export type CompareResponse = {
  Comparisons?: ComparisonRow[];
  Products?: ComparisonRow[];
  TotalNormalPrice?: Record<Store, number>;
  TotalSalePrice?: Record<Store, number>;
  TotalCurrentPrice?: Record<Store, number>;
  TotalSavings?: Record<Store, number>;
  CheaperStore?: Store | string;
};

export type ListProductsResponse =
  | {
      Products?: Array<{
        Coles: ProductRecord | null;
        Woolworths: ProductRecord | null;
      }>;
    }
  | Array<{
      Coles: ProductRecord | null;
      Woolworths: ProductRecord | null;
    }>;

export type EntryDraft = {
  coverage: EntryCoverage;
  coles: string;
  woolworths: string;
};

export type AppState = {
  screen: Screen;
  themeMode: ThemeMode;
  email: string;
  userId: string;
  lists: ListSummary[];
  activeList: ListSummary | null;
  products: Array<{
    Coles: ProductRecord | null;
    Woolworths: ProductRecord | null;
  }>;
  compareResult: CompareResponse | null;
  loading: boolean;
  error: string | null;
  newListName: string;
  entryMode: EntryMode;
  drafts: Record<EntryMode, EntryDraft>;
};

export type PersistedAppState = Pick<
  AppState,
  "screen" | "themeMode" | "email" | "userId" | "lists" | "activeList" | "products" | "compareResult" | "newListName" | "entryMode" | "drafts"
>;

export type AppRoute = {
  screen: Screen;
  listId?: string;
};
