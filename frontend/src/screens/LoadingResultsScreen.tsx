import React, { useMemo, useEffect, useState } from "react";
import { StyleSheet, Text, View, Animated } from "react-native";
import { FeatureArtwork, ThemeToggle } from "../components/common";
import { useTheme } from "../lib/theme";

export default function LoadingResultsScreen({
  listName,
}: {
  listName: string;
}) {
  const { palette } = useTheme();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const [spinAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    ).start();
  }, [spinAnim]);

  const spinInterpolate = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const spinStyle = {
    transform: [{ rotate: spinInterpolate }],
  };

  return (
    <View style={styles.page}>
      <View style={styles.topBar}>
        <View>
          <Text style={styles.brand}>Open.</Text>
          <Text style={styles.subtitle}>Comparing Stores</Text>
        </View>
        <ThemeToggle />
      </View>

      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Your savings are almost here!</Text>
        <Text style={styles.heroSub}>{listName}</Text>
      </View>

      <Animated.View style={[styles.progressRing, spinStyle]}>
        <View style={styles.progressInner}>
          <Text style={styles.progressText}>⟳</Text>
        </View>
      </Animated.View>

      <View style={styles.planetFrame}>
        <FeatureArtwork source="assets/images/Planet Splash.png" fallback="comparison" />
      </View>
    </View>
  );
}

function createStyles(palette: ReturnType<typeof useTheme>["palette"]) {
  return StyleSheet.create({
    page: {
      minHeight: 720,
      backgroundColor: palette.background,
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 28,
    },
    topBar: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 24,
      gap: 12,
    },
    brand: {
      color: palette.text,
      fontSize: 24,
      fontWeight: "300",
      letterSpacing: -0.8,
    },
    subtitle: {
      color: palette.muted,
      fontSize: 12,
      fontWeight: "500",
      textTransform: "uppercase",
      letterSpacing: 0.4,
      marginTop: 1,
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
      width: 100,
      height: 100,
      borderRadius: 50,
      alignSelf: "center",
      marginTop: 40,
      marginBottom: 40,
      alignItems: "center",
      justifyContent: "center",
    },
    progressInner: {
      width: 100,
      height: 100,
      borderRadius: 50,
      alignItems: "center",
      justifyContent: "center",
    },
    progressText: {
      color: palette.accent,
      fontSize: 48,
      fontWeight: "300",
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
