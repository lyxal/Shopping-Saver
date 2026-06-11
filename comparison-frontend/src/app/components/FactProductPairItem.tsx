import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { SymbolView } from "expo-symbols";
import { colors, radii, spacing, typography } from "../styles/global";
import FactProductItem from "./FactProductItem";
import { FactProductPair } from "../lib/types";

export default function FactProductPairItem({
  pair,
  onRemove,
  removing,
}: {
  pair: FactProductPair;
  onRemove: (productID: string) => void;
  removing?: boolean;
}) {
  return (
    <View style={styles.container}>
      <View style={styles.products}>
        <FactProductItem product={pair.Coles} key="coles" />
        <FactProductItem product={pair.Woolworths} key="woolworths" />
      </View>
      <Pressable
        onPress={() => onRemove(pair.Coles.ProductID)}
        style={[styles.removeButton, removing && styles.disabled]}
        disabled={removing}
        accessibilityRole="button"
        accessibilityLabel={`Remove ${pair.Coles.Name}`}
      >
        {removing ? (
          <ActivityIndicator color={colors.textPrimary} size="small" />
        ) : (
          <SymbolView
            name={{
              ios: "trash",
              android: "delete",
              web: "delete",
            }}
            fallback={<Text style={styles.removeButtonText}>Remove</Text>}
            size={20}
            tintColor={colors.textPrimary}
          />
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flexDirection: "row",
    alignItems: "stretch",
    gap: spacing.md,
  },

  products: {
    flex: 1,
    flexDirection: "row",
    alignItems: "stretch",
    gap: spacing.md,
  },

  removeButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    borderWidth: 1,
    borderColor: colors.textPrimary,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceHigh,
  },

  removeButtonText: {
    color: colors.textPrimary,
    fontFamily: typography.fontFamilyMedium,
    fontSize: typography.sizeSm,
    fontWeight: typography.weightMedium,
  },

  disabled: {
    opacity: 0.48,
  },
});
