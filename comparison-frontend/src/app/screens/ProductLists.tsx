import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Text,
  View,
  TextInput,
  Pressable,
} from "react-native";
import { getAPI, postAPI } from "../lib/api";
import { ProductListSummary } from "../lib/types";
import { Redirect, router } from "expo-router";
import ListSummary from "../components/ListSummary";
import { styles as g, colors } from "../styles/global";

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
    const response = await postAPI<{ ListID: string }>("/createList", {
      UserID: userID,
      ListName: newListName.trim(),
    });
    const newListID = response.ListID;
    router.push({
      pathname: "/screens/ListDetails",
      params: { listID: newListID, listName: newListName.trim() },
    });
  };

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [newListNameFocused, setNewListNameFocused] = useState(false);

  return (
    <>
      <View style={g.screenContainer}>
        <Text style={g.textHeading}>Your Product Lists</Text>
        {lists.map((list) => (
          <ListSummary
            key={list.ListID}
            list={list}
            onPress={handleListPress}
          />
        ))}
        <Pressable
          onPress={() => setShowCreateForm(true)}
          style={g.buttonPrimary}
        >
          <Text style={g.buttonPrimaryText}>Create New List</Text>
        </Pressable>
        {showCreateForm && (
          <View style={g.modal}>
            <Text style={g.inputLabel}>List name</Text>
            <TextInput
              placeholder="Enter list name"
              placeholderTextColor={colors.textSecondary}
              value={newListName}
              onChangeText={setNewListName}
              onFocus={() => setNewListNameFocused(true)}
              onBlur={() => setNewListNameFocused(false)}
              style={[g.input, newListNameFocused && g.inputFocused]}
            />
            <Pressable onPress={handleCreateList} style={g.buttonPrimary}>
              <Text style={g.buttonPrimaryText}>Create</Text>
            </Pressable>
          </View>
        )}
      </View>
    </>
  );
}
