import { Text, View, StyleSheet } from "react-native";
import { styles as g, colors, spacing } from "../styles/global";

export default function TopBar() {
  return (
    <View style={styles.container}>
      <Text style={g.textHeading}>Open</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "flex-start",
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.background,
  },
});
