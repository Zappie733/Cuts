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
  Image,
  ActivityIndicator,
} from "react-native";
import { RootStackScreenProps } from "../../Navigations/RootNavigator";
import { Header } from "../../Components/Header";
import { Theme } from "../../Contexts/ThemeContext";
import { Auth } from "../../Contexts/AuthContext";
import { AntDesign, FontAwesome5 } from "@expo/vector-icons";
import { ImageSlider } from "../../Components/ImageSlider";
import { apiCallHandler } from "../../Middlewares/util";
import {
  addGallery,
  deleteGalleryById,
  likeGalleryById,
  updateGallery,
} from "../../Middlewares/StoreMiddleware/GalleryMiddleware";
import { User } from "../../Contexts/UserContext";
import {
  AddGalleryData,
  UpdateGalleryData,
} from "../../Types/StoreTypes/GalleryTypes";
import { Input } from "../../Components/Input";
import { SelectImages } from "../../Components/Image";
import { IImageProps } from "../../Types/ComponentTypes/ImageTypes";
import { DropdownPicker } from "../../Components/DropdownPicker";

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

  const [loading, setLoading] = useState(false);

  const { store, refetchData } = useContext(Store);
  const { auth, setAuth, updateAccessToken } = useContext(Auth);
  const { user, refetchUser } = useContext(User);
  useEffect(() => {
    console.log(user);
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

    setLoading(false);
  };

  const handleDeleteGalleryById = async () => {
    setLoading(true);

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

    setLoading(false);
  };

  //---------------------
  //ADD
  const [isAddForm, setIsAddForm] = useState(false);

  const defaultAddData: AddGalleryData = {
    images: [],
    caption: "",
  };

  const [addData, setAddData] = useState(defaultAddData);
  console.log("galleryAddData", addData);

  const handleAddTextChange = <T extends keyof AddGalleryData>(
    value: AddGalleryData[T],
    fieldname: T
  ) => {
    setAddData({
      ...addData,
      [fieldname]: value,
    });
  };

  const handleAddPost = async () => {
    setLoading(true);

    const response = await apiCallHandler({
      apiCall: () =>
        addGallery({
          auth,
          updateAccessToken,
          data: addData,
        }),
      auth,
      setAuth,
      navigation,
    });

    if (response.status >= 200 && response.status < 400) {
      Alert.alert("Success", response.message);
      console.log(response.status, response.message);
      await refetchData();
      setAddData(defaultAddData);
      setIsAddForm(false);
    } else if (response) {
      Alert.alert("Error", response.message);
      console.log(response.status, response.message);
    }

    setLoading(false);
  };
  //-------------------------------------------------------------------
  // EDIT
  const [isEditForm, setIsEditForm] = useState(false);

  const defaultUpdateData: UpdateGalleryData = {
    galleryId: "",
    caption: "",
    isPublic: false,
  };

  const [updateData, setUpdateData] = useState(defaultUpdateData);
  console.log("galleryUpdateData", updateData);
  const [imagesEditForm, setImagesEditForm] = useState<IImageProps[]>([]);
  // console.log("imagesEditForm", imagesEditForm);

  const handleUpdateTextChange = <T extends keyof UpdateGalleryData>(
    value: UpdateGalleryData[T],
    fieldname: T
  ) => {
    setUpdateData({
      ...updateData,
      [fieldname]: value,
    });
  };

  const handleSetEditData = () => {
    const gallery = store.gallery.find(
      (gallery) => gallery._id === selectedGalleryId
    );

    const currentData: UpdateGalleryData = {
      galleryId: selectedGalleryId,
      caption: gallery?.caption ?? "",
      isPublic: gallery?.isPublic ?? false,
    };

    console.log("forEditData", currentData);
    setUpdateData(currentData);
    setImagesEditForm(gallery?.images ?? []);
    setTimeout(() => {
      setIsEditForm(true);
    }, 300);
  };

  const [galleryCaptionEdit, setGalleryCaptionEdit] = useState(false);
  const [isPublicEdit, setIsPublicEdit] = useState(false);

  const handleUpdatePost = async () => {
    setLoading(true);

    const response = await apiCallHandler({
      apiCall: () =>
        updateGallery({
          auth,
          updateAccessToken,
          data: updateData,
        }),
      auth,
      setAuth,
      navigation,
    });

    if (response.status >= 200 && response.status < 400) {
      console.log(response.status, response.message);
      await refetchData();
      setUpdateData(defaultUpdateData);
      setIsEditForm(false);
      setGalleryCaptionEdit(false);
      setIsPublicEdit(false);
      Alert.alert("Success", response.message);

      // setSelectedGalleryId("");
    } else if (response) {
      Alert.alert("Error", response.message);
      console.log(response.status, response.message);
    }

    setLoading(false);
  };

  const isPublicOptions = [
    { label: "Yes", value: "true" },
    { label: "No", value: "false" },
  ];

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
                {/* Edit Icon */}
                <Pressable
                  style={styles.modalEditContainer}
                  onPress={() => {
                    handleSetEditData();
                  }}
                >
                  <FontAwesome5
                    name="edit"
                    size={22}
                    color={activeColors.accent}
                  />
                </Pressable>
              </View>
            </View>
          </Modal>
        </>
      ) : (
        <>
          <Header
            goBack={() => {
              isAddForm
                ? (setIsAddForm(false), setAddData(defaultAddData))
                : (setIsEditForm(false),
                  setUpdateData(defaultUpdateData),
                  setGalleryCaptionEdit(false),
                  setIsPublicEdit(false));
            }}
          />

          {/* title */}
          <View>
            <Text
              style={[
                styles.title,
                { color: activeColors.accent, fontSize: 26 },
              ]}
            >
              {isAddForm ? "Add Post Form" : "Edit Post Form"}
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

          {/* form gallery */}
          <ScrollView showsVerticalScrollIndicator={false}>
            <View
              style={[
                styles.formContainer,
                { borderColor: activeColors.tertiary },
              ]}
            >
              <View>
                {/* image */}
                <View
                  style={{
                    width: "100%",
                    height: 300,
                    // alignSelf: "center",
                    marginVertical: 10,
                  }}
                >
                  {isAddForm && addData.images.length === 1 ? (
                    <>
                      <Image
                        source={{
                          uri:
                            "data:image/png;base64," + addData.images[0]?.file,
                        }}
                        style={styles.image}
                      />
                    </>
                  ) : (
                    <ImageSlider
                      images={
                        isAddForm
                          ? addData.images.map((item) => item.file)
                          : imagesEditForm.map((item) => item.file)
                      }
                    />
                  )}
                </View>

                {isAddForm && (
                  <>
                    {/* line separator */}
                    <View
                      style={{
                        borderWidth: 1,
                        borderColor: activeColors.tertiary,
                      }}
                    />

                    <View style={{ marginVertical: 10 }}>
                      <SelectImages
                        imagesData={addData.images}
                        handleSetImages={(images: IImageProps[]) => {
                          handleAddTextChange(images, "images");
                        }}
                      />
                    </View>
                  </>
                )}

                <View style={{ alignSelf: "center" }}>
                  {/* caption */}
                  <Input
                    key="caption"
                    context="Caption"
                    placeholder="Enter Caption"
                    value={
                      isEditForm ? updateData.caption : addData?.caption || ""
                    }
                    updateValue={(text: string) =>
                      isEditForm
                        ? handleUpdateTextChange(text, "caption")
                        : handleAddTextChange(text, "caption")
                    }
                    isEditable={isEditForm ? galleryCaptionEdit : undefined}
                    setEditable={isEditForm ? setGalleryCaptionEdit : undefined}
                  />

                  {isEditForm && (
                    <View style={styles.typeInputContainer}>
                      <DropdownPicker
                        key={"storeCanChooseWorker"}
                        options={isPublicOptions}
                        selectedValue={updateData.isPublic.toString()}
                        onValueChange={(text: string) =>
                          handleUpdateTextChange(
                            text === "true" ? true : false,
                            "isPublic"
                          )
                        }
                        placeHolder="Can Customer Pick a Worker"
                        isInput={true}
                        context="Public"
                        isEditable={isPublicEdit}
                        setEditable={setIsPublicEdit}
                      />
                    </View>
                  )}
                </View>

                {/* line separator */}
                <View
                  style={{
                    borderWidth: 1,
                    borderColor: activeColors.tertiary,
                  }}
                />

                {/* create order */}
                <Pressable
                  style={[
                    styles.createServiceButton,
                    { backgroundColor: activeColors.accent },
                  ]}
                  onPress={() =>
                    isAddForm ? handleAddPost() : handleUpdatePost()
                  }
                >
                  <Text
                    style={{
                      color: activeColors.primary,
                      fontWeight: "bold",
                      fontSize: 16,
                    }}
                  >
                    {isAddForm ? "Add Post" : "Update Post"}
                  </Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </>
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
  addButtonContainer: {
    position: "absolute",
    top: 20,
    right: 40,
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
  modalEditContainer: {
    position: "absolute",
    top: 8,
    left: 50,
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

  formContainer: {
    flexDirection: "column",
    // alignItems: "center",
    marginHorizontal: 25,
    marginVertical: 20,
    paddingHorizontal: 25,
    paddingBottom: 20,
    borderRadius: 20,
    borderWidth: 2,
  },
  createServiceButton: {
    width: (screenWidth * 2) / 3 + 50,
    marginTop: 10,
    paddingVertical: 10,
    borderRadius: 50,
    alignItems: "center",
    alignSelf: "center",
  },
  typeInputContainer: {
    width: (screenWidth * 2) / 3 + 50,
    zIndex: 99,
    marginVertical: 10,
  },
});
