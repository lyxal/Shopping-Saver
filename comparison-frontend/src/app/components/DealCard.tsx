/**
 * examples/component.tsx
 *
 * Reference component demonstrating the project's styling conventions.
 * Shows: global token usage, local StyleSheet, dynamic runtime styles.
 *
 * This is a shop/deal card — sits on a black background, floats without
 * a heavy card surface, uses the blue accent for actions only.
 */

import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import {
  styles as g,
  colors,
  spacing,
  typography,
  radii,
} from "../styles/global";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DealCardProps {
  shopName: string;
  category: string;
  saving: string;
  isClaimed: boolean;
  onClaim: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DealCard({
  shopName,
  category,
  saving,
  isClaimed,
  onClaim,
}: DealCardProps) {
  return (
    <View style={styles.card}>
      {/* Header row */}
      <View style={styles.header}>
        <View style={styles.meta}>
          <Text style={styles.shopName}>{shopName}</Text>
          <Text style={styles.category}>{category}</Text>
        </View>

        {/* Saving badge — dynamic color based on claimed state */}
        <View
          style={[
            styles.badge,
            {
              backgroundColor: isClaimed
                ? colors.accentSubtle
                : colors.amberSubtle,
            },
          ]}
        >
          <Text
            style={[
              styles.badgeText,
              { color: isClaimed ? colors.accent : colors.amber },
            ]}
          >
            {saving}
          </Text>
        </View>
      </View>

      {/* Divider */}
      <View style={g.divider} />

      {/* Action */}
      <TouchableOpacity
        style={[styles.button, isClaimed && styles.buttonClaimed]}
        onPress={onClaim}
        disabled={isClaimed}
        activeOpacity={0.75}
        accessibilityRole="button"
        accessibilityLabel={
          isClaimed ? "Deal claimed" : `Claim deal at ${shopName}`
        }
      >
        <Text
          style={[styles.buttonText, isClaimed && styles.buttonTextClaimed]}
        >
          {isClaimed ? "Claimed" : "Claim Deal"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Local styles — component-specific only. Shared tokens come from `g`.
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },

  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },

  meta: {
    flex: 1,
    gap: spacing.xs,
  },

  shopName: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizeLg,
    fontWeight: typography.weightSemibold,
    color: colors.textPrimary,
  },

  category: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizeSm,
    fontWeight: typography.weightRegular,
    color: colors.textSecondary,
  },

  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
  },

  badgeText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizeSm,
    fontWeight: typography.weightMedium,
  },

  button: {
    backgroundColor: colors.amber,
    borderRadius: radii.full,
    paddingVertical: spacing.sm,
    alignItems: "center",
    minHeight: 44,
    justifyContent: "center",
  },

  buttonClaimed: {
    backgroundColor: colors.surfaceHigh,
  },

  buttonText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizeMd,
    fontWeight: typography.weightSemibold,
    color: colors.textDark,
  },

  buttonTextClaimed: {
    color: colors.textSecondary,
  },
});
