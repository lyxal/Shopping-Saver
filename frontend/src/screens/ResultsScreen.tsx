import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import type { CompareResponse, ComparisonRow, Store } from "../lib/types";
import { formatCurrency, formatPercent } from "../lib/api";
import { EmptyState, ProductThumbnail, SecondaryButton, SummaryMetric, ThemeToggle } from "../components/common";
import { useTheme } from "../lib/theme";

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
  const { palette } = useTheme();
  const styles = useMemo(() => createStyles(palette), [palette]);

  return (
    <View style={styles.page}>
      <View style={styles.topBar}>
        <Text style={styles.title}>Comparison Results</Text>
        <ThemeToggle />
      </View>

      <View style={styles.body}>
        <View style={styles.headerRow}>
          <View style={styles.headerText}>
            <Text style={styles.pageKicker}>Results</Text>
            <Text style={styles.pageSub}>{listName}</Text>
            <Text style={styles.heroText}>
              {cheapest
                ? `${cheapest} is the cheaper option this week.`
                : "Your savings are ready."}
            </Text>
          </View>

          <View style={styles.headerActions}>
            <SecondaryButton label="Edit List" onPress={onBackToEdit} />
            <SecondaryButton label="Pick Another" onPress={onPickAnother} />
          </View>
        </View>

        <View style={styles.summaryGrid}>
          <SummaryMetric label="Cheaper store" value={cheapest || "Pending"} accent />
          <SummaryMetric label="Coles total" value={formatCurrency(totals?.Coles)} />
          <SummaryMetric label="Woolworths total" value={formatCurrency(totals?.Woolworths)} />
          <SummaryMetric
            label="Basket gap"
            value={formatCurrency(Math.abs((totals?.Coles ?? 0) - (totals?.Woolworths ?? 0)))}
          />
        </View>

        <View style={styles.listColumn}>
          {rows.length === 0 ? (
            <EmptyState
              title="No comparison items"
              body="Add products in the edit screen and compare again."
            />
          ) : (
            rows.map((row, index) => <ComparisonRowCard key={index} row={row} />)
          )}
        </View>

        {compare?.TotalSavings ? (
          <View style={styles.footerNote}>
            <Text style={styles.footerText}>
              Savings tracked by backend: Coles {formatCurrency(compare.TotalSavings.Coles)} ·
              Woolworths {formatCurrency(compare.TotalSavings.Woolworths)}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

function ComparisonRowCard({ row }: { row: ComparisonRow }) {
  const { palette } = useTheme();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const cheaper = row.CheaperStore;
  return (
    <View style={styles.resultCard}>
      <View style={styles.resultHeader}>
        <Text style={styles.resultTitle}>{row.WoolworthsProduct.Name || row.ColesProduct.Name}</Text>
        <Text style={styles.resultPill}>{cheaper}</Text>
      </View>

      <View style={styles.storeGrid}>
        <StoreColumn
          store="Coles"
          normal={row.ColesPrice.NormalPrice}
          sale={row.ColesPrice.SalePrice}
          highlight={cheaper === "Coles"}
          imageLink={row.ColesProduct.ImageLink}
        />
        <StoreColumn
          store="Woolworths"
          normal={row.WoolworthsPrice.NormalPrice}
          sale={row.WoolworthsPrice.SalePrice}
          highlight={cheaper === "Woolworths"}
          imageLink={row.WoolworthsProduct.ImageLink}
        />
      </View>

      <Text style={styles.resultMeta}>
        Difference {formatCurrency(row.PriceDifference)} · {formatPercent(row.PercentageDifference)}
      </Text>
    </View>
  );
}

function StoreColumn({
  store,
  normal,
  sale,
  highlight,
  imageLink,
}: {
  store: Store;
  normal: number;
  sale: number;
  highlight: boolean;
  imageLink?: string;
}) {
  const { palette } = useTheme();
  const styles = useMemo(() => createStyles(palette), [palette]);
  return (
    <View style={[styles.storeCard, highlight && styles.storeCardHighlight]}>
      <View style={styles.storeHeader}>
        <ProductThumbnail source={imageLink} fallbackLabel={store.slice(0, 1)} size={40} />
        <Text style={styles.storeLabel}>{store}</Text>
      </View>
      <Text style={styles.storePrice}>{formatCurrency(sale)}</Text>
      <Text style={styles.storeMeta}>Normal {formatCurrency(normal)}</Text>
      <Text style={styles.storeImageHint}>{imageLink ? "Image available" : "No image"}</Text>
    </View>
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
      marginTop: 12,
      gap: 22,
    },
    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: 18,
    },
    headerText: {
      flex: 1,
      gap: 10,
    },
    pageKicker: {
      color: palette.text,
      fontSize: 18,
      fontWeight: "300",
    },
    pageSub: {
      color: palette.muted,
      fontSize: 16,
    },
    heroText: {
      color: palette.text,
      fontSize: 42,
      fontWeight: "300",
      letterSpacing: -1.6,
      lineHeight: 48,
      maxWidth: 780,
    },
    headerActions: {
      gap: 10,
      alignItems: "flex-end",
    },
    summaryGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
    },
    listColumn: {
      gap: 18,
    },
    resultCard: {
      borderWidth: 1,
      borderColor: palette.line,
      borderRadius: 12,
      padding: 18,
      gap: 14,
      backgroundColor: palette.surface,
    },
    resultHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 12,
    },
    resultTitle: {
      color: palette.text,
      fontSize: 28,
      fontWeight: "300",
      letterSpacing: -1.1,
      flexShrink: 1,
    },
    resultPill: {
      color: palette.white,
      backgroundColor: palette.accentDeep,
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 6,
      fontSize: 13,
      fontWeight: "500",
    },
    storeGrid: {
      flexDirection: "row",
      gap: 10,
    },
    storeCard: {
      flex: 1,
      minHeight: 104,
      borderWidth: 1,
      borderColor: palette.line,
      borderRadius: 10,
      padding: 12,
      justifyContent: "space-between",
      backgroundColor: palette.surface,
    },
    storeHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    storeCardHighlight: {
      backgroundColor: palette.accentSoft,
    },
    storeLabel: {
      color: palette.text,
      fontSize: 16,
      fontWeight: "400",
    },
    storePrice: {
      color: palette.text,
      fontSize: 26,
      fontWeight: "300",
      letterSpacing: -0.6,
    },
    storeMeta: {
      color: palette.muted,
      fontSize: 13,
    },
    storeImageHint: {
      color: palette.accentDeep,
      fontSize: 12,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 0.8,
    },
    resultMeta: {
      color: palette.muted,
      fontSize: 14,
    },
    footerNote: {
      paddingTop: 6,
    },
    footerText: {
      color: palette.muted,
      fontSize: 13,
    },
  });
}
