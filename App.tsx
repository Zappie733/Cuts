import React from "react"; // Add this import at the top
import { NavigationContainer } from "@react-navigation/native";
import { RootNavigator } from "./Src/Navigations/RootNavigator";

import { UserContext } from "./Src/Contexts/UserContext";
import { enableScreens } from "react-native-screens";
import { StoreContext } from "./Src/Contexts/StoreContext";
import { AuthContext } from "./Src/Contexts/AuthContext";
import { ThemeContext } from "./Src/Contexts/ThemeContext";
import { OrderContext } from "./Src/Contexts/OrderContext";

export default function App() {
  enableScreens();
  return (
    <AuthContext>
      <ThemeContext>
        <NavigationContainer>
          <StoreContext>
            <UserContext>
              <OrderContext>
                <RootNavigator />
              </OrderContext>
            </UserContext>
          </StoreContext>
        </NavigationContainer>
      </ThemeContext>
    </AuthContext>
  );
}
