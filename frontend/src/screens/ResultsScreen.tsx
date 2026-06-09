import React, { useMemo } from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";
import type { CompareResponse, ComparisonRow, Store } from "../lib/types";
import { formatCurrency, formatPercent } from "../lib/api";
import { EmptyState, ProductThumbnail, ThemeToggle } from "../components/common";
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

  const colesTotal = totals?.Coles ?? 0;
  const woolworthsTotal = totals?.Woolworths ?? 0;
  const difference = Math.abs(colesTotal - woolworthsTotal);
  const percentDifference = colesTotal > 0 ? ((difference / colesTotal) * 100).toFixed(1) : "0";

  return (
    <View style={styles.page}>
      <View style={styles.topBar}>
        <View>
          <Text style={styles.brand}>Open.</Text>
          <View style={styles.topBarText}>
            <Text style={styles.pageKicker}>COMPARISON RESULTS</Text>
            <Text style={styles.listName}>{listName}</Text>
          </View>
        </View>
        <View style={styles.topActions}>
          <ThemeToggle />
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>
            {cheapest ? `${cheapest} is cheaper this week` : "Comparison complete"}
          </Text>
          {cheapest && colesTotal > 0 && (
            <Text style={styles.heroSubtitle}>
              Save {formatCurrency(difference)} ({percentDifference}%)
            </Text>
          )}
        </View>

        <View style={styles.summarySection}>
          <View style={[styles.storeCard, cheapest === "Coles" && styles.storeCardHighlight]}>
            <Text style={styles.storeName}>Coles</Text>
            <Text style={styles.storeTotal}>{formatCurrency(colesTotal)}</Text>
            {cheapest === "Coles" && <Text style={styles.winnerBadge}>CHEAPER</Text>}
          </View>
          <View style={[styles.storeCard, cheapest === "Woolworths" && styles.storeCardHighlight]}>
            <Text style={styles.storeName}>Woolworths</Text>
            <Text style={styles.storeTotal}>{formatCurrency(woolworthsTotal)}</Text>
            {cheapest === "Woolworths" && <Text style={styles.winnerBadge}>CHEAPER</Text>}
          </View>
        </View>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Items Compared</Text>
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

        <View style={styles.actionButtons}>
          <Pressable style={[styles.actionButton, styles.actionButtonSecondary]} onPress={onBackToEdit}>
            <Text style={styles.actionButtonTextSecondary}>Edit List</Text>
          </Pressable>
          <Pressable style={[styles.actionButton, styles.actionButtonPrimary]} onPress={onPickAnother}>
            <Text style={styles.actionButtonTextPrimary}>Compare Another</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function ComparisonRowCard({ row }: { row: ComparisonRow }) {
  const { palette } = useTheme();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const cheaper = row.CheaperStore;
  const colesPrice = row.ColesPrice.SalePrice || row.ColesPrice.NormalPrice;
  const woolworthsPrice = row.WoolworthsPrice.SalePrice || row.WoolworthsPrice.NormalPrice;

  return (
    <View style={styles.resultCard}>
      <View style={styles.productHeader}>
        <ProductThumbnail
          source={row.ColesProduct.ImageLink || row.WoolworthsProduct.ImageLink}
          fallbackLabel={(row.ColesProduct.Name || row.WoolworthsProduct.Name).slice(0, 1)}
          size={50}
        />
        <View style={styles.productInfo}>
          <Text style={styles.productName}>
            {row.WoolworthsProduct.Name || row.ColesProduct.Name}
          </Text>
          <Text style={styles.priceDifference}>
            Difference {formatCurrency(row.PriceDifference)} ({formatPercent(row.PercentageDifference)})
          </Text>
        </View>
      </View>

      <View style={styles.priceCompare}>
        <View style={[styles.priceBox, cheaper === "Coles" && styles.priceBoxWinner]}>
          <Text style={styles.priceBoxLabel}>Coles</Text>
          <Text style={[styles.priceBoxAmount, cheaper === "Coles" && styles.priceBoxAmountWinner]}>
            {formatCurrency(colesPrice)}
          </Text>
        </View>
        <View style={[styles.priceBox, cheaper === "Woolworths" && styles.priceBoxWinner]}>
          <Text style={styles.priceBoxLabel}>Woolworths</Text>
          <Text style={[styles.priceBoxAmount, cheaper === "Woolworths" && styles.priceBoxAmountWinner]}>
            {formatCurrency(woolworthsPrice)}
          </Text>
        </View>
      </View>
    </View>
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
      alignItems: "flex-start",
      marginBottom: 20,
    },
    brand: {
      color: palette.text,
      fontSize: 24,
      fontWeight: "300",
      letterSpacing: -0.8,
      marginBottom: 2,
    },
    topBarText: {
      gap: 1,
    },
    pageKicker: {
      color: palette.muted,
      fontSize: 11,
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: 0.6,
    },
    listName: {
      color: palette.text,
      fontSize: 20,
      fontWeight: "600",
      letterSpacing: -0.5,
    },
    topActions: {
      flexDirection: "row",
      gap: 10,
      alignItems: "center",
    },
    body: {
      flex: 1,
      gap: 18,
    },
    heroSection: {
      alignItems: "center",
      paddingVertical: 8,
    },
    heroTitle: {
      color: palette.text,
      fontSize: 28,
      fontWeight: "500",
      letterSpacing: -0.7,
      textAlign: "center",
      marginBottom: 4,
    },
    heroSubtitle: {
      color: palette.accent,
      fontSize: 16,
      fontWeight: "500",
      textAlign: "center",
    },
    summarySection: {
      flexDirection: "row",
      gap: 10,
    },
    storeCard: {
      flex: 1,
      borderWidth: 1.5,
      borderColor: palette.line,
      borderRadius: 12,
      padding: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: palette.surface,
      gap: 6,
    },
    storeCardHighlight: {
      backgroundColor: palette.accentSoft,
      borderColor: palette.accent,
      borderWidth: 2,
    },
    storeName: {
      color: palette.muted,
      fontSize: 11,
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: 0.4,
    },
    storeTotal: {
      color: palette.text,
      fontSize: 24,
      fontWeight: "600",
      letterSpacing: -0.6,
    },
    winnerBadge: {
      color: palette.accent,
      fontSize: 11,
      fontWeight: "700",
      marginTop: 4,
      textTransform: "uppercase",
      letterSpacing: 0.4,
    },
    divider: {
      height: 1,
      backgroundColor: palette.line,
    },
    sectionTitle: {
      color: palette.text,
      fontSize: 13,
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: 0.4,
      marginTop: 0,
    },
    listColumn: {
      gap: 10,
    },
    resultCard: {
      borderWidth: 1.5,
      borderColor: palette.line,
      borderRadius: 12,
      padding: 12,
      gap: 12,
      backgroundColor: palette.surface,
    },
    productHeader: {
      flexDirection: "row",
      gap: 10,
      alignItems: "flex-start",
    },
    productInfo: {
      flex: 1,
      gap: 2,
    },
    productName: {
      color: palette.text,
      fontSize: 14,
      fontWeight: "500",
      letterSpacing: -0.2,
    },
    priceDifference: {
      color: palette.muted,
      fontSize: 11,
      fontWeight: "400",
    },
    priceCompare: {
      flexDirection: "row",
      gap: 10,
    },
    priceBox: {
      flex: 1,
      borderWidth: 1.5,
      borderColor: palette.line,
      borderRadius: 10,
      paddingHorizontal: 10,
      paddingVertical: 8,
      alignItems: "center",
      backgroundColor: palette.background,
      gap: 2,
    },
    priceBoxWinner: {
      backgroundColor: palette.accentSoft,
      borderColor: palette.accent,
      borderWidth: 2,
    },
    priceBoxLabel: {
      color: palette.muted,
      fontSize: 10,
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: 0.3,
    },
    priceBoxAmount: {
      color: palette.text,
      fontSize: 16,
      fontWeight: "600",
      letterSpacing: -0.3,
    },
    priceBoxAmountWinner: {
      color: palette.accentDeep,
    },
    actionButtons: {
      flexDirection: "row",
      gap: 10,
      marginTop: 8,
    },
    actionButton: {
      flex: 1,
      borderRadius: 10,
      paddingVertical: 11,
      alignItems: "center",
      justifyContent: "center",
      minHeight: 44,
    },
    actionButtonSecondary: {
      borderWidth: 1.5,
      borderColor: palette.line,
      backgroundColor: palette.surface,
    },
    actionButtonTextSecondary: {
      color: palette.text,
      fontSize: 14,
      fontWeight: "600",
    },
    actionButtonPrimary: {
      backgroundColor: palette.accent,
    },
    actionButtonTextPrimary: {
      color: palette.black,
      fontSize: 14,
      fontWeight: "600",
    },
  });
}
