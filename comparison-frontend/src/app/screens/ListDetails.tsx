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
import {
  styles as g,
  colors,
  spacing,
  typography,
} from "../styles/global";
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
  const [disableSearchButton, setDisableSearchButton] = useState(false);
  useEffect(() => {
    const fetchDetails = async () => {
      if (!listID) return;
      const response = await getAPI<FactProductPair[]>(
        `/getlist/${userID}/${listID}`,
        {},
      );
      console.log("Fetched list details:", response);
      setDetails(response);
      setDisableSearchButton(false);
    };
    fetchDetails();
  }, [listID, userID]);

  const [showAddItemForm, setShowAddItemForm] = useState(false);
  const [itemToAddFocused, setItemToAddFocused] = useState(false);
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

  const [selectedColesLink, setSelectedColesProduct] = useState<string>("");
  const [selectedWoolworthsLink, setSelectedWoolworthsProduct] =
    useState<string>("");

  const handleAddItem = async () => {
    setDisableSearchButton(true);
    if (!itemToAdd.value.trim()) return;
    if (
      itemToAdd.additionType === "link" ||
      (!!selectedColesLink && !!selectedWoolworthsLink)
    ) {
      const link = itemToAdd.value.trim();
      const payload = {
        ProductLinks: {} as Record<string, string>,
        ListID: listID,
        UserID: userID,
      };
      if (!!selectedColesLink && !!selectedWoolworthsLink) {
        payload["ProductLinks"]["Coles"] = selectedColesLink;
        payload["ProductLinks"]["Woolworths"] = selectedWoolworthsLink;
      } else if (link.includes("coles.com.au")) {
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
        ColesLink?: string;
        WoolworthsLink?: string;
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
        setColesOptions([]);
        setWoolworthsOptions([]);
        setShowSearchResults(false);
        setSelectedColesProduct("");
        setSelectedWoolworthsProduct("");
      } else {
        // This is where the search options are shown
        if (response.ColesLink) {
          setSelectedColesProduct(response.ColesLink);
        } else if (response.ColesOptions) {
          setColesOptions(response.ColesOptions);
        }
        if (response.WoolworthsLink) {
          setSelectedWoolworthsProduct(response.WoolworthsLink);
        } else if (response.WoolworthsOptions) {
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
        ColesLink?: string;
        WoolworthsLink?: string;
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
        if (response.ColesLink) {
          setSelectedColesProduct(response.ColesLink);
        } else if (response.ColesOptions) {
          setColesOptions(response.ColesOptions);
        }
        if (response.WoolworthsLink) {
          setSelectedWoolworthsProduct(response.WoolworthsLink);
        } else if (response.WoolworthsOptions) {
          setWoolworthsOptions(response.WoolworthsOptions);
        }
        setShowAddItemForm(false);
        setShowSearchResults(true);
        setDisableSearchButton(false);
      }
    }
  };

  const handleCompareRequest = () => {
    router.push({
      pathname: "/screens/ComparisonPage",
      params: { listID, listName },
    });
  };

  return (
    <>
      <ScrollView
        style={g.screenContainer}
        contentContainerStyle={styles.content}
      >
        <Pressable
          onPress={() => router.push("/screens/ProductLists")}
          style={styles.backButton}
        >
          <Text style={styles.linkText}>{`< Back to Lists`}</Text>
        </Pressable>
        <Text style={g.textHeading}>List: {listName}</Text>
        <Pressable
          onPress={handleCompareRequest}
          style={g.buttonPrimary}
        >
          <Text style={g.buttonPrimaryText}>Compare Products</Text>
        </Pressable>
        <Text style={g.textLabel}>Products</Text>
        {details.map((pair) => (
          <FactProductPairItem
            key={`${pair.Coles.ProductID}-${pair.Woolworths.ProductID}`}
            pair={pair}
          />
        ))}
        <Pressable
          onPress={() => setShowAddItemForm(true)}
          style={g.buttonOutlined}
        >
          <Text style={g.buttonOutlinedText}>Add Item</Text>
        </Pressable>
        {showAddItemForm && (
          <View style={g.modal}>
            <Text style={g.textSubheading}>Add Product</Text>
            <Text style={g.inputLabel}>Product name or link</Text>
            <TextInput
              placeholder="Product Name/Product Link"
              placeholderTextColor={colors.textSecondary}
              style={[g.input, itemToAddFocused && g.inputFocused]}
              value={itemToAdd.value}
              onFocus={() => setItemToAddFocused(true)}
              onBlur={() => setItemToAddFocused(false)}
              onChangeText={(text) => handleItemToAddChange(text)}
            />
            <Pressable
              onPress={handleAddItem}
              style={g.buttonPrimary}
              disabled={disableSearchButton}
            >
              <Text style={g.buttonPrimaryText}>Search</Text>
            </Pressable>
          </View>
        )}
        {showSearchResults && (
          <View style={styles.searchResults}>
            <Text style={g.textLabel}>Search Results</Text>
            <View style={styles.resultColumns}>
              {colesOptions.length > 0 && (
                <ScrollView style={styles.resultList}>
                  <Text style={g.textSubheading}>Coles</Text>
                  {colesOptions.map((product) => (
                    <View
                      key={`coles-${product.Name}`}
                      style={styles.optionRow}
                    >
                      <FactProductItem
                        product={product}
                        selected={selectedColesLink === product.Link}
                      />
                      <Pressable
                        onPress={() => setSelectedColesProduct(product.Link)}
                      >
                        <Text style={styles.linkText}>Choose This Product</Text>
                      </Pressable>
                    </View>
                  ))}
                </ScrollView>
              )}
              {woolworthsOptions.length > 0 && (
                <ScrollView style={styles.resultList}>
                  <Text style={g.textSubheading}>Woolworths</Text>
                  {woolworthsOptions.map((product) => (
                    <View
                      key={`woolworths-${product.Name}`}
                      style={styles.optionRow}
                    >
                      <FactProductItem
                        product={product}
                        selected={selectedWoolworthsLink === product.Link}
                      />
                      <Pressable
                        onPress={() =>
                          setSelectedWoolworthsProduct(product.Link)
                        }
                      >
                        <Text style={styles.linkText}>Choose This Product</Text>
                      </Pressable>
                    </View>
                  ))}
                </ScrollView>
              )}
            </View>
            {!!selectedColesLink && !!selectedWoolworthsLink && (
              <Pressable onPress={handleAddItem} style={g.buttonPrimary}>
                <Text style={g.buttonPrimaryText}>Submit Selected Products</Text>
              </Pressable>
            )}
          </View>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
    gap: spacing.md,
  },

  backButton: {
    alignSelf: "flex-start",
    minHeight: 44,
    justifyContent: "center",
  },

  linkText: {
    color: colors.accent,
    fontFamily: typography.fontFamily,
    fontSize: typography.sizeSm,
    fontWeight: typography.weightMedium,
    minHeight: 44,
    textAlignVertical: "center",
  },

  searchResults: {
    gap: spacing.md,
    marginTop: spacing.md,
  },

  resultColumns: {
    flexDirection: "row",
    gap: spacing.md,
  },

  resultList: {
    flex: 1,
    maxHeight: 200,
  },

  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
});
