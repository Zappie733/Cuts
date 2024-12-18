import React from "react"; // Add this import at the top
import { NavigationContainer } from "@react-navigation/native";
import { RootNavigator } from "./Src/Navigations/RootNavigator";

import { UserContext } from "./Src/Contexts/UserContext";
import { enableScreens } from "react-native-screens";
import { StoreContext } from "./Src/Contexts/StoreContext";
import { AuthContext } from "./Src/Contexts/AuthContext";
import { ThemeContext } from "./Src/Contexts/ThemeContext";

export default function App() {
  enableScreens();
  return (
    <AuthContext>
      <ThemeContext>
        <NavigationContainer>
          <StoreContext>
            <UserContext>
              <RootNavigator />
            </UserContext>
          </StoreContext>
        </NavigationContainer>
      </ThemeContext>
    </AuthContext>
  );
}
