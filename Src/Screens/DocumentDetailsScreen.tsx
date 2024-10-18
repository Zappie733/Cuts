import React, { useContext } from "react";
import {
  View,
  Dimensions,
  Text,
  Alert,
  Platform,
  StatusBar,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import Pdf from "react-native-pdf";
import { RootStackScreenProps } from "../Navigations/RootNavigator";
import { Header } from "../Components/Header";
import { Theme } from "../Contexts";
import { colors } from "../Config/Theme";

export const DocumentDetailsScreen = ({
  navigation,
  route,
}: RootStackScreenProps<"DocumentDetailsScreen">) => {
  const handleGoBack = () => {
    navigation.goBack();
  };

  const { theme } = useContext(Theme);
  let activeColors = colors[theme.mode];

  const { documentUri, fileName } = route.params || {
    documentUri: "",
    fileName: "",
  };

  console.log(documentUri);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: activeColors.primary }]}
    >
      <Header goBack={handleGoBack} />
      <Text
        style={[styles.title, { color: activeColors.tertiary }]}
        numberOfLines={2}
      >
        {fileName}
      </Text>
      {documentUri ? (
        <View style={styles.contentContainer}>
          <Pdf
            trustAllCerts={false}
            source={{
              uri: documentUri,
              cache: true,
            }}
            onLoadComplete={(numberOfPages, filePath) => {
              console.log(`number of pages: ${numberOfPages}`);
            }}
            onPageChanged={(page, numberOfPages) => {
              console.log(`Current page: ${page}`);
            }}
            onError={(error) => {
              console.log(error);
            }}
            onPressLink={(uri) => {
              console.log(`Link Pressed: ${uri}`);
            }}
            style={styles.pdf}
          />
        </View>
      ) : (
        <View style={styles.contentContainer}>
          <Text style={{ color: "red" }}>No document to display.</Text>
        </View>
      )}
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
  contentContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 30,
    marginVertical: 15,
  },
  pdf: {
    flex: 1,
    alignSelf: "stretch",
  },
  title: {
    textAlign: "center",
    fontSize: 16,
    marginTop: 20,
  },
});
