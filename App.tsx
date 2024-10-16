import { NavigationContainer } from "@react-navigation/native";
import { RootNavigator } from "./Src/Navigations/RootNavigator";
import { ThemeContext, AuthContext } from "./Src/Contexts";
import { UserContext } from "./Src/Contexts/UserContext";
import { enableScreens } from "react-native-screens";

export default function App() {
  enableScreens();
  return (
    <AuthContext>
      <ThemeContext>
        <NavigationContainer>
          <UserContext>
            <RootNavigator />
          </UserContext>
        </NavigationContainer>
      </ThemeContext>
    </AuthContext>
  );
}
