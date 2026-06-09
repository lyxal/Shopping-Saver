import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import type { EntryCoverage, EntryDraft, EntryMode, ListSummary, ProductRecord } from "../lib/types";
import { EmptyState, ProductThumbnail, ThemeToggle, ToggleChip } from "../components/common";
import { useTheme } from "../lib/theme";

type ProductPair = {
  Coles: ProductRecord | null;
  Woolworths: ProductRecord | null;
};

type OverlayMode = "add" | "edit";

export default function ModifyListScreen({
  list,
  loading,
  products,
  entryMode,
  draft,
  onEntryModeChange,
  onDraftChange,
  onAddProduct,
  onCompare,
  onBack,
  onViewResults,
  hasResults,
  onRemoveProduct,
  onEditProduct,
}: {
  list: ListSummary;
  loading: boolean;
  products: ProductPair[];
  entryMode: EntryMode;
  draft: EntryDraft;
  onEntryModeChange: (mode: EntryMode) => void;
  onDraftChange: (field: keyof EntryDraft, value: string | EntryCoverage) => void;
  onAddProduct: (mode: EntryMode, draft: EntryDraft, editingProductId?: string) => void;
  onCompare: () => void;
  onBack: () => void;
  onViewResults: () => void;
  hasResults: boolean;
  onRemoveProduct: (productId: string) => void;
  onEditProduct: (productId: string, draft: EntryDraft, mode: EntryMode) => void;
}) {
  const { palette } = useTheme();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const [overlayMode, setOverlayMode] = useState<OverlayMode | null>(null);
  const [editingProductId, setEditingProductId] = useState<string | undefined>(undefined);

  const title = useMemo(() => `Editing "${list.ListName}"`, [list.ListName]);

  const detectStoreFromLink = (link: string): string | null => {
    if (!link) return null;
    if (link.includes("coles.com.au") || link.includes("coles")) return "Coles";
    if (link.includes("woolworths.com.au") || link.includes("woolworths")) return "Woolworths";
    return null;
  };

  const openAddOverlay = () => {
    setEditingProductId(undefined);
    setOverlayMode("add");
    onEntryModeChange("name");
    onDraftChange("coverage", "both");
    onDraftChange("coles", "");
    onDraftChange("woolworths", "");
  };

  const openEditOverlay = (entry: ProductPair) => {
    const existingMode: EntryMode = entryMode;
    const nextCoverage: EntryCoverage =
      entry.Coles && entry.Woolworths ? "both" : entry.Coles ? "coles" : "woolworths";

    onEntryModeChange(existingMode);
    onDraftChange("coverage", nextCoverage);
    onDraftChange(
      "coles",
      existingMode === "name" ? entry.Coles?.Name ?? "" : entry.Coles?.Link ?? "",
    );
    onDraftChange(
      "woolworths",
      existingMode === "name" ? entry.Woolworths?.Name ?? "" : entry.Woolworths?.Link ?? "",
    );

    setEditingProductId(entry.Coles?.ProductID ?? entry.Woolworths?.ProductID);
    setOverlayMode("edit");
  };

  const closeOverlay = () => {
    setOverlayMode(null);
    setEditingProductId(undefined);
  };

  const submitOverlay = () => {
    if (overlayMode === "edit") {
      if (editingProductId) {
        onEditProduct(editingProductId, draft, entryMode);
      }
    } else {
      onAddProduct(entryMode, draft);
    }
    closeOverlay();
  };

  return (
    <View style={styles.page}>
      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <Text style={styles.brand}>Open.</Text>
          <Pressable onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Return to all lists</Text>
          </Pressable>
        </View>
        <View style={styles.topBarRight}>
          <Pressable
            style={[styles.compareTopButton, { backgroundColor: palette.accent }]}
            onPress={hasResults ? onViewResults : onCompare}
          >
            <Text style={styles.compareTopButtonText}>
              {hasResults ? "View Results" : "Compare"}
            </Text>
          </Pressable>
          <ThemeToggle />
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.headerRow}>
          <View style={styles.headerText}>
            <Text style={styles.pageKicker}>Edit List</Text>
            <Text style={styles.pageSub}>
              Tap an item to replace it, or use the button below to add a new product.
            </Text>
          </View>
        </View>

        <View style={styles.listColumn}>
          {products.length === 0 ? (
            <EmptyState
              title="No products yet"
              body="Use Add Item to start building your list."
            />
          ) : (
            products.map((entry, index) => (
              <EditableItemCard
                key={`${entry.Coles?.ProductID ?? entry.Woolworths?.ProductID ?? index}`}
                entry={entry}
                onRemove={() => onRemoveProduct(entry.Coles?.ProductID ?? entry.Woolworths?.ProductID ?? "")}
                onEdit={() => openEditOverlay(entry)}
              />
            ))
          )}
        </View>

        <Pressable style={styles.addButton} onPress={openAddOverlay}>
          <Text style={styles.addButtonLabel}>Add Item</Text>
          <View style={styles.addBubble}>
            <Text style={styles.addBubbleText}>+</Text>
          </View>
        </Pressable>
      </View>

      {overlayMode ? (
        <View style={styles.overlayScrim}>
          <Pressable style={StyleSheet.absoluteFill} onPress={closeOverlay} />
          <View style={styles.overlayCard}>
            <View style={styles.overlayHeader}>
              <Text style={styles.overlayTitle}>
                {overlayMode === "add" ? "Add Product" : "Edit Product"}
              </Text>
              <Pressable style={styles.overlayCloseButton} onPress={closeOverlay}>
                <Text style={styles.overlayCloseButtonText}>✕</Text>
              </Pressable>
            </View>

            <View style={styles.overlayModeRow}>
              <ToggleChip
                label="By Name"
                active={entryMode === "name"}
                onPress={() => onEntryModeChange("name")}
              />
              <ToggleChip
                label="By Link"
                active={entryMode === "link"}
                onPress={() => onEntryModeChange("link")}
              />
            </View>

            <View style={styles.overlayCoverageRow}>
              {entryMode === "name" ? (
                <>
                 <ToggleChip
                    label="Different names"
                    active={draft.coverage === "both"}
                    onPress={() => onDraftChange("coverage", "both")}
                  />
                  <ToggleChip
                    label="Coles name"
                    active={draft.coverage === "coles"}
                    onPress={() => onDraftChange("coverage", "coles")}
                  />
                  <ToggleChip
                    label="Woolworths name"
                    active={draft.coverage === "woolworths"}
                    onPress={() => onDraftChange("coverage", "woolworths")}
                  />
                </>
              ) : (
                <>
                  <ToggleChip
                    label="One link"
                    active={draft.coverage === "both"}
                    onPress={() => onDraftChange("coverage", "both")}
                  />
                  <ToggleChip
                    label="Both links"
                    active={draft.coverage === "coles"}
                    onPress={() => onDraftChange("coverage", "coles")}
                  />
                </>
              )}
            </View>

            <View style={styles.overlayFieldSection}>
              <Text style={styles.overlayFieldLabel}>
                {entryMode === "name" ? "Product Name" : "Product Link"}
              </Text>

              {entryMode === "name" ? (
                <>
                  {draft.coverage === "coles" ? (
                    <TextInput
                      value={draft.coles}
                      onChangeText={(value) => onDraftChange("coles", value)}
                      placeholder="Enter product name"
                      placeholderTextColor={palette.muted}
                      autoCapitalize="words"
                      style={styles.overlayInput}
                    />
                  )  :  draft.coverage === "woolworths" ? (<TextInput
                      value={draft.woolworths}
                      onChangeText={(value) => onDraftChange("woolworths", value)}
                      placeholder="Enter product name"
                      placeholderTextColor={palette.muted}
                      autoCapitalize="words"
                      style={styles.overlayInput}
                    />) : (
                    <View style={styles.dualFieldsContainer}>
                      <TextInput
                        value={draft.coles}
                        onChangeText={(value) => onDraftChange("coles", value)}
                        placeholder="Coles name"
                        placeholderTextColor={palette.muted}
                        autoCapitalize="words"
                        style={styles.overlayInput}
                      />
                      <TextInput
                        value={draft.woolworths}
                        onChangeText={(value) => onDraftChange("woolworths", value)}
                        placeholder="Woolworths name"
                        placeholderTextColor={palette.muted}
                        autoCapitalize="words"
                        style={styles.overlayInput}
                      />
                    </View>
                  )}
                </>
              ) : (
                <>
                  {draft.coverage === "both" ? (
                    <View>
                      <TextInput
                        value={draft.coles}
                        onChangeText={(value) => onDraftChange("coles", value)}
                        placeholder="Paste link (Coles or Woolworths)"
                        placeholderTextColor={palette.muted}
                        autoCapitalize="none"
                        style={styles.overlayInput}
                      />
                      {detectStoreFromLink(draft.coles) ? (
                        <Text style={styles.storeDetectionHint}>
                          Detected: {detectStoreFromLink(draft.coles)}
                        </Text>
                      ) : null}
                    </View>
                  ) : (
                    <View style={styles.dualFieldsContainer}>
                      <View>
                        <TextInput
                          value={draft.coles}
                          onChangeText={(value) => onDraftChange("coles", value)}
                          placeholder="Coles link"
                          placeholderTextColor={palette.muted}
                          autoCapitalize="none"
                          style={styles.overlayInput}
                        />
                        {detectStoreFromLink(draft.coles) === "Coles" ? (
                          <Text style={styles.storeDetectionHint}>✓ Coles link detected</Text>
                        ) : null}
                      </View>
                      <View>
                        <TextInput
                          value={draft.woolworths}
                          onChangeText={(value) => onDraftChange("woolworths", value)}
                          placeholder="Woolworths link"
                          placeholderTextColor={palette.muted}
                          autoCapitalize="none"
                          style={styles.overlayInput}
                        />
                        {detectStoreFromLink(draft.woolworths) === "Woolworths" ? (
                          <Text style={styles.storeDetectionHint}>✓ Woolworths link detected</Text>
                        ) : null}
                      </View>
                    </View>
                  )}
                </>
              )}
            </View>

            <View style={styles.overlayActions}>
              <Pressable style={[styles.overlayButton, styles.overlayCancelButton]} onPress={closeOverlay}>
                <Text style={styles.overlayCancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable style={[styles.overlayButton, styles.overlaySubmitButton]} onPress={submitOverlay} disabled={loading}>
                <Text style={styles.overlaySubmitButtonText}>
                  {loading ? "..." : overlayMode === "add" ? "Add" : "Save"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      ) : null}
    </View>
  );
}

function EditableItemCard({
  entry,
  onRemove,
  onEdit,
}: {
  entry: ProductPair;
  onRemove: () => void;
  onEdit: () => void;
}) {
  const { palette } = useTheme();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const label = entry.Coles?.Name || entry.Woolworths?.Name || "Item Name";
  const colesLink = entry.Coles?.Link;
  const woolworthsLink = entry.Woolworths?.Link;

  return (
    <View style={styles.card}>
      <View style={styles.cardLeft}>
        <ProductThumbnail source={entry.Coles?.ImageLink || entry.Woolworths?.ImageLink} fallbackLabel={label.slice(0, 1)} size={60} />
      </View>

      <View style={styles.cardMiddle}>
        <Text style={styles.cardTitle}>{label}</Text>
        <Text style={styles.cardMeta}>Added just now</Text>
        <View style={styles.cardLinksContainer}>
          {colesLink ? (
            <Pressable onPress={() => onViewLink(colesLink)}>
              <Text style={styles.cardLink}>View at Coles</Text>
            </Pressable>
          ) : null}
          {colesLink && woolworthsLink ? (
            <Text style={styles.cardLinkSeparator}> · </Text>
          ) : null}
          {woolworthsLink ? (
            <Pressable onPress={() => onViewLink(woolworthsLink)}>
              <Text style={styles.cardLink}>View at Woolworths</Text>
            </Pressable>
          ) : null}
        </View>
      </View>

      <View style={styles.cardRight}>
        <Pressable style={styles.removeButton} onPress={onRemove}>
          <Text style={styles.removeButtonText}>−</Text>
        </Pressable>
        <Pressable style={styles.editButton} onPress={onEdit}>
          <Text style={styles.editButtonText}>Edit</Text>
        </Pressable>
      </View>
    </View>
  );

  function onViewLink(link: string) {
    if (typeof window !== "undefined") {
      window.open(link, "_blank");
    }
  }
}

function ActionButton({
  label,
  onPress,
  filled = false,
}: {
  label: string;
  onPress: () => void;
  filled?: boolean;
}) {
  const { palette } = useTheme();
  const styles = useMemo(() => createStyles(palette), [palette]);
  return (
    <Pressable style={[styles.actionButton, filled && styles.actionButtonFilled]} onPress={onPress}>
      <Text style={[styles.actionButtonText, filled && styles.actionButtonTextFilled]}>{label}</Text>
    </Pressable>
  );
}

function createStyles(palette: ReturnType<typeof useTheme>["palette"]) {
  return StyleSheet.create({
    page: {
      minHeight: 720,
      backgroundColor: palette.background,
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 20,
    },
    topBar: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 20,
      gap: 12,
    },
    topBarLeft: {
      flex: 1,
    },
    brand: {
      color: palette.text,
      fontSize: 24,
      fontWeight: "300",
      letterSpacing: -0.8,
      marginBottom: 4,
    },
    backButton: {
      paddingHorizontal: 0,
      paddingVertical: 4,
    },
    backButtonText: {
      color: palette.accent,
      fontSize: 12,
      fontWeight: "500",
    },
    topBarRight: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    compareTopButton: {
      borderWidth: 1.5,
      borderColor: palette.accent,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 9,
      alignItems: "center",
      justifyContent: "center",
    },
    compareTopButtonText: {
      color: palette.black,
      fontSize: 13,
      fontWeight: "600",
    },
    body: {
      flex: 1,
      marginTop: 0,
      position: "relative",
      paddingBottom: 90,
    },
    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: 16,
      marginBottom: 16,
    },
    headerText: {
      flex: 1,
      gap: 8,
    },
    pageKicker: {
      color: palette.text,
      fontSize: 13,
      fontWeight: "400",
      textTransform: "uppercase",
      letterSpacing: 0.4,
    },
    pageSub: {
      color: palette.muted,
      fontSize: 13,
      lineHeight: 18,
      maxWidth: 580,
      fontWeight: "400",
    },
    listColumn: {
      marginTop: 0,
      gap: 10,
    },
    card: {
      minHeight: 120,
      borderWidth: 1.5,
      borderColor: palette.line,
      borderRadius: 12,
      flexDirection: "row",
      paddingHorizontal: 12,
      paddingVertical: 10,
      alignItems: "center",
      backgroundColor: palette.surface,
      gap: 12,
    },
    cardLeft: {
      width: 60,
      alignItems: "flex-start",
      justifyContent: "center",
    },
    cardMiddle: {
      flex: 1,
      alignSelf: "stretch",
      justifyContent: "space-between",
      paddingVertical: 2,
    },
    cardTitle: {
      color: palette.text,
      fontSize: 15,
      fontWeight: "500",
      letterSpacing: -0.2,
    },
    cardMeta: {
      color: palette.muted,
      fontSize: 11,
      marginTop: 1,
      fontWeight: "400",
    },
    cardLinksContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 4,
      flexWrap: "wrap",
    },
    cardLink: {
      color: palette.accent,
      fontSize: 11,
      textDecorationLine: "underline",
      fontWeight: "500",
    },
    cardLinkSeparator: {
      color: palette.muted,
      fontSize: 11,
      fontWeight: "400",
      marginHorizontal: 2,
    },
    cardRight: {
      width: 90,
      alignSelf: "stretch",
      justifyContent: "center",
      alignItems: "flex-end",
      gap: 6,
      paddingVertical: 2,
    },
    removeButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: palette.danger,
      alignItems: "center",
      justifyContent: "center",
    },
    removeButtonText: {
      color: palette.white,
      fontSize: 20,
      fontWeight: "300",
      lineHeight: 20,
      marginTop: 0,
    },
    editButton: {
      borderWidth: 1,
      borderColor: palette.line,
      borderRadius: 6,
      paddingHorizontal: 10,
      paddingVertical: 5,
      backgroundColor: palette.background,
    },
    editButtonText: {
      color: palette.text,
      fontSize: 11,
      fontWeight: "500",
    },
    addButton: {
      position: "absolute",
      right: 20,
      bottom: 20,
      backgroundColor: palette.surface,
      borderRadius: 10,
      flexDirection: "row",
      alignItems: "center",
      paddingLeft: 14,
      paddingRight: 8,
      paddingVertical: 8,
      gap: 10,
      borderWidth: 1.5,
      borderColor: palette.line,
    },
    addButtonLabel: {
      color: palette.text,
      fontSize: 13,
      fontWeight: "500",
    },
    addBubble: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: palette.black,
      alignItems: "center",
      justifyContent: "center",
    },
    addBubbleText: {
      color: palette.white,
      fontSize: 18,
      fontWeight: "300",
    },
    overlayScrim: {
      position: "absolute",
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.85)",
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
    },
    overlayModeRow: {
      flexDirection: "row",
      gap: 10,
      flexWrap: "wrap",
      justifyContent: "center",
    },
    overlayCoverageRow: {
      flexDirection: "row",
      gap: 10,
      flexWrap: "wrap",
      justifyContent: "center",
      marginTop: 6,
    },
    overlayCard: {
      width: "100%",
      maxWidth: 420,
      borderWidth: 1.5,
      borderColor: palette.line,
      borderRadius: 20,
      backgroundColor: palette.background,
      paddingHorizontal: 24,
      paddingTop: 20,
      paddingBottom: 20,
      gap: 18,
    },
    overlayHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 2,
    },
    overlayTitle: {
      color: palette.text,
      fontSize: 24,
      fontWeight: "400",
      letterSpacing: -0.6,
    },
    overlayCloseButton: {
      width: 28,
      height: 28,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 14,
      backgroundColor: palette.surface,
    },
    overlayCloseButtonText: {
      color: palette.muted,
      fontSize: 16,
      fontWeight: "300",
    },
    overlayFieldSection: {
      gap: 10,
    },
    overlayFieldLabel: {
      color: palette.muted,
      fontSize: 12,
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    dualFieldsContainer: {
      gap: 10,
    },
    storeDetectionHint: {
      color: palette.success,
      fontSize: 11,
      fontWeight: "500",
      marginTop: 4,
    },
    overlayInput: {
      borderWidth: 1.5,
      borderColor: palette.line,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 12,
      color: palette.text,
      fontSize: 14,
      fontWeight: "400",
      backgroundColor: palette.surface,
    },
    overlayActions: {
      flexDirection: "row",
      gap: 10,
      marginTop: 4,
    },
    overlayButton: {
      flex: 1,
      borderRadius: 10,
      paddingVertical: 10,
      alignItems: "center",
      justifyContent: "center",
      minHeight: 44,
    },
    overlayCancelButton: {
      borderWidth: 1.5,
      borderColor: palette.line,
      backgroundColor: palette.surface,
    },
    overlayCancelButtonText: {
      color: palette.text,
      fontSize: 14,
      fontWeight: "500",
    },
    overlaySubmitButton: {
      backgroundColor: palette.accent,
    },
    overlaySubmitButtonText: {
      color: palette.black,
      fontSize: 14,
      fontWeight: "600",
    },
  });
}
