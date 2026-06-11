import {
  View,
  Pressable,
  Linking,
  StyleSheet,
  Image,
  Text,
} from "react-native";
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
  variant?: "default" | "search";
};

export default function FactProductItem({
  product,
  selected,
  variant = "default",
}: Props) {
  console.log("Rendering FactProductItem for product:", product);
  const fallbackImage = "https://placehold.co/80x80?text=No+Image";
  const [imageUri, setImageUri] = useState(product.ImageLink);
  return (
    <View
      style={[
        styles.container,
        variant === "search" && styles.searchContainer,
        selected && styles.selected,
      ]}
    >
      <Image
        source={{ uri: imageUri }}
        style={styles.image}
        onError={() => setImageUri(fallbackImage)}
      />
      <View style={styles.infoContainer}>
        <Text style={g.textBody} numberOfLines={2}>
          {product.Name}
        </Text>
        <Text style={g.textCaption}>{product.Store}</Text>
        <Pressable
          style={styles.linkButton}
          onPress={() => Linking.openURL(product.Link)}
        >
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
    minHeight: 112,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    gap: spacing.md,
  },

  searchContainer: {
    minHeight: 128,
    padding: 0,
    borderWidth: 0,
    backgroundColor: "transparent",
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

  linkButton: {
    marginTop: spacing.sm,
  },

  link: {
    color: colors.amber,
    fontFamily: typography.fontFamilyMedium,
    fontSize: typography.sizeSm,
    fontWeight: typography.weightMedium,
    minHeight: 32,
    textAlignVertical: "center",
  },
});
