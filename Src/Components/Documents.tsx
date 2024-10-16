import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Button,
  Text,
  ScrollView,
  Alert,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  Dimensions,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { useNavigation } from "@react-navigation/native"; // For navigation to PDF viewer
import { RootStackScreenProps } from "../Navigations/RootNavigator";
import { FontAwesome6 } from "@expo/vector-icons";
import { Theme } from "../Contexts";
import { colors } from "../Config/Theme";
import { IDocumentProps, ISelectDocumentProps } from "../Types/DocumentTypes";
import * as FileSystem from "expo-file-system";

const width = (Dimensions.get("screen").width * 2) / 3 + 50;

export const SelectDocuments = ({
  handleSetDocument,
}: ISelectDocumentProps) => {
  const { theme } = useContext(Theme);
  let activeColors = colors[theme.mode];

  const [documents, setDocuments] = useState<
    DocumentPicker.DocumentPickerAsset[]
  >([]);

  const [documentOptionForUpload, setDocumentOptionForUpload] = useState<
    IDocumentProps[]
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
        return;
      }

      const pickedDocuments = result.assets;
      if (pickedDocuments && pickedDocuments.length > 0) {
        setDocuments((prevDocs) => [...prevDocs, ...pickedDocuments]);
      }

      const base64Documents: IDocumentProps[] = await Promise.all(
        pickedDocuments.map(async (doc) => {
          const base64Document = await FileSystem.readAsStringAsync(doc.uri, {
            encoding: FileSystem.EncodingType.Base64,
          });

          return {
            name: doc.name,
            file: base64Document,
            path: "StoreDocuments",
          };
        })
      );

      setDocumentOptionForUpload([
        ...documentOptionForUpload,
        ...base64Documents,
      ]);
    } catch (error) {
      console.error("Error picking documents:", error);
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      Alert.alert("Error picking documents:", errorMessage);
    }
  };

  const handleOpenDocument = (document: DocumentPicker.DocumentPickerAsset) => {
    // console.log(document.uri);
    navigation.navigate("DocumentDetailsScreen", {
      documentUri: document.uri,
      fileName: document.name,
    });
  };

  useEffect(() => {
    handleSetDocument(documentOptionForUpload);
  }, [documentOptionForUpload]);
  return (
    <View style={styles.container}>
      <View style={styles.documentContainer}>
        {documents.length > 0 && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.documentList}
          >
            {documents.map((document, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleOpenDocument(document)} // Open document on click
                style={[
                  styles.documentItemContainer,
                  { borderColor: activeColors.secondary },
                ]}
              >
                {/* PDF Icon */}
                <FontAwesome6
                  name={"file-pdf"}
                  size={30}
                  color={activeColors.tertiary}
                />
                {/* Document Name */}
                <Text
                  style={{
                    color: activeColors.accent,
                    fontSize: 12,
                    paddingLeft: 10,
                  }}
                >
                  {document.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Select Documents */}
      <Pressable
        onPress={handleDocumentPick}
        style={[
          styles.selectDocumentButton,
          {
            backgroundColor: activeColors.accent,
          },
        ]}
      >
        <Text
          style={[styles.selectDocumentText, { color: activeColors.secondary }]}
        >
          Select Documents
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
  documentContainer: {
    marginBottom: 10,
    width: width,
  },
  documentList: {
    flexDirection: "column",
    justifyContent: "center",
  },
  deleteButton: {
    position: "absolute",
    right: 3,
    top: 3,
    padding: 3,
    borderRadius: 20,
  },
  selectDocumentButton: {
    paddingHorizontal: 20,
    paddingVertical: 7,
    borderRadius: 10,
  },
  selectDocumentText: {
    fontSize: 15,
  },
  documentItemContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 1,
    padding: 5,
    borderRadius: 10,
  },
});
