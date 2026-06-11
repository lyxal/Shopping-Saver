import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  styles as g,
  colors,
  spacing,
  typography,
  radii,
} from "../styles/global";
import { Redirect, router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ComparisonResponse } from "../lib/types";
import { postAPI } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import TopBar from "../components/TopBar";

const loadingMessages = [
  "Checking the shelves...",
  "Pairing up matching products...",
  "Reading the price tags...",
  "Looking for the cheaper trolley...",
  "Counting every cent saved...",
];

export default function ComparisonPage() {
  const auth = useAuth();

  if (!auth) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  const { userID } = auth;
  if (!userID) {
    // Redirect to landing page
    return <Redirect href="/" />;
  }

  const { listID, listName } = useLocalSearchParams();
  const currentListID = Array.isArray(listID) ? listID[0] : listID;
  const currentListName =
    (Array.isArray(listName) ? listName[0] : listName) ?? "Product List";
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const [comparisonData, setComparisonData] =
    useState<ComparisonResponse | null>(null);
  const comparisonSummary = useMemo(() => {
    if (!comparisonData) return null;

    const colesTotal = comparisonData.TotalSalePrice.Coles;
    const woolworthsTotal = comparisonData.TotalSalePrice.Woolworths;
    const cheaperTotal = Math.min(colesTotal, woolworthsTotal);
    const expensiveTotal = Math.max(colesTotal, woolworthsTotal);
    const totalCheaper = expensiveTotal - cheaperTotal;
    const percentCheaper =
      expensiveTotal > 0 ? (totalCheaper / expensiveTotal) * 100 : 0;
    const woolworthsSaved =
      comparisonData.TotalNormalPrice.Woolworths -
      comparisonData.TotalSalePrice.Woolworths;
    const colesSaved =
      comparisonData.TotalNormalPrice.Coles - comparisonData.TotalSalePrice.Coles;
    const totalSaved = woolworthsSaved + colesSaved;
    const totalNormal =
      comparisonData.TotalNormalPrice.Woolworths +
      comparisonData.TotalNormalPrice.Coles;
    const percentSaved = totalNormal > 0 ? (totalSaved / totalNormal) * 100 : 0;

    return {
      totalCheaper,
      percentCheaper,
      totalSaved,
      percentSaved,
    };
  }, [comparisonData]);

  const fallbackImage = "https://placehold.co/80x80?text=No+Image";
  useEffect(() => {
    if (!loading) return;

    const interval = setInterval(() => {
      setLoadingMessageIndex(
        (currentIndex) => (currentIndex + 1) % loadingMessages.length,
      );
    }, 2200);

    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    const fetchComparison = async () => {
      try {
        const response = await postAPI<ComparisonResponse>("/compare", {
          ListID: currentListID,
          UserID: userID,
        });
        if (!response) {
          setLoading(false);
          return;
        }
        console.log("Comparison data received:", response);
        setComparisonData(response);
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Comparison failed. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    };

    if (currentListID) {
      fetchComparison();
    }
  }, [currentListID]);

  return (
    <View style={g.screenContainer}>
      <TopBar></TopBar>
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.content}
        onScroll={(event) => {
          setShowBackToTop(event.nativeEvent.contentOffset.y > 180);
        }}
        scrollEventThrottle={16}
      >
        <View style={styles.contentColumn}>
          <View style={styles.header}>
            <View style={styles.headerActions}>
              {!loading && (
                <Pressable
                  onPress={() =>
                    router.push({
                      pathname: "/screens/ListDetails",
                      params: {
                        listID: currentListID,
                        listName: currentListName,
                      },
                    })
                  }
                  style={styles.backButton}
                  accessibilityRole="button"
                >
                  <Text style={styles.backButtonText}>Back to List</Text>
                </Pressable>
              )}
              {!loading && (
                <Pressable
                  onPress={() => router.push("/screens/ProductLists")}
                  style={styles.backButton}
                  accessibilityRole="button"
                >
                  <Text style={styles.backButtonText}>Back to All Lists</Text>
                </Pressable>
              )}
            </View>
            <Text style={g.textHeading}>{currentListName}</Text>
            <Text style={g.textCaption}>Comparison</Text>
          </View>

          {loading && (
            <View style={styles.loadingPanel}>
              <ActivityIndicator color={colors.textPrimary} size="large" />
              <Text style={g.textBody}>{loadingMessages[loadingMessageIndex]}</Text>
            </View>
          )}

          {!!errorMessage && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          {!!comparisonData && !loading && (
            <>
              <View style={styles.summary}>
                <View style={styles.summaryHeader}>
                  <Text style={g.textLabel}>Overall Cheaper Store</Text>
                  <Text style={styles.cheaperStore}>
                    {comparisonData.CheaperStore}
                  </Text>
                  {!!comparisonSummary && (
                    <View style={styles.summaryStats}>
                      <Text style={styles.statText}>
                        ${comparisonSummary.totalCheaper.toFixed(2)} cheaper
                      </Text>
                      <Text style={styles.statText}>
                        {comparisonSummary.percentCheaper.toFixed(2)}% cheaper
                      </Text>
                      <Text style={styles.statText}>
                        ${comparisonSummary.totalSaved.toFixed(2)} total saved
                      </Text>
                      <Text style={styles.statText}>
                        {comparisonSummary.percentSaved.toFixed(2)}% saved
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.summaryGrid}>
                  <View style={styles.summaryCard}>
                    <Text style={styles.storeLabel}>Coles</Text>
                    <Text style={styles.priceText}>
                      ${comparisonData.TotalSalePrice.Coles.toFixed(2)}
                    </Text>
                    <Text style={g.textCaption}>
                      Normal ${comparisonData.TotalNormalPrice.Coles.toFixed(2)}
                    </Text>
                    <Text style={styles.savingsText}>
                      Savings ${comparisonData.TotalSavings.Coles.toFixed(2)}
                    </Text>
                  </View>

                  <View style={styles.summaryCard}>
                    <Text style={styles.storeLabel}>Woolworths</Text>
                    <Text style={styles.priceText}>
                      ${comparisonData.TotalSalePrice.Woolworths.toFixed(2)}
                    </Text>
                    <Text style={g.textCaption}>
                      Normal $
                      {comparisonData.TotalNormalPrice.Woolworths.toFixed(2)}
                    </Text>
                    <Text style={styles.savingsText}>
                      Savings $
                      {comparisonData.TotalSavings.Woolworths.toFixed(2)}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.sectionHeader}>
                <Text style={g.textLabel}>Products Compared</Text>
                <Text style={styles.countPill}>
                  {comparisonData.Comparisons.length}
                </Text>
              </View>

              <View style={styles.columnLabels}>
                <Text style={styles.columnLabel}>Coles</Text>
                <Text style={styles.columnLabel}>Woolworths</Text>
              </View>

              <View style={styles.comparisonStack}>
                {comparisonData.Comparisons.map((comp, index) => {
                  const colesWins = comp.CheaperStore === "Coles";
                  const woolworthsWins = comp.CheaperStore === "Woolworths";
                  const colesOnSale =
                    comp.ColesPrice.SalePrice < comp.ColesPrice.NormalPrice;
                  const woolworthsOnSale =
                    comp.WoolworthsPrice.SalePrice <
                    comp.WoolworthsPrice.NormalPrice;
                  const priceDifference = Math.abs(comp.PriceDifference);
                  const percentageDifference = Math.abs(
                    comp.PercentageDifference,
                  );

                  return (
                    <View key={index} style={styles.comparisonCard}>
                      <View style={styles.productColumns}>
                        <View
                          style={[
                            styles.productPanel,
                            colesWins && styles.winningProduct,
                          ]}
                        >
                          <Image
                            source={{
                              uri: comp.ColesProduct.ImageLink || fallbackImage,
                            }}
                            style={styles.productImage}
                          />
                          <View style={styles.productMeta}>
                            {colesWins && (
                              <View style={styles.winnerBadge}>
                                <Text style={styles.winnerBadgeText}>
                                  Cheapest
                                </Text>
                              </View>
                            )}
                            {colesOnSale && (
                              <View style={styles.saleBadge}>
                                <Text style={styles.saleBadgeText}>
                                  On Sale
                                </Text>
                              </View>
                            )}
                            <Text style={g.textBody} numberOfLines={2}>
                              {comp.ColesProduct.Name}
                            </Text>
                            <Text style={g.textCaption}>
                              Normal ${comp.ColesPrice.NormalPrice.toFixed(2)}
                            </Text>
                            {colesOnSale && (
                              <Text style={styles.priceInline}>
                                Sale ${comp.ColesPrice.SalePrice.toFixed(2)}
                              </Text>
                            )}
                          </View>
                        </View>

                        <View
                          style={[
                            styles.productPanel,
                            woolworthsWins && styles.winningProduct,
                          ]}
                        >
                          <Image
                            source={{
                              uri:
                                comp.WoolworthsProduct.ImageLink ||
                                fallbackImage,
                            }}
                            style={styles.productImage}
                          />
                          <View style={styles.productMeta}>
                            {woolworthsWins && (
                              <View style={styles.winnerBadge}>
                                <Text style={styles.winnerBadgeText}>
                                  Cheapest
                                </Text>
                              </View>
                            )}
                            {woolworthsOnSale && (
                              <View style={styles.saleBadge}>
                                <Text style={styles.saleBadgeText}>
                                  On Sale
                                </Text>
                              </View>
                            )}
                            <Text style={g.textBody} numberOfLines={2}>
                              {comp.WoolworthsProduct.Name}
                            </Text>
                            <Text style={g.textCaption}>
                              Normal $
                              {comp.WoolworthsPrice.NormalPrice.toFixed(2)}
                            </Text>
                            {woolworthsOnSale && (
                              <Text style={styles.priceInline}>
                                Sale $
                                {comp.WoolworthsPrice.SalePrice.toFixed(2)}
                              </Text>
                            )}
                          </View>
                        </View>
                      </View>

                      <View style={styles.resultRow}>
                        <Text style={styles.savingsText}>
                          Difference ${priceDifference.toFixed(2)}
                        </Text>
                        <Text style={g.textCaption}>
                          {percentageDifference.toFixed(2)}% cheaper at{" "}
                          {comp.CheaperStore}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </>
          )}
        </View>
      </ScrollView>

      {showBackToTop && (
        <View style={styles.floatingActionBar}>
          <Pressable
            onPress={() => scrollRef.current?.scrollTo({ y: 0, animated: true })}
            style={styles.backToTopButton}
            accessibilityRole="button"
          >
            <Text style={styles.backToTopText}>Back to Top</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    width: "100%",
  },

  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl * 2,
    alignItems: "center",
  },

  contentColumn: {
    width: "100%",
    maxWidth: 760,
    gap: spacing.lg,
  },

  header: {
    gap: spacing.sm,
  },

  headerActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },

  backButton: {
    alignSelf: "flex-start",
    minHeight: 44,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },

  backButtonText: {
    color: colors.textPrimary,
    fontFamily: typography.fontFamilyMedium,
    fontSize: typography.sizeSm,
    fontWeight: typography.weightMedium,
  },

  loadingPanel: {
    minHeight: 280,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
  },

  errorBanner: {
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.destructive,
    borderRadius: radii.lg,
    backgroundColor: colors.errorBg,
  },

  errorText: {
    color: colors.textError,
    fontFamily: typography.fontFamilyMedium,
    fontSize: typography.sizeSm,
    fontWeight: typography.weightMedium,
  },

  summary: {
    gap: spacing.md,
  },

  summaryHeader: {
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.amber,
    borderRadius: radii.lg,
    backgroundColor: colors.amberSubtle,
    gap: spacing.xs,
  },

  summaryStats: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },

  statText: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    overflow: "hidden",
    borderRadius: radii.full,
    backgroundColor: colors.surfaceHigh,
    color: colors.textPrimary,
    fontFamily: typography.fontFamilyMedium,
    fontSize: typography.sizeSm,
    fontWeight: typography.weightMedium,
  },

  cheaperStore: {
    color: colors.amber,
    fontFamily: typography.fontFamilyBold,
    fontSize: typography.sizeXl,
    fontWeight: typography.weightBold,
  },

  summaryGrid: {
    flexDirection: "row",
    gap: spacing.md,
  },

  summaryCard: {
    flex: 1,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    gap: spacing.xs,
  },

  storeLabel: {
    color: colors.textPrimary,
    fontFamily: typography.fontFamilyMonoMedium,
    fontSize: typography.sizeXs,
    fontWeight: typography.weightMedium,
    textTransform: "uppercase",
    letterSpacing: typography.letterSpacingCaps,
  },

  priceText: {
    color: colors.textPrimary,
    fontFamily: typography.fontFamilyBold,
    fontSize: typography.sizeLg,
    fontWeight: typography.weightBold,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },

  countPill: {
    minWidth: 32,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    overflow: "hidden",
    borderRadius: radii.full,
    backgroundColor: colors.surfaceHigh,
    color: colors.textPrimary,
    fontFamily: typography.fontFamilyMedium,
    fontSize: typography.sizeSm,
    fontWeight: typography.weightMedium,
    textAlign: "center",
  },

  columnLabels: {
    flexDirection: "row",
    gap: spacing.md,
  },

  columnLabel: {
    flex: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    overflow: "hidden",
    borderRadius: radii.full,
    backgroundColor: colors.surfaceHigh,
    color: colors.textPrimary,
    fontFamily: typography.fontFamilyMonoMedium,
    fontSize: typography.sizeXs,
    fontWeight: typography.weightMedium,
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: typography.letterSpacingCaps,
  },

  comparisonStack: {
    gap: spacing.md,
  },

  comparisonCard: {
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    gap: spacing.md,
  },

  productColumns: {
    flexDirection: "row",
    gap: spacing.lg,
  },

  productPanel: {
    flex: 1,
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "center",
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    backgroundColor: colors.background,
  },

  winningProduct: {
    borderColor: colors.amber,
    backgroundColor: colors.amberSubtle,
  },

  productImage: {
    width: 80,
    height: 80,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceHigh,
  },

  productMeta: {
    flex: 1,
    gap: spacing.xs,
  },

  winnerBadge: {
    alignSelf: "flex-start",
    backgroundColor: colors.amberBadge,
    borderRadius: radii.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },

  winnerBadgeText: {
    color: colors.textDark,
    fontFamily: typography.fontFamilyMonoMedium,
    fontSize: typography.sizeXs,
    fontWeight: typography.weightMedium,
    textTransform: "uppercase",
    letterSpacing: typography.letterSpacingCaps,
  },

  saleBadge: {
    alignSelf: "flex-start",
    backgroundColor: colors.accentSubtle,
    borderRadius: radii.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },

  saleBadgeText: {
    color: colors.textPrimary,
    fontFamily: typography.fontFamilyMonoMedium,
    fontSize: typography.sizeXs,
    fontWeight: typography.weightMedium,
    textTransform: "uppercase",
    letterSpacing: typography.letterSpacingCaps,
  },

  priceInline: {
    color: colors.textPrimary,
    fontFamily: typography.fontFamilySemibold,
    fontSize: typography.sizeSm,
    fontWeight: typography.weightSemibold,
  },

  resultRow: {
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.xs,
  },

  savingsText: {
    color: colors.amber,
    fontFamily: typography.fontFamilySemibold,
    fontSize: typography.sizeMd,
    fontWeight: typography.weightSemibold,
  },

  floatingActionBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: spacing.lg,
    zIndex: 2,
    alignItems: "center",
    paddingHorizontal: spacing.lg,
  },

  backToTopButton: {
    width: "100%",
    maxWidth: 760,
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.full,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },

  backToTopText: {
    color: colors.textPrimary,
    fontFamily: typography.fontFamilyMedium,
    fontSize: typography.sizeSm,
    fontWeight: typography.weightMedium,
  },
});
