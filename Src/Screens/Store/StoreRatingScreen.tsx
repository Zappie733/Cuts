import { useContext, useEffect, useRef, useState } from "react";
import { Auth, Theme } from "../../Contexts";
import { colors } from "../../Config/Theme";
import { Store } from "../../Contexts/StoreContext";
import {
  SafeAreaView,
  StyleSheet,
  Dimensions,
  Platform,
  StatusBar,
  Text,
  ScrollView,
  View,
  Alert,
  Pressable,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { RootStackScreenProps } from "../../Navigations/RootNavigator";
import { Header } from "../../Components/Header";
import { DropdownPicker } from "../../Components/DropdownPicker";
import {
  getAllRatingByStoreId,
  getAllRatingByStoreIdAndServiceId,
} from "../../Middlewares/RatingMiddleware";
import {
  GetAllRatingByStoreIdAndServiceIdResponse,
  GetAllRatingByStoreIdResponse,
} from "../../Types/ResponseTypes/RatingResponse";
import { set } from "mongoose";
import { GetUserInfoForOrderByIdResponse } from "../../Types/ResponseTypes";
import { apiCallHandler } from "../../Middlewares/util";
import { getUserInfoForOrderById } from "../../Middlewares/UserMiddleware";
import { ServiceObj } from "../../Types/StoreTypes/ServiceTypes";
import { AntDesign } from "@expo/vector-icons";

const screenWidth = Dimensions.get("screen").width;
const PAGE_LIMIT = 2;

export const StoreRatingScreen = ({
  navigation,
  route,
}: RootStackScreenProps<"StoreRatings">) => {
  const handleGoBack = () => {
    navigation.goBack();
  };

  const { theme } = useContext(Theme);
  let activeColors = colors[theme.mode];

  const { store, refetchData } = useContext(Store);
  const { auth, setAuth, updateAccessToken } = useContext(Auth);

  const ratingOptions = [
    { label: "1★", value: "1" },
    { label: "2★", value: "2" },
    { label: "3★", value: "3" },
    { label: "4★", value: "4" },
    { label: "5★", value: "5" },
  ];

  const [rating, setRating] = useState("");

  const servicesOptions = store.services.map((service) => {
    return { label: service.name, value: service._id ?? "" };
  });
  const [service, setService] = useState("");

  const [withFilter, setWithFilter] = useState(false);

  const [data, setData] = useState<
    GetAllRatingByStoreIdResponse | GetAllRatingByStoreIdAndServiceIdResponse
  >();
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const handleFetchRatings = async () => {
    if (loading || !hasMore) {
      // console.log("loading", loading);
      // console.log("has more", hasMore);
      console.log("loading or no more data");
      return;
    }

    setLoading(true);

    let response;

    if (!withFilter) {
      console.log("without filter");
      response = await apiCallHandler({
        apiCall: () =>
          getAllRatingByStoreId({
            auth,
            updateAccessToken,
            params: {
              storeId: store._id,
              limit: PAGE_LIMIT,
              offset: offset,
              rating: rating,
            },
          }),
        auth,
        setAuth,
        navigation,
      });
    } else {
      console.log("with filter");
      response = await apiCallHandler({
        apiCall: () =>
          getAllRatingByStoreIdAndServiceId({
            auth,
            updateAccessToken,
            params: {
              storeId: store._id,
              serviceId: service,
              limit: PAGE_LIMIT,
              offset: offset,
              rating: rating,
            },
          }),
        auth,
        setAuth,
        navigation,
      });
    }

    if (response.status >= 200 && response.status < 400 && response.data) {
      const currentTotal = data?.ratings.length ?? 0 + PAGE_LIMIT;
      console.log("current total", currentTotal);
      console.log("ada", response.data);
      setData((prevData) => ({
        ratings: [
          ...(prevData?.ratings || []),
          ...(response.data?.ratings || []),
        ],
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

  const [userInfoRecord, setUserInfoRecord] = useState<
    Record<string, GetUserInfoForOrderByIdResponse>
  >({});

  const fetchUserInfoForOrderById = async (userId: string) => {
    const response = await apiCallHandler({
      apiCall: () =>
        getUserInfoForOrderById({
          auth,
          updateAccessToken,
          params: {
            userId,
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

  const getUserInfoRecord = async () => {
    const userInfoRecordTemp: Record<string, GetUserInfoForOrderByIdResponse> =
      {};

    const promises = data?.ratings.map(async (rating) => {
      const userInfo = await fetchUserInfoForOrderById(rating.userId ?? "");
      userInfoRecordTemp[rating.userId ?? ""] = userInfo;
    });

    await Promise.all(promises ?? []);
    setUserInfoRecord(userInfoRecordTemp);
  };

  const [servicesRecord, setServicesRecord] = useState<
    Record<string, ServiceObj>
  >({});

  const getStoreServices = () => {
    const servicesRecordTemp: Record<string, ServiceObj> = {};

    store.services.forEach((service) => {
      servicesRecordTemp[service._id ?? ""] = service;
    });
    setServicesRecord(servicesRecordTemp);
  };

  useEffect(() => {
    if (store._id) {
      getStoreServices();
    }
  }, [store]);

  useEffect(() => {
    if (offset === 0) {
      console.log("NEW FETCH");
      handleFetchRatings();
    }
  }, [offset]);

  const isFirstRender = useRef(true);
  // set withfilter or not
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if ((!rating && !service) || !service) {
      console.log("set withFilter to false");
      setWithFilter(false);
    } else {
      console.log("set withFilter to true");
      setWithFilter(true);
    }

    setData(undefined);
    setHasMore(true);
    setOffset(0);
    // console.log("handleFetchRatings");
    // handleFetchRatings();
  }, [rating, service]);

  useEffect(() => {
    if (data) {
      getUserInfoRecord();
    }
  }, [data]);

  return (
    <SafeAreaView
      style={[
        styles.container,
        { width: screenWidth, backgroundColor: activeColors.primary },
      ]}
    >
      <Header goBack={handleGoBack} />

      {/* title */}
      <Text style={[styles.title, { color: activeColors.accent }]}>
        Store Ratings
      </Text>

      {/* filter */}
      <View style={styles.filterContainer}>
        <View style={{ flex: 2 }}>
          <DropdownPicker
            key="service"
            options={servicesOptions}
            selectedValue={service}
            onValueChange={setService}
            placeHolder="Service..."
            isInput={false}
          />
        </View>

        <View style={{ flex: 1 }}>
          <DropdownPicker
            key="rating"
            options={ratingOptions}
            selectedValue={rating}
            onValueChange={setRating}
            placeHolder="Star..."
            isInput={false}
          />
        </View>
      </View>

      {data?.total === 0 ? (
        <Text
          style={{
            color: activeColors.accent,
            textAlign: "center",
            fontSize: 20,
            marginTop: 10,
          }}
        >
          No ratings found
        </Text>
      ) : (
        <FlatList
          data={data?.ratings || null}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <View>
                  <Text style={{ color: activeColors.accent, fontSize: 16 }}>
                    {userInfoRecord[item.userId ?? ""]?.firstName}{" "}
                    {userInfoRecord[item.userId ?? ""]?.lastName} (
                    {servicesRecord[item.serviceId ?? ""]?.name})
                  </Text>
                </View>
                <View>
                  <Text style={{ color: activeColors.accent, fontSize: 16 }}>
                    {item.date.toString().split("T")[0]}
                  </Text>
                </View>
              </View>

              <View style={{ flexDirection: "row", marginVertical: 5 }}>
                {Array.from({ length: item.rating }).map((_, index) => (
                  <AntDesign key={index} name="star" size={16} color="yellow" />
                ))}
              </View>
              <View>
                <Text style={{ color: activeColors.accent, fontSize: 15 }}>
                  {item.comment}
                </Text>
              </View>
            </View>
          )}
          onEndReached={handleFetchRatings}
          onEndReachedThreshold={0.5} // Load more when the user is within 50% of the list's end
          ListFooterComponent={renderFooter}
          style={[
            styles.ratingContainer,
            { backgroundColor: activeColors.secondary },
          ]}
        />
      )}
    </SafeAreaView>
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
  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginVertical: 10,
    textAlign: "center",
  },
  filterContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 30,
    justifyContent: "space-between",
    gap: 10,
    marginVertical: 10,
  },
  item: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    // marginVertical: 100,
  },
  ratingContainer: {
    marginTop: 10,
    marginHorizontal: 30,
    marginBottom: 30,
    borderRadius: 10,
  },
});
