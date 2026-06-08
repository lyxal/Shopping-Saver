import React, { useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import { apiFetch, getApiConfig, normalizeListProducts, normalizeLists } from "./lib/api";
import { palette } from "./lib/theme";
import type {
  AppState,
  CompareResponse,
  EntryCoverage,
  EntryDraft,
  EntryMode,
  ListSummary,
  ListProductsResponse,
  Screen,
} from "./lib/types";
import { Notice, StepTrack, screenLabel } from "./components/common";
import LoginScreen from "./screens/LoginScreen";
import PickListScreen from "./screens/PickListScreen";
import ModifyListScreen from "./screens/ModifyListScreen";
import ResultsScreen from "./screens/ResultsScreen";

const initialDraft = (): EntryDraft => ({
  coverage: "both",
  coles: "",
  woolworths: "",
});

const initialState: AppState = {
  screen: "login",
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
};

export default function AppShell() {
  const [state, setState] = useState<AppState>(initialState);
  const apiBase = useMemo(() => getApiConfig().baseUrl, []);

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

  const focusList = async (list: ListSummary) => {
    setField("activeList", list);
    setField("compareResult", null);
    setField("loading", true);
    try {
      await loadListDetails(state.userId, list.ListID);
      setField("screen", "modifyList");
      setField("error", null);
    } catch (error) {
      setField("error", error instanceof Error ? error.message : "Could not load that list.");
    } finally {
      setField("loading", false);
    }
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
      setField("screen", "pickList");
      setField("error", null);
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

      const createdList: ListSummary = {
        ListID: payload.ListID,
        ListName: listName,
      };
      setField("lists", [createdList, ...state.lists]);
      setField("activeList", createdList);
      setField("newListName", "");
      await loadListDetails(state.userId, payload.ListID);
      setField("screen", "modifyList");
      setField("error", null);
    } catch (error) {
      setField("error", error instanceof Error ? error.message : "Could not create the list.");
    } finally {
      setField("loading", false);
    }
  };

  const validateDraft = (draft: EntryDraft) => {
    const needsColes = draft.coverage === "both" || draft.coverage === "coles";
    const needsWoolworths =
      draft.coverage === "both" || draft.coverage === "woolworths";

    if (needsColes && !draft.coles.trim()) {
      return "Enter the Coles value first.";
    }
    if (needsWoolworths && !draft.woolworths.trim()) {
      return "Enter the Woolworths value first.";
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

  const handleAddProduct = async () => {
    if (!state.activeList) return;

    const mode = state.entryMode;
    const draft = state.drafts[mode];
    const validation = validateDraft(draft);
    if (validation) {
      setField("error", validation);
      return;
    }

    const endpoint = mode === "name" ? "/addProductFromName" : "/addProductFromLink";
    const payloadKey = mode === "name" ? "ProductNames" : "ProductLinks";

    setField("loading", true);
    try {
      await apiFetch<{ Message: string }>(endpoint, {
        method: "POST",
        body: JSON.stringify({
          UserID: state.userId,
          ListID: state.activeList.ListID,
          [payloadKey]: buildPayload(draft),
        }),
      });

      setState((current) => ({
        ...current,
        drafts: {
          ...current.drafts,
          [mode]: initialDraft(),
        },
      }));
      await loadListDetails(state.userId, state.activeList.ListID);
      setField("error", null);
    } catch (error) {
      setField("error", error instanceof Error ? error.message : "Could not add the product.");
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
      setField("screen", "results");
      setField("error", null);
    } catch (error) {
      setField("error", error instanceof Error ? error.message : "Could not compare the list.");
    } finally {
      setField("loading", false);
    }
  };

  const compare = state.compareResult ?? null;
  const totals = compare?.TotalSalePrice ?? compare?.TotalCurrentPrice ?? null;
  const rows = compare?.Comparisons ?? compare?.Products ?? [];
  const cheapest = compare?.CheaperStore;

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" />
      <ExpoStatusBar style="dark" />
      <View style={styles.topGlow} />
      <View style={styles.bottomGlow} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.shell}>
          <View style={styles.brandRow}>
            <View>
              <Text style={styles.brand}>Shopping Saver</Text>
              <Text style={styles.brandSub}>Weekly grocery comparison, simplified.</Text>
            </View>
            <View style={styles.brandChip}>
              <Text style={styles.brandChipText}>{screenLabel(state.screen)}</Text>
            </View>
          </View>

          <StepTrack screen={state.screen} />

          {state.error ? <Notice tone="danger" text={state.error} /> : null}

          {state.screen === "login" ? (
            <LoginScreen
              email={state.email}
              loading={state.loading}
              apiBase={apiBase}
              onEmailChange={(value) => setField("email", value)}
              onContinue={handleSignin}
            />
          ) : null}

          {state.screen === "pickList" ? (
            <PickListScreen
              lists={state.lists}
              loading={state.loading}
              newListName={state.newListName}
              onNewListNameChange={(value) => setField("newListName", value)}
              onCreateList={handleCreateList}
              onPickList={focusList}
              onBackToLogin={() => setField("screen", "login")}
            />
          ) : null}

          {state.screen === "modifyList" && state.activeList ? (
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
              onAddProduct={handleAddProduct}
              onCompare={handleCompare}
              onBack={() => setField("screen", "pickList")}
              onViewResults={() => setField("screen", "results")}
              hasResults={Boolean(state.compareResult)}
            />
          ) : null}

          {state.screen === "results" && state.activeList ? (
            <ResultsScreen
              listName={state.activeList.ListName}
              compare={compare}
              rows={rows}
              totals={totals}
              cheapest={cheapest}
              onBackToEdit={() => setField("screen", "modifyList")}
              onPickAnother={() => setField("screen", "pickList")}
            />
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: {
    flex: 1,
    backgroundColor: palette.background,
  },
  shell: {
    padding: 18,
    paddingBottom: 40,
    gap: 14,
  },
  topGlow: {
    position: "absolute",
    top: -70,
    right: -50,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(244, 183, 64, 0.18)",
  },
  bottomGlow: {
    position: "absolute",
    bottom: -100,
    left: -120,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(25, 143, 109, 0.10)",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  brand: {
    color: palette.text,
    fontSize: 30,
    lineHeight: 34,
    fontWeight: "900",
    letterSpacing: -1,
  },
  brandSub: {
    color: palette.muted,
    fontSize: 14,
    marginTop: 4,
  },
  brandChip: {
    backgroundColor: palette.surfaceWarm,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "rgba(20, 32, 51, 0.10)",
  },
  brandChipText: {
    color: palette.accentDeep,
    fontSize: 12,
    fontWeight: "800",
  },
});
