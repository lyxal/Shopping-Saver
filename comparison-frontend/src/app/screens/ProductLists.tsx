import { useAuth } from "../context/AuthContext";
import {
  Text,
  View,
  StyleSheet,
  Image,
  TextInput,
  Pressable,
} from "react-native";
export default function ProductLists() {
  const auth = useAuth();
  if (!auth) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  const { userID } = auth;

  return (
    <>
      <Text>Welcome, {userID}!</Text>
    </>
  );
}
