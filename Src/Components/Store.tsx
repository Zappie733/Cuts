import {
  Alert,
  Dimensions,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { Auth, Theme } from "../Contexts";
import { colors } from "../Config/Theme";
import { DeleteStoreParams, IStoreProps } from "../Types/StoreTypes";
import { AntDesign, Fontisto } from "@expo/vector-icons";
import { deleteStore } from "../Middlewares/StoreMiddleware";
import { IResponseProps } from "../Types/ResponseTypes";
import { logoutUser } from "../Middlewares/AuthMiddleware";
import { removeDataFromAsyncStorage } from "../Config/AsyncStorage";
import { IAuthObj } from "../Types/AuthContextTypes";
import { CommonActions, useNavigation } from "@react-navigation/native";
import { Input } from "./Input";

const width = (Dimensions.get("screen").width * 2) / 3 + 50;

export const Store = ({
  email,
  images,
  name,
  type,
  location,
  isOpen,
  status,
  refetchData,
}: IStoreProps) => {
  const { theme } = useContext(Theme);
  let activeColors = colors[theme.mode];
  const { auth, setAuth, updateAccessToken } = useContext(Auth);
  const navigation = useNavigation();

  const handleLogin = () => {
    console.log("login process");
  };

  const handleEdit = () => {
    console.log("edit process");
  };

  const [isModalVisible, setIsModalVisible] = useState(false);
  const screenWidth = Dimensions.get("screen").width;
  const [hidePassword, setHidePassword] = useState(true);

  const defaultDeleteStoreFormData: DeleteStoreParams = {
    email: email,
    password: "",
  };

  const [deleteStoreFormData, setDeleteStoreFormData] =
    useState<DeleteStoreParams>(defaultDeleteStoreFormData);
  console.log(deleteStoreFormData);
  const handleDeleteStoreTextChange = (text: string, fieldname: string) => {
    setDeleteStoreFormData({ ...deleteStoreFormData, [fieldname]: text });
  };

  const handleDelete = async () => {
    console.log("delete process");
    const response = await deleteStore(
      auth,
      updateAccessToken,
      deleteStoreFormData
    );

    if (response.status === 402) {
      Alert.alert("Session Expired", response.message);
      const result: IResponseProps = await logoutUser(auth.refreshToken);
      console.log(JSON.stringify(result, null, 2));

      if (result.status >= 200 && result.status < 400) {
        await removeDataFromAsyncStorage("auth");
        const defaultAuth: IAuthObj = {
          _id: "",
          refreshToken: "",
          accessToken: "",
        };
        setAuth(defaultAuth);

        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: "Welcome" }],
          })
        );
      } else {
        Alert.alert("Logout Error", result.message);
      }
    }

    if (response.status >= 200 && response.status < 400) {
      Alert.alert("Success", response.message);
      setIsModalVisible(false);
      setHidePassword(true);
      setDeleteStoreFormData(defaultDeleteStoreFormData);

      refetchData();
    } else {
      Alert.alert("Deletion error", response.message);
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: activeColors.secondary,
          borderColor: activeColors.tertiary,
        },
      ]}
    >
      {/* Store Name */}
      <Text
        style={[
          styles.storeName,
          {
            color: activeColors.accent,
            borderBottomColor: activeColors.primary,
          },
        ]}
        numberOfLines={2}
      >
        {name}
      </Text>
      {/* store info */}
      <View style={styles.storeInfoContainer}>
        {/* Image */}
        <View style={styles.imageContainer}>
          {images[0].file === "" ? (
            <Fontisto
              name="shopping-store"
              size={80}
              color={activeColors.accent}
            />
          ) : (
            <Image source={{ uri: images[0].file }} style={styles.image} />
          )}
        </View>
        {/* Profile Info */}
        <View style={styles.infoContainer}>
          <Text style={[styles.text, { color: activeColors.accent }]}>
            <Text style={{ fontWeight: "400" }}>Type:</Text> {type}{" "}
            <Image
              source={
                type === "Salon"
                  ? require("../../assets/salon.png")
                  : require("../../assets/barbershop.png")
              }
              style={{ width: 15, height: 15 }}
            />
          </Text>
          <Text style={[styles.text, { color: activeColors.accent }]}>
            <Text style={{ fontWeight: "400" }}>Status:</Text> {status}
          </Text>
          <Text
            style={[styles.text, { color: activeColors.accent }]}
            numberOfLines={2}
          >
            <Text style={{ fontWeight: "400" }}>Location:</Text> {location}
          </Text>
        </View>
      </View>

      {/* Login Button */}
      <Pressable
        style={[
          styles.button,
          {
            backgroundColor:
              status === "Waiting for Approval"
                ? activeColors.disabledColor
                : activeColors.accent,
            borderColor: activeColors.tertiary,
          },
        ]}
        onPress={status === "Rejected" ? handleEdit : handleLogin}
        disabled={status === "Waiting for Approval"}
      >
        {status === "Active" || status === "InActive" ? (
          <Text style={[styles.buttonText, { color: activeColors.secondary }]}>
            Login
          </Text>
        ) : status === "Rejected" ? (
          <Text style={[styles.buttonText, { color: activeColors.secondary }]}>
            Edit
          </Text>
        ) : (
          <Text style={[styles.buttonText, { color: activeColors.secondary }]}>
            Pending
          </Text>
        )}
      </Pressable>

      {/* open/close */}
      {isOpen === true && (
        <View style={styles.oc}>
          <Image
            source={require("../../assets/open.png")}
            style={{ width: 50, height: 50 }}
          />
        </View>
      )}
      {isOpen === false && (status === "Active" || status === "InActive") && (
        <View style={styles.oc}>
          <Image
            source={require("../../assets/closed.png")}
            style={{ width: 50, height: 50 }}
          />
        </View>
      )}

      {/* waiting for approval / rejected */}
      {(status === "Waiting for Approval" || status === "Rejected") && (
        <View style={styles.oc}>
          <Image
            source={require("../../assets/onboarding.png")}
            style={{ width: 40, height: 40 }}
          />
        </View>
      )}
      {/* Delete Icon */}
      <Pressable
        style={styles.deleteContainer}
        onPress={() =>
          Alert.alert(
            "Are you sure want to delete this store?",
            "Choose an option",
            [
              {
                text: "Delete",
                onPress: () => {
                  setIsModalVisible(true);
                },
              },
              { text: "Cancel", style: "cancel" },
            ],
            { cancelable: true }
          )
        }
      >
        <AntDesign name="delete" size={18} color={activeColors.accent} />
      </Pressable>

      {/* Modal for input Password for delete store */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => {
          setIsModalVisible(false);
          setHidePassword(true);
          setDeleteStoreFormData(defaultDeleteStoreFormData);
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
            {/* Title */}
            <Text
              style={[
                styles.modalTitle,
                {
                  color: activeColors.accent,
                },
              ]}
            >
              Verify Password
            </Text>

            {/* Inputs */}
            <View>
              {/* Password Input */}
              <Input
                key="inputPassword"
                context="Password"
                isHidden={hidePassword}
                setHidden={setHidePassword}
                placeholder="Enter Your Password"
                value={deleteStoreFormData.password}
                updateValue={(text: string) =>
                  handleDeleteStoreTextChange(text, "password")
                }
                iconName="lock"
                iconSource="Octicons"
              />
            </View>

            {/* Submit Button */}
            <Pressable
              style={[
                styles.submitButton,
                {
                  backgroundColor: activeColors.accent,
                  width: (screenWidth * 2) / 3 + 50,
                },
              ]}
              onPress={handleDelete}
            >
              <Text
                style={[
                  styles.submitButtonText,
                  { color: activeColors.secondary },
                ]}
              >
                Submit
              </Text>
            </Pressable>

            {/* Close Button */}
            <Pressable
              onPress={() => {
                setIsModalVisible(false);
                setHidePassword(true);
                setDeleteStoreFormData(defaultDeleteStoreFormData);
              }}
              style={styles.modalCloseButton}
            >
              <AntDesign name="close" size={22} color={activeColors.accent} />
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width,
    flexDirection: "column",
    padding: 5,
    borderWidth: 2,
    marginVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  storeName: {
    fontSize: 22,
    fontWeight: "400",
    textAlign: "center",
    borderBottomWidth: 1,
    width: 220,
  },
  storeInfoContainer: {
    flexDirection: "row",
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  imageContainer: {
    padding: 10,
  },
  infoContainer: {
    flexDirection: "column",
    paddingVertical: 10,
    flex: 1,
  },
  text: {
    fontSize: 13,
    fontWeight: "300",
    marginBottom: 5,
    width: 170,
  },
  button: {
    paddingVertical: 5,
    borderWidth: 1,
    borderRadius: 10,
    width: "100%",
    marginTop: -5,
  },
  buttonText: {
    textAlign: "center",
    fontWeight: "bold",
  },
  oc: {
    position: "absolute",
    top: 10,
    right: 3,
  },
  icon: {
    width: 30,
    height: 30,
  },
  deleteContainer: {
    position: "absolute",
    top: 12,
    left: 10,
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    width: "90%",
    padding: 30,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "500",
  },
  modalContent: {
    marginTop: 10,
    fontSize: 17,
    fontWeight: "200",
  },
  modalCloseButton: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  submitButton: {
    marginTop: 10,
    paddingVertical: 10,
    borderRadius: 50,
    alignItems: "center",
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
});
