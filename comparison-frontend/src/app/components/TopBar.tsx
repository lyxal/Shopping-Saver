import { Text, View, StyleSheet, Pressable } from "react-native";
import { styles as g, colors, spacing } from "../styles/global";
import { router } from "expo-router";

export default function TopBar() {
  const handleOpen = () => {
    router.push("/");
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={handleOpen}>
        <Text style={g.textHeading}>Open</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "flex-start",
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.background,
    marginBottom: spacing.lg,
  },
});
