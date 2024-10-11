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

  const { documentUri } = route.params || { documentUri: "" };

  console.log(documentUri);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: activeColors.primary }]}
    >
      <Header />

      {documentUri ? (
        <View style={styles.contentContainer}>
          <Pdf
            trustAllCerts={false}
            source={{
              uri: "https://www.learningcontainer.com/wp-content/uploads/2019/09/sample-pdf-file.pdf",
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
    margin: 32,
  },
  pdf: {
    flex: 1,
    alignSelf: "stretch",
  },
});
