import {
  StyleSheet,
  Text,
  View,
  Pressable,
  StatusBar,
  Platform,
  Dimensions,
  SafeAreaView,
  Modal,
  ActivityIndicator,
  FlatList,
  ImageBackground,
  Image,
} from "react-native";
import React, { useContext, useEffect, useRef, useState } from "react";
import { colors } from "../Config/Theme";
import { TabsStackScreenProps } from "../Navigations/TabNavigator";
import { Theme } from "../Contexts/ThemeContext";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import { Header } from "../Components/Header";
import { Auth } from "../Contexts/AuthContext";
import { SearchBar } from "../Components/SearchBar";
import { AntDesign } from "@expo/vector-icons";
import { StoresByStatusResponse } from "../Types/ResponseTypes/StoreResponse";
import { apiCallHandler } from "../Middlewares/util";
import {
  getStoreById,
  getStoresByStatus,
} from "../Middlewares/StoreMiddleware/StoreMiddleware";
import { GetRatingSummaryByStoreIdResponse } from "../Types/ResponseTypes/RatingResponse";
import { getRatingSummaryByStoreId } from "../Middlewares/RatingMiddleware";
import { set } from "mongoose";
import { CheckBox } from "../Components/CheckBox";
import { Store } from "../Contexts/StoreContext";

const screenWidth = Dimensions.get("screen").width;
const PAGE_LIMIT = 5;

export const HomeScreen = ({
  navigation,
  route,
}: TabsStackScreenProps<"Home">) => {
  const { theme } = useContext(Theme);
  let activeColors = colors[theme.mode];

  // const [loading, setLoading] = useState(false);

  const { auth, setAuth, updateAccessToken } = useContext(Auth);

  const { refetchStoreById } = useContext(Store);

  const handleGoBack = () => {
    navigation.goBack();
  };

  const [search, setSearch] = useState("");
  const [finalSearch, setFinalSearch] = useState("");
  // console.log("search:", search);

  const [data, setData] = useState<StoresByStatusResponse>();
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const [isFilterModalShown, setIsFilterModalShown] = useState(false);
  const [filterSalon, setFilterSalon] = useState(false);
  const [filterBarber, setFilterBarber] = useState(false);

  const handleFetchStores = async () => {
    if (loading || !hasMore) {
      // console.log("loading", loading);
      // console.log("has more", hasMore);
      console.log("loading or no more data");
      return;
    }

    setLoading(true);

    const response = await apiCallHandler({
      apiCall: () =>
        getStoresByStatus({
          auth,
          updateAccessToken,
          params: {
            limit: PAGE_LIMIT,
            offset: offset,
            status: "Active",
            search,
            type:
              (!filterSalon && !filterBarber) || (filterSalon && filterBarber)
                ? undefined
                : filterSalon
                ? "salon"
                : "barbershop",
          },
        }),
      auth,
      setAuth,
      navigation,
    });

    if (response.status >= 200 && response.status < 400 && response.data) {
      const currentTotal = data?.stores.length ?? 0 + PAGE_LIMIT;
      console.log("current total", currentTotal);
      console.log("ada", JSON.stringify(response.data, null, 2));
      setData((prevData) => ({
        stores: [...(prevData?.stores || []), ...(response.data?.stores || [])],
        total: response.data?.total || prevData?.total || 0,
      }));

      setHasMore(response.data.total > currentTotal);
      setOffset((prevOffset) => prevOffset + PAGE_LIMIT);
    } else if (response) {
      console.log(response.status, response.message);
      setHasMore(false); // Stop fetching on error
    }

    setLoading(false);
  };

  const renderFooter = () => {
    if (!loading) return null;
    return <ActivityIndicator style={{ margin: 10 }} />;
  };

  const [storeRatingRecord, setStoreRatingRecord] = useState<
    Record<string, GetRatingSummaryByStoreIdResponse>
  >({});

  const fetchStoreRatingInfoById = async (storeId: string) => {
    const response = await apiCallHandler({
      apiCall: () =>
        getRatingSummaryByStoreId({
          auth,
          updateAccessToken,
          params: {
            storeId,
          },
        }),
      auth,
      setAuth,
      navigation,
    });

    if (
      response &&
      response.status >= 200 &&
      response.status < 400 &&
      response.data
    ) {
      return response.data;
    } else if (response) {
      console.log(response.status, response.message);
    }
  };

  const getStoreRatingInfo = async () => {
    const storeRatingInfoTemp: Record<
      string,
      GetRatingSummaryByStoreIdResponse
    > = {};

    const promises = data?.stores.map(async (store) => {
      const storeRatingInfo = await fetchStoreRatingInfoById(store._id ?? "");
      storeRatingInfoTemp[store._id ?? ""] = storeRatingInfo;
    });

    await Promise.all(promises ?? []);
    setStoreRatingRecord(storeRatingInfoTemp);
  };

  useEffect(() => {
    if (offset === 0) {
      console.log("NEW FETCH");
      handleFetchStores();
    }
    // console.log("offset", offset);
  }, [offset]);

  const isFirstRender = useRef(true);
  // set withfilter or not
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    setData(undefined);
    setHasMore(true);
    setOffset(0);
  }, [finalSearch, filterSalon, filterBarber]);

  useEffect(() => {
    getStoreRatingInfo();
  }, [data]);

  const handleNavigateToStoreDetail = async (storeId: string) => {
    refetchStoreById(storeId);

    setTimeout(() => {
      navigation.navigate("DetailStore");
    }, 200);
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { width: screenWidth, backgroundColor: activeColors.primary },
      ]}
    >
      <ExpoStatusBar
        hidden={false}
        style={theme.mode === "dark" ? "light" : "dark"}
        backgroundColor={activeColors.primary}
      />

      {/* Loading Modal */}
      {/* <Modal transparent={true} animationType="fade" visible={loading}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={activeColors.accent} />
        </View>
      </Modal> */}

      {auth._id === "" && <Header goBack={handleGoBack} />}

      {/* Search Bar and filter */}
      <View style={styles.searchBarNFilterContainer}>
        <View style={styles.searchBarContainer}>
          <SearchBar
            placeHolder="Search Store..."
            input={search}
            onSearch={setSearch}
            onPress={() => setFinalSearch(search)}
          />
        </View>

        <Pressable
          style={[
            styles.filterContainer,
            {
              borderColor: activeColors.tertiary,
              backgroundColor: activeColors.secondary,
            },
          ]}
          onPress={() => setIsFilterModalShown(true)}
        >
          <AntDesign name="filter" size={24} color={activeColors.accent} />
        </Pressable>
      </View>

      {/* Active Filter */}
      {(filterBarber || filterSalon) && (
        <View style={styles.filterActiveContainer}>
          {filterBarber && (
            <ActiveFilterComponent
              label="Barbershop"
              onPress={setFilterBarber}
            />
          )}

          {filterSalon && (
            <ActiveFilterComponent label="Salon" onPress={setFilterSalon} />
          )}
        </View>
      )}

      {/* Stores */}
      {data?.total !== 0 && (
        <View style={[styles.itemContainer]}>
          <FlatList
            data={data?.stores || null}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => handleNavigateToStoreDetail(item._id ?? "")}
              >
                <ImageBackground
                  source={{ uri: item.images[0].file }} // Replace with your image URL
                  style={[
                    styles.card,
                    {
                      borderColor: activeColors.tertiary,
                    },
                  ]}
                  imageStyle={styles.image} // Optional for customizing the image
                >
                  <View
                    style={[
                      styles.item,
                      {
                        borderColor: activeColors.tertiary,
                        backgroundColor:
                          theme.mode === "dark"
                            ? "rgba(0,0,0,0.6)"
                            : "rgba(255,255,255,0.6)",
                      },
                    ]}
                  >
                    {/* image */}
                    <View
                      style={[
                        styles.itemImageContainer,
                        { backgroundColor: activeColors.secondary },
                      ]}
                    >
                      <Image
                        source={{ uri: item.images[0].file }}
                        style={styles.itemImage}
                      />
                    </View>

                    <View style={styles.itemContentContainer}>
                      {/* title */}
                      <View>
                        <Text
                          style={[
                            styles.itemTitle,
                            { color: activeColors.accent },
                          ]}
                        >
                          {item.name}
                        </Text>
                      </View>

                      {/* rating */}
                      <View style={styles.itemRatingContainer}>
                        <AntDesign name="star" size={30} color="yellow" />
                        <Text
                          style={[
                            styles.itemRatingText,
                            {
                              color: activeColors.accent,
                            },
                          ]}
                        >
                          {storeRatingRecord[
                            item._id ?? ""
                          ]?.averageRating.toFixed(2)}{" "}
                          / 5
                        </Text>
                      </View>

                      {/* District And Sub District */}
                      <View>
                        <Text
                          style={[
                            styles.itemDistrictNSubDistrict,
                            { color: activeColors.accent },
                          ]}
                        >
                          {item.district}, {item.subDistrict}
                        </Text>
                      </View>
                      <View>
                        <Text
                          style={[
                            styles.itemDistrictNSubDistrict,
                            { color: activeColors.accent },
                          ]}
                        >
                          {item.location.address}
                        </Text>
                        <Text
                          style={[
                            styles.itemDistrictNSubDistrict,
                            { color: activeColors.accent },
                          ]}
                        >
                          {`${item.location.coordinates.coordinates}`}
                        </Text>
                      </View>
                    </View>
                  </View>
                </ImageBackground>
              </Pressable>
            )}
            onEndReached={handleFetchStores}
            onEndReachedThreshold={0.5} // Load more when the user is within 50% of the list's end
            ListFooterComponent={renderFooter}
          />
        </View>
      )}

      {/* Modal for Filter */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isFilterModalShown}
        onRequestClose={() => setIsFilterModalShown(false)}
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
              Filter
            </Text>

            {/* Content */}
            <View style={[styles.modalContent]}>
              <View style={styles.modalContentItem}>
                <CheckBox
                  label="Barbershop"
                  value={filterBarber}
                  onPress={setFilterBarber}
                />
              </View>
              <View style={styles.modalContentItem}>
                <CheckBox
                  label="Salon"
                  value={filterSalon}
                  onPress={setFilterSalon}
                />
              </View>
            </View>
            {/* Close Button */}
            <Pressable
              onPress={() => setIsFilterModalShown(false)}
              style={styles.modalCloseButton}
            >
              <AntDesign name="close" size={22} color={activeColors.accent} />
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

interface ActiveFilterProps {
  label: string;
  onPress: (value: boolean) => void;
}

const ActiveFilterComponent = ({ label, onPress }: ActiveFilterProps) => {
  const { theme } = useContext(Theme);
  let activeColors = colors[theme.mode];

  return (
    <View
      style={[
        styles.filterActiveItem,
        { backgroundColor: activeColors.secondary },
      ]}
    >
      <Text style={[styles.filterActiveText, { color: activeColors.accent }]}>
        {label}
      </Text>
      {/* Remove Button */}
      <Pressable
        onPress={() => onPress(false)}
        style={styles.removeFilterActiveButton}
      >
        <AntDesign name="close" size={17} color={activeColors.accent} />
      </Pressable>
    </View>
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
  // loaderContainer: {
  //   flex: 1,
  //   justifyContent: "center",
  //   alignItems: "center",
  //   backgroundColor: "rgba(0, 0, 0, 0.5)",
  // },

  searchBarNFilterContainer: {
    marginHorizontal: 20,
    borderRadius: 20,
    shadowOffset: { width: 0, height: 2 },
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  searchBarContainer: {
    width: "85%",
    marginRight: 5,
  },
  filterContainer: {
    width: "15%",
    borderWidth: 1,
    borderRadius: 50,
    paddingVertical: 7,
    alignItems: "center",
    justifyContent: "center",
  },

  itemContainer: {
    paddingHorizontal: 20,
  },
  card: {
    borderWidth: 2,
    borderRadius: 10,
    justifyContent: "center", // Center text
    overflow: "hidden", // Ensures border radius is applied to the background image
    marginVertical: 7,
  },
  image: {
    borderRadius: 10, // Ensure the image follows the View's border radius
    resizeMode: "cover",
  },

  item: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  itemImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 10,
    overflow: "hidden",
    marginRight: 10,
  },
  itemImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  itemContentContainer: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: "500",
    marginBottom: 5,
  },
  itemRatingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  itemRatingText: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginLeft: 5,
  },
  itemDistrictNSubDistrict: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 5,
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    width: "50%",
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,
  },
  modalTitle: {
    textAlign: "center",
    fontSize: 22,
    fontWeight: "500",
  },
  modalContent: {
    flexDirection: "column",
    marginTop: 10,
    fontSize: 17,
    fontWeight: "200",
  },
  modalContentItem: {
    marginVertical: 5,
  },
  modalCloseButton: {
    position: "absolute",
    top: 10,
    right: 10,
  },

  filterActiveContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 30,
    marginBottom: 10,
  },
  filterActiveItem: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginRight: 10,
  },
  filterActiveText: {
    fontSize: 13,
    fontWeight: "500",
    textAlign: "center",
  },
  removeFilterActiveButton: {
    position: "absolute",
    top: -5,
    right: -5,
  },
});
