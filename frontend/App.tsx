import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";

type Store = "Coles" | "Woolworths";

type ListSummary = {
  ListID: string;
  ListName: string;
};

type ProductRecord = {
  ProductID: string;
  Name: string;
  Store: Store | string;
  Link: string;
  ImageLink: string;
};

type PricedProduct = {
  ProductID: string;
  Store: Store | string;
  NormalPrice: number;
  SalePrice: number;
  LastChecked: string;
  ProductLink: string;
};

type ComparisonRow = {
  WoolworthsProduct: ProductRecord;
  WoolworthsPrice: PricedProduct;
  ColesProduct: ProductRecord;
  ColesPrice: PricedProduct;
  PriceDifference: number;
  PercentageDifference: number;
  CheaperStore: Store | string;
};

type CompareResponse = {
  Comparisons?: ComparisonRow[];
  Products?: ComparisonRow[];
  TotalNormalPrice?: Record<Store, number>;
  TotalSalePrice?: Record<Store, number>;
  TotalCurrentPrice?: Record<Store, number>;
  TotalSavings?: Record<Store, number>;
  CheaperStore?: Store | string;
};

type ListProductsResponse =
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

type ApiConfig = {
  baseUrl: string;
};

type AppState = {
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
  addMode: "name" | "link";
  addInput: string;
  createListName: string;
};

const DEFAULT_API_BASE_URL = "http://localhost:5000";

const initialState: AppState = {
  email: "",
  userId: "",
  lists: [],
  activeList: null,
  products: [],
  compareResult: null,
  loading: false,
  error: null,
  addMode: "name",
  addInput: "",
  createListName: "",
};

const palette = {
  background: "#07111f",
  panel: "#0f1b2f",
  panelSoft: "#14233c",
  panelWarm: "#1f2f4d",
  text: "#f4f7fb",
  subtext: "#9eb0ca",
  accent: "#f4b740",
  accentSoft: "#f8d27f",
  success: "#37c98b",
  danger: "#f16d6d",
  line: "rgba(255,255,255,0.09)",
  white: "#ffffff",
};

function getApiConfig(): ApiConfig {
  const baseUrl =
    process.env.EXPO_PUBLIC_API_BASE_URL?.trim() || DEFAULT_API_BASE_URL;
  return { baseUrl: baseUrl.replace(/\/+$/, "") };
}

async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const { baseUrl } = getApiConfig();
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const text = await response.text();
  const payload = text ? safeJsonParse(text) : null;

  if (!response.ok) {
    const message =
      (payload && typeof payload === "object" && "error" in payload
        ? String((payload as { error: unknown }).error)
        : null) ??
      (payload && typeof payload === "object" && "title" in payload
        ? String((payload as { title: unknown }).title)
        : null) ??
      `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return payload as T;
}

function safeJsonParse(value: string) {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return value;
  }
}

function normalizeLists(payload: unknown): ListSummary[] {
  if (!payload) {
    return [];
  }

  if (Array.isArray(payload)) {
    return payload
      .map((item) => {
        if (!item || typeof item !== "object") return null;
        const maybe = item as Partial<ListSummary>;
        if (typeof maybe.ListID !== "string") return null;
        return {
          ListID: maybe.ListID,
          ListName: typeof maybe.ListName === "string" ? maybe.ListName : "Untitled list",
        };
      })
      .filter((item): item is ListSummary => item !== null);
  }

  if (typeof payload === "object" && "Lists" in payload) {
    return normalizeLists((payload as { Lists?: unknown }).Lists);
  }

  return [];
}

function normalizeListProducts(payload: ListProductsResponse | unknown) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (payload && typeof payload === "object" && "Products" in payload) {
    const products = (payload as { Products?: unknown }).Products;
    return Array.isArray(products) ? products : [];
  }

  return [];
}

function formatCurrency(value?: number) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "-";
  }

  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatPercent(value?: number) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "-";
  }

  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

function productLabel(entry: {
  Coles: ProductRecord | null;
  Woolworths: ProductRecord | null;
}) {
  return entry.Woolworths?.Name || entry.Coles?.Name || "Unnamed product";
}

export default function App() {
  const [state, setState] = useState<AppState>(initialState);
  const apiBase = useMemo(() => getApiConfig().baseUrl, []);

  useEffect(() => {
    setState((current) => ({ ...current, error: null }));
  }, []);

  const setField = <K extends keyof AppState>(field: K, value: AppState[K]) => {
    setState((current) => ({ ...current, [field]: value }));
  };

  const loadLists = async (userId: string) => {
    const response = await apiFetch<unknown>(`/getlists/${encodeURIComponent(userId)}`);
    setField("lists", normalizeLists(response));
  };

  const loadListDetails = async (userId: string, listId: string) => {
    const response = await apiFetch<ListProductsResponse>(
      `/getlist/${encodeURIComponent(userId)}/${encodeURIComponent(listId)}`,
    );
    setField("products", normalizeListProducts(response));
  };

  const handleSignin = async () => {
    const email = state.email.trim();
    if (!email) {
      setField("error", "Enter the email you want tied to this shopping profile.");
      return;
    }

    setField("loading", true);
    try {
      const payload = await apiFetch<{ UserID: string }>("/signin", {
        method: "POST",
        body: JSON.stringify({ Email: email }),
      });
      setField("userId", payload.UserID);
      await loadLists(payload.UserID);
      setField("error", null);
    } catch (error) {
      setField("error", error instanceof Error ? error.message : "Could not sign in.");
    } finally {
      setField("loading", false);
    }
  };

  const handleCreateList = async () => {
    const listName = state.createListName.trim();
    if (!listName) {
      setField("error", "Give the list a name first.");
      return;
    }

    setField("loading", true);
    try {
      const payload = await apiFetch<{ ListID: string }>("/createlist", {
        method: "POST",
        body: JSON.stringify({ UserID: state.userId, ListName: listName }),
      });

      const nextList: ListSummary = { ListID: payload.ListID, ListName: listName };
      setField("lists", [nextList, ...state.lists]);
      setField("activeList", nextList);
      setField("createListName", "");
      await loadListDetails(state.userId, payload.ListID);
    } catch (error) {
      setField("error", error instanceof Error ? error.message : "Could not create the list.");
    } finally {
      setField("loading", false);
    }
  };

  const openList = async (list: ListSummary) => {
    setField("activeList", list);
    setField("compareResult", null);
    setField("loading", true);
    try {
      await loadListDetails(state.userId, list.ListID);
    } catch (error) {
      setField("error", error instanceof Error ? error.message : "Could not load that list.");
    } finally {
      setField("loading", false);
    }
  };

  const handleCompare = async () => {
    if (!state.activeList) return;

    setField("loading", true);
    try {
      const payload = await apiFetch<CompareResponse>("/compare", {
        method: "POST",
        body: JSON.stringify({ UserID: state.userId, ListID: state.activeList.ListID }),
      });
      setField("compareResult", payload);
    } catch (error) {
      setField("error", error instanceof Error ? error.message : "Could not compare the list.");
    } finally {
      setField("loading", false);
    }
  };

  const handleAddProduct = async () => {
    if (!state.activeList) return;

    const value = state.addInput.trim();
    if (!value) {
      setField("error", "Enter a product name or link first.");
      return;
    }

    const endpoint = state.addMode === "name" ? "/addProductFromName" : "/addProductFromLink";
    const payloadKey = state.addMode === "name" ? "ProductNames" : "ProductLinks";

    setField("loading", true);
    try {
      await apiFetch<{ Message: string }>(endpoint, {
        method: "POST",
        body: JSON.stringify({
          UserID: state.userId,
          ListID: state.activeList.ListID,
          [payloadKey]: {
            Woolworths: state.addMode === "name" ? value : undefined,
            Coles: state.addMode === "name" ? undefined : value,
          },
        }),
      });
      setField("addInput", "");
      await loadListDetails(state.userId, state.activeList.ListID);
      setField("compareResult", null);
    } catch (error) {
      setField("error", error instanceof Error ? error.message : "Could not add the product.");
    } finally {
      setField("loading", false);
    }
  };

  const comparing = state.compareResult ?? null;
  const totals = comparing?.TotalSalePrice ?? comparing?.TotalCurrentPrice ?? null;
  const rows = comparing?.Comparisons ?? comparing?.Products ?? [];
  const cheaperStore = comparing?.CheaperStore;

  if (!state.userId) {
    return (
      <SafeAreaView style={styles.screen}>
        <StatusBar barStyle="light-content" />
        <ExpoStatusBar style="light" />
        <View style={styles.backdropBlobTop} />
        <View style={styles.backdropBlobBottom} />
        <ScrollView contentContainerStyle={styles.authShell}>
          <View style={styles.heroCard}>
            <Text style={styles.kicker}>Shopping Saver</Text>
            <Text style={styles.title}>Find the cheapest store for your weekly basket.</Text>
            <Text style={styles.bodyText}>
              Tell the app what you buy often, then compare Coles and Woolworths with the current
              specials already captured by your backend.
            </Text>

            <View style={styles.metricRow}>
              <Metric label="Stores compared" value="2" />
              <Metric label="Savings focus" value="Weekly basket" />
              <Metric label="Flow" value="Sign in, compare, buy" />
            </View>
          </View>

          <View style={styles.panel}>
            <Text style={styles.sectionTitle}>Start here</Text>
            <Text style={styles.helpText}>Backend endpoint: {apiBase}</Text>

            <TextInput
              value={state.email}
              onChangeText={(value) => setField("email", value)}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="Email address"
              placeholderTextColor={palette.subtext}
              style={styles.input}
            />

            {state.error ? <InlineNotice tone="danger" text={state.error} /> : null}

            <Pressable
              onPress={handleSignin}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.pressed,
              ]}
            >
              {state.loading ? (
                <ActivityIndicator color={palette.background} />
              ) : (
                <Text style={styles.primaryButtonText}>Continue</Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="light-content" />
      <ExpoStatusBar style="light" />
      <View style={styles.backdropBlobTop} />
      <View style={styles.backdropBlobBottom} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.appShell}>
          <View style={styles.headerCard}>
            <View>
              <Text style={styles.kicker}>Signed in</Text>
              <Text style={styles.headerTitle}>{state.email}</Text>
              <Text style={styles.helpText}>Use your saved lists to compare the weekly basket.</Text>
            </View>
            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeText}>
                {state.activeList ? "List ready" : "Pick a list"}
              </Text>
            </View>
          </View>

          {state.error ? <InlineNotice tone="danger" text={state.error} /> : null}

          <View style={styles.section}>
            <SectionHeader
              title="Your lists"
              subtitle="Choose an existing basket or create a fresh one."
            />
            <View style={styles.inlineRow}>
              <TextInput
                value={state.createListName}
                onChangeText={(value) => setField("createListName", value)}
                placeholder="New weekly list"
                placeholderTextColor={palette.subtext}
                style={[styles.input, styles.flexGrow]}
              />
              <Pressable
                onPress={handleCreateList}
                style={({ pressed }) => [
                  styles.secondaryButton,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.secondaryButtonText}>Create</Text>
              </Pressable>
            </View>

            <FlatList
              data={state.lists}
              horizontal
              keyExtractor={(item) => item.ListID}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.listRail}
              renderItem={({ item }) => {
                const active = state.activeList?.ListID === item.ListID;
                return (
                  <Pressable
                    onPress={() => openList(item)}
                    style={[styles.listCard, active && styles.listCardActive]}
                  >
                    <Text style={styles.listName}>{item.ListName}</Text>
                    <Text style={styles.listMeta}>{item.ListID.slice(0, 8)}</Text>
                    <Text style={styles.listAction}>
                      {active ? "Open" : "View"}
                    </Text>
                  </Pressable>
                );
              }}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateTitle}>No lists yet</Text>
                  <Text style={styles.helpText}>
                    Create your first grocery basket and start adding products.
                  </Text>
                </View>
              }
            />
          </View>

          {state.activeList ? (
            <>
              <View style={styles.section}>
                <SectionHeader
                  title={state.activeList.ListName}
                  subtitle="Add products, then compare the store totals."
                />

                <View style={styles.toggleRow}>
                  <ToggleButton
                    label="By name"
                    active={state.addMode === "name"}
                    onPress={() => setField("addMode", "name")}
                  />
                  <ToggleButton
                    label="By link"
                    active={state.addMode === "link"}
                    onPress={() => setField("addMode", "link")}
                  />
                </View>

                <TextInput
                  value={state.addInput}
                  onChangeText={(value) => setField("addInput", value)}
                  placeholder={
                    state.addMode === "name"
                      ? "e.g. milk, chicken breast, pasta"
                      : "Paste a product link"
                  }
                  placeholderTextColor={palette.subtext}
                  autoCapitalize="none"
                  style={styles.input}
                />

                <View style={styles.inlineRow}>
                  <Pressable
                    onPress={handleAddProduct}
                    style={({ pressed }) => [
                      styles.primaryButton,
                      styles.flexGrow,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text style={styles.primaryButtonText}>Add to list</Text>
                  </Pressable>
                  <Pressable
                    onPress={handleCompare}
                    style={({ pressed }) => [
                      styles.secondaryButton,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text style={styles.secondaryButtonText}>Compare</Text>
                  </Pressable>
                </View>
              </View>

              <View style={styles.section}>
                <SectionHeader
                  title="List items"
                  subtitle="The backend pairs Coles and Woolworths products when it can."
                />
                {state.products.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyStateTitle}>Nothing in this list yet</Text>
                    <Text style={styles.helpText}>
                      Add a product name or link to populate the comparison.
                    </Text>
                  </View>
                ) : (
                  state.products.map((entry, index) => (
                    <ProductCard key={`${productLabel(entry)}-${index}`} entry={entry} />
                  ))
                )}
              </View>

              <View style={styles.section}>
                <SectionHeader
                  title="Comparison"
                  subtitle="What your backend says about the current week."
                />

                {comparing ? (
                  <>
                    <View style={styles.summaryGrid}>
                      <SummaryStat
                        label="Cheaper store"
                        value={cheaperStore || "Pending"}
                        tone="accent"
                      />
                      <SummaryStat
                        label="Coles total"
                        value={formatCurrency(totals?.Coles)}
                      />
                      <SummaryStat
                        label="Woolworths total"
                        value={formatCurrency(totals?.Woolworths)}
                      />
                      <SummaryStat
                        label="Basket gap"
                        value={formatCurrency(
                          Math.abs((totals?.Coles ?? 0) - (totals?.Woolworths ?? 0)) || undefined,
                        )}
                      />
                    </View>

                    <View style={styles.comparisonBanner}>
                      <Text style={styles.comparisonBannerTitle}>
                        {cheaperStore || "Comparison ready"}
                      </Text>
                      <Text style={styles.comparisonBannerBody}>
                        {cheaperStore
                          ? `The backend currently favours ${cheaperStore} for this basket.`
                          : "Run a comparison to see which store gives the best total."}
                      </Text>
                    </View>

                    {rows.map((row, index) => (
                      <ComparisonCard key={`${row.ColesProduct?.ProductID ?? "c"}-${index}`} row={row} />
                    ))}
                  </>
                ) : (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyStateTitle}>No comparison yet</Text>
                    <Text style={styles.helpText}>
                      Tap Compare to calculate the current basket totals.
                    </Text>
                  </View>
                )}
              </View>
            </>
          ) : (
            <View style={styles.section}>
              <SectionHeader
                title="What this app does"
                subtitle="Designed to reduce the friction of weekly price checking."
              />
              <View style={styles.storyCard}>
                <Text style={styles.storyTitle}>A simple decision engine</Text>
                <Text style={styles.bodyText}>
                  Start with a recurring shopping list, let the backend map products between
                  Coles and Woolworths, and show the user the cheapest overall store plus the
                  line-by-line differences.
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle ? <Text style={styles.helpText}>{subtitle}</Text> : null}
    </View>
  );
}

function InlineNotice({ tone, text }: { tone: "danger" | "success"; text: string }) {
  return (
    <View
      style={[
        styles.notice,
        tone === "danger" ? styles.noticeDanger : styles.noticeSuccess,
      ]}
    >
      <Text style={styles.noticeText}>{text}</Text>
    </View>
  );
}

function ToggleButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.toggleButton, active && styles.toggleButtonActive]}
    >
      <Text style={[styles.toggleText, active && styles.toggleTextActive]}>{label}</Text>
    </Pressable>
  );
}

function SummaryStat({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "accent";
}) {
  return (
    <View style={[styles.summaryCard, tone === "accent" && styles.summaryCardAccent]}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

function ProductCard({
  entry,
}: {
  entry: {
    Coles: ProductRecord | null;
    Woolworths: ProductRecord | null;
  };
}) {
  const items = [
    entry.Coles ? { label: "Coles", product: entry.Coles } : null,
    entry.Woolworths ? { label: "Woolworths", product: entry.Woolworths } : null,
  ].filter((item): item is { label: Store; product: ProductRecord } => item !== null);

  return (
    <View style={styles.productCard}>
      <Text style={styles.productTitle}>{productLabel(entry)}</Text>
      <View style={styles.productPillRow}>
        {items.map(({ label, product }) => (
          <View key={label} style={styles.productPill}>
            <Text style={styles.productPillLabel}>{label}</Text>
            <Text style={styles.productPillName} numberOfLines={1}>
              {product.Name}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function ComparisonCard({ row }: { row: ComparisonRow }) {
  const colesCheaper = row.CheaperStore === "Coles";
  const woolworthsCheaper = row.CheaperStore === "Woolworths";

  return (
    <View style={styles.comparisonCard}>
      <View style={styles.comparisonTopRow}>
        <Text style={styles.comparisonTitle}>
          {row.WoolworthsProduct.Name || row.ColesProduct.Name}
        </Text>
        <View
          style={[
            styles.cheaperBadge,
            colesCheaper ? styles.cheaperBadgeColes : woolworthsCheaper ? styles.cheaperBadgeWoolies : null,
          ]}
        >
          <Text style={styles.cheaperBadgeText}>{row.CheaperStore}</Text>
        </View>
      </View>

      <View style={styles.priceGrid}>
        <StorePrice
          store="Coles"
          normal={row.ColesPrice.NormalPrice}
          sale={row.ColesPrice.SalePrice}
          cheaper={colesCheaper}
        />
        <StorePrice
          store="Woolworths"
          normal={row.WoolworthsPrice.NormalPrice}
          sale={row.WoolworthsPrice.SalePrice}
          cheaper={woolworthsCheaper}
        />
      </View>

      <View style={styles.comparisonFooter}>
        <Text style={styles.comparisonFooterText}>
          Difference {formatCurrency(row.PriceDifference)} · {formatPercent(row.PercentageDifference)}
        </Text>
      </View>
    </View>
  );
}

function StorePrice({
  store,
  normal,
  sale,
  cheaper,
}: {
  store: Store;
  normal: number;
  sale: number;
  cheaper: boolean;
}) {
  return (
    <View style={[styles.storePriceCard, cheaper && styles.storePriceCardCheaper]}>
      <Text style={styles.storePriceLabel}>{store}</Text>
      <Text style={styles.storePriceValue}>{formatCurrency(sale)}</Text>
      <Text style={styles.storePriceMeta}>Normal {formatCurrency(normal)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: {
    flex: 1,
    backgroundColor: palette.background,
  },
  authShell: {
    padding: 20,
    gap: 16,
  },
  appShell: {
    padding: 16,
    paddingBottom: 40,
    gap: 14,
  },
  backdropBlobTop: {
    position: "absolute",
    top: -80,
    right: -40,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: "rgba(244, 183, 64, 0.18)",
  },
  backdropBlobBottom: {
    position: "absolute",
    bottom: 0,
    left: -120,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(55, 201, 139, 0.10)",
  },
  heroCard: {
    backgroundColor: palette.panel,
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: palette.line,
    gap: 14,
    shadowColor: "#000",
    shadowOpacity: 0.24,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 5,
  },
  headerCard: {
    backgroundColor: palette.panel,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: palette.line,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  kicker: {
    color: palette.accentSoft,
    textTransform: "uppercase",
    letterSpacing: 1.4,
    fontSize: 12,
    fontWeight: "700",
  },
  title: {
    color: palette.text,
    fontSize: 36,
    lineHeight: 40,
    fontWeight: "800",
    letterSpacing: -1,
  },
  headerTitle: {
    color: palette.text,
    fontSize: 22,
    lineHeight: 26,
    fontWeight: "800",
  },
  bodyText: {
    color: palette.subtext,
    fontSize: 16,
    lineHeight: 23,
  },
  helpText: {
    color: palette.subtext,
    fontSize: 13,
    lineHeight: 19,
  },
  metricRow: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
  },
  metricCard: {
    backgroundColor: palette.panelSoft,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 14,
    minWidth: 100,
    flexGrow: 1,
    borderWidth: 1,
    borderColor: palette.line,
  },
  metricValue: {
    color: palette.text,
    fontSize: 17,
    fontWeight: "800",
  },
  metricLabel: {
    color: palette.subtext,
    fontSize: 12,
    marginTop: 4,
  },
  panel: {
    backgroundColor: palette.panel,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: palette.line,
    gap: 14,
  },
  section: {
    gap: 12,
  },
  sectionHeader: {
    gap: 4,
  },
  sectionTitle: {
    color: palette.text,
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  inlineRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  input: {
    backgroundColor: palette.panelSoft,
    color: palette.text,
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
  },
  flexGrow: {
    flexGrow: 1,
    flexBasis: 0,
  },
  primaryButton: {
    backgroundColor: palette.accent,
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 14,
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButton: {
    backgroundColor: palette.panelSoft,
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: palette.background,
    fontSize: 15,
    fontWeight: "800",
  },
  secondaryButtonText: {
    color: palette.text,
    fontSize: 15,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.86,
    transform: [{ scale: 0.99 }],
  },
  notice: {
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
  },
  noticeDanger: {
    backgroundColor: "rgba(241, 109, 109, 0.12)",
    borderColor: "rgba(241, 109, 109, 0.4)",
  },
  noticeSuccess: {
    backgroundColor: "rgba(55, 201, 139, 0.10)",
    borderColor: "rgba(55, 201, 139, 0.36)",
  },
  noticeText: {
    color: palette.text,
    fontSize: 14,
    lineHeight: 20,
  },
  statusBadge: {
    backgroundColor: "rgba(244, 183, 64, 0.12)",
    borderColor: "rgba(244, 183, 64, 0.3)",
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  statusBadgeText: {
    color: palette.accentSoft,
    fontSize: 12,
    fontWeight: "700",
  },
  listRail: {
    gap: 10,
    paddingVertical: 4,
  },
  listCard: {
    width: 170,
    backgroundColor: palette.panelSoft,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: palette.line,
    gap: 10,
  },
  listCardActive: {
    borderColor: palette.accent,
    backgroundColor: palette.panelWarm,
  },
  listName: {
    color: palette.text,
    fontSize: 16,
    fontWeight: "800",
  },
  listMeta: {
    color: palette.subtext,
    fontSize: 12,
  },
  listAction: {
    color: palette.accentSoft,
    fontSize: 12,
    fontWeight: "700",
  },
  emptyState: {
    backgroundColor: palette.panelSoft,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: palette.line,
    gap: 4,
  },
  emptyStateTitle: {
    color: palette.text,
    fontSize: 16,
    fontWeight: "800",
  },
  toggleRow: {
    flexDirection: "row",
    gap: 10,
  },
  toggleButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: palette.panelSoft,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: palette.line,
  },
  toggleButtonActive: {
    backgroundColor: "rgba(244, 183, 64, 0.16)",
    borderColor: palette.accent,
  },
  toggleText: {
    color: palette.subtext,
    fontSize: 13,
    fontWeight: "700",
  },
  toggleTextActive: {
    color: palette.text,
  },
  productCard: {
    backgroundColor: palette.panelSoft,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: palette.line,
    gap: 12,
  },
  productTitle: {
    color: palette.text,
    fontSize: 16,
    fontWeight: "800",
  },
  productPillRow: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
  },
  productPill: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 16,
    padding: 12,
    minWidth: 140,
    flexGrow: 1,
    borderWidth: 1,
    borderColor: palette.line,
    gap: 2,
  },
  productPillLabel: {
    color: palette.accentSoft,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.9,
    fontWeight: "700",
  },
  productPillName: {
    color: palette.text,
    fontSize: 14,
    fontWeight: "700",
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  summaryCard: {
    width: "48%",
    backgroundColor: palette.panelSoft,
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: palette.line,
    gap: 6,
  },
  summaryCardAccent: {
    backgroundColor: "rgba(244, 183, 64, 0.14)",
    borderColor: palette.accent,
  },
  summaryLabel: {
    color: palette.subtext,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  summaryValue: {
    color: palette.text,
    fontSize: 18,
    fontWeight: "800",
  },
  comparisonBanner: {
    backgroundColor: "rgba(55, 201, 139, 0.10)",
    borderColor: "rgba(55, 201, 139, 0.28)",
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    gap: 4,
  },
  comparisonBannerTitle: {
    color: palette.text,
    fontSize: 18,
    fontWeight: "800",
  },
  comparisonBannerBody: {
    color: palette.subtext,
    fontSize: 14,
    lineHeight: 20,
  },
  comparisonCard: {
    backgroundColor: palette.panelSoft,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: palette.line,
    gap: 12,
  },
  comparisonTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  comparisonTitle: {
    color: palette.text,
    fontSize: 16,
    fontWeight: "800",
    flexShrink: 1,
  },
  cheaperBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: palette.line,
  },
  cheaperBadgeColes: {
    backgroundColor: "rgba(0, 95, 175, 0.18)",
    borderColor: "rgba(0, 95, 175, 0.42)",
  },
  cheaperBadgeWoolies: {
    backgroundColor: "rgba(0, 132, 255, 0.18)",
    borderColor: "rgba(0, 132, 255, 0.42)",
  },
  cheaperBadgeText: {
    color: palette.text,
    fontSize: 11,
    fontWeight: "800",
  },
  priceGrid: {
    flexDirection: "row",
    gap: 10,
  },
  storePriceCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: palette.line,
    padding: 12,
    gap: 4,
  },
  storePriceCardCheaper: {
    backgroundColor: "rgba(244, 183, 64, 0.16)",
    borderColor: palette.accent,
  },
  storePriceLabel: {
    color: palette.accentSoft,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  storePriceValue: {
    color: palette.text,
    fontSize: 18,
    fontWeight: "800",
  },
  storePriceMeta: {
    color: palette.subtext,
    fontSize: 12,
  },
  comparisonFooter: {
    borderTopWidth: 1,
    borderTopColor: palette.line,
    paddingTop: 10,
  },
  comparisonFooterText: {
    color: palette.subtext,
    fontSize: 13,
  },
  storyCard: {
    backgroundColor: palette.panelSoft,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: palette.line,
    gap: 8,
  },
  storyTitle: {
    color: palette.text,
    fontSize: 18,
    fontWeight: "800",
  },
});
