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
      paddingHorizontal: 18,
      paddingTop: 20,
      paddingBottom: 28,
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
      fontSize: 64,
      lineHeight: 68,
      fontWeight: "300",
      letterSpacing: -2.2,
    },
    heroSub: {
      color: palette.muted,
      fontSize: 18,
      marginTop: 6,
    },
    progressRing: {
      width: 158,
      height: 158,
      borderRadius: 79,
      borderWidth: 10,
      borderColor: palette.line,
      borderTopColor: palette.text,
      alignSelf: "center",
      marginTop: 42,
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
      fontSize: 34,
      fontWeight: "300",
    },
    planetFrame: {
      marginTop: 24,
      flex: 1,
      minHeight: 320,
      overflow: "hidden",
      alignItems: "center",
      justifyContent: "flex-start",
      borderRadius: 8,
    },
  });
}
