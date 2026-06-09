import React, { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet } from "react-native";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import { apiFetch, normalizeListProducts, normalizeLists } from "./lib/api";
import { getCurrentRoute, pathFromRoute, pushRoute, routeFromLocation } from "./lib/navigation";
import { clearSnapshot, loadSnapshot, saveSnapshot } from "./lib/storage";
import type {
  AppRoute,
  AppState,
  CompareResponse,
  EntryCoverage,
  EntryDraft,
  EntryMode,
  ListSummary,
  ListProductsResponse,
} from "./lib/types";
import { Notice } from "./components/common";
import { ThemeProvider, themes } from "./lib/theme";
import LandingScreen from "./screens/LandingScreen";
import PickListScreen from "./screens/PickListScreen";
import ModifyListScreen from "./screens/ModifyListScreen";
import ResultsScreen from "./screens/ResultsScreen";
import LoadingResultsScreen from "./screens/LoadingResultsScreen";

const initialDraft = (): EntryDraft => ({
  coverage: "both",
  coles: "",
  woolworths: "",
});

const initialData = (): AppState => ({
  screen: "landing",
  themeMode: "dark",
  email: "",
  userId: "",
  lists: [],
  activeList: null,
  products: [],
  compareResult: null,
  loading: false,
  error: null,
  newListName: "",
  entryMode: "name",
  drafts: {
    name: initialDraft(),
    link: initialDraft(),
  },
});

export default function AppShell() {
  const [route, setRoute] = useState<AppRoute>(() => getCurrentRoute());
  const [state, setState] = useState<AppState>(() => {
    const snapshot = loadSnapshot();
    return snapshot
      ? {
          ...initialData(),
          ...snapshot,
          themeMode: snapshot.themeMode ?? "dark",
          screen: route.screen,
        }
      : {
          ...initialData(),
          screen: route.screen,
        };
  });
  const [hydrated, setHydrated] = useState(false);

  const setField = <K extends keyof AppState>(field: K, value: AppState[K]) => {
    setState((current) => ({ ...current, [field]: value }));
  };

  const setDraftField = (
    mode: EntryMode,
    field: keyof EntryDraft,
    value: string | EntryCoverage,
  ) => {
    setState((current) => ({
      ...current,
      drafts: {
        ...current.drafts,
        [mode]: {
          ...current.drafts[mode],
          [field]: value,
        },
      },
    }));
  };

  const navigate = (nextRoute: AppRoute, replace = false) => {
    setRoute(nextRoute);
    pushRoute(nextRoute, replace);
  };

  const persist = () => {
    saveSnapshot({
      screen: state.screen,
      email: state.email,
      userId: state.userId,
      lists: state.lists,
      activeList: state.activeList,
      products: state.products,
      compareResult: state.compareResult,
      themeMode: state.themeMode,
      newListName: state.newListName,
      entryMode: state.entryMode,
      drafts: state.drafts,
    });
  };

  const loadLists = async (userId: string) => {
    const response = await apiFetch<unknown>(`/getlists/${encodeURIComponent(userId)}`);
    console.log("Fetched lists:", response);
    const nextLists = normalizeLists(response);
    setField("lists", nextLists);
    return nextLists;
  };

  const loadListDetails = async (userId: string, listId: string) => {
    const response = await apiFetch<ListProductsResponse>(
      `/getlist/${encodeURIComponent(userId)}/${encodeURIComponent(listId)}`,
    );
    const nextProducts = normalizeListProducts(response);
    setField("products", nextProducts);
    return nextProducts;
  };

  const ensureListContext = async (listId: string) => {
    if (!state.userId) return null;

    let list = state.lists.find((candidate) => candidate.ListID === listId) ?? null;
    if (!list) {
      const nextLists = await loadLists(state.userId);
      list = nextLists.find((candidate) => candidate.ListID === listId) ?? null;
    }

    if (!list) {
      setField("error", "That list could not be found.");
      return null;
    }

    setField("activeList", list);
    await loadListDetails(state.userId, listId);
    return list;
  };

  const goToLanding = () => {
    setField("screen", "landing");
    navigate({ screen: "landing" });
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
      setField("screen", "pickList");
      navigate({ screen: "pickList" });
    } catch (error) {
      setField("error", error instanceof Error ? error.message : "Could not sign in.");
    } finally {
      setField("loading", false);
    }
  };

  const handleCreateList = async () => {
    const listName = state.newListName.trim();
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

      const createdList: ListSummary = { ListID: payload.ListID, ListName: listName, ProductCount: 0, CreatedAt: new Date().toISOString(), LastEdited: new Date().toISOString() };
      setField("lists", [createdList, ...state.lists]);
      setField("activeList", createdList);
      setField("newListName", "");
      await loadListDetails(state.userId, payload.ListID);
      setField("compareResult", null);
      setField("error", null);
      setField("screen", "modifyList");
      navigate({ screen: "modifyList", listId: createdList.ListID });
    } catch (error) {
      setField("error", error instanceof Error ? error.message : "Could not create the list.");
    } finally {
      setField("loading", false);
    }
  };

  const validateDraft = (draft: EntryDraft) => {
    const needsBoth = draft.coverage === "both";

    if (needsBoth && (!draft.coles.trim() || !draft.woolworths.trim())) {
      return "Enter values for both stores.";
    }

    return null;
  };

  const buildPayload = (draft: EntryDraft) => {
    const payload: Record<string, string> = {};
    if (draft.coverage === "both" || draft.coverage === "coles") {
      payload.Coles = draft.coles.trim();
    }
    if (draft.coverage === "both" || draft.coverage === "woolworths") {
      payload.Woolworths = draft.woolworths.trim();
    }
    return payload;
  };

  const submitAddProduct = async (mode: EntryMode, draft: EntryDraft, editingProductId?: string) => {
    if (!state.activeList) return;

    const validation = validateDraft(draft);
    if (validation) {
      setField("error", validation);
      return;
    }

    setField("loading", true);
    try {
      if (editingProductId) {
        await apiFetch<{ Message: string }>("/removeProduct", {
          method: "POST",
          body: JSON.stringify({
            UserID: state.userId,
            ListID: state.activeList.ListID,
            ProductID: editingProductId,
          }),
        });
      }

      const endpoint = mode === "name" ? "/addProductFromName" : "/addProductFromLink";
      const payloadKey = mode === "name" ? "ProductNames" : "ProductLinks";
      await apiFetch<{ Message: string }>(endpoint, {
        method: "POST",
        body: JSON.stringify({
          UserID: state.userId,
          ListID: state.activeList.ListID,
          [payloadKey]: buildPayload(draft),
        }),
      });

      await loadListDetails(state.userId, state.activeList.ListID);
      setField("compareResult", null);
      setField("error", null);
    } catch (error) {
      setField("error", error instanceof Error ? error.message : "Could not add the product.");
    } finally {
      setField("loading", false);
    }
  };

  const runComparison = async (listId: string) => {
    if (!state.userId) return;
    setField("loading", true);
    try {
      const payload = await apiFetch<CompareResponse>("/compare", {
        method: "POST",
        body: JSON.stringify({ UserID: state.userId, ListID: listId }),
      });
      setField("compareResult", payload);
      setField("error", null);
      setField("screen", "results");
      navigate({ screen: "results", listId });
    } catch (error) {
      setField("error", error instanceof Error ? error.message : "Could not compare the list.");
      setField("screen", "modifyList");
      navigate({ screen: "modifyList", listId });
    } finally {
      setField("loading", false);
    }
  };

  const handleCompare = async () => {
    if (!state.activeList) return;
    setField("compareResult", null);
    navigate({ screen: "loadingResults", listId: state.activeList.ListID });
  };

  const toggleTheme = () => {
    setState((current) => ({
      ...current,
      themeMode: current.themeMode === "dark" ? "light" : "dark",
    }));
  };

  const handleRemoveProduct = async (productId: string) => {
    if (!state.activeList) return;

    setField("loading", true);
    try {
      await apiFetch<{ Message: string }>("/removeProduct", {
        method: "POST",
        body: JSON.stringify({
          UserID: state.userId,
          ListID: state.activeList.ListID,
          ProductID: productId,
        }),
      });
      await loadListDetails(state.userId, state.activeList.ListID);
      setField("compareResult", null);
      setField("error", null);
    } catch (error) {
      setField("error", error instanceof Error ? error.message : "Could not remove the product.");
    } finally {
      setField("loading", false);
    }
  };

  const handleEditProduct = async (productId: string, draft: EntryDraft, mode: EntryMode) => {
    await submitAddProduct(mode, draft, productId);
  };

  useEffect(() => {
    const nextRoute = getCurrentRoute();
    setRoute(nextRoute);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onPopState = () => {
      const next = routeFromLocation(window.location.pathname);
      setRoute(next);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const currentPath = typeof window !== "undefined" ? window.location.pathname : "";
    const nextPath = pathFromRoute(route);
    if (currentPath !== nextPath) {
      pushRoute(route, true);
    }
  }, [hydrated, route]);

  useEffect(() => {
    if (!hydrated) return;
    persist();
  }, [hydrated, state]);

  useEffect(() => {
    if (!hydrated) return;
    setField("screen", route.screen);
  }, [hydrated, route.screen]);

  useEffect(() => {
    if (!hydrated || !state.userId) return;

    if (route.screen === "pickList" && state.lists.length === 0) {
      void loadLists(state.userId);
    }

    if ((route.screen === "modifyList" || route.screen === "loadingResults" || route.screen === "results") && route.listId) {
      if (!state.activeList || state.activeList.ListID !== route.listId) {
        void ensureListContext(route.listId);
      }
    }
  }, [hydrated, route.screen, route.listId, state.userId]);

  useEffect(() => {
    if (!hydrated || !state.userId) return;
    if (route.screen !== "loadingResults" || !route.listId || !state.activeList) return;

    if (state.compareResult && state.activeList.ListID === route.listId) {
      navigate({ screen: "results", listId: route.listId }, true);
      setField("screen", "results");
      return;
    }

    void runComparison(route.listId);
  }, [hydrated, route.screen, route.listId, state.activeList?.ListID, state.userId]);

  useEffect(() => {
    if (!hydrated || !state.userId) return;
    if (route.screen !== "results" || !route.listId || !state.activeList) return;
    if (!state.compareResult || state.activeList.ListID !== route.listId) {
      navigate({ screen: "loadingResults", listId: route.listId }, true);
    }
  }, [hydrated, route.screen, route.listId, state.activeList?.ListID, state.compareResult, state.userId]);

  const compare = state.compareResult ?? null;
  const totals = compare?.TotalSalePrice ?? compare?.TotalCurrentPrice ?? null;
  const rows = compare?.Comparisons ?? compare?.Products ?? [];
  const cheapest = compare?.CheaperStore;
  const palette = themes[state.themeMode];

  return (
    <ThemeProvider mode={state.themeMode} toggleTheme={toggleTheme}>
      <SafeAreaView style={[styles.root, { backgroundColor: palette.background }]}>
        <StatusBar barStyle={state.themeMode === "dark" ? "light-content" : "dark-content"} />
        <ExpoStatusBar style={state.themeMode === "dark" ? "light" : "dark"} />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.flex}
        >
          <ScrollView contentContainerStyle={[styles.scrollShell, { backgroundColor: palette.background }]}>
            {state.error ? <Notice tone="danger" text={state.error} /> : null}

            {route.screen === "landing" ? (
              <LandingScreen
                email={state.email}
                loading={state.loading}
                onEmailChange={(value) => setField("email", value)}
                onContinue={handleSignin}
              />
            ) : null}

            {route.screen === "pickList" ? (
              <PickListScreen
                lists={state.lists}
                loading={state.loading}
                newListName={state.newListName}
                onNewListNameChange={(value) => setField("newListName", value)}
                onCreateList={handleCreateList}
                onPickList={(list) => {
                  setField("activeList", list);
                  setField("screen", "modifyList");
                  setField("compareResult", null);
                  navigate({ screen: "modifyList", listId: list.ListID });
                  void ensureListContext(list.ListID);
                }}
                onDirectCompare={(list) => {
                  setField("activeList", list);
                  setField("screen", "loadingResults");
                  setField("compareResult", null);
                  navigate({ screen: "loadingResults", listId: list.ListID });
                }}
              onBackToLogin={() => {
                clearSnapshot();
                setState((current) => ({
                  ...initialData(),
                  themeMode: current.themeMode,
                }));
                goToLanding();
              }}
            />
            ) : null}

            {route.screen === "modifyList" && state.activeList ? (
              <ModifyListScreen
                list={state.activeList}
                loading={state.loading}
                products={state.products}
                entryMode={state.entryMode}
                draft={state.drafts[state.entryMode]}
                onEntryModeChange={(mode) => setField("entryMode", mode)}
                onDraftChange={(field, value) =>
                  setDraftField(state.entryMode, field, value)
                }
                onAddProduct={(mode, draft, editingProductId) =>
                  void submitAddProduct(mode, draft, editingProductId)
                }
                onCompare={() => void handleCompare()}
                onBack={() => navigate({ screen: "pickList" })}
                onViewResults={() => navigate({ screen: "results", listId: state.activeList?.ListID })}
                hasResults={Boolean(state.compareResult)}
                onRemoveProduct={(productId) => void handleRemoveProduct(productId)}
                onEditProduct={(productId, draft, mode) => void handleEditProduct(productId, draft, mode)}
              />
            ) : null}

            {route.screen === "loadingResults" && state.activeList ? (
              <LoadingResultsScreen listName={state.activeList.ListName} />
            ) : null}

            {route.screen === "results" && state.activeList ? (
              <ResultsScreen
                listName={state.activeList.ListName}
                compare={compare}
                rows={rows}
                totals={totals}
                cheapest={cheapest}
                onBackToEdit={() => navigate({ screen: "modifyList", listId: state.activeList?.ListID })}
                onPickAnother={() => navigate({ screen: "pickList" })}
              />
            ) : null}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  root: {
    flex: 1,
    backgroundColor: "#000",
  },
  scrollShell: {
    flexGrow: 1,
    backgroundColor: "#000",
  },
});
