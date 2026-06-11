import { Stack } from "expo-router";
import Head from "expo-router/head";
import {
  Sora_400Regular,
  Sora_500Medium,
  Sora_600SemiBold,
  Sora_700Bold,
  useFonts,
} from "@expo-google-fonts/sora";
import { DMMono_500Medium } from "@expo-google-fonts/dm-mono";
import { AuthProvider } from "./context/AuthContext";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Sora_400Regular,
    Sora_500Medium,
    Sora_600SemiBold,
    Sora_700Bold,
    DMMono_500Medium,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <AuthProvider>
      <Head>
        <title>Shopping Saver</title>
      </Head>
      <Stack
        screenOptions={{
          headerShown: false,
          title: "Shopping Saver",
        }}
      />
    </AuthProvider>
  );
}
