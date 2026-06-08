import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { palette } from "../lib/theme";
import type { EntryCoverage, EntryDraft, EntryMode, ListSummary, ProductRecord } from "../lib/types";
import {
  EmptyState,
  PrimaryButton,
  ProductCard,
  SecondaryButton,
  StoreField,
  SummaryMetric,
  ToggleChip,
} from "../components/common";

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
}: {
  list: ListSummary;
  loading: boolean;
  products: Array<{
    Coles: ProductRecord | null;
    Woolworths: ProductRecord | null;
  }>;
  entryMode: EntryMode;
  draft: EntryDraft;
  onEntryModeChange: (mode: EntryMode) => void;
  onDraftChange: (field: keyof EntryDraft, value: string | EntryCoverage) => void;
  onAddProduct: () => void;
  onCompare: () => void;
  onBack: () => void;
  onViewResults: () => void;
  hasResults: boolean;
}) {
  return (
    <View style={styles.pageCard}>
      <View style={styles.cardHeaderRow}>
        <View style={styles.cardHeaderText}>
          <Text style={styles.pageKicker}>Step 3</Text>
          <Text style={styles.pageTitle}>{list.ListName}</Text>
          <Text style={styles.pageBody}>
            Add grocery items. If you only enter one store, the backend will try to find the
            best match in the other store for you.
          </Text>
        </View>
        <View style={styles.cardActions}>
          <SecondaryButton label="Back to lists" onPress={onBack} />
          <PrimaryButton
            label={hasResults ? "View results" : "Compare now"}
            onPress={hasResults ? onViewResults : onCompare}
          />
        </View>
      </View>

      <View style={styles.summaryPanel}>
        <SummaryMetric label="List ID" value={list.ListID.slice(0, 8)} />
        <SummaryMetric label="Items" value={String(products.length)} />
        <SummaryMetric
          label="Entry mode"
          value={entryMode === "name" ? "Names" : "Links"}
        />
      </View>

      <View style={styles.inlineCard}>
        <Text style={styles.sectionTitle}>Add products</Text>
        <Text style={styles.sectionHint}>
          Pick how you want to add items, then choose whether you’re entering both stores or just
          one.
        </Text>

        <View style={styles.toggleRow}>
          <ToggleChip
            label="By name"
            active={entryMode === "name"}
            onPress={() => onEntryModeChange("name")}
          />
          <ToggleChip
            label="By link"
            active={entryMode === "link"}
            onPress={() => onEntryModeChange("link")}
          />
        </View>

        <Text style={styles.fieldLabel}>Store coverage</Text>
        <View style={styles.toggleRow}>
          <ToggleChip
            label="Coles + Woolworths"
            active={draft.coverage === "both"}
            onPress={() => onDraftChange("coverage", "both")}
          />
          <ToggleChip
            label="Just Coles"
            active={draft.coverage === "coles"}
            onPress={() => onDraftChange("coverage", "coles")}
          />
          <ToggleChip
            label="Just Woolworths"
            active={draft.coverage === "woolworths"}
            onPress={() => onDraftChange("coverage", "woolworths")}
          />
        </View>

        {draft.coverage === "both" ? (
          <View style={styles.dualFieldGrid}>
            <StoreField
              label="Coles"
              value={draft.coles}
              placeholder={entryMode === "name" ? "e.g. milk" : "Paste a Coles product link"}
              onChange={(value) => onDraftChange("coles", value)}
            />
            <StoreField
              label="Woolworths"
              value={draft.woolworths}
              placeholder={
                entryMode === "name" ? "e.g. milk" : "Paste a Woolworths product link"
              }
              onChange={(value) => onDraftChange("woolworths", value)}
            />
          </View>
        ) : draft.coverage === "coles" ? (
          <StoreField
            label="Coles"
            value={draft.coles}
            placeholder={entryMode === "name" ? "e.g. bread" : "Paste a Coles product link"}
            helper="The server will try to find the Woolworths match."
            onChange={(value) => onDraftChange("coles", value)}
          />
        ) : (
          <StoreField
            label="Woolworths"
            value={draft.woolworths}
            placeholder={
              entryMode === "name" ? "e.g. bread" : "Paste a Woolworths product link"
            }
            helper="The server will try to find the Coles match."
            onChange={(value) => onDraftChange("woolworths", value)}
          />
        )}

        <Pressable
          onPress={onAddProduct}
          style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
        >
          {loading ? (
            <ActivityIndicator color={palette.text} />
          ) : (
            <Text style={styles.primaryButtonText}>Add product</Text>
          )}
        </Pressable>
      </View>

      <View style={styles.listSectionHeader}>
        <Text style={styles.sectionTitle}>Products in this list</Text>
        <Text style={styles.sectionHint}>
          Paired items show both stores. Unpaired items still stay on the list.
        </Text>
      </View>

      {products.length === 0 ? (
        <EmptyState
          title="No products yet"
          body="Add a few usual groceries so the comparison has something useful to work with."
        />
      ) : (
        <View style={styles.listColumn}>
          {products.map((entry, index) => (
            <ProductCard key={`${entry.Coles?.ProductID ?? entry.Woolworths?.ProductID ?? index}`} entry={entry} />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  pageCard: {
    backgroundColor: palette.surface,
    borderRadius: 28,
    padding: 18,
    borderWidth: 1,
    borderColor: palette.line,
    gap: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  pageKicker: {
    color: palette.accentDeep,
    textTransform: "uppercase",
    letterSpacing: 1.4,
    fontSize: 12,
    fontWeight: "800",
  },
  pageTitle: {
    color: palette.text,
    fontSize: 26,
    lineHeight: 30,
    fontWeight: "900",
    letterSpacing: -0.8,
  },
  pageBody: {
    color: palette.muted,
    fontSize: 15,
    lineHeight: 22,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  cardHeaderText: {
    flex: 1,
    gap: 6,
  },
  cardActions: {
    gap: 8,
    alignItems: "flex-end",
  },
  summaryPanel: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  inlineCard: {
    backgroundColor: palette.surfaceMuted,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: palette.line,
    gap: 12,
  },
  sectionTitle: {
    color: palette.text,
    fontSize: 19,
    lineHeight: 24,
    fontWeight: "900",
    letterSpacing: -0.3,
  },
  sectionHint: {
    color: palette.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  fieldLabel: {
    color: palette.text,
    fontSize: 13,
    fontWeight: "800",
  },
  toggleRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  dualFieldGrid: {
    flexDirection: "row",
    gap: 10,
  },
  listSectionHeader: {
    gap: 4,
  },
  listColumn: {
    gap: 10,
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
  primaryButtonText: {
    color: palette.text,
    fontSize: 15,
    fontWeight: "900",
  },
  pressed: {
    opacity: 0.84,
    transform: [{ scale: 0.99 }],
  },
});
