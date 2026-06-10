import { View, Pressable, Linking } from "react-native";
import { FactProduct } from "../lib/types";
import { StyleSheet } from "react-native";
import { Image, Text } from "react-native";
import { styles } from "../styles/global";
import { useState } from "react";
const localStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#ccc",
  },
  image: {
    width: 80,
    height: 80,
    marginRight: 10,
  },
  infoContainer: {
    flex: 1,
    justifyContent: "center",
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
  },
  store: {
    fontSize: 14,
    color: "#666",
  },
  link: {
    fontSize: 14,
    color: "#007bff",
  },
});

type Props = {
  product: FactProduct;
  key: string;
};

export default function FactProductItem({ product, key }: Props) {
  console.log("Rendering FactProductItem for product:", product);
  const fallbackImage = "https://placehold.co/80x80?text=No+Image";
  const [imageUri, setImageUri] = useState(product.ImageLink);
  return (
    <View style={localStyles.container} key={key}>
      <Image
        source={{ uri: imageUri }}
        style={localStyles.image}
        onError={() => setImageUri(fallbackImage)}
      />
      <View style={localStyles.infoContainer}>
        <Text style={styles.text}>{product.Name}</Text>
        <Text style={styles.text}>{product.Store}</Text>
        <Pressable onPress={() => Linking.openURL(product.Link)}>
          <Text style={localStyles.link}>View Product</Text>
        </Pressable>
      </View>
    </View>
  );
}
