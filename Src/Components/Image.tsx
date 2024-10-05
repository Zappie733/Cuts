import * as ImagePicker from "expo-image-picker";
import { Camera } from "expo-camera";
import { useState, useEffect, useContext } from "react";
import {
  Button,
  Image,
  View,
  Alert,
  StyleSheet,
  Pressable,
  Text,
} from "react-native";
import { Theme } from "../Contexts";
import { colors } from "../Config/Theme";
import { EvilIcons } from "@expo/vector-icons";
export const SelectImage = () => {
  const { theme } = useContext(Theme);
  let activeColors = colors[theme.mode];

  const [image, setImage] = useState("");

  const requestPermission = async () => {
    const cameraStatus = await Camera.requestCameraPermissionsAsync();
    const galleryStatus =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (
      cameraStatus.status !== "granted" ||
      galleryStatus.status !== "granted"
    ) {
      Alert.alert(
        "Permission required",
        "Sorry, we need camera and media permissions to make this work!"
      );
    }
  };

  useEffect(() => {
    (async () => {
      await requestPermission();
    })();
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleImageSelection = () => {
    Alert.alert(
      "Select Image",
      "Choose an option",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Take Photo", onPress: takePhoto },
        { text: "Choose from Gallery", onPress: pickImage },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.image}>
        {image === "" ? (
          <EvilIcons name="user" size={200} color={activeColors.accent} />
        ) : (
          <Image
            source={{ uri: image }}
            style={{ width: 100, height: 100, borderRadius: 50 }}
          />
        )}
      </View>

      <Pressable
        onPress={handleImageSelection}
        style={[
          styles.selectImageButton,
          { backgroundColor: activeColors.tertiary },
        ]}
      >
        <Text style={[styles.selectImageText, { color: activeColors.accent }]}>
          Select Photo
        </Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    alignItems: "center",
    marginVertical: 20,
  },
  image: {
    marginBottom: 10,
  },
  selectImageButton: {
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 7,
    borderRadius: 20,
  },
  selectImageText: {
    fontSize: 15,
  },
});
