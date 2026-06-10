import { View, Text, StyleSheet, Pressable } from "react-native";
import { ProductListSummary } from "../lib/types";

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 16,
    flexGrow: 1,
  },
  listName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
  },
  extraInfo: {
    fontSize: 14,
    color: "#666",
  },
});

type Props = {
  list: ProductListSummary;
  onPress: (listID: string, listName: string) => void;
};

export default function ListSummary({ list, onPress }: Props) {
  return (
    <Pressable onPress={() => onPress(list.ListID, list.ListName)}>
      <View style={styles.container}>
        <Text style={styles.listName}>{list.ListName}</Text>
        <Text style={styles.extraInfo}>{list.ProductCount} product(s)</Text>
        <Text style={styles.extraInfo}>
          Last updated: {new Date(list.LastEdited).toLocaleString()}
        </Text>
        <Text style={styles.extraInfo}>
          Created at: {new Date(list.CreatedAt).toLocaleString()}
        </Text>
      </View>
    </Pressable>
  );
}
