import {
  Alert,
  Dimensions,
  Image,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { TabsStackScreenProps } from "../../Navigations/TabNavigator";
import { colors } from "../../Config/Theme";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import { Store } from "../../Contexts/StoreContext";
import { WorkerObj } from "../../Types/StoreTypes/WorkerTypes";
import { apiCallHandler } from "../../Middlewares/util";
import {
  absence,
  clockIn,
  clockOut,
} from "../../Middlewares/StoreMiddleware/WorkerMiddleware";
import { AntDesign } from "@expo/vector-icons";
import { set } from "mongoose";
import { DropdownPicker } from "../../Components/DropdownPicker";
import { Option } from "../../Types/ComponentTypes/DropdownPickerTypes";
import { AddOrderData } from "../../Types/OrderTypes";
import { MultiSelectDropdownPicker } from "../../Components/MultiSelectDropdownPicker";
import { Input } from "../../Components/Input";
import { addOrder } from "../../Middlewares/OrderMiddleware";
import { useFocusEffect } from "@react-navigation/native";
import { chosenServiceProductObj } from "../../Types/OrderTypes";
import { DateTimePickerComponent } from "../../Components/DateTimePicker";
import { CheckBox } from "../../Components/CheckBox";
import { Theme } from "../../Contexts/ThemeContext";
import { Auth } from "../../Contexts/AuthContext";

const screenWidth = Dimensions.get("screen").width;

export const StoreHomeScreen = ({
  navigation,
  route,
}: TabsStackScreenProps<"Home">) => {
  const { theme } = useContext(Theme);
  let activeColors = colors[theme.mode];

  const { store, refetchData } = useContext(Store);
  const { auth, setAuth, updateAccessToken } = useContext(Auth);

  // useFocusEffect(
  //   useCallback(() => {
  //     console.log("accessToken Home: ", auth.accessToken);
  //   }, [])
  // );
  const [workersRecord, setWorkersRecord] = useState<Record<string, WorkerObj>>(
    {}
  );

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [absenceWorkerId, setAbsenceWorkerId] = useState("");
  const [absenceReason, setAbsenceReason] = useState<string>("");
  // console.log("absenceWorkerId: " + absenceWorkerId);
  // console.log("absenceReason: " + absenceReason);

  const getStoreWorkers = () => {
    const workersRecordTemp: Record<string, WorkerObj> = {};
    store.workers.forEach((worker) => {
      workersRecordTemp[worker._id ?? ""] = worker;
    });

    setWorkersRecord(workersRecordTemp);
  };

  const currentTime = new Date(Date.now());
  const storeOpenHour = Number(store.openHour);
  const storeOpenMinute = Number(store.openMinute);
  const storeCloseHour = Number(store.closeHour);
  const storeCloseMinute = Number(store.closeMinute);
  // console.log(currentTime);
  // console.log(currentTime.getHours());
  // console.log(currentTime.getMinutes());
  //get hours dan minute ini entah bagaimana sudah di + 7 jadi meski current timenya gmt tapi dengan menggunakan getHours / getMinutes sudah otomatis + 7

  const isStoreOpen = () => {
    return (
      currentTime.getHours() * 60 + currentTime.getMinutes() >=
        storeOpenHour * 60 + storeOpenMinute &&
      currentTime.getHours() * 60 + currentTime.getMinutes() <=
        storeCloseHour * 60 + storeCloseMinute
    );
  };

  //7 jam sebelumnya dari hari ini
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to midnight

  //hari ini 00:00:00
  const adjustedToday = new Date(today.getTime() + 7 * 60 * 60 * 1000);

  const handleClockIn = async (workerId: string) => {
    const response = await apiCallHandler({
      apiCall: () =>
        clockIn({
          auth,
          updateAccessToken,
          params: {
            workerId,
          },
        }),
      auth,
      setAuth,
      navigation,
    });

    if (response && response.status >= 200 && response.status < 400) {
      await refetchData();
      Alert.alert("Success", response.message);
    } else if (response) {
      console.log(response.status, response.message);
    }
  };

  const handleClockOut = async (workerId: string) => {
    const response = await apiCallHandler({
      apiCall: () =>
        clockOut({
          auth,
          updateAccessToken,
          params: {
            workerId,
          },
        }),
      auth,
      setAuth,
      navigation,
    });

    if (response && response.status >= 200 && response.status < 400) {
      await refetchData();
      Alert.alert("Success", response.message);
    } else if (response) {
      console.log(response.status, response.message);
    }
  };

  const handleAbsence = async (workerId: string) => {
    const response = await apiCallHandler({
      apiCall: () =>
        absence({
          auth,
          updateAccessToken,
          data: {
            id: workerId,
            reason: absenceReason,
          },
        }),
      auth,
      setAuth,
      navigation,
    });

    if (response && response.status >= 200 && response.status < 400) {
      Alert.alert("Success", response.message);
      await refetchData();
      setIsModalVisible(false);
      setAbsenceWorkerId("");
      setAbsenceReason("");
    } else if (response) {
      console.log(response.status, response.message);
    }
  };

  const handleReasonTextChange = (text: string) => {
    // Split the text into lines and add the "- " prefix for each line
    const formattedText = text
      .split("\n") // Split the text by new line
      .map((line) => (line.startsWith("- ") ? line : `- ${line}`)) // Add the "- " prefix if not already present
      .join("\n"); // Join the lines back into a single string

    setAbsenceReason(formattedText); // Set the updated text
  };

  const services = store.services;

  const servicesOptions: Option[] = services.map((service) => ({
    label: service.name.replace(/\b\w/g, (char) => char.toUpperCase()) ?? "",
    value: service._id ?? "",
  }));

  const defaultOrderData: AddOrderData = {
    serviceIds: [],
    chosenServiceProductsIds: [],
    isManual: true,
    totalPrice: 0,
    totalDuration: 0,
    userName: "",
  };
  const [orderFormData, setOrderFormData] =
    useState<AddOrderData>(defaultOrderData);
  // console.log("orderFormData", orderFormData);
  // console.log(JSON.stringify(orderFormData, null, 2));
  const handleOrderTextChange = <T extends keyof AddOrderData>(
    value: AddOrderData[T],
    field: T
  ) => {
    if (field === "serviceIds" || field === "chosenServiceProductsIds") {
      let totalPrice = 0;
      let totalDuration = 0;
      console.log("value:", value);
      // Use updated value for recalculation
      const updatedServiceIds =
        field === "serviceIds" ? (value as string[]) : orderFormData.serviceIds;
      const updatedServiceProductsIds =
        field === "chosenServiceProductsIds"
          ? (value as chosenServiceProductObj[])
          : orderFormData.chosenServiceProductsIds;

      // Calculate totals for selected services
      const selectedServices = services.filter((service) =>
        updatedServiceIds.includes(service._id ?? "")
      );

      selectedServices.forEach((service) => {
        totalPrice += service.price || 0;
        totalDuration += service.duration || 0;
      });

      // Calculate totals for selected service products
      let selectedServiceProducts: string[] = [];

      updatedServiceProductsIds?.map((obj) => {
        selectedServiceProducts.push(...obj.serviceProductIds);
      });

      selectedServiceProducts?.forEach((productId) => {
        totalPrice +=
          store.serviceProducts.find((p) => p._id === productId)
            ?.addtionalPrice || 0;
      });

      // Update state with recalculated values`
      if (updatedServiceIds.length === 0) {
        setOrderFormData((prevData) => ({
          ...prevData,
          totalPrice,
          totalDuration,
          [field]: value,
          chosenServiceProductsIds: [],
        }));
      } else {
        setOrderFormData((prevData) => ({
          ...prevData,
          totalPrice,
          totalDuration,
          [field]: value,
        }));
      }
    } else {
      // For other fields, just update the state
      setOrderFormData((prevData) => ({
        ...prevData,
        [field]: value,
      }));
    }
  };

  const handleCreateOrder = async () => {
    const response = await apiCallHandler({
      apiCall: () =>
        addOrder({
          auth,
          updateAccessToken,
          data:
            selectedDateTime !== undefined
              ? {
                  ...orderFormData,
                  date: new Date(
                    selectedDateTime.getTime() + 7 * 60 * 60 * 1000
                  ),
                }
              : orderFormData,
        }),
      auth,
      setAuth,
      navigation,
    });

    if (response && response.status >= 200 && response.status < 400) {
      Alert.alert("Success", response.message);
      setOrderFormData(defaultOrderData);
    } else if (response) {
      Alert.alert("Validation Error", response.message);
    }
  };

  const workersOptions: Option[] = store.workers
    .filter((worker) => worker.isOnDuty && worker.role === "worker")
    .map((worker) => ({
      label: worker.firstName + " " + worker.lastName,
      value: worker._id || "",
    }));
  // console.log("workersOptions:", workersOptions);

  const [showDateTimePicker, setShowDateTimePicker] = useState(false);
  const [selectedDateTime, setSelectedDateTime] = useState<Date>();

  useEffect(() => {
    if (store._id) {
      // console.log("get workers");
      getStoreWorkers();
    }
  }, [store]);

  useFocusEffect(
    useCallback(() => {
      console.log("home jalan");
      refetchData();
    }, [auth])
  );

  useEffect(() => {
    setSelectedDateTime(undefined);
  }, [showDateTimePicker]);

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

      <Text style={[styles.title, { color: activeColors.accent }]}>
        {store.name}
      </Text>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ marginBottom: 90 }}
        nestedScrollEnabled={true}
      >
        {/* form bikin order */}
        <View
          style={[styles.formContainer, { borderColor: activeColors.tertiary }]}
        >
          <View>
            <Text style={[styles.formTitle, { color: activeColors.accent }]}>
              Order Form
            </Text>
          </View>

          <View>
            {/* username */}
            <Input
              key="userNameOrder"
              context="Customer Name"
              placeholder="Enter Customer Name"
              value={orderFormData.userName || ""}
              updateValue={(text: string) =>
                handleOrderTextChange(text, "userName")
              }
            />
            {/* services */}
            <View style={[styles.serviceInputContainer]}>
              <MultiSelectDropdownPicker
                key="serviceIdsOrder"
                options={servicesOptions}
                selectedValues={orderFormData.serviceIds}
                onValuesChange={(newValues) =>
                  handleOrderTextChange(newValues, "serviceIds")
                }
                placeHolder="Select Services..."
                isInput={true}
                context="Services"
              />
            </View>

            {/* service products */}
            {orderFormData.serviceIds.map((serviceId) => {
              const service = services.find((s) => s._id === serviceId);

              const serviceProducts = service?.serviceProduct
                ?.map((productId) => {
                  const serviceProduct = store.serviceProducts.find(
                    (sp) => sp._id === productId
                  );
                  return serviceProduct?.isAnOption ? serviceProduct : null;
                })
                .filter(Boolean); // Remove any null or undefined value

              if (serviceProducts?.length === 0) {
                return null;
              }

              if (serviceProducts) {
                const serviceProductsOptions = serviceProducts?.map(
                  (serviceProduct) => ({
                    label:
                      serviceProduct?.name.replace(/\b\w/g, (char) =>
                        char.toUpperCase()
                      ) ?? "",
                    value: serviceProduct?._id ?? "",
                  })
                );

                return (
                  <View
                    key={serviceId}
                    style={[styles.serviceProductInputContainer]}
                  >
                    <MultiSelectDropdownPicker
                      key={"serviceProductsIdsOrder" + serviceId}
                      options={serviceProductsOptions}
                      selectedValues={
                        orderFormData.chosenServiceProductsIds?.find(
                          (id) =>
                            id.serviceId.toString() === serviceId.toString()
                        )?.serviceProductIds ?? []
                      }
                      onValuesChange={(newValues) => {
                        const existingItem =
                          orderFormData.chosenServiceProductsIds?.find(
                            (id) =>
                              id.serviceId.toString() === serviceId.toString()
                          );

                        const newChosenServiceProductsIds = existingItem
                          ? // Update the existing item with new values
                            orderFormData.chosenServiceProductsIds?.map(
                              (item) =>
                                item.serviceId.toString() ===
                                serviceId.toString()
                                  ? { ...item, serviceProductIds: newValues }
                                  : item
                            )
                          : // Add a new item if no match is found
                            [
                              ...(orderFormData.chosenServiceProductsIds || []),
                              {
                                serviceId: serviceId, // Ensure serviceId is explicitly defined
                                serviceProductIds: newValues,
                              },
                            ];

                        handleOrderTextChange(
                          newChosenServiceProductsIds,
                          "chosenServiceProductsIds"
                        );
                      }}
                      placeHolder={`Select ${service?.name} products...`}
                      isInput={true}
                      context={`${service?.name.replace(/\b\w/g, (char) =>
                        char.toUpperCase()
                      )} Product`}
                    />
                  </View>
                );
              }

              return null;
            })}

            {/* worker */}
            {store.canChooseWorker && workersOptions.length > 0 && (
              <View style={styles.workerInputContainer}>
                <DropdownPicker
                  key="workerIdsOrder"
                  options={workersOptions}
                  selectedValue={orderFormData.workerId ?? ""}
                  onValueChange={(text: string) =>
                    handleOrderTextChange(text, "workerId")
                  }
                  placeHolder="Select Worker..."
                  isInput={true}
                  context="Worker"
                />
              </View>
            )}

            {/* onsite booking */}
            <View style={styles.checkBoxContainer}>
              <CheckBox
                label="Onsite Future Booking?"
                onPress={(value: boolean) => setShowDateTimePicker(value)}
              />
            </View>

            {/* date time picker */}
            {showDateTimePicker && (
              <>
                <View style={styles.dateTimePickerContainer}>
                  {selectedDateTime ? (
                    <View style={{ width: "100%" }}>
                      <Text
                        style={[
                          styles.dateTimeText,
                          { color: activeColors.accent },
                        ]}
                      >
                        Date & Time
                      </Text>
                      <Text
                        style={[
                          styles.dateTimeText,
                          { color: activeColors.accent },
                        ]}
                      >
                        {selectedDateTime.toString().split("GMT")[0]}
                      </Text>
                    </View>
                  ) : (
                    <DateTimePickerComponent
                      onPress={(value: Date) => setSelectedDateTime(value)}
                    />
                  )}
                </View>

                <Text
                  style={[styles.noteText, { color: activeColors.infoColor }]}
                >
                  IMPORTANT NOTES:{"\n"}- Date & Time only for onsite future
                  booking. {"\n"}- Customer must pay before creating the onsite
                  future booking
                </Text>
              </>
            )}

            {/* create order */}
            <Pressable
              style={[
                styles.createOrderButton,
                { backgroundColor: activeColors.accent },
              ]}
              onPress={handleCreateOrder}
            >
              <Text style={{ color: activeColors.primary }}>Create Order</Text>
            </Pressable>
          </View>
        </View>

        {/* absensi hari ini */}
        <View
          style={[
            styles.workerContainer,
            {
              borderColor: activeColors.tertiary,
            },
          ]}
        >
          <Text style={[styles.workerTitle, { color: activeColors.accent }]}>
            Worker's Attendance Today
          </Text>
          <ScrollView
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}
          >
            {Object.keys(workersRecord).map((workerId) => {
              const worker = workersRecord[workerId];
              const todayHistory = worker.history?.find((history) => {
                const historyDate = new Date(history.date); // Convert to Date object from string (i think backend always return data in string no matter what)
                return (
                  historyDate.toDateString() === adjustedToday.toDateString()
                );
              });

              return (
                <View
                  key={workerId}
                  style={[
                    styles.worker,
                    {
                      borderColor: activeColors.tertiary,
                      backgroundColor: activeColors.secondary,
                    },
                  ]}
                >
                  {/* Image */}
                  <View style={{ marginRight: 15 }}>
                    <Image
                      source={{ uri: worker.image.file }}
                      style={{ width: 50, height: 50 }}
                    />
                  </View>

                  {/* info & action container */}
                  <View style={styles.InfoActionContainer}>
                    {/* info */}
                    <View style={{ flex: 1 }}>
                      {/* name */}
                      <View>
                        <Text
                          style={[
                            styles.workerText,
                            { color: activeColors.accent },
                          ]}
                        >
                          {worker.firstName + " " + worker.lastName}
                        </Text>
                      </View>

                      <View>
                        {todayHistory && todayHistory.clockIn && (
                          <Text style={{ color: activeColors.accent }}>
                            Clock In:{" "}
                            {
                              todayHistory.clockIn
                                .toString()
                                .split(".")[0]
                                .split("T")[1]
                            }
                          </Text>
                        )}

                        {todayHistory && todayHistory.clockOut && (
                          <Text style={{ color: activeColors.accent }}>
                            Clock Out:{" "}
                            {
                              todayHistory.clockOut
                                .toString()
                                .split(".")[0]
                                .split("T")[1]
                            }
                          </Text>
                        )}

                        {todayHistory && todayHistory.isAbsence && (
                          <Text style={{ color: activeColors.accent }}>
                            {todayHistory.reason}
                          </Text>
                        )}
                      </View>
                    </View>

                    {/* Action */}
                    <View>
                      {!todayHistory ? (
                        // Case: No history
                        <View style={{ gap: 10 }}>
                          {/* Clock In */}
                          <Pressable
                            onPress={() => handleClockIn(workerId)}
                            disabled={!isStoreOpen()}
                            style={[
                              styles.workerButton,
                              {
                                backgroundColor: isStoreOpen()
                                  ? activeColors.tertiary
                                  : activeColors.disabledColor,
                              },
                            ]}
                          >
                            <Text style={{ color: activeColors.accent }}>
                              Clock In
                            </Text>
                          </Pressable>

                          {/* Absence */}
                          <Pressable
                            style={[
                              styles.workerButton,
                              { backgroundColor: activeColors.tertiary },
                            ]}
                            onPress={() => {
                              setIsModalVisible(true);
                              setAbsenceWorkerId(workerId);
                            }}
                          >
                            <Text style={{ color: activeColors.accent }}>
                              Absence
                            </Text>
                          </Pressable>
                        </View>
                      ) : todayHistory.clockIn ? (
                        // Case: User has clocked in
                        <View style={{ gap: 10 }}>
                          {/* Clock Out */}
                          <Pressable
                            onPress={() => handleClockOut(workerId)}
                            style={[
                              styles.workerButton,
                              { backgroundColor: activeColors.tertiary },
                            ]}
                          >
                            <Text style={{ color: activeColors.accent }}>
                              Clock Out
                            </Text>
                          </Pressable>

                          {/* Absence */}
                          <Pressable
                            style={[
                              styles.workerButton,
                              { backgroundColor: activeColors.tertiary },
                            ]}
                            onPress={() => {
                              setIsModalVisible(true);
                              setAbsenceWorkerId(workerId);
                            }}
                          >
                            <Text style={{ color: activeColors.accent }}>
                              Absence
                            </Text>
                          </Pressable>
                        </View>
                      ) : todayHistory.isAbsence ? (
                        // Case: User is absent
                        <Pressable
                          onPress={() => handleClockIn(workerId)}
                          disabled={!isStoreOpen()}
                          style={[
                            styles.workerButton,
                            {
                              backgroundColor: isStoreOpen()
                                ? activeColors.tertiary
                                : activeColors.disabledColor,
                            },
                          ]}
                        >
                          <Text style={{ color: activeColors.accent }}>
                            Clock In
                          </Text>
                        </Pressable>
                      ) : null}
                    </View>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </View>
      </ScrollView>

      <Modal
        animationType="fade"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => {
          setIsModalVisible(false);
        }}
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
              Absence Form
            </Text>

            {/* Text Input */}
            <TextInput
              style={[
                styles.modalTextInput,
                {
                  color: activeColors.accent,
                  borderColor: activeColors.tertiary,
                  backgroundColor: activeColors.secondary,
                },
              ]}
              placeholder="Enter reasons, make a new line for every reason."
              placeholderTextColor={activeColors.primary}
              multiline={true}
              numberOfLines={5}
              onChangeText={(text) => handleReasonTextChange(text)}
              value={absenceReason}
            />

            {/* Submit Button */}
            <Pressable
              style={[
                styles.modalSubmitButton,
                {
                  backgroundColor: activeColors.accent,
                },
              ]}
              onPress={() =>
                Alert.alert("Absence Form", "Are you ready to submit?", [
                  {
                    text: "OK",
                    onPress: () => handleAbsence(absenceWorkerId),
                  },
                  {
                    text: "Cancel",
                    style: "cancel",
                    onPress: () => console.log("Cancel Pressed"),
                  },
                ])
              }
            >
              <Text
                style={[
                  styles.modalSubmitButtonText,
                  { color: activeColors.secondary },
                ]}
              >
                Submit
              </Text>
            </Pressable>

            {/* Close Button */}
            <Pressable
              onPress={() => {
                setIsModalVisible(false);
                setAbsenceWorkerId("");
                setAbsenceReason("");
              }}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop:
      Platform.OS === "android"
        ? (StatusBar.currentHeight ? StatusBar.currentHeight : 0) + 20
        : 0,
    paddingHorizontal: 20,
  },
  title: {
    marginTop: 10,
    marginBottom: 20,
    fontSize: 25,
    textAlign: "center",
  },
  workerContainer: {
    marginVertical: 20,
    padding: 20,
    borderRadius: 20,
    maxHeight: 320,
    borderWidth: 2,
  },
  workerTitle: {
    fontSize: 22,
    marginBottom: 10,
    textAlign: "center",
  },
  worker: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderWidth: 1,
    borderRadius: 10,
    margin: 5,
  },
  workerText: {
    fontSize: 17,
  },
  InfoActionContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  workerButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    alignItems: "center",
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    width: "90%",
    padding: 30,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 10,
  },
  modalTextInput: {
    marginTop: 10,
    fontSize: 15,
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
    textAlignVertical: "top",
    height: 120,
  },
  modalCloseButton: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  modalSubmitButton: {
    width: "100%",
    marginTop: 10,
    paddingVertical: 10,
    borderRadius: 50,
    alignItems: "center",
  },
  modalSubmitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },

  formContainer: {
    flexDirection: "column",
    alignItems: "center",
    padding: 25,
    borderRadius: 20,
    borderWidth: 2,
    zIndex: 1,
  },
  formTitle: {
    fontSize: 22,
    // fontWeight: "500",
    textAlign: "center",
    marginBottom: 10,
  },
  serviceInputContainer: {
    width: (screenWidth * 2) / 3 + 50,
    zIndex: 100,
    marginVertical: 10,
  },
  serviceProductInputContainer: {
    width: (screenWidth * 2) / 3 + 50,
    zIndex: 99,
    marginVertical: 10,
  },
  createOrderButton: {
    width: (screenWidth * 2) / 3 + 50,
    marginTop: 10,
    paddingVertical: 10,
    borderRadius: 50,
    alignItems: "center",
  },
  workerInputContainer: {
    width: (screenWidth * 2) / 3 + 50,
    zIndex: 98,
    marginVertical: 10,
  },

  checkBoxContainer: {
    padding: 10,
  },
  dateTimePickerContainer: {
    width: (screenWidth * 2) / 3 + 50,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  dateTimeText: {
    fontSize: 17,
    fontWeight: "bold",
    textAlign: "center",
  },
  noteText: {
    padding: 10,
    fontSize: 13,
    textAlign: "left",
  },
});
