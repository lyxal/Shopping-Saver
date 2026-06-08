import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { palette } from "../lib/theme";
import type { CompareResponse, ComparisonRow, Store } from "../lib/types";
import { ComparisonCard, EmptyState, SecondaryButton, SummaryMetric } from "../components/common";
import { formatCurrency } from "../lib/api";

export default function ResultsScreen({
  listName,
  compare,
  rows,
  totals,
  cheapest,
  onBackToEdit,
  onPickAnother,
}: {
  listName: string;
  compare: CompareResponse | null;
  rows: ComparisonRow[];
  totals: Record<Store, number> | null;
  cheapest?: Store | string;
  onBackToEdit: () => void;
  onPickAnother: () => void;
}) {
  return (
    <View style={styles.pageCard}>
      <View style={styles.cardHeaderRow}>
        <View style={styles.cardHeaderText}>
          <Text style={styles.pageKicker}>Step 4</Text>
          <Text style={styles.pageTitle}>{listName}</Text>
          <Text style={styles.pageBody}>
            The backend has compared the basket. This view shows the cheaper store and the item
            level breakdown.
          </Text>
        </View>
        <View style={styles.cardActions}>
          <SecondaryButton label="Edit list" onPress={onBackToEdit} />
          <SecondaryButton label="Pick another" onPress={onPickAnother} />
        </View>
      </View>

      <View style={styles.summaryGrid}>
        <SummaryMetric
          label="Cheaper store"
          value={cheapest || "Pending"}
          accent
        />
        <SummaryMetric label="Coles total" value={formatCurrency(totals?.Coles)} />
        <SummaryMetric
          label="Woolworths total"
          value={formatCurrency(totals?.Woolworths)}
        />
        <SummaryMetric
          label="Basket gap"
          value={formatCurrency(Math.abs((totals?.Coles ?? 0) - (totals?.Woolworths ?? 0)))}
        />
      </View>

      <View style={styles.resultBanner}>
        <Text style={styles.resultBannerTitle}>
          {cheapest ? `${cheapest} is the cheaper option this week` : "Comparison ready"}
        </Text>
        <Text style={styles.resultBannerBody}>
          {cheapest
            ? "Use the results below to decide whether you want to shop at one store or split the trip."
            : "If the totals are not shown yet, run the comparison again from the edit screen."}
        </Text>
      </View>

      {rows.length === 0 ? (
        <EmptyState
          title="No comparison items"
          body="Add products in the modify screen, then run the comparison again."
        />
      ) : (
        <View style={styles.listColumn}>
          {rows.map((row, index) => (
            <ComparisonCard key={`${row.ColesProduct?.ProductID ?? "row"}-${index}`} row={row} />
          ))}
        </View>
      )}

      {compare?.TotalSavings ? (
        <View style={styles.footerNote}>
          <Text style={styles.footerNoteText}>
            Savings tracked by the backend: Coles {formatCurrency(compare.TotalSavings.Coles)} ·
            Woolworths {formatCurrency(compare.TotalSavings.Woolworths)}
          </Text>
        </View>
      ) : null}
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
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  resultBanner: {
    backgroundColor: "rgba(25, 143, 109, 0.10)",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(25, 143, 109, 0.22)",
    gap: 4,
  },
  resultBannerTitle: {
    color: palette.text,
    fontSize: 17,
    fontWeight: "900",
  },
  resultBannerBody: {
    color: palette.muted,
    fontSize: 13,
    lineHeight: 19,
  },
  listColumn: {
    gap: 10,
  },
  footerNote: {
    paddingTop: 2,
  },
  footerNoteText: {
    color: palette.muted,
    fontSize: 12,
    lineHeight: 18,
  },
});
