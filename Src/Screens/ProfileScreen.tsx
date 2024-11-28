import {
  Alert,
  Dimensions,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { RootStackScreenProps } from "../Navigations/RootNavigator";
import { Auth, Theme, User, UserContext } from "../Contexts";
import { colors } from "../Config/Theme";
import { Header } from "../Components/Header";
import { SelectImage } from "../Components/Image";
import { Input } from "../Components/Input";
import { logoutUser, updateUserProfile } from "../Middlewares/UserMiddleware";
import { IResponseProps } from "../Types/ResponseTypes";
import { removeDataFromAsyncStorage } from "../Config/AsyncStorage";
import { IAuthObj } from "../Types/ContextTypes/AuthContextTypes";
import { CommonActions } from "@react-navigation/native";
import { ProfileData } from "../Types/UserTypes";

export const ProfileScreen = ({
  navigation,
  route,
}: RootStackScreenProps<"Profile">) => {
  const { theme } = useContext(Theme);
  let activeColors = colors[theme.mode];

  const { auth, setAuth, updateAccessToken } = useContext(Auth);
  const { user, setUser } = useContext(User);

  const screenWidth = Dimensions.get("screen").width;

  const handleGoBack = () => {
    navigation.goBack();
  };

  const defaultUserFormData: ProfileData = {
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
  };
  const [userFormData, setUserFormData] =
    useState<ProfileData>(defaultUserFormData);

  const handleTextChange = (text: string, fieldname: string) => {
    setUserFormData({ ...userFormData, [fieldname]: text });
  };

  const [firstNameEdit, setFirstNameEdit] = useState(false);
  const [lastNameEdit, setLastNameEdit] = useState(false);
  const [emailEdit, setEmailEdit] = useState(false);
  const [phoneEdit, setPhoneEdit] = useState(false);

  const [isChanges, setIsChanges] = useState(false);

  useEffect(() => {
    if (
      userFormData.firstName !== user.firstName ||
      userFormData.lastName !== user.lastName ||
      userFormData.email !== user.email ||
      userFormData.phone !== user.phone
    ) {
      setIsChanges(true);
    } else {
      setIsChanges(false);
    }
  }, [userFormData]);

  const handleUpdateUser = async () => {
    if (isChanges) {
      const response = await updateUserProfile({
        auth,
        updateAccessToken,
        data: userFormData,
      });

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

          // setUserData(defaultUserData);
          // Resetting the navigation stack
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

        setTimeout(() => {
          navigation.navigate("TabsStack", { screen: "Settings" });
        });
      } else {
        Alert.alert("Update Failed", response.message);
      }
    }
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { width: screenWidth, backgroundColor: activeColors.primary },
      ]}
    >
      <Header goBack={handleGoBack} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ marginHorizontal: 30 }}
      >
        <View style={styles.scrollContainer}>
          <Text
            style={{
              color: activeColors.accent,
              fontSize: 30,
              textAlign: "center",
              marginBottom: 20,
            }}
          >
            Your Profile
          </Text>

          <SelectImage userImage={user.image?.file ?? ""} />

          {/* Inputs */}
          <View style={{ marginTop: 20 }}>
            {/* FirstName Input */}
            <Input
              key="firstName"
              context="First Name"
              placeholder="Enter Your First Name"
              value={userFormData.firstName}
              updateValue={(text: string) =>
                handleTextChange(text, "firstName")
              }
              iconName="person"
              iconSource="Octicons"
              isEditable={firstNameEdit}
              setEditable={setFirstNameEdit}
            />
            {/* LastName Input */}
            <Input
              key="lastName"
              context="Last Name"
              placeholder="Enter Your Last Name"
              value={userFormData.lastName}
              updateValue={(text: string) => handleTextChange(text, "lastName")}
              iconName="person"
              iconSource="Octicons"
              isEditable={lastNameEdit}
              setEditable={setLastNameEdit}
            />
            {/* Email Input */}
            <Input
              key="email"
              context="Email"
              placeholder="Enter Your Email"
              value={userFormData.email}
              updateValue={(text: string) => handleTextChange(text, "email")}
              iconName="email-outline"
              iconSource="MaterialCommunityIcons"
              isEditable={emailEdit}
              setEditable={setEmailEdit}
            />
            {/* Mobile Number Input */}
            <Input
              key="phone"
              context="Phone Number"
              placeholder="Enter Your Phone Number"
              value={userFormData.phone}
              updateValue={(text: string) => handleTextChange(text, "phone")}
              iconName="phone"
              iconSource="Feather"
              isEditable={phoneEdit}
              setEditable={setPhoneEdit}
            />
          </View>

          {/* Register Button */}
          <Pressable onPress={handleUpdateUser}>
            <Text
              style={[
                styles.submitButton,
                {
                  color: activeColors.secondary,
                  backgroundColor: isChanges
                    ? activeColors.accent
                    : activeColors.disabledColor,
                  width: (screenWidth * 2) / 3 + 50,
                },
              ]}
            >
              Save
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop:
      Platform.OS === "android"
        ? (StatusBar.currentHeight ? StatusBar.currentHeight : 0) + 20
        : 0,
    flex: 1,
  },
  scrollContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  submitButton: {
    paddingVertical: 12,
    borderRadius: 50,
    textAlign: "center",
    fontSize: 16,
    marginVertical: 15,
    fontWeight: "500",
  },
});
