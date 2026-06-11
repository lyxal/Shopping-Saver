import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  Pressable,
  View,
} from "react-native";
import { getAPI, postAPI } from "../lib/api";
import { ProductListSummary } from "../lib/types";
import { Redirect, router } from "expo-router";
import ListSummary from "../components/ListSummary";
import {
  styles as g,
  colors,
  radii,
  spacing,
  typography,
} from "../styles/global";
import TopBar from "../components/TopBar";

export default function ProductLists() {
  const auth = useAuth();
  if (!auth) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  const { userID } = auth;
  if (!userID) {
    // Redirect to landing page
    return <Redirect href="/" />;
  }
  const [lists, setLists] = useState<ProductListSummary[]>([]);

  useEffect(() => {
    const fetchLists = async () => {
      const response = await getAPI<ProductListSummary[]>(
        `/getLists/${userID}`,
        {},
      );
      setLists(response);
    };
    fetchLists();
  }, [userID]);

  const handleListPress = (listID: string, listName: string) => {
    router.push({
      pathname: "/screens/ListDetails",
      params: { listID, listName },
    });
  };

  const handleCreateList = async () => {
    if (!newListName.trim()) return;
    const listName = newListName.trim();
    const response = await postAPI<{ ListID: string }>("/createList", {
      UserID: userID,
      ListName: listName,
    });
    const newListID = response.ListID;
    setShowCreateForm(false);
    setNewListName("");
    router.push({
      pathname: "/screens/ListDetails",
      params: { listID: newListID, listName },
    });
  };

  const closeCreateForm = () => {
    setShowCreateForm(false);
    setNewListName("");
    setNewListNameFocused(false);
  };

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [newListNameFocused, setNewListNameFocused] = useState(false);

  return (
    <View style={g.screenContainer}>
      <TopBar></TopBar>
      <View style={g.screenContainerCentered}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
        >
          <View style={styles.contentColumn}>
            <View style={styles.header}>
              <Text style={g.textHeadingAmber}>My Shopping Lists</Text>
            </View>

            <View>
              <Text style={g.textBody}>
                Here are your shopping lists. Tap on a list to view items and
                compare prices between Coles and Woolworths. You can create
                multiple lists for different shopping occasions or categories.
              </Text>
            </View>

            <View style={[styles.listStack, { marginBottom: spacing.sm }]}>
              {lists.map((list) => (
                <ListSummary
                  key={list.ListID}
                  list={list}
                  onPress={handleListPress}
                />
              ))}
            </View>

            <Pressable
              onPress={() => setShowCreateForm(true)}
              style={g.buttonPrimary}
              accessibilityRole="button"
            >
              <Text style={g.buttonPrimaryText}>Create New List</Text>
            </Pressable>
          </View>
        </ScrollView>

        <Modal
          animationType="fade"
          transparent
          visible={showCreateForm}
          onRequestClose={closeCreateForm}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={g.textSubheading}>Create List</Text>
                <Pressable
                  onPress={closeCreateForm}
                  style={styles.closeButton}
                  accessibilityRole="button"
                  accessibilityLabel="Close create list modal"
                >
                  <Text style={styles.closeButtonText}>X</Text>
                </Pressable>
              </View>

              <View style={styles.form}>
                <View>
                  <Text style={g.inputLabel}>List name</Text>
                  <TextInput
                    placeholder="Enter list name"
                    placeholderTextColor={colors.textSecondary}
                    value={newListName}
                    onChangeText={setNewListName}
                    onFocus={() => setNewListNameFocused(true)}
                    onBlur={() => setNewListNameFocused(false)}
                    onSubmitEditing={handleCreateList}
                    returnKeyType="done"
                    autoFocus
                    style={[g.input, newListNameFocused && g.inputFocused]}
                  />
                </View>

                <Pressable
                  onPress={handleCreateList}
                  disabled={!newListName.trim()}
                  style={[
                    g.buttonPrimary,
                    !newListName.trim() && styles.buttonDisabled,
                  ]}
                  accessibilityRole="button"
                >
                  <Text style={g.buttonPrimaryText}>Create</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    width: "100%",
  },

  content: {
    padding: spacing.lg,
    alignItems: "center",
  },

  contentColumn: {
    width: "100%",
    maxWidth: 560,
    gap: spacing.lg,
  },

  header: {
    paddingTop: spacing.sm,
  },

  listStack: {
    gap: spacing.md,
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
    maxWidth: 360,
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
    fontFamily: typography.fontFamily,
    fontSize: typography.sizeSm,
    fontWeight: typography.weightSemibold,
  },

  form: {
    gap: spacing.md,
  },

  buttonDisabled: {
    opacity: 0.48,
  },
});
