import { View, Text, StyleSheet, Pressable } from "react-native";
import { ProductListSummary } from "../lib/types";
import { styles as g, colors, spacing } from "../styles/global";

type Props = {
  list: ProductListSummary;
  onPress: (listID: string, listName: string) => void;
};

export default function ListSummary({ list, onPress }: Props) {
  return (
    <Pressable
      onPress={() => onPress(list.ListID, list.ListName)}
      style={({ pressed }) => [g.cardDark, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={`${list.ListName}, ${list.ProductCount} products`}
    >
      <Text style={g.textSubheading}>{list.ListName}</Text>
      <View style={styles.meta}>
        <Text style={g.textCaption}>
          {list.ProductCount} product{list.ProductCount === 1 ? "" : "s"}
        </Text>
        <Text style={g.textCaption}>
          Updated {new Date(list.LastEdited).toLocaleString()}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: {
    backgroundColor: colors.surfaceHigh,
  },

  meta: {
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
});
