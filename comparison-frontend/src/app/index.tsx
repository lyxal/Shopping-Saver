import { View } from "react-native";
import TopBar from "./components/TopBar";
import LandingPage from "./screens/LandingPage";
import { styles as g } from "./styles/global";

export default function Index() {
  return (
    <View style={g.screenContainer}>
      <TopBar />
      <LandingPage />
    </View>
  );
}
