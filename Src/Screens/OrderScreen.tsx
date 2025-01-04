import {
  Dimensions,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  SafeAreaView,
} from "react-native";
import { useContext } from "react";
import { Theme } from "../Contexts/ThemeContext";
import { colors } from "../Config/Theme";
import { Auth } from "../Contexts/AuthContext";
import { Header } from "../Components/Header";
import { Store } from "../Contexts/StoreContext";
import { StoreObj } from "../Types/StoreTypes/StoreTypes";
import { TabsStackScreenProps } from "../Navigations/TabNavigator";
import ExpoStatusBar from "expo-status-bar/build/ExpoStatusBar";
import { Orders } from "../Contexts/OrderContext";

const screenWidth = Dimensions.get("screen").width;

export const OrderScreen = ({
  navigation,
  route,
}: TabsStackScreenProps<"Order">) => {
  const { theme } = useContext(Theme);
  let activeColors = colors[theme.mode];

  // const [loading, setLoading] = useState(false);

  const { auth, setAuth, updateAccessToken } = useContext(Auth);
  const { store, setStore } = useContext(Store);
  const { orders, setOrders } = useContext(Orders);
  console.log("orders", JSON.stringify(orders, null, 2));

  return (
    <SafeAreaView
      style={[
        styles.container,
        { width: screenWidth, backgroundColor: activeColors.primary },
      ]}
    >
      <ExpoStatusBar
        hidden={false}
        style={theme.mode === "dark" ? "light" : "dark"}
        backgroundColor={activeColors.primary}
      />
      {/* Loading Modal */}
      {/* <Modal transparent={true} animationType="fade" visible={loading}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={activeColors.accent} />
        </View>
      </Modal> */}
      <Text>Order Screen</Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop:
      Platform.OS === "android"
        ? (StatusBar.currentHeight ? StatusBar.currentHeight : 0) + 20
        : 0,
  },
  // loaderContainer: {
  //   flex: 1,
  //   justifyContent: "center",
  //   alignItems: "center",
  //   backgroundColor: "rgba(0, 0, 0, 0.5)",
  // },
});
