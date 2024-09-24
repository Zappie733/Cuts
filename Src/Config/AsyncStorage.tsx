import AsyncStorage from "@react-native-async-storage/async-storage";
import { IColorProps } from "../Types/ColorTypes";

export const storeDataToAsyncStorage = async (
  key: string,
  value: IColorProps
) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
    console.log(`saved ${key} to AsyncStorage`, value, JSON.stringify(value));
  } catch (e) {
    console.error("Failed to store theme to AsyncStorage:", e);
  }
};

export const getDataFromAsyncStorage = async (key: string) => {
  try {
    const storedState = await AsyncStorage.getItem("theme");
    console.log(
      `get ${key} from AsyncStorage`,
      storedState,
      JSON.parse(storedState ? storedState : "")
    );
    return storedState != null ? JSON.parse(storedState) : null;
  } catch (e) {
    console.error(`Failed to get ${key} from AsyncStorage:`, e);
  }
};
