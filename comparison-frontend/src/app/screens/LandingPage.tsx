import { useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  Image,
  TextInput,
  Pressable,
} from "react-native";
import { postAPI } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { router } from "expo-router";
import { SigninResponse } from "../lib/types";
const styles = StyleSheet.create({
  main: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  heroText: {
    color: "#ffffff",
    fontFamily: "Arial",
    fontSize: 24,
    fontWeight: "bold",
  },
});

export default function LandingPage() {
  const [email, setEmail] = useState("");
  const auth = useAuth();

  if (!auth) {
    return null; // or some fallback UI
  }

  const { setUserID } = auth;

  const handleGetStarted = async () => {
    const trimmedEmail = email.trim();
    const payload = await postAPI<SigninResponse>("/signin", {
      Email: trimmedEmail,
    });
    setEmail("");
    setUserID(payload.UserID);
    requestAnimationFrame(() => {
      router.push("/screens/ProductLists");
    });
  };

  return (
    <View style={styles.main}>
      <Text style={styles.heroText}>Unlock a world of savings.</Text>
      <Text style={styles.heroText}>One shop at a time.</Text>

      <Image
        source={require("../../../assets/images/PlanetSplash.png")}
        style={{ width: 300, height: 300 }}
      />

      <View style={{ flexDirection: "row", marginTop: 20 }}>
        <TextInput
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          spellCheck={false}
          style={{
            backgroundColor: "#ffffff",
            padding: 10,
            borderRadius: 5,
            width: 200,
            marginRight: 10,
          }}
        />
        <Pressable
          onPress={handleGetStarted}
          style={{
            backgroundColor: "#007bff",
            padding: 10,
            borderRadius: 5,
          }}
        >
          <Text style={{ color: "#ffffff", fontWeight: "bold" }}>
            Get Started
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
