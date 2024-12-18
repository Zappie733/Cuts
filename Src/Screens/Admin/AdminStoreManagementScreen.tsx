import {
  StyleSheet,
  Text,
  View,
  Pressable,
  StatusBar,
  Platform,
  AppState,
  Alert,
  Dimensions,
  SafeAreaView,
  ScrollView,
} from "react-native";
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { colors } from "../../Config/Theme";
import { TabsStackScreenProps } from "../../Navigations/TabNavigator";
import { Theme } from "../../Contexts/ThemeContext";
import { IResponseProps } from "../../Types/ResponseTypes";
import { CommonActions, useFocusEffect } from "@react-navigation/native";
import { getStoresByStatus } from "../../Middlewares/StoreMiddleware/StoreMiddleware";
import { removeDataFromAsyncStorage } from "../../Config/AsyncStorage";
import { IAuthObj } from "../../Types/ContextTypes/AuthContextTypes";
import { Header } from "../../Components/Header";
import { DropdownPicker } from "../../Components/DropdownPicker";
import { set } from "mongoose";
import { Store } from "../../Components/Store";
import { SearchBar } from "../../Components/SearchBar";
import { StoresByStatusResponse } from "../../Types/ResponseTypes/StoreResponse";
import { GetStoresByStatusParam } from "../../Types/StoreTypes/StoreTypes";
import { logoutUser } from "../../Middlewares/UserMiddleware";
import ExpoStatusBar from "expo-status-bar/build/ExpoStatusBar";
import { Auth } from "../../Contexts/AuthContext";

const screenWidth = Dimensions.get("screen").width;

export const AdminStoreManagementScreen = ({
  navigation,
  route,
}: TabsStackScreenProps<"AdminStoreManagement">) => {
  const { theme } = useContext(Theme);
  let activeColors = colors[theme.mode];
  const { auth, setAuth, updateAccessToken } = useContext(Auth);

  const handleGoBack = () => {
    navigation.goBack();
  };

  const [data, setData] = useState<StoresByStatusResponse>({
    stores: [],
    total: 0,
  });

  const [offset, setOffset] = useState<number>(0);
  const limit = 3;
  const [isBeingFetch, setIsBeingFetch] = useState<boolean>(false);
  const [search, setSearch] = useState("");
  // console.log(search);

  const handleFetchStores = async () => {
    const params: GetStoresByStatusParam = {
      limit,
      offset: offset,
      status: selectedStatus as
        | "Waiting for Approval"
        | "Rejected"
        | "Active"
        | "InActive"
        | "Hold",
      search,
    };
    // console.log(data);
    const response = await getStoresByStatus({
      auth,
      updateAccessToken,
      params,
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

    if (response.status >= 200 && response.status < 400 && response.data) {
      // setData(response.data);
      // setData((prevStores) => [...prevStores, ...(response.data || [])]);
      setData((prevState) => ({
        stores: [...prevState.stores, ...(response.data?.stores || [])],
        total: response.data?.total || prevState.total,
      }));

      setOffset(offset + limit);
    } else {
      console.log(response.status, response.message);
    }
  };

  const [selectedStatus, setSelectedStatus] = useState<string>("");
  // console.log(selectedStatus);
  const options = [
    { label: "All", value: "" },
    { label: "Waiting for Approval", value: "Waiting for Approval" },
    { label: "Active", value: "Active" },
    { label: "InActive", value: "InActive" },
    { label: "Hold", value: "Hold" },
    { label: "Rejected", value: "Rejected" },
  ];

  const handleScroll = ({ nativeEvent }: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
    // layoutMeasurement: Contains the dimensions (height and width) of the visible area within the ScrollView.
    // contentOffset: Tells the current scroll position within the content.
    // contentSize: Holds the total dimensions of the scrollable content (the full height and width of the entire scrollable area).
    const isNearBottom =
      layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;

    if (isNearBottom && isBeingFetch === false) {
      if (offset < data.total) {
        console.log("refecth process");
        setIsBeingFetch(true);
        handleFetchStores();
      }
    }
  };

  const handleIsFromReviewRef = () => {
    console.log("set isFromReviewRef to true");
    isFromReviewRef.current = true;
  };

  const handleChangeSearchText = (input: string) => {
    setSearch(input);
  };

  //initial fetch
  useEffect(() => {
    console.log("initial fetch data");
    handleFetchStores();
  }, []);
  //when new data fetch
  useEffect(() => {
    console.log("set isBeingFetch to false");
    setIsBeingFetch(false);
  }, [data]);

  const firstRenderSelectedStatus = useRef(true);
  // reset when status changes
  useEffect(() => {
    if (firstRenderSelectedStatus.current) {
      console.log(
        "first render selectedStatus and search so no reset data (only reset when status or search changes)"
      );
      firstRenderSelectedStatus.current = false;
      return;
    }

    // if (selectedStatus !== "") {
    console.log("reset data");
    setData({ stores: [], total: 0 });
    setOffset(0);
    // }
  }, [selectedStatus, search]);

  const firstRenderOffSet = useRef(true);
  // Fetch new data when offset 0 (after reset)
  useEffect(() => {
    if (firstRenderOffSet.current) {
      console.log(
        "first render offset so no fetch new data (only fetch for change of status)"
      );
      firstRenderOffSet.current = false;
      return;
    }
    if (offset === 0) {
      console.log(
        `fetch new data for status ${
          selectedStatus === "" ? "all" : selectedStatus
        } and name includes ${search}`
      );
      handleFetchStores();
    }
  }, [offset]);

  const firstRenderCallback = useRef(true);
  // const isFromReviewRef = useRef(isFromReview);
  const isFromReviewRef = useRef(false);
  useFocusEffect(
    useCallback(() => {
      if (firstRenderCallback.current) {
        console.log("first render callback so no reset data from callback");
        firstRenderCallback.current = false;
        return;
      }

      console.log("line 188 isFromReviewRef", isFromReviewRef);

      if (isFromReviewRef.current) {
        console.log("change isFromReviewRef to false");
        isFromReviewRef.current = false;
        console.log("Coming from review, skipping data reset.");
        return;
      }

      console.log("reset data from callback");
      setData({ stores: [], total: 0 });
      setOffset(0);
      setSearch("");
      setSelectedStatus("");
    }, [])
  );

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

      <Header goBack={handleGoBack} />

      {/* Dropdown Status */}
      <View
        style={[
          styles.dropDownContainer,
          {
            backgroundColor: activeColors.secondary,
            shadowColor: activeColors.tertiary,
          },
        ]}
      >
        <DropdownPicker
          options={options}
          selectedValue={selectedStatus}
          onValueChange={setSelectedStatus}
          placeHolder="Select Store Status..."
          isInput={false}
        />
      </View>

      {/* Store Title */}
      <View style={styles.titleContainer}>
        <Text style={[styles.titleText, { color: activeColors.tertiary }]}>
          {selectedStatus} {selectedStatus === "" ? "All" : ""} Stores
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBarContainer}>
        <SearchBar
          placeHolder="Search Store..."
          input={search}
          onSearch={handleChangeSearchText}
        />
      </View>

      {/* Line */}
      <View
        style={[
          styles.line,
          {
            borderColor: activeColors.secondary,
            backgroundColor: activeColors.tertiary,
          },
        ]}
      ></View>

      {/* Store List */}
      <ScrollView showsVerticalScrollIndicator={false} onScroll={handleScroll}>
        <View style={styles.storeList}>
          {data.stores.map((item, index) => (
            <Store
              key={index}
              data={item}
              changeIsFromReviewRef={handleIsFromReviewRef}
            />
          ))}
        </View>
      </ScrollView>
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
  dropDownContainer: {
    marginTop: 20,
    marginHorizontal: 20,
    borderRadius: 20,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 5,
    zIndex: 999,
  },
  titleContainer: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "center",
  },
  searchBarContainer: {
    marginVertical: 10,
    marginHorizontal: 50,
    borderRadius: 20,
    shadowOffset: { width: 0, height: 2 },
  },
  titleText: {
    fontSize: 24,
  },
  line: {
    borderWidth: 1,
    marginBottom: 10,
    padding: 1,
    marginHorizontal: 20,
    borderRadius: 20,
  },
  storeList: {
    flexDirection: "column",
    alignItems: "center",
    paddingBottom: 100,
  },
});
