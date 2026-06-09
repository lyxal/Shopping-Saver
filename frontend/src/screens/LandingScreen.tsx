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
        <Text style={styles.emailLabel}>Email</Text>
        <View style={styles.emailInputWrap}>
          <TextInput
            value={email}
            onChangeText={onEmailChange}
            placeholder="Enter email value"
            placeholderTextColor={palette.muted}
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.emailInput}
          />
          <Pressable onPress={onContinue} style={styles.submitDot}>
            {loading ? (
              <ActivityIndicator color={palette.black} />
            ) : (
              <Text style={styles.submitDotText}>↗</Text>
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
      paddingHorizontal: 18,
      paddingTop: 20,
      paddingBottom: 28,
      justifyContent: "space-between",
    },
    topBar: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    brand: {
      color: palette.text,
      fontSize: 54,
      fontWeight: "300",
      letterSpacing: -2,
    },
    hero: {
      alignItems: "center",
      marginTop: 10,
    },
    heroTitle: {
      color: palette.text,
      textAlign: "center",
      fontSize: 68,
      lineHeight: 72,
      fontWeight: "300",
      letterSpacing: -2.4,
    },
    artworkWrap: {
      alignItems: "center",
      justifyContent: "center",
      flex: 1,
      minHeight: 320,
    },
    emailPanel: {
      width: "100%",
      maxWidth: 520,
      alignSelf: "center",
      marginTop: 8,
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
      borderWidth: 2,
      borderColor: palette.line,
      borderRadius: 6,
      paddingLeft: 18,
      backgroundColor: palette.background,
    },
    emailInput: {
      flex: 1,
      color: palette.text,
      fontSize: 28,
      fontWeight: "300",
      paddingVertical: 20,
      paddingRight: 12,
    },
    submitDot: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: palette.accentSoft,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 16,
    },
    submitDotText: {
      color: palette.black,
      fontSize: 16,
      fontWeight: "700",
    },
  });
}
