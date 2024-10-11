import {
  Dimensions,
  KeyboardAvoidingView,
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
import React, { useContext, useState } from "react";
import { RootStackScreenProps } from "../Navigations/RootNavigator";
import { Theme } from "../Contexts";
import { colors } from "../Config/Theme";
import { Header } from "../Components/Header";
import { AntDesign } from "@expo/vector-icons";
import { Input } from "../Components/Input";
import { DocumentUpload } from "../Components/Documents";

export const RegisterStoreScreen = ({
  navigation,
  route,
}: RootStackScreenProps<"RegisterStoreScreen">) => {
  const { theme } = useContext(Theme);
  let activeColors = colors[theme.mode];

  const screenWidth = Dimensions.get("screen").width;

  const handleGoBack = () => {
    navigation.goBack();
  };

  const [isModalVisible, setModalVisible] = useState(true);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: activeColors.primary }]}
    >
      {/* Modal for Information */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setModalVisible(false)}
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
              Store Registration Information
            </Text>
            {/* Content */}
            {/* Things to do */}
            <Text
              style={[
                styles.modalSubTitleText,
                {
                  color: activeColors.accent,
                },
              ]}
            >
              Things to do:
            </Text>
            <Text
              style={[
                styles.modalContentText,
                {
                  color: activeColors.accent,
                },
              ]}
            >
              • Input all the required information about your store {"\n"}
            </Text>

            {/* Status Registration */}
            <Text
              style={[
                styles.modalSubTitleText,
                {
                  color: activeColors.accent,
                },
              ]}
            >
              Store Statuses:
            </Text>
            <Text
              style={[
                styles.modalContentText,
                {
                  color: activeColors.accent,
                },
              ]}
            >
              •{" "}
              <Text style={{ fontWeight: "bold" }}>Awaiting for Approval</Text>{" "}
              (Admin is validating your store data)
            </Text>
            <Text
              style={[
                styles.modalContentText,
                {
                  color: activeColors.accent,
                },
              ]}
            >
              • <Text style={{ fontWeight: "bold" }}>Rejected</Text> (Admin
              rejected your store registration, you can modify and resubmit)
            </Text>
            <Text
              style={[
                styles.modalContentText,
                {
                  color: activeColors.accent,
                },
              ]}
            >
              • <Text style={{ fontWeight: "bold" }}>Active</Text> (Store can be
              seen publicly)
            </Text>
            <Text
              style={[
                styles.modalContentText,
                {
                  color: activeColors.accent,
                },
              ]}
            >
              • <Text style={{ fontWeight: "bold" }}>InActive</Text> (Store is
              still private)
            </Text>
            {/* Close Button */}
            <Pressable
              onPress={() => setModalVisible(false)}
              style={styles.modalCloseButton}
            >
              <AntDesign name="close" size={22} color={activeColors.accent} />
            </Pressable>
          </View>
        </View>
      </Modal>

      <Header goBack={handleGoBack} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={[styles.registerContainer]}
        // iOS: padding menggeser konten ke atas tanpa mengubah tinggi kontainer.
        // Android: height mengurangi tinggi kontainer untuk menghindari tumpang tindih dengan keyboard.
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{ width: screenWidth }}
        >
          <View style={styles.registerScrollContainer}>
            {/* Title */}
            <Text style={[styles.title, { color: activeColors.accent }]}>
              Join With Cuts & Expands Your Store
            </Text>

            {/* Information Button */}
            <Pressable onPress={() => setModalVisible(true)}>
              <Text
                style={[
                  styles.informationButton,
                  {
                    color: activeColors.tertiary,
                  },
                ]}
              >
                About Store Registration{" "}
                <Text style={{ color: activeColors.accent }}>Read here</Text>
              </Text>
            </Pressable>

            {/* Break Line */}
            <View
              style={{
                marginTop: 10,
                borderWidth: 1,
                backgroundColor: activeColors.secondary,
                borderColor: activeColors.secondary,
                width: "100%",
              }}
            ></View>

            {/* Little Text */}
            <Text style={[styles.text, { color: activeColors.accent }]}>
              Fill the form below to Register
            </Text>

            {/* Inputs */}
            <View style={{ flex: 1 }}>
              {/* FirstName Input */}
              {/* <Input
                key="registerFirstName"
                context="First Name"
                placeholder="Enter Your First Name"
                value={userRegisterFormData.firstName}
                updateValue={(text: string) =>
                  handleRegisterTextChange(text, "firstName")
                }
                iconName="person"
                iconSource="Octicons"
              /> */}
              <DocumentUpload />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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

  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    width: "75%",
    padding: 30,
    borderRadius: 10,
    borderWidth: 1,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "500",
    textAlign: "center",
  },
  modalSubTitleText: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: "400",
    textAlign: "left",
  },
  modalContentText: {
    marginTop: 10,
    fontSize: 17,
    fontWeight: "200",
  },
  modalCloseButton: {
    position: "absolute",
    top: 10,
    right: 10,
  },

  registerContainer: {
    flex: 1,
  },
  registerScrollContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 40,
    marginBottom: 10,
    fontWeight: "600",
    marginTop: 20,
  },
  informationButton: {
    fontSize: 13,
    marginTop: 5,
  },
  text: {
    fontSize: 20,
    fontWeight: "500",
    marginTop: 20,
  },
});
