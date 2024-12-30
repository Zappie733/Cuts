import { useCallback, useContext, useEffect, useState } from "react";

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
  Modal,
  ActivityIndicator,
} from "react-native";
import { RootStackScreenProps } from "../../Navigations/RootNavigator";
import { Header } from "../../Components/Header";
import { Input } from "../../Components/Input";
import { UpdateStoreGeneralInformationData } from "../../Types/StoreTypes/StoreTypes";
import { Switch } from "../../Components/Switch";
import { FontAwesome6, MaterialIcons } from "@expo/vector-icons";
import { apiCallHandler } from "../../Middlewares/util";
import {
  activeStore,
  inActiveStore,
  updateStoreGeneralInformation,
  updateStoreOpenCloseStatus,
} from "../../Middlewares/StoreMiddleware/StoreMiddleware";
import { DropdownPicker } from "../../Components/DropdownPicker";
import { SelectImages } from "../../Components/Image";
import { IImageProps } from "../../Types/ComponentTypes/ImageTypes";
import { TimePicker } from "../../Components/TimePicker";
import { useFocusEffect } from "@react-navigation/native";
import { Theme } from "../../Contexts/ThemeContext";
import { Auth } from "../../Contexts/AuthContext";

const screenWidth = Dimensions.get("screen").width;

export const StoreProfileScreen = ({
  navigation,
  route,
}: RootStackScreenProps<"StoreProfile">) => {
  const handleGoBack = () => {
    navigation.goBack();
  };

  const { theme } = useContext(Theme);
  let activeColors = colors[theme.mode];

  const [loading, setLoading] = useState(false);

  let { store, refetchData } = useContext(Store);

  const { auth, setAuth, updateAccessToken } = useContext(Auth);

  const defaultStoreFormData: UpdateStoreGeneralInformationData = {
    name: store.name,
    images: store.images,
    district: store.district,
    subDistrict: store.subDistrict,
    location: store.location,
    openHour: store.openHour,
    openMinute: store.openMinute,
    closeHour: store.closeHour,
    closeMinute: store.closeMinute,
    canChooseWorker: store.canChooseWorker,
    toleranceTime: store.toleranceTime,
  };
  // console.log(JSON.stringify(defaultStoreFormData, null, 2));
  const [storeFormData, setStoreFormData] =
    useState<UpdateStoreGeneralInformationData>(defaultStoreFormData);
  console.log(JSON.stringify(storeFormData, null, 2));
  const handleTextChange = <T extends keyof UpdateStoreGeneralInformationData>(
    text: UpdateStoreGeneralInformationData[T],
    fieldname: T
  ) => {
    console.log(text, fieldname);
    setStoreFormData({ ...storeFormData, [fieldname]: text });
  };

  const [storeNameEdit, setStoreNameEdit] = useState(false);
  const [storeDistrictEdit, setStoreDistrictEdit] = useState(false);
  const [storeSubDistrictEdit, setStoreSubDistrictEdit] = useState(false);
  const [storeLocationEdit, setStoreLocationEdit] = useState(false);
  const storeCanChooseWorkerOptions = [
    { label: "Yes", value: "true" },
    { label: "No", value: "false" },
  ];
  const [storeCanChooseWorkerEdit, setStoreCanChooseWorkerEdit] =
    useState(false);
  const [storeToleranceTimeEdit, setStoreToleranceTimeEdit] = useState(false);
  const handleChangeImages = (images: IImageProps[]) => {
    setStoreFormData({
      ...storeFormData,
      images,
    });
  };
  const [selectedOpenTime, setSelectedOpenTime] = useState<Date>();
  const [selectedCloseTime, setSelectedCloseTime] = useState<Date>();

  const handleupdateStoreOpenCloseStatus = async () => {
    setLoading(true);

    const response = await apiCallHandler({
      apiCall: () =>
        updateStoreOpenCloseStatus({
          auth,
          updateAccessToken,
        }),
      auth,
      setAuth,
      navigation,
    });

    if (response.status >= 200 && response.status < 400) {
      Alert.alert("Success", response.message);
      await refetchData();
    } else if (response) {
      console.log(response.status, response.message);
    }

    setLoading(false);
  };

  const handleActiveStore = async () => {
    setLoading(true);

    const response = await apiCallHandler({
      apiCall: () =>
        activeStore({
          auth,
          updateAccessToken,
        }),
      auth,
      setAuth,
      navigation,
    });

    if (response.status >= 200 && response.status < 400) {
      Alert.alert("Success", response.message);
      await refetchData();
    } else if (response) {
      console.log(response.status, response.message);
    }

    setLoading(false);
  };

  const handleInActiveStore = async () => {
    setLoading(true);

    const response = await apiCallHandler({
      apiCall: () =>
        inActiveStore({
          auth,
          updateAccessToken,
        }),
      auth,
      setAuth,
      navigation,
    });

    if (response.status >= 200 && response.status < 400) {
      Alert.alert("Success", response.message);
      await refetchData();
    } else if (response) {
      console.log(response.status, response.message);
    }

    setLoading(false);
  };

  const operationalHourModification = (value: number) => {
    if (value === 0) {
      return "00";
    }

    if (value < 10) {
      return `0${value}`;
    }

    return value;
  };

  const [isChanges, setIsChanges] = useState(false);

  const handleUpdateStoreGeneralInformation = async () => {
    setLoading(true);

    const response = await apiCallHandler({
      apiCall: () =>
        updateStoreGeneralInformation({
          auth,
          updateAccessToken,
          data: storeFormData,
        }),
      auth,
      setAuth,
      navigation,
    });

    if (response.status >= 200 && response.status < 400) {
      Alert.alert("Success", response.message);
      await refetchData();
      setTimeout(() => {
        handleGoBack();
      }, 1000);
    } else if (response) {
      console.log(response.status, response.message);
    }

    setLoading(false);
  };

  useEffect(() => {
    setStoreFormData(defaultStoreFormData);
  }, []);

  useEffect(() => {
    if (
      JSON.stringify(defaultStoreFormData) !== JSON.stringify(storeFormData)
    ) {
      setIsChanges(true);
    } else {
      setIsChanges(false);
    }
  }, [storeFormData]);

  useEffect(() => {
    if (selectedOpenTime || selectedCloseTime) {
      if (selectedOpenTime) {
        setStoreFormData((prevData) => ({
          ...prevData,
          ...(selectedOpenTime && {
            openHour: selectedOpenTime.getHours(),
            openMinute: selectedOpenTime.getMinutes(),
          }),
        }));
      }

      if (selectedCloseTime) {
        setStoreFormData((prevData) => ({
          ...prevData,
          ...(selectedCloseTime && {
            closeHour: selectedCloseTime.getHours(),
            closeMinute: selectedCloseTime.getMinutes(),
          }),
        }));
      }
    }
  }, [selectedOpenTime, selectedCloseTime]);

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
        style={{ width: screenWidth }}
      >
        <View style={styles.updateScrollContainer}>
          {/* Title */}
          <Text
            style={{
              color: activeColors.accent,
              fontSize: 30,
              textAlign: "center",
              marginBottom: 20,
            }}
          >
            Store Information
          </Text>

          {/* Inputs */}
          <View style={{ marginTop: 20 }}>
            {/* storeName Input */}
            <Input
              key="storeName"
              context="Name"
              placeholder="Enter Your Store Name"
              value={storeFormData.name}
              updateValue={(text: string) => handleTextChange(text, "name")}
              isEditable={storeNameEdit}
              setEditable={setStoreNameEdit}
            />
            {/* district Input */}
            <Input
              key="storeDistrict"
              context="District"
              placeholder="Enter Your Store District"
              value={storeFormData.district}
              updateValue={(text: string) => handleTextChange(text, "district")}
              isEditable={storeDistrictEdit}
              setEditable={setStoreDistrictEdit}
            />
            {/* subDistict Input */}
            <Input
              key="storeSubDistrict"
              context="Sub-District"
              placeholder="Enter Your Store Sub-District"
              value={storeFormData.subDistrict}
              updateValue={(text: string) =>
                handleTextChange(text, "subDistrict")
              }
              isEditable={storeSubDistrictEdit}
              setEditable={setStoreSubDistrictEdit}
            />
            {/* location Input */}
            <Input
              key="storeLocation"
              context="Location"
              placeholder="Enter Your Store Location"
              value={storeFormData.location}
              updateValue={(text: string) => handleTextChange(text, "location")}
              isEditable={storeLocationEdit}
              setEditable={setStoreLocationEdit}
            />
            <View style={styles.typeInputContainer}>
              <DropdownPicker
                key={"storeCanChooseWorker"}
                options={storeCanChooseWorkerOptions}
                selectedValue={storeFormData.canChooseWorker.toString()}
                onValueChange={(text: string) =>
                  handleTextChange(
                    text === "true" ? true : false,
                    "canChooseWorker"
                  )
                }
                placeHolder="Can Customer Pick a Worker"
                isInput={true}
                context="Pick a worker"
                isEditable={storeCanChooseWorkerEdit}
                setEditable={setStoreCanChooseWorkerEdit}
              />
            </View>
            {/* tolerance Input */}
            <Input
              key="storeToleranceTime"
              context="Tolerance"
              placeholder="Enter Your Store Tolerance Time"
              value={storeFormData.toleranceTime.toString()}
              updateValue={(text: string) =>
                handleTextChange(Number.parseInt(text), "toleranceTime")
              }
              isEditable={storeToleranceTimeEdit}
              setEditable={setStoreToleranceTimeEdit}
            />
          </View>

          {/* Break Line */}
          <View
            style={{
              marginVertical: 10,
              borderWidth: 1,
              backgroundColor: activeColors.secondary,
              borderColor: activeColors.secondary,
              width: "100%",
            }}
          ></View>

          <SelectImages
            imagesData={storeFormData.images}
            handleSetImages={handleChangeImages}
          />

          {/* Break Line */}
          <View
            style={{
              marginVertical: 10,
              borderWidth: 1,
              backgroundColor: activeColors.secondary,
              borderColor: activeColors.secondary,
              width: "100%",
            }}
          ></View>
          {/* Open Time */}
          <View style={styles.timePickerContainer}>
            <View>
              <Text style={[styles.time, { color: activeColors.accent }]}>
                Open Time: {operationalHourModification(storeFormData.openHour)}
                :{operationalHourModification(storeFormData.openMinute)}
              </Text>
            </View>
            <View>
              <TimePicker
                isForUpdate
                onPress={(value: Date) => setSelectedOpenTime(value)}
              />
            </View>
          </View>
          {/* Close Time */}
          <View style={styles.timePickerContainer}>
            <View>
              <Text style={[styles.time, { color: activeColors.accent }]}>
                Close Time:{" "}
                {operationalHourModification(storeFormData.closeHour)}:
                {operationalHourModification(storeFormData.closeMinute)}
              </Text>
            </View>
            <View>
              <TimePicker
                isForUpdate
                onPress={(value: Date) => setSelectedCloseTime(value)}
              />
            </View>
          </View>

          {/* Save Button */}
          <Pressable onPress={() => handleUpdateStoreGeneralInformation()}>
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

        {/* Line */}
        <View
          style={[
            styles.line,
            {
              borderColor: activeColors.secondary,
              backgroundColor: activeColors.secondary,
            },
          ]}
        />
        {/* Store Status */}
        <View
          style={[
            styles.switchContainer,
            {
              backgroundColor: activeColors.secondary,
              borderColor: activeColors.tertiary,
            },
          ]}
        >
          <View style={styles.switchTextContainer}>
            <MaterialIcons
              name={store.status === "Active" ? "public" : "public-off"}
              size={24}
              color={activeColors.accent}
            />

            <Text style={[styles.switchText, { color: activeColors.accent }]}>
              Store status ({store.status})
            </Text>
          </View>

          <Switch
            onPress={
              store.status === "Active"
                ? handleInActiveStore
                : handleActiveStore
            }
          />
        </View>

        {/* Operational Status */}
        <View
          style={[
            styles.switchContainer,
            {
              backgroundColor: activeColors.secondary,
              borderColor: activeColors.tertiary,
            },
          ]}
        >
          <View style={styles.switchTextContainer}>
            <FontAwesome6
              name={store.isOpen ? "door-open" : "door-closed"}
              size={24}
              color={activeColors.accent}
            />

            <Text style={[styles.switchText, { color: activeColors.accent }]}>
              Operational status ({store.isOpen ? "Open" : "Closed"})
            </Text>
          </View>

          <Switch onPress={handleupdateStoreOpenCloseStatus} />
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
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  updateScrollContainer: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
  typeInputContainer: {
    width: (screenWidth * 2) / 3 + 50,
    zIndex: 99,
    marginVertical: 10,
  },
  line: {
    borderWidth: 1,
    marginVertical: 20,
    padding: 2,
    marginHorizontal: 10,
    borderRadius: 20,
  },
  timePickerContainer: {
    width: (screenWidth * 2) / 3 + 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  time: {
    fontSize: 20,
  },

  submitButton: {
    paddingVertical: 12,
    borderRadius: 50,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "500",
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 30,
    borderWidth: 2,
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
  },
  switchTextContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  switchText: {
    fontSize: 18,
    fontWeight: "400",
    marginRight: 15,
    marginLeft: 5,
  },
});
