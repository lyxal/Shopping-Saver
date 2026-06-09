import { Text, View, StyleSheet } from "react-native";

const styles = StyleSheet.create({
  logo: {
    color: "#ffffff",
    fontFamily: "Arial",
    fontSize: 24,
    fontWeight: "bold",
    flex: 1,
  },
  container: {
    flexDirection: "row",
    justifyContent: "flex-start",
    paddingTop: 20,
    paddingLeft: 20,
  },
});

export default function TopBar() {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>Open</Text>
    </View>
  );
}
