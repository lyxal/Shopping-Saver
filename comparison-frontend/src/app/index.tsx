import { Text, View, StyleSheet } from "react-native";
import TopBar from "./components/TopBar";
import LandingPage from "./screens/LandingPage";
import ProductLists from "./screens/ProductLists";

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: "#000000",
  },
  text: {
    color: "#ffffff",
    fontFamily: "Arial",
  },
});

export default function Index() {
  return (
    <View style={styles.main}>
      <TopBar />
      <LandingPage />
    </View>
  );
}
