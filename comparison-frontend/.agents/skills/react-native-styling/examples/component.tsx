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
import { styles as g, colors, spacing } from "../styles/global";

export default function LandingPage() {
  const [email, setEmail] = useState("");
  const [emailFocused, setEmailFocused] = useState(false);
  const auth = useAuth();

  if (!auth) {
    return null;
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
    <View style={g.screenContainerCentered}>
      <Text style={g.textHeading}>Unlock a world of savings.</Text>
      <Text style={g.textHeading}>One shop at a time.</Text>

      <Image
        source={require("../../../assets/images/PlanetSplash.png")}
        style={styles.globe}
      />

      <View style={styles.inputRow}>
        <TextInput
          placeholder="Enter your email"
          placeholderTextColor={colors.textSecondary}
          value={email}
          onChangeText={setEmail}
          onFocus={() => setEmailFocused(true)}
          onBlur={() => setEmailFocused(false)}
          spellCheck={false}
          style={[g.input, styles.emailInput, emailFocused && g.inputFocused]}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Pressable
          onPress={handleGetStarted}
          style={({ pressed }) => [
            g.buttonPrimary,
            pressed && styles.buttonPressed,
          ]}
        >
          <Text style={g.buttonPrimaryText}>Get Started</Text>
        </Pressable>
      </View>
    </View>
  );
}

// Local styles — layout and sizing specific to this screen only.
const styles = StyleSheet.create({
  globe: {
    width: 300,
    height: 300,
    marginVertical: spacing.xl,
  },

  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },

  emailInput: {
    width: 200,
  },

  buttonPressed: {
    opacity: 0.8,
  },
});
