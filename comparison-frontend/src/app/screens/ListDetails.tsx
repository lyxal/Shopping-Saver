import { useEffect, useState } from "react";
import { FactProductPair } from "../lib/types";
import { useAuth } from "../context/AuthContext";
import { StyleSheet, View, Text, Pressable } from "react-native";
import { getAPI } from "../lib/api";
import { Redirect, router, useLocalSearchParams } from "expo-router";
import { styles } from "../styles/global";
import FactProductPairItem from "../components/FactProductPairItem";

export default function ListDetails() {
  const auth = useAuth();

  if (!auth) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  const { userID } = auth;
  if (!userID) {
    // Redirect to landing page
    return <Redirect href="/" />;
  }

  // Read the listID from the query parameters
  const { listID, listName } = useLocalSearchParams();

  const [details, setDetails] = useState<FactProductPair[]>([]);
  useEffect(() => {
    const fetchDetails = async () => {
      if (!listID) return;
      const response = await getAPI<FactProductPair[]>(
        `/getlist/${userID}/${listID}`,
        {},
      );
      console.log("Fetched list details:", response);
      setDetails(response);
      requestAnimationFrame(() => {});
    };
    fetchDetails();
  }, [listID, userID]);

  const [showAddItemForm, setShowAddItemForm] = useState(false);

  return (
    <>
      <View style={styles.main}>
        <Pressable
          onPress={() => router.push("/screens/ProductLists")}
          style={{ marginBottom: 20 }}
        >
          <Text style={styles.text}>{`< Back to Lists`}</Text>
        </Pressable>
        <Text style={styles.text}>List: {listName}</Text>
        <Text style={styles.text}>Products:</Text>
        {details.map((pair) => (
          <FactProductPairItem
            key={`${pair.Coles.ProductID}-${pair.Woolworths.ProductID}`}
            pair={pair}
          />
        ))}
        <Pressable
          onPress={() => setShowAddItemForm(true)}
          style={{ marginTop: 20 }}
        >
          <Text style={styles.text}>Add Item</Text>
        </Pressable>
        {showAddItemForm && (
          <View style={styles.modal}>
            <Text style={styles.text}>Add Item</Text>
          </View>
        )}
      </View>
    </>
  );
}
