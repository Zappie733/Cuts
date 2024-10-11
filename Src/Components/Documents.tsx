import React, { useContext, useState } from "react";
import {
  View,
  Button,
  Text,
  ScrollView,
  Alert,
  TouchableOpacity,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { useNavigation } from "@react-navigation/native"; // For navigation to PDF viewer
import { RootStackScreenProps } from "../Navigations/RootNavigator";
import { FontAwesome6 } from "@expo/vector-icons";
import { Theme } from "../Contexts";
import { colors } from "../Config/Theme";

export const DocumentUpload = () => {
  const { theme } = useContext(Theme);
  let activeColors = colors[theme.mode];

  const [documents, setDocuments] = useState<
    DocumentPicker.DocumentPickerAsset[]
  >([]);
  const navigation =
    useNavigation<
      RootStackScreenProps<"DocumentDetailsScreen">["navigation"]
    >(); // Ensure proper typing

  const handleDocumentPick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        multiple: true,
        type: "application/pdf", // Allow only PDFs
      });

      if (result.canceled) {
        Alert.alert("Document selection cancelled.");
        return;
      }

      const pickedDocuments = result.assets;
      if (pickedDocuments && pickedDocuments.length > 0) {
        setDocuments((prevDocs) => [...prevDocs, ...pickedDocuments]);
      }
    } catch (error) {
      console.error("Error picking documents:", error);
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      Alert.alert("Error picking documents:", errorMessage);
    }
  };

  const handleOpenDocument = (document: DocumentPicker.DocumentPickerAsset) => {
    console.log(document.uri);
    navigation.navigate("DocumentDetailsScreen", { documentUri: document.uri });
  };

  const handleUpload = async () => {
    Alert.alert("Upload", "Implement your upload logic here.");
  };

  return (
    <View style={{ padding: 20 }}>
      <Button title="Pick Documents" onPress={handleDocumentPick} />

      <ScrollView style={{ marginVertical: 20 }}>
        <View style={{ flexDirection: "column" }}>
          {documents.map((document, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleOpenDocument(document)} // Open document on click
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              {/* PDF Icon */}
              <FontAwesome6
                name={"file-pdf"}
                size={40}
                color={activeColors.secondary}
              />
              {/* Document Name */}
              <Text>{document.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <Button title="Upload Documents" onPress={handleUpload} />
    </View>
  );
};
