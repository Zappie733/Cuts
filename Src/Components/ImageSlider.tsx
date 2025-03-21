import React, { useContext } from "react";
import { View, Image, StyleSheet, Text } from "react-native";
import Swiper from "react-native-swiper";
import { colors } from "../Config/Theme";
import { IImageSliderProps } from "../Types/ComponentTypes/ImageSliderTypes";
import { Theme } from "../Contexts/ThemeContext";

export const ImageSlider = ({ images }: IImageSliderProps) => {
  const { theme } = useContext(Theme);
  let activeColors = colors[theme.mode];

  const imagesDefault = [
    "https://via.placeholder.com/600/92c952",
    "https://via.placeholder.com/600/771796",
    "https://via.placeholder.com/600/24f355",
  ];

  const isBase64 = (str: string) => {
    return (
      /^data:image\/[a-z]+;base64,/.test(str) || /^[A-Za-z0-9+/=]+$/.test(str)
    );
  };

  const prepareUri = (uri: string) => {
    if (isBase64(uri) && !uri.startsWith("data:image")) {
      return `data:image/png;base64,${uri}`; // Add prefix if missing
    }
    return uri;
  };

  return (
    <View style={styles.container}>
      <Swiper
        showsButtons
        autoplay
        autoplayTimeout={3}
        dotColor={activeColors.secondary} // Set inactive dot color
        activeDotColor={activeColors.accent} // Set active dot color
        nextButton={
          <Text style={[styles.button, { color: activeColors.accent }]}>›</Text>
        } // Custom right button
        prevButton={
          <Text style={[styles.button, { color: activeColors.accent }]}>‹</Text>
        } // Custom left button
      >
        {images && images.length > 0 ? (
          images.map((uri, index) => (
            <Image
              key={index}
              source={{ uri: prepareUri(uri) }}
              style={[styles.image, { backgroundColor: "black" }]}
            />
          ))
        ) : (
          <></>
        )}
      </Swiper>
    </View>
  );
};
{
  /* imagesDefault.map((uri, index) => (
              <Image
                key={index}
                source={{ uri: prepareUri(uri) }}
                style={styles.image}
              />
            ))} */
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    resizeMode: "cover",
    width: "auto",
    height: "100%",
    borderRadius: 10,
  },
  button: {
    fontSize: 40,
    paddingHorizontal: 10,
    backgroundColor: "transparent",
  },
});
