import React from "react"; // Add this import at the top
import { NavigationContainer } from "@react-navigation/native";
import { RootNavigator } from "./Src/Navigations/RootNavigator";
import { ThemeContext, AuthContext } from "./Src/Contexts";
import { UserContext } from "./Src/Contexts/UserContext";
import { enableScreens } from "react-native-screens";
import { StoreContext } from "./Src/Contexts/StoreContext";

export default function App() {
  enableScreens();
  return (
    <AuthContext>
      <ThemeContext>
        <NavigationContainer>
          <UserContext>
            <StoreContext>
              <RootNavigator />
            </StoreContext>
          </UserContext>
        </NavigationContainer>
      </ThemeContext>
    </AuthContext>
  );
}
