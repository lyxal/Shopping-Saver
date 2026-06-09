import React, { useMemo } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { FeatureArtwork, ThemeToggle } from "../components/common";
import { useTheme } from "../lib/theme";

export default function LandingScreen({
  email,
  loading,
  onEmailChange,
  onContinue,
}: {
  email: string;
  loading: boolean;
  onEmailChange: (value: string) => void;
  onContinue: () => void;
}) {
  const { palette } = useTheme();
  const styles = useMemo(() => createStyles(palette), [palette]);

  return (
    <View style={styles.page}>
      <View style={styles.topBar}>
        <Text style={styles.brand}>Open.</Text>
        <ThemeToggle />
      </View>

      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Unlock a world of savings.</Text>
        <Text style={styles.heroTitle}>One shop at a time.</Text>
      </View>

      <View style={styles.artworkWrap}>
        <FeatureArtwork fallback="planet" />
      </View>

      <View style={styles.emailPanel}>
        <View style={styles.emailInputWrap}>
          <TextInput
            value={email}
            onChangeText={onEmailChange}
            onSubmitEditing={onContinue}
            placeholder="Email Value"
            placeholderTextColor={palette.muted}
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.emailInput}
          />
          <Pressable onPress={onContinue} style={styles.submitDot} disabled={loading}>
            {loading ? (
              <ActivityIndicator color={palette.white} size="small" />
            ) : (
              <View style={styles.submitDotIcon} />
            )}
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function createStyles(palette: ReturnType<typeof useTheme>["palette"]) {
  return StyleSheet.create({
    page: {
      minHeight: 720,
      backgroundColor: palette.background,
      paddingHorizontal: 24,
      paddingTop: 24,
      paddingBottom: 40,
      justifyContent: "space-between",
    },
    topBar: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 20,
    },
    brand: {
      color: palette.text,
      fontSize: 48,
      fontWeight: "300",
      letterSpacing: -1.5,
    },
    hero: {
      alignItems: "center",
      marginBottom: 40,
    },
    heroTitle: {
      color: palette.text,
      textAlign: "center",
      fontSize: 58,
      lineHeight: 64,
      fontWeight: "300",
      letterSpacing: -1.5,
    },
    artworkWrap: {
      alignItems: "center",
      justifyContent: "center",
      flex: 1,
      minHeight: 340,
      marginVertical: 30,
    },
    emailPanel: {
      width: "100%",
      maxWidth: 520,
      alignSelf: "center",
    },
    emailLabel: {
      color: palette.muted,
      fontSize: 32,
      fontWeight: "300",
      position: "absolute",
      left: 18,
      top: -8,
      opacity: 0.8,
    },
    emailInputWrap: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1.5,
      borderColor: palette.line,
      borderRadius: 20,
      paddingLeft: 24,
      paddingRight: 8,
      backgroundColor: palette.background,
      height: 56,
    },
    emailInput: {
      flex: 1,
      color: palette.text,
      fontSize: 16,
      fontWeight: "400",
      paddingVertical: 16,
      paddingRight: 12,
    },
    submitDot: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: palette.accent,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 8,
    },
    submitDotIcon: {
      width: 16,
      height: 16,
      backgroundColor: palette.white,
      borderRadius: 1,
      transform: [{ rotate: "45deg" }],
    },
    submitDotText: {
      color: palette.black,
      fontSize: 16,
      fontWeight: "700",
    },
  });
}
