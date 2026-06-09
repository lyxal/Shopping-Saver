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

  const title = useMemo(() => `Editing “${list.ListName}”`, [list.ListName]);

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
        <Text style={styles.title}>{title}</Text>
        <ThemeToggle />
      </View>

      <View style={styles.body}>
        <View style={styles.headerRow}>
          <View style={styles.headerText}>
            <Text style={styles.pageKicker}>Edit List</Text>
            <Text style={styles.pageSub}>
              Tap an item to replace it, or use the floating button to add a new product.
            </Text>
          </View>
          <View style={styles.headerActions}>
            <ActionButton label="Back" onPress={onBack} />
            <ActionButton
              label={hasResults ? "Results" : "Compare"}
              onPress={hasResults ? onViewResults : onCompare}
              filled
            />
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
            <Text style={styles.overlayTitle}>
              {overlayMode === "add" ? "Enter Product Information" : "Edit Product Information"}
            </Text>

            <View style={styles.modeRow}>
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

            <View style={styles.coverageRow}>
              <ToggleChip
                label="Both Stores"
                active={draft.coverage === "both"}
                onPress={() => onDraftChange("coverage", "both")}
              />
              <ToggleChip
                label="Coles"
                active={draft.coverage === "coles"}
                onPress={() => onDraftChange("coverage", "coles")}
              />
              <ToggleChip
                label="Woolworths"
                active={draft.coverage === "woolworths"}
                onPress={() => onDraftChange("coverage", "woolworths")}
              />
            </View>

            <Text style={styles.fieldLabel}>
              {entryMode === "name" ? "Product Name" : "Product Link"}
            </Text>

            {draft.coverage === "both" ? (
              <View style={styles.dualFields}>
                <TextInput
                  value={draft.coles}
                  onChangeText={(value) => onDraftChange("coles", value)}
                  placeholder={entryMode === "name" ? "Coles value" : "Coles link"}
                  placeholderTextColor={palette.muted}
                  autoCapitalize="none"
                  style={styles.overlayInput}
                />
                <TextInput
                  value={draft.woolworths}
                  onChangeText={(value) => onDraftChange("woolworths", value)}
                  placeholder={entryMode === "name" ? "Woolworths value" : "Woolworths link"}
                  placeholderTextColor={palette.muted}
                  autoCapitalize="none"
                  style={styles.overlayInput}
                />
              </View>
            ) : draft.coverage === "coles" ? (
              <TextInput
                value={draft.coles}
                onChangeText={(value) => onDraftChange("coles", value)}
                placeholder={entryMode === "name" ? "Coles value" : "Coles product link"}
                placeholderTextColor={palette.muted}
                autoCapitalize="none"
                style={styles.overlayInput}
              />
            ) : (
              <TextInput
                value={draft.woolworths}
                onChangeText={(value) => onDraftChange("woolworths", value)}
                placeholder={entryMode === "name" ? "Woolworths value" : "Woolworths product link"}
                placeholderTextColor={palette.muted}
                autoCapitalize="none"
                style={styles.overlayInput}
              />
            )}

            <Pressable style={styles.submitButton} onPress={submitOverlay}>
              {loading ? (
                <ActivityIndicator color={palette.black} />
              ) : (
                <Text style={styles.submitButtonText}>
                  {overlayMode === "add" ? "Submit" : "Save"}
                </Text>
              )}
            </Pressable>
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
  const infoLabel =
    entry.Coles && entry.Woolworths
      ? "Exact Coles · Best Match Woolworths"
      : entry.Coles
      ? "Coles only"
      : "Woolworths only";
  const imageLink = entry.Coles?.ImageLink || entry.Woolworths?.ImageLink;

  return (
    <View style={styles.card}>
      <View style={styles.cardLeft}>
        <ProductThumbnail source={imageLink} fallbackLabel={label.slice(0, 1)} size={60} />
      </View>

      <View style={styles.cardMiddle}>
        <Text style={styles.cardTitle}>{label}</Text>
        <Text style={styles.cardMeta}>Added just now</Text>
        <Text style={styles.cardLinks}>{infoLabel}</Text>
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
      paddingHorizontal: 18,
      paddingTop: 20,
      paddingBottom: 28,
    },
    topBar: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
    },
    title: {
      color: palette.text,
      fontSize: 56,
      fontWeight: "300",
      letterSpacing: -2,
    },
    body: {
      flex: 1,
      marginTop: 10,
      position: "relative",
      paddingBottom: 120,
    },
    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: 18,
    },
    headerText: {
      flex: 1,
      gap: 8,
    },
    pageKicker: {
      color: palette.text,
      fontSize: 18,
      fontWeight: "300",
    },
    pageSub: {
      color: palette.muted,
      fontSize: 13,
      lineHeight: 18,
      maxWidth: 580,
    },
    headerActions: {
      gap: 10,
      alignItems: "flex-end",
    },
    actionButton: {
      borderWidth: 1,
      borderColor: palette.line,
      borderRadius: 8,
      paddingHorizontal: 14,
      paddingVertical: 10,
      minWidth: 92,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: palette.surface,
    },
    actionButtonFilled: {
      backgroundColor: palette.text,
    },
    actionButtonText: {
      color: palette.text,
      fontSize: 14,
      fontWeight: "400",
    },
    actionButtonTextFilled: {
      color: palette.background,
    },
    listColumn: {
      marginTop: 28,
      gap: 38,
    },
    card: {
      minHeight: 196,
      borderWidth: 1,
      borderColor: palette.line,
      borderRadius: 10,
      flexDirection: "row",
      paddingHorizontal: 18,
      paddingVertical: 18,
      alignItems: "center",
      backgroundColor: palette.surface,
      gap: 18,
    },
    cardLeft: {
      width: 90,
      alignItems: "flex-start",
      justifyContent: "center",
    },
    cardMiddle: {
      flex: 1,
      alignSelf: "stretch",
      justifyContent: "space-between",
      paddingVertical: 12,
    },
    cardTitle: {
      color: palette.text,
      fontSize: 28,
      fontWeight: "300",
      letterSpacing: -1.2,
    },
    cardMeta: {
      color: palette.muted,
      fontSize: 13,
      marginTop: 6,
    },
    cardLinks: {
      color: palette.accentDeep,
      fontSize: 14,
      textDecorationLine: "underline",
      marginTop: 36,
    },
    cardRight: {
      width: 120,
      alignSelf: "stretch",
      justifyContent: "flex-end",
      alignItems: "flex-end",
      gap: 12,
      paddingVertical: 8,
    },
    removeButton: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: palette.danger,
      alignItems: "center",
      justifyContent: "center",
    },
    removeButtonText: {
      color: palette.black,
      fontSize: 34,
      fontWeight: "300",
      lineHeight: 40,
      marginTop: -7,
    },
    editButton: {
      borderWidth: 1,
      borderColor: palette.line,
      borderRadius: 6,
      paddingHorizontal: 14,
      paddingVertical: 10,
    },
    editButtonText: {
      color: palette.text,
      fontSize: 14,
      fontWeight: "400",
    },
    addButton: {
      position: "absolute",
      right: 0,
      bottom: 0,
      backgroundColor: palette.surface,
      borderRadius: 8,
      flexDirection: "row",
      alignItems: "center",
      paddingLeft: 18,
      paddingRight: 8,
      paddingVertical: 12,
      gap: 16,
      borderWidth: 1,
      borderColor: palette.line,
    },
    addButtonLabel: {
      color: palette.text,
      fontSize: 28,
      fontWeight: "300",
    },
    addBubble: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: palette.background,
      alignItems: "center",
      justifyContent: "center",
    },
    addBubbleText: {
      color: palette.text,
      fontSize: 28,
      fontWeight: "300",
      marginTop: -4,
    },
    overlayScrim: {
      position: "absolute",
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.82)",
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
    },
    overlayCard: {
      width: "100%",
      maxWidth: 760,
      borderWidth: 2,
      borderColor: palette.line,
      borderRadius: 34,
      backgroundColor: palette.background,
      paddingHorizontal: 28,
      paddingTop: 28,
      paddingBottom: 32,
      gap: 18,
    },
    overlayTitle: {
      color: palette.text,
      fontSize: 44,
      fontWeight: "300",
      textAlign: "center",
      letterSpacing: -1.4,
    },
    modeRow: {
      flexDirection: "row",
      gap: 10,
      flexWrap: "wrap",
    },
    coverageRow: {
      flexDirection: "row",
      gap: 10,
      flexWrap: "wrap",
    },
    fieldLabel: {
      color: palette.muted,
      fontSize: 18,
      fontWeight: "300",
      marginTop: 4,
    },
    dualFields: {
      gap: 14,
    },
    overlayInput: {
      borderWidth: 1,
      borderColor: palette.line,
      borderRadius: 6,
      paddingHorizontal: 20,
      paddingVertical: 16,
      color: palette.text,
      fontSize: 26,
      fontWeight: "300",
      backgroundColor: palette.surface,
    },
    submitButton: {
      backgroundColor: palette.text,
      borderRadius: 14,
      paddingVertical: 18,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 16,
      minHeight: 74,
    },
    submitButtonText: {
      color: palette.background,
      fontSize: 34,
      fontWeight: "300",
    },
  });
}
