import { StyleSheet, View, Text, Image } from "react-native";
import {
  styles as g,
  colors,
  spacing,
  typography,
  radii,
} from "../styles/global";
import { Redirect, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ComparisonResponse } from "../lib/types";
import { postAPI } from "../lib/api";
import { useAuth } from "../context/AuthContext";

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
  const [loading, setLoading] = useState(true);

  const [comparisonData, setComparisonData] =
    useState<ComparisonResponse | null>(null);

  const fallbackImage = "https://placehold.co/80x80?text=No+Image";
  useEffect(() => {
    const fetchComparison = async () => {
      const response = await postAPI<ComparisonResponse>("/compare", {
        ListID: listID,
        UserID: userID,
      });
      if (!response) {
        setLoading(false);
        return;
      }
      console.log("Comparison data received:", response);
      setComparisonData(response);
      setLoading(false);
    };

    if (listID) {
      fetchComparison();
    }
  }, [listID]);

  return (
    <View style={g.screenContainer}>
      {loading ? (
        <Text style={g.textBody}>
          Loading comparison for list "{listName}"...
        </Text>
      ) : (
        !!comparisonData && (
          <View style={styles.content}>
            <Text style={g.textHeading}>Comparison for list "{listName}"</Text>
            <Text style={g.textBody}>
              Total Normal Price: Woolworths $
              {comparisonData.TotalNormalPrice.Woolworths.toFixed(2)} vs Coles $
              {comparisonData.TotalNormalPrice.Coles.toFixed(2)}
            </Text>
            {comparisonData.Comparisons.map((comp, index) => (
              <View key={index} style={g.cardDark}>
                <Image
                  source={{
                    uri: comp.WoolworthsProduct.ImageLink || fallbackImage,
                  }}
                  style={styles.productImage}
                />
                <Text style={g.textSubheading}>
                  {comp.WoolworthsProduct.Name}
                </Text>
                <Text style={g.textBody}>
                  Woolworths: ${comp.WoolworthsPrice.NormalPrice.toFixed(2)}{" "}
                  (Sale: ${comp.WoolworthsPrice.SalePrice.toFixed(2)})
                </Text>
                <Text style={g.textSubheading}>{comp.ColesProduct.Name}</Text>
                <Image
                  source={{ uri: comp.ColesProduct.ImageLink || fallbackImage }}
                  style={styles.productImage}
                />
                <Text style={g.textBody}>
                  Coles: ${comp.ColesPrice.NormalPrice.toFixed(2)} (Sale: $
                  {comp.ColesPrice.SalePrice.toFixed(2)})
                </Text>
                <Text style={styles.savingsText}>
                  Price Difference: ${comp.PriceDifference.toFixed(2)} (
                  {comp.PercentageDifference.toFixed(2)}%) - Cheaper at{" "}
                  {comp.CheaperStore}
                </Text>
              </View>
            ))}
            <Text style={g.textBody}>
              Total Sale Price: Woolworths $
              {comparisonData.TotalSalePrice.Woolworths.toFixed(2)} vs Coles $
              {comparisonData.TotalSalePrice.Coles.toFixed(2)}
            </Text>
            <Text style={styles.savingsText}>
              Total Savings: $
              {comparisonData.TotalSavings.Woolworths.toFixed(2)} vs Coles $
              {comparisonData.TotalSavings.Coles.toFixed(2)}
            </Text>
            <Text style={g.textSubheading}>
              Overall Cheaper Store: {comparisonData.CheaperStore}
            </Text>
          </View>
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
    gap: spacing.md,
  },

  productImage: {
    width: 80,
    height: 80,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceHigh,
    marginBottom: spacing.sm,
  },

  savingsText: {
    color: colors.amber,
    fontFamily: typography.fontFamily,
    fontSize: typography.sizeMd,
    fontWeight: typography.weightSemibold,
  },
});
