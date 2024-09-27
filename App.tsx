import { NavigationContainer } from "@react-navigation/native";
import { RootNavigator } from "./Src/Navigations/RootNavigator";
import { ThemeContext, AuthContext } from "./Src/Contexts";

export default function App() {
  return (
    <AuthContext>
      <ThemeContext>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </ThemeContext>
    </AuthContext>
  );
}
