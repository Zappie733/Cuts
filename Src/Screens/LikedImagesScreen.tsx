import React from "react";
import { useContext, useEffect, useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Dimensions,
  Platform,
  StatusBar,
  Text,
  ScrollView,
  View,
  Alert,
  Pressable,
  ImageBackground,
  Modal,
  Image,
  ActivityIndicator,
} from "react-native";

import { RootStackScreenProps } from "../Navigations/RootNavigator";
import { Theme } from "../Contexts/ThemeContext";
import { colors } from "../Config/Theme";
import { Auth } from "../Contexts/AuthContext";
import { User } from "../Contexts/UserContext";
import { apiCallHandler } from "../Middlewares/util";
import {
  getGalleryById,
  likeGalleryById,
} from "../Middlewares/StoreMiddleware/GalleryMiddleware";
import { Header } from "../Components/Header";
import { AntDesign } from "@expo/vector-icons";
import { ImageSlider } from "../Components/ImageSlider";
import { GalleryObj } from "../Types/StoreTypes/GalleryTypes";
import { GetGalleryByIdResponse } from "../Types/ResponseTypes/StoreResponse";
import { set } from "mongoose";

const screenWidth = Dimensions.get("screen").width;

export const LikedImagesScreen = ({
  navigation,
  route,
}: RootStackScreenProps<"LikedImages">) => {
  const handleGoBack = () => {
    navigation.goBack();
  };

  const { theme } = useContext(Theme);
  let activeColors = colors[theme.mode];

  const [loading, setLoading] = useState(false);

  const { auth, setAuth, updateAccessToken } = useContext(Auth);
  const { user, refetchUser } = useContext(User);
  useEffect(() => {
    console.log(JSON.stringify(user, null, 2));
  }, [user]);

  const [selectedGalleryId, setSelectedGalleryId] = useState("");
  console.log("selectedGalleryId", selectedGalleryId);

  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleLikeGalleryById = async () => {
    setLoading(true);

    const response = await apiCallHandler({
      apiCall: () =>
        likeGalleryById({
          auth,
          updateAccessToken,
          params: {
            storeId: user.likes?.find(
              (like) => like.imageId === selectedGalleryId
            )?.storeId,
            galleryId: selectedGalleryId,
          },
        }),
      auth,
      setAuth,
      navigation,
    });

    if (response.status >= 200 && response.status < 400) {
      // Alert.alert("Success", response.message);
      console.log(response.status, response.message);
      setSelectedGalleryId("");
      setIsModalVisible(false);
      await refetchUser(); //karena berhub dengan user's like array
    } else if (response) {
      // Alert.alert("Error", response.message);
      console.log(response.status, response.message);
    }

    setLoading(false);
  };

  const [galleriesRecord, setGalleriesRecord] = useState<
    Record<string, GalleryObj>
  >({});

  const handleGetGalleryById = async (storeId: string, galleryId: string) => {
    const response = await apiCallHandler({
      apiCall: () =>
        getGalleryById({
          auth,
          updateAccessToken,
          params: {
            storeId,
            galleryId,
          },
        }),
      auth,
      setAuth,
      navigation,
    });

    if (
      response &&
      response.status >= 200 &&
      response.status < 400 &&
      response.data
    ) {
      return response.data;
    } else if (response) {
      console.log(response.status, response.message);
    }
  };

  const getLikedGalleriesInfo = async () => {
    setLoading(true);

    const galleriesRecordTemp: Record<string, GalleryObj> = {};

    const promises = user.likes?.map(async (likedObj) => {
      const galleryInfo: GetGalleryByIdResponse = await handleGetGalleryById(
        likedObj.storeId ?? "",
        likedObj.imageId ?? ""
      );
      galleriesRecordTemp[likedObj.imageId ?? ""] = galleryInfo.gallery;
    });

    await Promise.all(promises ?? []);
    setGalleriesRecord(galleriesRecordTemp);

    setLoading(false);
  };

  useEffect(() => {
    getLikedGalleriesInfo();
  }, [user]);

  useEffect(() => {
    if (selectedGalleryId) {
      setIsModalVisible(true);
    } else {
      setIsModalVisible(false);
    }
  }, [selectedGalleryId]);

  return (
    <SafeAreaView
      style={[
        styles.container,
        { width: screenWidth, backgroundColor: activeColors.primary },
      ]}
    >
      {/* Loading Modal */}
      <Modal transparent={true} animationType="fade" visible={loading}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={activeColors.accent} />
        </View>
      </Modal>

      <Header goBack={handleGoBack} />

      {/* title */}
      <View>
        <Text style={[styles.title, { color: activeColors.accent }]}>
          Liked Images
        </Text>
      </View>

      {/* line separator */}
      <View
        style={{
          borderWidth: 1,
          marginHorizontal: 60,
          borderColor: activeColors.tertiary,
        }}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ marginHorizontal: 30, marginVertical: 20 }}
      >
        <View style={styles.gridContainer}>
          {user.likes?.map((likedObj) => (
            <Pressable
              key={likedObj.imageId}
              onPress={() => setSelectedGalleryId(likedObj.imageId ?? "")}
            >
              <ImageBackground
                source={{ uri: likedObj.imageFiles[0] }}
                style={[
                  styles.gridItem,
                  {
                    borderColor: activeColors.tertiary,
                  },
                ]}
                imageStyle={styles.image}
              />
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <Modal
        animationType="fade"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => {
          setIsModalVisible(false);
          setSelectedGalleryId("");
        }}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContainer,
              {
                backgroundColor: activeColors.primary,
                borderColor: activeColors.secondary,
              },
            ]}
          >
            {user.likes?.map((likedObj) => {
              if (likedObj.imageId === selectedGalleryId) {
                return (
                  <View key={likedObj.imageId}>
                    {/* line separator */}
                    <View
                      style={{
                        borderWidth: 0.5,
                        borderColor: activeColors.tertiary,
                      }}
                    />

                    {/* image */}
                    <View style={{ width: "100%", height: 400 }}>
                      <ImageSlider images={likedObj.imageFiles} />
                    </View>

                    {/* line separator */}
                    <View
                      style={{
                        borderWidth: 0.5,
                        borderColor: activeColors.tertiary,
                      }}
                    />

                    {/* likes */}
                    <View
                      style={{
                        flexDirection: "row",
                        marginVertical: 10,
                        alignItems: "center",
                        justifyContent: "flex-end",
                      }}
                    >
                      <Pressable
                        onPress={() =>
                          Alert.alert(
                            "UnLike",
                            "Are you sure to unlike this image?",
                            [
                              {
                                text: "No",
                                style: "cancel",
                              },
                              {
                                text: "Yes",
                                onPress: () => handleLikeGalleryById(),
                              },
                            ]
                          )
                        }
                      >
                        <AntDesign
                          name="like1"
                          size={24}
                          color={activeColors.accent}
                        />
                      </Pressable>
                      <View>
                        <Text
                          style={[styles.likes, { color: activeColors.accent }]}
                        >
                          {galleriesRecord[likedObj.imageId]?.likes}
                        </Text>
                      </View>
                    </View>

                    {/* caption */}
                    <Text
                      style={[styles.caption, { color: activeColors.accent }]}
                    >
                      {galleriesRecord[likedObj.imageId]?.caption}
                    </Text>
                  </View>
                );
              }
            })}
            {/* Close Button */}
            <Pressable
              onPress={() => {
                setIsModalVisible(false);
                setSelectedGalleryId("");
              }}
              style={styles.modalCloseButton}
            >
              <AntDesign name="close" size={22} color={activeColors.accent} />
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop:
      Platform.OS === "android"
        ? (StatusBar.currentHeight ? StatusBar.currentHeight : 0) + 20
        : 0,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginVertical: 10,
    textAlign: "center",
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    rowGap: 3,
    columnGap: 3,
  },
  gridItem: {
    width: (screenWidth - 66) / 3,
    height: (screenWidth - 66) / 3,
    borderWidth: 0.5,
    overflow: "hidden",
  },
  image: {
    resizeMode: "cover",
    width: "100%",
    height: "100%",
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    width: "90%",
    height: "65%",
    paddingVertical: 40,
    borderRadius: 10,
    // alignItems: "center",
    borderWidth: 1,
  },
  modalCloseButton: {
    position: "absolute",
    top: 10,
    right: 10,
  },

  likes: {
    fontSize: 18,
    fontWeight: "400",
    marginLeft: 5,
    marginRight: 10,
  },
  caption: {
    fontSize: 18,
    fontWeight: "400",
    marginVertical: 5,
    paddingHorizontal: 30,
  },
});
