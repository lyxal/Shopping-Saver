import { View, Pressable, Linking, StyleSheet, Image, Text } from "react-native";
import { FactProduct } from "../lib/types";
import {
  styles as g,
  colors,
  spacing,
  typography,
  radii,
} from "../styles/global";
import { useState } from "react";

type Props = {
  product: FactProduct;
  selected?: boolean;
};

export default function FactProductItem({ product, selected }: Props) {
  console.log("Rendering FactProductItem for product:", product);
  const fallbackImage = "https://placehold.co/80x80?text=No+Image";
  const [imageUri, setImageUri] = useState(product.ImageLink);
  return (
    <View
      style={[
        styles.container,
        selected && styles.selected,
      ]}
    >
      <Image
        source={{ uri: imageUri }}
        style={styles.image}
        onError={() => setImageUri(fallbackImage)}
      />
      <View style={styles.infoContainer}>
        <Text style={g.textBody}>{product.Name}</Text>
        <Text style={g.textCaption}>{product.Store}</Text>
        <Pressable onPress={() => Linking.openURL(product.Link)}>
          <Text style={styles.link}>View Product</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    gap: spacing.md,
  },

  selected: {
    backgroundColor: colors.accentSubtle,
    borderColor: colors.accent,
  },

  image: {
    width: 80,
    height: 80,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceHigh,
  },

  infoContainer: {
    flex: 1,
    justifyContent: "center",
    gap: spacing.xs,
  },

  link: {
    color: colors.accent,
    fontFamily: typography.fontFamily,
    fontSize: typography.sizeSm,
    fontWeight: typography.weightMedium,
    minHeight: 44,
    textAlignVertical: "center",
  },
});
