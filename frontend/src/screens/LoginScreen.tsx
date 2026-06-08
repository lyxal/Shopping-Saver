import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { palette } from "../lib/theme";
import { InfoChip } from "../components/common";

export default function LoginScreen({
  email,
  loading,
  apiBase,
  onEmailChange,
  onContinue,
}: {
  email: string;
  loading: boolean;
  apiBase: string;
  onEmailChange: (value: string) => void;
  onContinue: () => void;
}) {
  return (
    <View style={styles.pageCard}>
      <Text style={styles.pageKicker}>Step 1</Text>
      <Text style={styles.pageTitle}>Sign in to your grocery profile</Text>
      <Text style={styles.pageBody}>
        Use one email to keep your shopping lists together and compare the stores week by week.
      </Text>

      <View style={styles.infoStrip}>
        <InfoChip label="Backend" value={apiBase} />
        <InfoChip label="Workflow" value="Login first, then choose a list" />
      </View>

      <Text style={styles.fieldLabel}>Email address</Text>
      <TextInput
        value={email}
        onChangeText={onEmailChange}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="you@example.com"
        placeholderTextColor={palette.muted}
        style={styles.input}
      />

      <Pressable
        onPress={onContinue}
        style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
      >
        {loading ? (
          <ActivityIndicator color={palette.text} />
        ) : (
          <Text style={styles.primaryButtonText}>Continue</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  pageCard: {
    backgroundColor: palette.surface,
    borderRadius: 28,
    padding: 18,
    borderWidth: 1,
    borderColor: palette.line,
    gap: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  pageKicker: {
    color: palette.accentDeep,
    textTransform: "uppercase",
    letterSpacing: 1.4,
    fontSize: 12,
    fontWeight: "800",
  },
  pageTitle: {
    color: palette.text,
    fontSize: 26,
    lineHeight: 30,
    fontWeight: "900",
    letterSpacing: -0.8,
  },
  pageBody: {
    color: palette.muted,
    fontSize: 15,
    lineHeight: 22,
  },
  infoStrip: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
  },
  fieldLabel: {
    color: palette.text,
    fontSize: 13,
    fontWeight: "800",
  },
  input: {
    backgroundColor: palette.surfaceMuted,
    color: palette.text,
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
  },
  primaryButton: {
    backgroundColor: palette.accent,
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 14,
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: palette.text,
    fontSize: 15,
    fontWeight: "900",
  },
  pressed: {
    opacity: 0.84,
    transform: [{ scale: 0.99 }],
  },
});
