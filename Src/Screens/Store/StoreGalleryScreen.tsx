import React from "react";
import { useContext, useEffect, useState } from "react";
import { colors } from "../../Config/Theme";
import { Store } from "../../Contexts/StoreContext";
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
} from "react-native";
import { RootStackScreenProps } from "../../Navigations/RootNavigator";
import { Header } from "../../Components/Header";
import { Theme } from "../../Contexts/ThemeContext";
import { Auth } from "../../Contexts/AuthContext";
import { AntDesign } from "@expo/vector-icons";
import { ImageSlider } from "../../Components/ImageSlider";
import { apiCallHandler } from "../../Middlewares/util";
import {
  deleteGalleryById,
  likeGalleryById,
} from "../../Middlewares/StoreMiddleware/GalleryMiddleware";
import { User } from "../../Contexts/UserContext";

const screenWidth = Dimensions.get("screen").width;

export const StoreGalleryScreen = ({
  navigation,
  route,
}: RootStackScreenProps<"StoreGallery">) => {
  const handleGoBack = () => {
    navigation.goBack();
  };

  const { theme } = useContext(Theme);
  let activeColors = colors[theme.mode];

  const { store, refetchData } = useContext(Store);
  const { auth, setAuth, updateAccessToken } = useContext(Auth);
  const { user, refetchUser } = useContext(User);
  // useEffect(() => {
  //   console.log(user);
  // }, [user]);
  const [selectedGalleryId, setSelectedGalleryId] = useState("");

  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleLikeGalleryById = async () => {
    const response = await apiCallHandler({
      apiCall: () =>
        likeGalleryById({
          auth,
          updateAccessToken,
          params: {
            storeId: store._id,
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
      await refetchUser(); //karena berhub dengan user's like array
      await refetchData();
    } else if (response) {
      // Alert.alert("Error", response.message);
      console.log(response.status, response.message);
    }
  };

  const handleDeleteGalleryById = async () => {
    const response = await apiCallHandler({
      apiCall: () =>
        deleteGalleryById({
          auth,
          updateAccessToken,
          params: {
            galleryId: selectedGalleryId,
          },
        }),
      auth,
      setAuth,
      navigation,
    });

    if (response.status >= 200 && response.status < 400) {
      Alert.alert("Success", response.message);
      console.log(response.status, response.message);
      await refetchUser(); //karena berhub dengan user's like array
      await refetchData();
      setSelectedGalleryId("");
      setIsModalVisible(false);
    } else if (response) {
      Alert.alert("Error", response.message);
      console.log(response.status, response.message);
    }
  };

  //---------------------
  //ADD
  const [isAddForm, setIsAddForm] = useState(false);

  //-------------------------------------------------------------------
  // EDIT
  const [isEditForm, setIsEditForm] = useState(false);

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
      {!isAddForm && !isEditForm ? (
        <>
          <Header goBack={handleGoBack} />

          {/* title */}
          <View>
            <Text style={[styles.title, { color: activeColors.accent }]}>
              Gallery
            </Text>
            {/* add salesProduct product button */}
            <Pressable
              style={styles.addButtonContainer}
              onPress={() => setIsAddForm(true)}
            >
              <AntDesign name="pluscircle" size={26} color="white" />
            </Pressable>
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
              {store.gallery.map((gallery) => (
                <Pressable
                  key={gallery._id}
                  onPress={() => setSelectedGalleryId(gallery._id ?? "")}
                >
                  <ImageBackground
                    source={{ uri: gallery.images[0].file }} // Replace with your image URL
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
                {store.gallery.map((gallery) => {
                  if (gallery._id === selectedGalleryId) {
                    return (
                      <View key={gallery._id}>
                        {/* line separator */}
                        <View
                          style={{
                            borderWidth: 0.5,
                            borderColor: activeColors.tertiary,
                          }}
                        />

                        {/* image */}
                        <View style={{ width: "100%", height: 400 }}>
                          <ImageSlider
                            images={gallery.images.map((item) => item.file)}
                          />
                        </View>

                        {/* line separator */}
                        <View
                          style={{
                            borderWidth: 0.5,
                            borderColor: activeColors.tertiary,
                          }}
                        />

                        {/* Created Data and Likes */}
                        <View style={styles.dateNLikesContainer}>
                          {/* created date */}
                          <View>
                            <Text
                              style={[
                                styles.createdDate,
                                { color: activeColors.accent },
                              ]}
                            >
                              Uploaded on: {""}
                              {gallery.date.toString().split("T")[0] +
                                " " +
                                gallery.date
                                  .toString()
                                  .split("T")[1]
                                  .slice(0, 8)}
                            </Text>
                          </View>

                          {/* likes */}
                          <View style={{ flexDirection: "row" }}>
                            <Pressable onPress={handleLikeGalleryById}>
                              <AntDesign
                                name={
                                  user.likes.includes(gallery._id)
                                    ? "like1"
                                    : "like2"
                                }
                                size={24}
                                color={activeColors.accent}
                              />
                            </Pressable>
                            <View>
                              <Text
                                style={[
                                  styles.likes,
                                  { color: activeColors.accent },
                                ]}
                              >
                                {gallery.likes}
                              </Text>
                            </View>
                          </View>
                        </View>

                        {/* caption */}
                        <Text
                          style={[
                            styles.caption,
                            { color: activeColors.accent },
                          ]}
                        >
                          {gallery.caption}
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
                  <AntDesign
                    name="close"
                    size={22}
                    color={activeColors.accent}
                  />
                </Pressable>

                {/* Delete Icon */}
                <Pressable
                  style={styles.modalDeleteButton}
                  onPress={() =>
                    Alert.alert(
                      `Are you sure want to delete this photo?`,
                      "Choose an option",
                      [
                        {
                          text: "Delete",
                          onPress: () => {
                            handleDeleteGalleryById();
                          },
                        },
                        { text: "Cancel", style: "cancel" },
                      ],
                      { cancelable: true }
                    )
                  }
                >
                  <AntDesign
                    name="delete"
                    size={22}
                    color={activeColors.accent}
                  />
                </Pressable>
              </View>
            </View>
          </Modal>
        </>
      ) : (
        <></>
      )}
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
  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginVertical: 10,
    textAlign: "center",
  },
  addButtonContainer: {
    position: "absolute",
    top: 20,
    right: 40,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
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
    resizeMode: "contain",
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
  modalDeleteButton: {
    position: "absolute",
    top: 10,
    left: 10,
  },

  dateNLikesContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 10,
    marginHorizontal: 5,
  },
  likes: {
    fontSize: 18,
    fontWeight: "400",
    marginLeft: 5,
    marginRight: 10,
  },
  createdDate: {
    fontSize: 15,
    fontWeight: "300",
    marginLeft: 5,
  },
  caption: {
    fontSize: 18,
    fontWeight: "400",
    marginVertical: 5,
    paddingHorizontal: 30,
  },
});
