import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { FeatureArtwork, ThemeToggle } from "../components/common";
import { useTheme } from "../lib/theme";

export default function LoadingResultsScreen({
  listName,
}: {
  listName: string;
}) {
  const { palette } = useTheme();
  const styles = useMemo(() => createStyles(palette), [palette]);

  return (
    <View style={styles.page}>
      <View style={styles.topBar}>
        <Text style={styles.brand}>Comparing Stores</Text>
        <ThemeToggle />
      </View>

      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Your savings are almost here!</Text>
        <Text style={styles.heroSub}>{listName}</Text>
      </View>

      <View style={styles.progressRing}>
        <View style={styles.progressInner}>
          <Text style={styles.progressText}>40%</Text>
        </View>
      </View>

      <View style={styles.planetFrame}>
        <FeatureArtwork fallback="comparison" />
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
    },
    topBar: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 30,
    },
    brand: {
      color: palette.text,
      fontSize: 48,
      fontWeight: "300",
      letterSpacing: -1.5,
    },
    hero: {
      alignItems: "center",
      marginVertical: 20,
    },
    heroTitle: {
      color: palette.text,
      textAlign: "center",
      fontSize: 52,
      lineHeight: 58,
      fontWeight: "300",
      letterSpacing: -1.5,
    },
    heroSub: {
      color: palette.muted,
      fontSize: 16,
      marginTop: 8,
      fontWeight: "400",
    },
    progressRing: {
      width: 140,
      height: 140,
      borderRadius: 70,
      borderWidth: 8,
      borderColor: palette.line,
      borderTopColor: palette.accent,
      alignSelf: "center",
      marginTop: 30,
      marginBottom: 30,
      alignItems: "center",
      justifyContent: "center",
    },
    progressInner: {
      width: 90,
      height: 90,
      borderRadius: 45,
      alignItems: "center",
      justifyContent: "center",
    },
    progressText: {
      color: palette.text,
      fontSize: 32,
      fontWeight: "400",
    },
    planetFrame: {
      marginTop: 20,
      flex: 1,
      minHeight: 300,
      overflow: "hidden",
      alignItems: "center",
      justifyContent: "flex-start",
      borderRadius: 8,
    },
  });
}
