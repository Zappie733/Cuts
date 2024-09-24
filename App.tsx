import { NavigationContainer } from "@react-navigation/native";
import { RootNavigator } from "./Src/Navigations/RootNavigator";
import { ThemeContext } from "./Src/Contexts/ThemeContext";

export default function App() {
  return (
    <ThemeContext>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </ThemeContext>
  );
}
