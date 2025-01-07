import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
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
import { colors } from "../Config/Theme";
import { Header } from "../Components/Header";
import { SelectProfileImage } from "../Components/Image";
import { Input } from "../Components/Input";
import { updateUserProfile } from "../Middlewares/UserMiddleware";
import { ProfileData } from "../Types/UserTypes";
import { Theme } from "../Contexts/ThemeContext";
import { Auth } from "../Contexts/AuthContext";
import { User } from "../Contexts/UserContext";
import { apiCallHandler } from "../Middlewares/util";

export const ProfileScreen = ({
  navigation,
  route,
}: RootStackScreenProps<"Profile">) => {
  const { theme } = useContext(Theme);
  let activeColors = colors[theme.mode];

  const [loading, setLoading] = useState(false);

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
      setLoading(true);

      const response = await apiCallHandler({
        apiCall: () =>
          updateUserProfile({
            auth,
            updateAccessToken,
            data: userFormData,
          }),
        auth,
        setAuth,
        navigation,
      });

      if (response.status >= 200 && response.status < 400) {
        Alert.alert("Success", response.message);

        setTimeout(() => {
          navigation.navigate("TabsStack", { screen: "Settings" });
        });
      } else {
        Alert.alert("Update Failed", response.message);
      }

      setLoading(false);
    }
  };

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

          <SelectProfileImage userImage={user.image?.file ?? ""} />

          {/* Inputs */}
          <View style={{ marginTop: 20, width: "100%", paddingHorizontal: 15 }}>
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
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
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
