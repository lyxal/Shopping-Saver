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
import { Svg, Path } from "react-native-svg";

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
      <Text style={g.textHeading}>Your Groceries Shopping</Text>
      <Text style={g.textHeadingAmber}>Enhancer</Text>

      <Image
        source={require("../../../assets/images/PlanetSplash.png")}
        style={styles.globe}
      />

      <View style={styles.inputRow}>
        <TextInput
          placeholder="Enter your email to get started"
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
          <Text style={g.buttonPrimaryText}>Sign In</Text>
        </Pressable>
      </View>
    </View>
  );
}

// Local styles — layout and sizing specific to this screen only.
const styles = StyleSheet.create({
  globe: {
    width: 450,
    height: 450,
    marginVertical: spacing.lg,
  },

  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },

  emailInput: {
    width: 300,
  },

  buttonPressed: {
    opacity: 0.8,
  },
});
