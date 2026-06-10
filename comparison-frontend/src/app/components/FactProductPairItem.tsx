import { View } from "react-native";
import { styles } from "../styles/global";
import FactProductItem from "./FactProductItem";
import { FactProductPair } from "../lib/types";

export default function FactProductPairItem({
  pair,
}: {
  pair: FactProductPair;
}) {
  return (
    <View style={styles.container}>
      <FactProductItem product={pair.Coles} key="coles" />
      <FactProductItem product={pair.Woolworths} key="woolworths" />
    </View>
  );
}
