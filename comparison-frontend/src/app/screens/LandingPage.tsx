import { useEffect, useState } from "react";
import {
  ActivityIndicator,
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [shouldNavigateAfterSignin, setShouldNavigateAfterSignin] =
    useState(false);
  const auth = useAuth();

  if (!auth) {
    return null;
  }

  const { userID, setUserID } = auth;

  useEffect(() => {
    if (!shouldNavigateAfterSignin || !userID) return;
    setShouldNavigateAfterSignin(false);
    router.replace({ pathname: "/screens/ProductLists" });
  }, [shouldNavigateAfterSignin, userID]);

  const handleGetStarted = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const payload = await postAPI<SigninResponse>("/signin", {
        Email: trimmedEmail,
      });
      const userID = payload.UserID ?? payload.userID;
      if (!userID) {
        throw new Error("Sign in succeeded, but no user ID was returned.");
      }

      setEmail("");
      setShouldNavigateAfterSignin(true);
      setUserID(userID);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "We couldn't sign you in. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={[g.screenContainerCentered, { marginTop: -spacing.md }]}>
      <Text style={g.textHeading}>Your Grocery Shopping</Text>
      <Text
        style={[g.textHeadingAmber, { fontSize: g.textHeading.fontSize * 1.8 }]}
      >
        Enhancer
      </Text>

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
          editable={!isSubmitting}
        />
        <Pressable
          onPress={handleGetStarted}
          disabled={isSubmitting || !email.trim()}
          style={({ pressed }) => [
            g.buttonPrimary,
            (isSubmitting || !email.trim()) && styles.buttonDisabled,
            pressed && styles.buttonPressed,
          ]}
        >
          {isSubmitting ? (
            <ActivityIndicator color={colors.textDark} />
          ) : (
            <Text style={g.buttonPrimaryText}>Sign In</Text>
          )}
        </Pressable>
      </View>

      {errorMessage ? (
        <View style={styles.errorBanner}>
          <Text style={g.errorBannerText}>{errorMessage}</Text>
        </View>
      ) : null}
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
    width: 350,
    // Center the text vertically within the input field
    textAlignVertical: "center",
  },

  buttonPressed: {
    opacity: 0.8,
  },

  buttonDisabled: {
    opacity: 0.56,
  },

  errorBanner: {
    ...g.errorBanner,
    width: 520,
    maxWidth: "90%",
    marginTop: spacing.md,
  },
});
