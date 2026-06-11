import { View, Text, StyleSheet, Pressable } from "react-native";
import { ProductListSummary } from "../lib/types";
import {
  styles as g,
  colors,
  radii,
  spacing,
  typography,
} from "../styles/global";
import { useEffect, useState } from "react";

type Props = {
  list: ProductListSummary;
  onPress: (listID: string, listName: string) => void;
};

export default function ListSummary({ list, onPress }: Props) {
  const [showPotentialSavings, setShowPotentialSavings] = useState(false);
  const productCount = Number(list.ProductCount);

  useEffect(() => {
    // Show the potential savings icon if the last edited date is more than 7 days ago
    const lastEditedDate = new Date(list.LastEdited);
    const now = new Date();
    const diffInDays =
      (now.getTime() - lastEditedDate.getTime()) / (1000 * 3600 * 24);
    //setShowPotentialSavings(diffInDays > 7);
    setShowPotentialSavings(diffInDays > 0); // For testing, show the icon if last edited is in the past
  }, [list.LastEdited]);
  return (
    <Pressable
      onPress={() => onPress(list.ListID, list.ListName)}
      style={({ pressed }) => [
        g.cardDark,
        styles.card,
        pressed && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${list.ListName}, ${list.ProductCount} products`}
    >
      {showPotentialSavings && (
        <View style={[styles.badge, { marginBottom: spacing.sm }]}>
          <Text style={g.badgeAlertText}>Potential Savings</Text>
        </View>
      )}
      <Text
        style={[styles.title, { marginBottom: spacing.sm }]}
        numberOfLines={2}
      >
        {list.ListName}
      </Text>
      <View style={styles.meta}>
        <Text style={g.textCaption}>
          {list.ProductCount} product{productCount === 1 ? "" : "s"}
        </Text>
        <Text style={styles.metaDivider}>•</Text>
        <Text style={g.textCaption}>
          Updated {new Date(list.LastEdited).toLocaleString()}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    borderColor: colors.textPrimary,
    borderRadius: radii.lg,
    gap: spacing.sm,
  },

  pressed: {
    backgroundColor: colors.surfaceHigh,
    opacity: 0.9,
  },

  badge: {
    alignSelf: "flex-start",
    backgroundColor: colors.alertRed,
    borderRadius: radii.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },

  title: {
    color: colors.textPrimary,
    fontFamily: typography.fontFamily,
    fontSize: typography.sizeMd,
    fontWeight: typography.weightSemibold,
  },

  meta: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: spacing.xs,
  },

  metaDivider: {
    color: colors.textSecondary,
    fontFamily: typography.fontFamily,
    fontSize: typography.sizeSm,
  },
});
