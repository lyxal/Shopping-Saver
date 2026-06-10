import { useEffect, useState } from "react";
import { FactProduct, FactProductPair } from "../lib/types";
import { useAuth } from "../context/AuthContext";
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  TextInput,
  ScrollView,
} from "react-native";
import { getAPI, postAPI } from "../lib/api";
import { Redirect, router, useLocalSearchParams } from "expo-router";
import { styles } from "../styles/global";
import FactProductPairItem from "../components/FactProductPairItem";
import FactProductItem from "../components/FactProductItem";

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
  const [itemToAdd, setItemToAdd] = useState<{
    additionType: "link" | "name";
    value: string;
  }>({ additionType: "name", value: "" });

  const handleItemToAddChange = (text: string) => {
    const trimmed = text.trim();
    if (trimmed.startsWith("http")) {
      setItemToAdd({ additionType: "link", value: trimmed });
    } else {
      setItemToAdd({ additionType: "name", value: trimmed });
    }
  };

  const [colesOptions, setColesOptions] = useState<FactProduct[]>([]);
  const [woolworthsOptions, setWoolworthsOptions] = useState<FactProduct[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const handleAddItem = async () => {
    if (!itemToAdd.value.trim()) return;
    if (itemToAdd.additionType === "link") {
      const link = itemToAdd.value.trim();
      const payload = {
        ProductLinks: {} as Record<string, string>,
        ListID: listID,
        UserID: userID,
      };
      if (link.includes("coles.com.au")) {
        payload["ProductLinks"]["Coles"] = link;
      } else if (link.includes("woolworths.com.au")) {
        payload["ProductLinks"]["Woolworths"] = link;
      } else {
        alert("Only Coles and Woolworths links are supported.");
      }
      const response = await postAPI<{
        Success: boolean;
        Message: string;
        ColesOptions: FactProduct[] | undefined;
        WoolworthsOptions: FactProduct[] | undefined;
      }>("/addProductFromLink", payload);

      if (response.Success) {
        alert("Product added successfully!");
        // Need to refetch the list details to show the new product
        const updatedDetails = await getAPI<FactProductPair[]>(
          `/getlist/${userID}/${listID}`,
          {},
        );
        setDetails(updatedDetails);
        setShowAddItemForm(false);
        setItemToAdd({ additionType: "name", value: "" });
      } else {
        // This is where the search options are shown
        if (response.ColesOptions) {
          setColesOptions(response.ColesOptions);
        }
        if (response.WoolworthsOptions) {
          setWoolworthsOptions(response.WoolworthsOptions);
        }
        setShowSearchResults(true);
      }
    } else {
      const response = await postAPI<{
        Success: boolean;
        Message: string;
        ColesOptions?: FactProduct[];
        WoolworthsOptions?: FactProduct[];
      }>("/addProductFromName", {
        ProductName: itemToAdd.value.trim(),
        ListID: listID,
        UserID: userID,
      });
      if (response.Success) {
        alert("Product added successfully!");
        const updatedDetails = await getAPI<FactProductPair[]>(
          `/getlist/${userID}/${listID}`,
          {},
        );
        setDetails(updatedDetails);
        setShowAddItemForm(false);
        setItemToAdd({ additionType: "name", value: "" });
      } else {
        if (response.ColesOptions) {
          setColesOptions(response.ColesOptions);
        }
        if (response.WoolworthsOptions) {
          setWoolworthsOptions(response.WoolworthsOptions);
        }
        setShowAddItemForm(false);
        setShowSearchResults(true);
      }
    }
  };

  return (
    <>
      <ScrollView style={styles.main}>
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
            <Text style={styles.text}>Add Product</Text>
            <TextInput
              placeholder="Product Name/Product Link"
              style={styles.input}
              value={itemToAdd.value}
              onChangeText={(text) => handleItemToAddChange(text)}
            />
            <Pressable
              onPress={handleAddItem}
              style={{
                backgroundColor: "#007bff",
                padding: 10,
                borderRadius: 5,
                marginTop: 10,
              }}
            >
              <Text style={{ color: "#ffffff", fontWeight: "bold" }}>
                Search
              </Text>
            </Pressable>
          </View>
        )}
        {showSearchResults && (
          <View style={{ marginTop: 20 }}>
            <Text style={styles.text}>Search Results:</Text>
            {colesOptions.length > 0 && (
              <>
                <Text style={styles.text}>Coles:</Text>
                {colesOptions.map((product) => (
                  <View>
                    <FactProductItem
                      key={`coles-${product.Name}`}
                      product={product}
                    />
                    <Pressable>
                      <Text style={{ color: "#007bff" }}>
                        Choose This Product
                      </Text>
                    </Pressable>
                  </View>
                ))}
              </>
            )}
            {woolworthsOptions.length > 0 && (
              <>
                <Text style={styles.text}>Woolworths:</Text>
                {woolworthsOptions.map((product) => (
                  <View>
                    <FactProductItem
                      key={`woolworths-${product.Name}`}
                      product={product}
                    />
                    <Pressable>
                      <Text style={{ color: "#007bff" }}>
                        Choose This Product
                      </Text>
                    </Pressable>
                  </View>
                ))}
              </>
            )}
          </View>
        )}
      </ScrollView>
    </>
  );
}
