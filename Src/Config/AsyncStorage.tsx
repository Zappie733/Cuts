import AsyncStorage from "@react-native-async-storage/async-storage";

export const storeDataToAsyncStorage = async <T = {},>(
  key: string,
  value: T
) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
    console.log(`saved ${key} to AsyncStorage`, value); //, JSON.stringify(value)
  } catch (e) {
    console.error("Failed to store theme to AsyncStorage:", e);
  }
};

export const getDataFromAsyncStorage = async (key: string) => {
  try {
    const storedState = await AsyncStorage.getItem(key);
    console.log(
      `get ${key} from AsyncStorage`,
      storedState
      // JSON.parse(storedState ? storedState : "")
    );
    return storedState !== null ? JSON.parse(storedState) : null;
  } catch (e) {
    console.error(`Failed to get ${key} from AsyncStorage:`, e);
  }
};

export const removeDataFromAsyncStorage = async (key: string) => {
  try {
    await AsyncStorage.removeItem(key);
    console.log(`Removed ${key} from AsyncStorage`);
  } catch (e) {
    console.error(`Failed to remove ${key} from AsyncStorage:`, e);
  }
};
