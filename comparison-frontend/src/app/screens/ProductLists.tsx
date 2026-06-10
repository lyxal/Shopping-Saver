import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Text,
  View,
  StyleSheet,
  Image,
  TextInput,
  Pressable,
} from "react-native";
import { getAPI, postAPI } from "../lib/api";
import { ProductListSummary } from "../lib/types";
import { Redirect, router } from "expo-router";
import ListSummary from "../components/ListSummary";
import { styles } from "../styles/global";

const localStyles = StyleSheet.create({
  textinput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 8,
    marginBottom: 10,
    backgroundColor: "#ffffff",
  },
});

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

  return (
    <>
      <View style={styles.main}>
        <Text style={styles.text}>Your Product Lists</Text>
        {lists.map((list) => (
          <ListSummary
            key={list.ListID}
            list={list}
            onPress={handleListPress}
          />
        ))}
        <Pressable onPress={() => setShowCreateForm(true)}>
          <Text style={styles.text}>Create New List</Text>
        </Pressable>
        {showCreateForm && (
          <View style={styles.modal}>
            <TextInput
              placeholder="Enter list name"
              value={newListName}
              onChangeText={setNewListName}
              style={localStyles.textinput}
            />
            <Pressable
              onPress={handleCreateList}
              style={{
                backgroundColor: "#007bff",
                padding: 10,
                borderRadius: 5,
              }}
            >
              <Text style={{ color: "#ffffff", fontWeight: "bold" }}>
                Create
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    </>
  );
}
