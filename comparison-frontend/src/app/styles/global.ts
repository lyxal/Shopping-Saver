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
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -150 }, { translateY: -100 }],
    width: 300,
    padding: 20,
    backgroundColor: "#222222",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#444444",
  }
});