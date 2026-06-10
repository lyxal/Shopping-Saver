import { Text, View, StyleSheet } from "react-native";
import TopBar from "./components/TopBar";
import LandingPage from "./screens/LandingPage";
import { styles } from "./styles/global";
export default function Index() {
  return (
    <View style={styles.main}>
      <TopBar />
      <LandingPage />
    </View>
  );
}
