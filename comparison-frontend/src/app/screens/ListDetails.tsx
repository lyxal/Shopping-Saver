import { useEffect, useRef, useState } from "react";
import { FactProduct, FactProductPair } from "../lib/types";
import { useAuth } from "../context/AuthContext";
import {
  ActivityIndicator,
  Animated,
  Modal,
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
  radii,
  spacing,
  typography,
} from "../styles/global";
import FactProductPairItem from "../components/FactProductPairItem";
import FactProductItem from "../components/FactProductItem";
import TopBar from "../components/TopBar";

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
  const scrollRef = useRef<ScrollView>(null);
  const successOpacity = useRef(new Animated.Value(0)).current;
  const successTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  useEffect(() => {
    return () => {
      if (successTimer.current) {
        clearTimeout(successTimer.current);
      }
    };
  }, []);

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
  const [submittingProducts, setSubmittingProducts] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [removingProductID, setRemovingProductID] = useState<string | null>(
    null,
  );

  const [selectedColesLink, setSelectedColesProduct] = useState<string>("");
  const [selectedWoolworthsLink, setSelectedWoolworthsProduct] =
    useState<string>("");
  const productCount = details.length;
  const canCompare = productCount >= 1;
  const hasSelectedProducts = !!selectedColesLink && !!selectedWoolworthsLink;

  const showSuccessMessage = (message: string) => {
    if (successTimer.current) {
      clearTimeout(successTimer.current);
    }
    setSuccessMessage(message);
    successOpacity.setValue(1);
    successTimer.current = setTimeout(() => {
      Animated.timing(successOpacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => setSuccessMessage(""));
    }, 10000);
  };

  const closeAddItemForm = () => {
    setShowAddItemForm(false);
    setItemToAddFocused(false);
    setDisableSearchButton(false);
    setSubmittingProducts(false);
    setItemToAdd({ additionType: "name", value: "" });
  };

  const handleAddItem = async () => {
    const isSubmittingSelection = hasSelectedProducts;
    if (!itemToAdd.value.trim() && !isSubmittingSelection) return;
    setSuccessMessage("");
    setErrorMessage("");
    if (isSubmittingSelection) {
      setSubmittingProducts(true);
    } else {
      setShowAddItemForm(false);
      setDisableSearchButton(true);
    }

    try {
      if (itemToAdd.additionType === "link" || isSubmittingSelection) {
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
          setErrorMessage("Only Coles and Woolworths links are supported.");
          return;
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
          // Need to refetch the list details to show the new product
          const updatedDetails = await getAPI<FactProductPair[]>(
            `/getlist/${userID}/${listID}`,
            {},
          );
          setDetails(updatedDetails);
          setItemToAdd({ additionType: "name", value: "" });
          setColesOptions([]);
          setWoolworthsOptions([]);
          setShowSearchResults(false);
          setSelectedColesProduct("");
          setSelectedWoolworthsProduct("");
          showSuccessMessage("Product added successfully.");
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
          const updatedDetails = await getAPI<FactProductPair[]>(
            `/getlist/${userID}/${listID}`,
            {},
          );
          setDetails(updatedDetails);
          setItemToAdd({ additionType: "name", value: "" });
          showSuccessMessage("Product added successfully.");
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
          setShowSearchResults(true);
        }
      }
    } catch (error) {
      setShowSearchResults(false);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Search failed. Please try again.",
      );
    } finally {
      setDisableSearchButton(false);
      setSubmittingProducts(false);
    }
  };

  const handleCompareRequest = () => {
    router.push({
      pathname: "/screens/ComparisonPage",
      params: { listID, listName },
    });
  };

  const handleRemoveProduct = async (productID: string) => {
    const currentListID = Array.isArray(listID) ? listID[0] : listID;
    if (!currentListID || removingProductID) return;

    setSuccessMessage("");
    setRemovingProductID(productID);
    try {
      await postAPI<unknown>("/removeProduct", {
        UserID: userID,
        ListID: currentListID,
        ProductID: productID,
      });
      const updatedDetails = await getAPI<FactProductPair[]>(
        `/getlist/${userID}/${currentListID}`,
        {},
      );
      setDetails(updatedDetails);
      showSuccessMessage("Product removed successfully.");
    } finally {
      setRemovingProductID(null);
    }
  };

  const handleBackToTop = () => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

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
            <View style={styles.pageActions}>
              <Pressable
                onPress={() => router.push("/screens/ProductLists")}
                style={styles.backButton}
                accessibilityRole="button"
              >
                <Text style={styles.backButtonText}>Back to Lists</Text>
              </Pressable>
            </View>
            <Text style={g.textHeading}>{listName}</Text>

            <View style={styles.sectionHeader}>
              <Text style={g.textLabel}>Products in List</Text>
              <Text style={styles.countPill}>{productCount}</Text>
            </View>
          </View>

          <Pressable
            onPress={() => setShowAddItemForm(true)}
            style={g.buttonPrimary}
            accessibilityRole="button"
          >
            <Text style={g.buttonPrimaryText}>Add Item</Text>
          </Pressable>

          {!!successMessage && (
            <Animated.View
              style={[styles.successBanner, { opacity: successOpacity }]}
            >
              <Text style={styles.successText}>{successMessage}</Text>
            </Animated.View>
          )}

          {!!errorMessage && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          {details.length > 0 && !showSearchResults && (
            <View style={[styles.productColumnLabels, styles.stickyLabels]}>
              <View style={styles.productLabelPair}>
                <Text style={styles.columnLabel}>Coles</Text>
                <Text style={styles.columnLabel}>Woolworths</Text>
              </View>
              <View style={styles.removeLabelSpacer} />
            </View>
          )}

          {!showSearchResults && (
            <View style={styles.productStack}>
              {details.map((pair) => (
                <FactProductPairItem
                  key={`${pair.Coles.ProductID}-${pair.Woolworths.ProductID}`}
                  pair={pair}
                  onRemove={handleRemoveProduct}
                  removing={removingProductID === pair.Coles.ProductID}
                />
              ))}
            </View>
          )}

          {showSearchResults && (
            <View style={styles.searchResults}>
              <View style={styles.searchHeader}>
                <Text style={g.textLabel}>Search Results</Text>
              </View>
              <View style={styles.resultColumns}>
                {colesOptions.length > 0 && (
                  <View style={styles.resultList}>
                    <Text style={styles.searchColumnLabel}>Coles</Text>
                    {colesOptions.map((product) => (
                      <Pressable
                        key={`coles-${product.Name}`}
                        onPress={() => setSelectedColesProduct(product.Link)}
                        style={[
                          styles.optionRow,
                          selectedColesLink === product.Link &&
                            styles.optionRowSelected,
                        ]}
                      >
                        <FactProductItem product={product} variant="search" />
                        <Pressable
                          onPress={() => setSelectedColesProduct(product.Link)}
                          style={g.buttonOutlined}
                        >
                          <Text style={g.buttonOutlinedText}>Choose</Text>
                        </Pressable>
                      </Pressable>
                    ))}
                  </View>
                )}
                {woolworthsOptions.length > 0 && (
                  <View style={styles.resultList}>
                    <Text style={styles.searchColumnLabel}>Woolworths</Text>
                    {woolworthsOptions.map((product) => (
                      <Pressable
                        key={`woolworths-${product.Name}`}
                        onPress={() =>
                          setSelectedWoolworthsProduct(product.Link)
                        }
                        style={[
                          styles.optionRow,
                          selectedWoolworthsLink === product.Link &&
                            styles.optionRowSelected,
                        ]}
                      >
                        <FactProductItem product={product} variant="search" />
                        <Pressable
                          onPress={() =>
                            setSelectedWoolworthsProduct(product.Link)
                          }
                          style={g.buttonOutlined}
                        >
                          <Text style={g.buttonOutlinedText}>Choose</Text>
                        </Pressable>
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {(showBackToTop || showSearchResults || canCompare) && (
        <View style={styles.floatingActionBar}>
          {showBackToTop && (
            <Pressable
              onPress={handleBackToTop}
              style={styles.backToTopButton}
              accessibilityRole="button"
            >
              <Text style={styles.backToTopText}>Back to Top</Text>
            </Pressable>
          )}

          {showSearchResults && hasSelectedProducts && (
            <Pressable
              onPress={handleAddItem}
              style={[
                styles.submitButton,
                submittingProducts && styles.buttonDisabled,
              ]}
              disabled={submittingProducts}
              accessibilityRole="button"
            >
              <View style={styles.buttonContent}>
                {submittingProducts && (
                  <ActivityIndicator color={colors.textDark} size="small" />
                )}
                <Text style={styles.submitButtonText}>
                  Submit Selected Products
                </Text>
              </View>
            </Pressable>
          )}

          {canCompare && !showSearchResults && (
            <Pressable
              onPress={handleCompareRequest}
              style={styles.stickyCompareButton}
              accessibilityRole="button"
            >
              <Text style={g.buttonPrimaryText}>Compare</Text>
            </Pressable>
          )}
        </View>
      )}

      {disableSearchButton && !showAddItemForm && (
        <View style={styles.searchLoadingOverlay}>
          <ActivityIndicator color={colors.textPrimary} size="large" />
          <Text style={styles.searchLoadingText}>Searching products...</Text>
        </View>
      )}

      <Modal
        animationType="fade"
        transparent
        visible={showAddItemForm}
        onRequestClose={closeAddItemForm}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={g.textSubheading}>Add Product</Text>
              <Pressable
                onPress={closeAddItemForm}
                style={styles.closeButton}
                accessibilityRole="button"
                accessibilityLabel="Close add product modal"
              >
                <Text style={styles.closeButtonText}>X</Text>
              </Pressable>
            </View>

            <View style={styles.form}>
              <View>
                <Text style={g.inputLabel}>Product name or link</Text>
                <TextInput
                  placeholder="Product name or product link"
                  placeholderTextColor={colors.textSecondary}
                  style={[g.input, itemToAddFocused && g.inputFocused]}
                  value={itemToAdd.value}
                  onFocus={() => setItemToAddFocused(true)}
                  onBlur={() => setItemToAddFocused(false)}
                  onChangeText={(text) => handleItemToAddChange(text)}
                  onSubmitEditing={handleAddItem}
                  returnKeyType="search"
                  autoFocus
                />
              </View>

              <Pressable
                onPress={handleAddItem}
                style={[
                  g.buttonPrimary,
                  styles.buttonWithSpinner,
                  (disableSearchButton || !itemToAdd.value.trim()) &&
                    styles.buttonDisabled,
                ]}
                disabled={disableSearchButton || !itemToAdd.value.trim()}
                accessibilityRole="button"
              >
                <View style={styles.buttonContent}>
                  {disableSearchButton && (
                    <ActivityIndicator color={colors.textDark} size="small" />
                  )}
                  <Text style={g.buttonPrimaryText}>Search</Text>
                </View>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    width: "100%",
  },

  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl * 3,
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

  pageActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
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
    marginBottom: spacing.md,
  },

  backButtonText: {
    color: colors.textPrimary,
    fontFamily: typography.fontFamilyMedium,
    fontSize: typography.sizeSm,
    fontWeight: typography.weightMedium,
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

  successBanner: {
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: radii.lg,
    backgroundColor: colors.accentSubtle,
  },

  successText: {
    color: colors.textPrimary,
    fontFamily: typography.fontFamilyMedium,
    fontSize: typography.sizeSm,
    fontWeight: typography.weightMedium,
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

  productColumnLabels: {
    flexDirection: "row",
    gap: spacing.md,
  },

  productLabelPair: {
    flex: 1,
    flexDirection: "row",
    gap: spacing.md,
  },

  removeLabelSpacer: {
    width: 44,
  },

  stickyLabels: {
    position: "sticky" as "relative",
    top: 0,
    zIndex: 1,
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

  productStack: {
    gap: spacing.md,
  },

  searchResults: {
    paddingTop: spacing.md,
    gap: spacing.lg,
  },

  searchHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },

  resultColumns: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.lg,
  },

  resultList: {
    flex: 1,
    gap: spacing.lg,
  },

  searchColumnLabel: {
    position: "sticky" as "relative",
    top: 0,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
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
    zIndex: 1,
    marginBottom: spacing.sm,
  },

  optionRow: {
    height: 232,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    gap: spacing.sm,
  },

  optionRowSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSubtle,
  },

  floatingActionBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2,
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
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

  submitButton: {
    width: "100%",
    maxWidth: 760,
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surfaceWhite,
  },

  submitButtonText: {
    color: colors.textDark,
    fontFamily: typography.fontFamilySemibold,
    fontSize: typography.sizeMd,
    fontWeight: typography.weightSemibold,
  },

  stickyCompareButton: {
    width: "100%",
    maxWidth: 760,
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.md,
    backgroundColor: colors.amber,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },

  searchLoadingOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 3,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    backgroundColor: "rgba(0, 0, 0, 0.72)",
  },

  searchLoadingText: {
    color: colors.textPrimary,
    fontFamily: typography.fontFamilyMedium,
    fontSize: typography.sizeMd,
    fontWeight: typography.weightMedium,
  },

  modalOverlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.72)",
    padding: spacing.lg,
  },

  modalCard: {
    width: "100%",
    maxWidth: 420,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.lg,
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },

  closeButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.border,
  },

  closeButtonText: {
    color: colors.textPrimary,
    fontFamily: typography.fontFamilySemibold,
    fontSize: typography.sizeSm,
    fontWeight: typography.weightSemibold,
  },

  form: {
    gap: spacing.md,
  },

  buttonWithSpinner: {
    flexDirection: "row",
  },

  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },

  buttonDisabled: {
    opacity: 0.48,
  },
});
