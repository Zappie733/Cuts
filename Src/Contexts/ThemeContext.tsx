import { createContext, ReactNode, useEffect, useRef, useState } from "react";
import { IColorProps, IThemeContext } from "../Types/ColorTypes";
import {
  storeDataToAsyncStorage,
  getDataFromAsyncStorage,
} from "../Config/AsyncStorage";
import * as SplashScreen from "expo-splash-screen";

//munculin splashscreen selama masih load theme dari AsyncStorage
SplashScreen.preventAutoHideAsync();

const defaultContext: IThemeContext = {
  theme: {
    mode: "dark",
  },
  setTheme: () => {},
  changeTheme: () => {},
};
export const Theme = createContext(defaultContext);

export const ThemeContext = ({ children }: { children: ReactNode }) => {
  const defaultTheme: IColorProps = {
    mode: "dark",
  };
  const [theme, setTheme] = useState<IColorProps>(defaultTheme);

  const changeTheme = () => {
    let newTheme = theme.mode === "dark" ? "light" : "dark";
    setTheme({ mode: newTheme as "dark" | "light" });
  };

  const isFirstRender = useRef(true); // Flag untuk melacak render pertama
  console.log("isFirstRender:" + isFirstRender.current);

  // Setiap kali state berubah, simpan ke AsyncStorage kecuali pada first render
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false; // Update flag setelah render pertama
      return; // Skip efek pada render pertama
    }

    if (theme !== null) {
      console.log(theme);
      storeDataToAsyncStorage("theme", theme); //store theme to AsyncStorage
    }
  }, [theme]);

  const loadThemeFromStorage = async () => {
    try {
      const theme = await getDataFromAsyncStorage("theme"); //get theme from AsyncStorage
      if (theme !== null) {
        setTheme(theme);
      } else {
        setTheme(defaultTheme);
      }
    } catch (e) {
      console.error("Failed to load theme:", e);
    } finally {
      await setTimeout(() => {
        console.log("close SplashScreen");
        SplashScreen.hideAsync(); //tutup SplashScreen
      }, 1000);
    }
  };

  // Mengambil theme yang tersimpan pada AsyncStorage ketika app pertama kali dimuat
  useEffect(() => {
    loadThemeFromStorage();
  }, []);

  return (
    <Theme.Provider value={{ theme, setTheme, changeTheme }}>
      {children}
    </Theme.Provider>
  );
};
