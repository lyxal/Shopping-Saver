import { View, Text, Image } from "react-native";
import { styles } from "../styles/global";
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
    <View style={styles.main}>
      {loading ? (
        <Text style={styles.text}>
          Loading comparison for list "{listName}"...
        </Text>
      ) : (
        !!comparisonData && (
          <View>
            <Text style={styles.text}>Comparison for list "{listName}"</Text>
            <Text style={styles.text}>
              Total Normal Price: Woolworths $
              {comparisonData.TotalNormalPrice.Woolworths.toFixed(2)} vs Coles $
              {comparisonData.TotalNormalPrice.Coles.toFixed(2)}
            </Text>
            {comparisonData.Comparisons.map((comp, index) => (
              <View key={index} style={{ marginBottom: 20 }}>
                <Image
                  source={{
                    uri: comp.WoolworthsProduct.ImageLink || fallbackImage,
                  }}
                  style={{ width: 80, height: 80 }}
                />
                <Text style={styles.text}>{comp.WoolworthsProduct.Name}</Text>
                <Text style={styles.text}>
                  Woolworths: ${comp.WoolworthsPrice.NormalPrice.toFixed(2)}{" "}
                  (Sale: ${comp.WoolworthsPrice.SalePrice.toFixed(2)})
                </Text>
                <Text style={styles.text}>{comp.ColesProduct.Name}</Text>
                <Image
                  source={{ uri: comp.ColesProduct.ImageLink || fallbackImage }}
                  style={{ width: 80, height: 80 }}
                />
                <Text style={styles.text}>
                  Coles: ${comp.ColesPrice.NormalPrice.toFixed(2)} (Sale: $
                  {comp.ColesPrice.SalePrice.toFixed(2)})
                </Text>
                <Text style={styles.text}>
                  Price Difference: ${comp.PriceDifference.toFixed(2)} (
                  {comp.PercentageDifference.toFixed(2)}%) - Cheaper at{" "}
                  {comp.CheaperStore}
                </Text>
              </View>
            ))}
            <Text style={styles.text}>
              Total Sale Price: Woolworths $
              {comparisonData.TotalSalePrice.Woolworths.toFixed(2)} vs Coles $
              {comparisonData.TotalSalePrice.Coles.toFixed(2)}
            </Text>
            <Text style={styles.text}>
              Total Savings: $
              {comparisonData.TotalSavings.Woolworths.toFixed(2)} vs Coles $
              {comparisonData.TotalSavings.Coles.toFixed(2)}
            </Text>
            <Text style={styles.text}>
              Overall Cheaper Store: {comparisonData.CheaperStore}
            </Text>
          </View>
        )
      )}
    </View>
  );
}
