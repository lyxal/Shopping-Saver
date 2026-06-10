import { StyleSheet } from 'react-native';
export const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: "#000000",
  },
  text: {
    color: "#ffffff",
    fontFamily: "Arial",
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  modal: {
    width: 300,
    padding: 20,
    backgroundColor: "#222222",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#444444",
  },
  input: {
    backgroundColor: "#333333",
    color: "#ffffff",
    borderWidth: 1,
    borderColor: "#444444",
    padding: 10,
    marginBottom: 10,
  }
});