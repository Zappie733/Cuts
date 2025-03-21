import React from "react";
import * as ImagePicker from "expo-image-picker";
import { Camera } from "expo-camera";
import { useState, useEffect, useContext, useRef } from "react";
import {
  Button,
  Image,
  View,
  Alert,
  StyleSheet,
  Pressable,
  Text,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from "react-native";
import { colors } from "../Config/Theme";
import { EvilIcons, Feather } from "@expo/vector-icons";
import {
  IImageProps,
  SelectImageProps,
  SelectImagesProps,
  SelectSingleImageProps,
} from "../Types/ComponentTypes/ImageTypes";
import * as FileSystem from "expo-file-system";
import { useNavigation } from "@react-navigation/native";
import ImageViewing from "react-native-image-viewing";
import { updateUserProfileImage } from "../Middlewares/UserMiddleware";
import { Theme } from "../Contexts/ThemeContext";
import { Auth } from "../Contexts/AuthContext";
import { User } from "../Contexts/UserContext";
import { apiCallHandler } from "../Middlewares/util";

const width = (Dimensions.get("screen").width * 2) / 3 + 50;

export const SelectProfileImage = ({ userImage }: SelectImageProps) => {
  const { theme } = useContext(Theme);
  let activeColors = colors[theme.mode];

  const [loading, setLoading] = useState(false);

  const [image, setImage] = useState("");
  const [imageOptionForUpload, setImageOptionForUpload] = useState<IImageProps>(
    { file: "" }
  );

  const [requestStatus, setRequestStatus] = useState(false);

  const { auth, setAuth, updateAccessToken } = useContext(Auth);
  const { updateUserImage } = useContext(User);
  const navigation = useNavigation();

  const requestPermission = async () => {
    // Check camera &g allery permission
    const cameraPermission = await Camera.getCameraPermissionsAsync();
    const galleryPermission =
      await ImagePicker.getMediaLibraryPermissionsAsync();

    if (!cameraPermission.granted || !galleryPermission.granted) {
      const cameraStatus = await Camera.requestCameraPermissionsAsync();
      const galleryStatus =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (
        cameraStatus.status !== "granted" ||
        galleryStatus.status !== "granted"
      ) {
        Alert.alert(
          "Permission required",
          "Sorry, we need camera and media permissions for update your profile photo"
        );
        setRequestStatus(false);
        return;
      }
    }

    setRequestStatus(true); // All required permissions are granted
  };

  useEffect(() => {
    (async () => {
      await requestPermission();
    })();
  }, []);

  const pickImage = async () => {
    console.log(imageOptionForUpload);
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const { uri } = result.assets[0];
      setImage(uri);

      const base64Image = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      await setImageOptionForUpload({ file: base64Image });
    }
  };

  const takePhoto = async () => {
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const { uri } = result.assets[0];
      setImage(uri);

      const base64Image = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      await setImageOptionForUpload({ file: base64Image });
    }
  };

  const handleImageSelection = () => {
    if (requestStatus) {
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
    }
  };

  const handleUploadImage = async () => {
    setLoading(true);
    // console.log("Full response object:", response);
    const response = await apiCallHandler({
      apiCall: () =>
        updateUserProfileImage({
          auth,
          updateAccessToken,
          data: imageOptionForUpload,
        }),
      auth,
      setAuth,
      navigation,
    });

    if (response.status >= 200 && response.status < 400) {
      Alert.alert("Success", response.message);

      if (response.data && response.data.image) {
        updateUserImage(response.data.image);
      }
    } else {
      console.error(response.status, response.message);
    }

    setLoading(false);
  };

  useEffect(() => {
    //console.log("Image option for upload updated:", imageOptionForUpload);
    if (image !== "") handleUploadImage();
  }, [imageOptionForUpload]);

  return (
    <View style={styles.container}>
      {/* Loading Modal */}
      <Modal transparent={true} animationType="fade" visible={loading}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={activeColors.accent} />
        </View>
      </Modal>
      <View style={styles.image}>
        {userImage !== "" ? (
          <Image
            source={{ uri: userImage }}
            style={{ width: 100, height: 100, borderRadius: 50 }}
          />
        ) : image === "" ? (
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
          {
            backgroundColor: requestStatus
              ? activeColors.accent
              : activeColors.disabledColor,
          },
        ]}
      >
        <Text
          style={[styles.selectImageText, { color: activeColors.secondary }]}
        >
          Select Photo
        </Text>
      </Pressable>
    </View>
  );
};

export const SelectSingleImage = ({
  imageData,
  handleSetImage,
}: SelectSingleImageProps) => {
  const { theme } = useContext(Theme);
  let activeColors = colors[theme.mode];

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageOptionForUpload, setImageOptionForUpload] =
    useState<IImageProps | null>(null);
  const [requestStatus, setRequestStatus] = useState(false);

  const requestPermission = async () => {
    // Check camera &g allery permission
    const cameraPermission = await Camera.getCameraPermissionsAsync();
    const galleryPermission =
      await ImagePicker.getMediaLibraryPermissionsAsync();

    if (!cameraPermission.granted || !galleryPermission.granted) {
      const cameraStatus = await Camera.requestCameraPermissionsAsync();
      const galleryStatus =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (
        cameraStatus.status !== "granted" ||
        galleryStatus.status !== "granted"
      ) {
        Alert.alert(
          "Permission required",
          "Sorry, we need camera and media permissions for this feature"
        );
        setRequestStatus(false);
        return;
      }
    }

    setRequestStatus(true); // All required permissions are granted
  };

  useEffect(() => {
    (async () => {
      await requestPermission();
    })();

    if (imageData) {
      setSelectedImage(imageData.file);
      setImageOptionForUpload(imageData);
    }
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;

      const base64Image = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      setSelectedImage(uri);
      const newImageOptionForUpload = { file: base64Image };
      setImageOptionForUpload(newImageOptionForUpload);
    }
  };

  const takePhoto = async () => {
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const { uri } = result.assets[0];
      const base64Image = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      setSelectedImage(uri);
      setImageOptionForUpload({ file: base64Image });
    }
  };

  const handleImageSelection = () => {
    if (requestStatus) {
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
    }
  };

  const handleDeleteImage = () => {
    setSelectedImage(null);
    setImageOptionForUpload(null);
  };

  useEffect(() => {
    handleSetImage(imageOptionForUpload);
  }, [imageOptionForUpload]);

  return (
    <View style={styles.container}>
      <View>
        {selectedImage ? (
          <>
            <Image
              source={{ uri: selectedImage }}
              style={[
                styles.singleImage,
                { borderColor: activeColors.tertiary },
              ]}
            />
            <Pressable
              onPress={handleDeleteImage}
              style={[
                styles.deleteButton,
                { backgroundColor: activeColors.tertiary },
              ]}
            >
              <Feather name="x" size={20} color={activeColors.secondary} />
            </Pressable>
          </>
        ) : (
          <View
            style={[
              styles.singleImage,
              {
                borderColor: activeColors.tertiary,
                alignItems: "center",
                justifyContent: "center",
              },
            ]}
          >
            <Text style={{ color: activeColors.tertiary, fontSize: 20 }}>
              No image selected
            </Text>
          </View>
        )}
      </View>

      {/* Select Image */}
      <Pressable
        onPress={handleImageSelection}
        style={[
          styles.selectImageButton,
          {
            backgroundColor: requestStatus
              ? activeColors.accent
              : activeColors.disabledColor,
          },
        ]}
      >
        <Text
          style={[styles.selectImageText, { color: activeColors.secondary }]}
        >
          {selectedImage ? "Change Image" : "Select Image"}
        </Text>
      </Pressable>
    </View>
  );
};

export const SelectImages = ({
  imagesData,
  handleSetImages,
}: SelectImagesProps) => {
  const { theme } = useContext(Theme);
  let activeColors = colors[theme.mode];

  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [imagesOptionForUpload, setImagesOptionForUpload] = useState<
    IImageProps[]
  >([]);

  const [requestStatus, setRequestStatus] = useState(false);

  const requestPermission = async () => {
    // Check camera &g allery permission
    const cameraPermission = await Camera.getCameraPermissionsAsync();
    const galleryPermission =
      await ImagePicker.getMediaLibraryPermissionsAsync();

    if (!cameraPermission.granted || !galleryPermission.granted) {
      const cameraStatus = await Camera.requestCameraPermissionsAsync();
      const galleryStatus =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (
        cameraStatus.status !== "granted" ||
        galleryStatus.status !== "granted"
      ) {
        Alert.alert(
          "Permission required",
          "Sorry, we need camera and media permissions for this feature"
        );
        setRequestStatus(false);
        return;
      }
    }

    setRequestStatus(true); // All required permissions are granted
  };

  useEffect(() => {
    (async () => {
      await requestPermission();
    })();

    if (imagesData) {
      setSelectedImages(imagesData.map((image) => image.file));
      setImagesOptionForUpload(imagesData);
    }
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      //allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      allowsMultipleSelection: true,
    });

    if (!result.canceled) {
      const uris = result.assets.map((asset) => asset.uri);
      // setSelectedImages(uris);
      setSelectedImages([...selectedImages, ...uris]);

      const base64Images = await Promise.all(
        uris.map((uri) => {
          return FileSystem.readAsStringAsync(uri, {
            encoding: FileSystem.EncodingType.Base64,
          });
        })
      );

      const newImagesOptionForUpload = base64Images.map((file) => ({
        file,
      }));

      setImagesOptionForUpload([
        ...imagesOptionForUpload,
        ...newImagesOptionForUpload,
      ]);
    }
  };

  const takePhoto = async () => {
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const { uri } = result.assets[0];
      setSelectedImages([...selectedImages, uri]);

      const base64Image = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      setImagesOptionForUpload([
        ...imagesOptionForUpload,
        { file: base64Image },
      ]);
    }
  };

  const handleImageSelection = () => {
    if (requestStatus) {
      Alert.alert(
        "Select Images",
        "Choose an option",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Take Photo", onPress: takePhoto },
          { text: "Choose from Gallery", onPress: pickImage },
        ],
        { cancelable: true }
      );
    }
  };

  const handleDeleteImage = (index: number) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
    setImagesOptionForUpload(
      imagesOptionForUpload.filter((_, i) => i !== index)
    );
  };

  useEffect(() => {
    handleSetImages(imagesOptionForUpload);
  }, [imagesOptionForUpload]);

  const [isImageViewerVisible, setImageViewerVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const images = selectedImages.map((image) => ({
    uri: image,
  }));
  const handleImagePress = (index: number) => {
    setSelectedImageIndex(index);
    setImageViewerVisible(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        {selectedImages.length > 0 ? (
          <ScrollView
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.imageList}
          >
            {selectedImages.map((uri, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleImagePress(index)}
              >
                <View style={styles.imageItemContainer}>
                  <Image
                    source={{ uri }}
                    style={[
                      styles.imageItem,
                      { borderColor: activeColors.tertiary },
                    ]}
                  />
                  <Pressable
                    onPress={() => handleDeleteImage(index)}
                    style={[
                      styles.deleteButton,
                      { backgroundColor: activeColors.tertiary },
                    ]}
                  >
                    <Feather
                      name="x"
                      size={20}
                      color={activeColors.secondary}
                    />
                  </Pressable>
                </View>
              </TouchableOpacity>
            ))}

            {/* Fullscreen Image Viewer */}
            <ImageViewing
              images={images}
              imageIndex={selectedImageIndex}
              visible={isImageViewerVisible}
              onRequestClose={() => setImageViewerVisible(false)}
            />
          </ScrollView>
        ) : (
          <View style={styles.multiImage}>
            <Text style={[styles.noImages, { color: activeColors.tertiary }]}>
              No images selected
            </Text>
          </View>
        )}
      </View>

      {/* Select Image */}
      <Pressable
        onPress={handleImageSelection}
        style={[
          styles.selectImageButton,
          {
            backgroundColor: requestStatus
              ? activeColors.accent
              : activeColors.disabledColor,
          },
        ]}
      >
        <Text
          style={[styles.selectImageText, { color: activeColors.secondary }]}
        >
          Select Images
        </Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    alignItems: "center",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  image: {
    marginBottom: 10,
  },
  imageList: {
    flexDirection: "row",
    alignItems: "center",
  },
  imageItemContainer: {
    marginHorizontal: 5,
  },
  imageItem: {
    borderRadius: 5,
    width: 80,
    height: 80,
    borderWidth: 1,
  },
  deleteButton: {
    position: "absolute",
    right: 3,
    top: 3,
    padding: 3,
    borderRadius: 20,
  },
  selectImageButton: {
    paddingHorizontal: 20,
    paddingVertical: 7,
    borderRadius: 10,
  },
  selectImageText: {
    fontSize: 15,
  },
  imageContainer: {
    marginBottom: 10,
    width: width,
  },

  singleImage: {
    borderRadius: 5,
    width: width,
    height: 200,
    borderWidth: 1,
    marginBottom: 10,
  },
  multiImage: {
    width: width,
    marginBottom: 10,
  },
  noImages: {
    fontSize: 20,
    textAlign: "center",
  },
});
