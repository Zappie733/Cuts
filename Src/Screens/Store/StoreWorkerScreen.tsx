import React, { useContext, useEffect, useState } from "react";
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
  Image,
  FlatList,
} from "react-native";
import { RootStackScreenProps } from "../../Navigations/RootNavigator";
import { Header } from "../../Components/Header";
import { Theme } from "../../Contexts/ThemeContext";
import { Auth } from "../../Contexts/AuthContext";
import { apiCallHandler } from "../../Middlewares/util";
import {
  deleteWorkerById,
  registerWorker,
  updateWorker,
} from "../../Middlewares/StoreMiddleware/WorkerMiddleware";
import { AntDesign, FontAwesome5 } from "@expo/vector-icons";
import {
  RegisterWorkerData,
  UpdateWorkerData,
  WorkerObj,
} from "../../Types/StoreTypes/WorkerTypes";
import { SelectSingleImage } from "../../Components/Image";
import { Input } from "../../Components/Input";
import { IImageProps } from "../../Types/ComponentTypes/ImageTypes";
import { DropdownPicker } from "../../Components/DropdownPicker";

const screenWidth = Dimensions.get("screen").width;

export const StoreWorkerScreen = ({
  navigation,
  route,
}: RootStackScreenProps<"StoreWorkers">) => {
  const handleGoBack = () => {
    navigation.goBack();
  };

  const { theme } = useContext(Theme);
  let activeColors = colors[theme.mode];

  const { store, refetchData } = useContext(Store);
  const { auth, setAuth, updateAccessToken } = useContext(Auth);

  const [loading, setLoading] = useState(false);

  const dateFormat = (date: Date | null) => {
    if (!date) {
      return "";
    }

    return date.toString().split("T")[0];
  };

  const dateTimeFormat = (date: Date | null) => {
    if (!date) {
      return "";
    }

    return (
      date.toString().split("T")[0] +
      " " +
      date.toString().split("T")[1].split(".")[0]
    );
  };

  const handleDeleteWorker = async (workerId: string) => {
    setLoading(true);
    const response = await apiCallHandler({
      apiCall: () =>
        deleteWorkerById({
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

    if (response.status >= 200 && response.status < 400) {
      Alert.alert("Success", response.message);
      await refetchData();
    } else if (response) {
      Alert.alert("Error", response.message);
      console.log(response.status, response.message);
    }

    setLoading(false);
  };

  //history
  const [showHistory, setShowHistory] = useState(false);
  const [worker, setWorker] = useState<WorkerObj>();

  const handleShowHistory = (workerId: string) => {
    const worker = store.workers.find((worker) => worker._id === workerId);

    setWorker(worker);
    setShowHistory(true);
  };

  const currentYear = new Date().getFullYear();
  const [years, setYears] = useState<number[]>([]);
  const [year, setYear] = useState<string>();
  interface YearOption {
    label: string;
    value: string;
  }

  const [yearsOptions, setYearsOptions] = useState<YearOption[]>([]);

  // console.log("years", years);
  // console.log("year", year);
  // console.log("yearsOptions", yearsOptions);
  useEffect(() => {
    setYear(undefined);
    setYears([]);

    console.log("worker", worker);
    if (worker) {
      if (worker) {
        const yearsSinceWorkerJoin = Array.from(
          {
            length: currentYear + 1 - new Date(worker.joinDate).getFullYear(),
          }, // +1 so atleast it has the same year as currentYear
          (_, index) => currentYear - index //index start from
        );
        console.log("yearsSinceWorkerJoin", yearsSinceWorkerJoin);

        setYears(yearsSinceWorkerJoin);

        const yearsOptions = yearsSinceWorkerJoin.map((year) => ({
          label: year.toString(),
          value: year.toString(),
        }));

        setYearsOptions(yearsOptions);
      }
    }
  }, [worker]);

  useEffect(() => {
    if (!year) {
      setYear(years[0]?.toString());
    }
  }, [years]);

  const currentMonth = new Date().getMonth() + 1; //getMonth starts from 0 and end in 11
  const [month, setMonth] = useState(currentMonth.toString());
  const monthslable = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const monthsOptions = Array.from({ length: 12 }, (_, index) => index + 1).map(
    (month) => ({ label: monthslable[month - 1], value: month.toString() })
  );
  // console.log("month", month);
  // console.log("monthsOptions", monthsOptions);

  //---------------------
  //ADD
  const [isAddForm, setIsAddForm] = useState(false);

  const defaultAddData: RegisterWorkerData = {
    firstName: "",
    lastName: "",
    age: 0,
    role: null,
    image: {
      file: "",
    },
  };

  const [addData, setAddData] = useState(defaultAddData);
  console.log("add worker data", addData);

  const handleAddTextChange = <T extends keyof RegisterWorkerData>(
    value: RegisterWorkerData[T],
    fieldname: T
  ) => {
    setAddData({
      ...addData,
      [fieldname]: value,
    });
  };

  const handleAddWorker = async () => {
    setLoading(true);

    const response = await apiCallHandler({
      apiCall: () =>
        registerWorker({
          auth,
          updateAccessToken,
          data: addData,
        }),
      auth,
      setAuth,
      navigation,
    });

    if (response.status >= 200 && response.status < 400) {
      Alert.alert("Success", response.message);
      await refetchData();
      setAddData(defaultAddData);
      setIsAddForm(false);
    } else if (response) {
      Alert.alert("Error", response.message);
      console.log(response.status, response.message);
    }

    setLoading(false);
  };

  const roleOptions = [
    { label: "Admin", value: "admin" },
    { label: "Worker", value: "worker" },
    { label: "Others", value: "others" },
  ];

  //-------------------------------------------------------------------
  // EDIT
  const [isEditForm, setIsEditForm] = useState(false);

  const defaultUpdateData: UpdateWorkerData = {
    workerId: "",
    firstName: "",
    lastName: "",
    age: 0,
    role: null,
    image: {
      file: "",
    },
  };

  const [updateData, setUpdateData] = useState(defaultUpdateData);
  console.log("update worker data", updateData);

  const handleUpdateTextChange = <T extends keyof UpdateWorkerData>(
    value: UpdateWorkerData[T],
    fieldname: T
  ) => {
    setUpdateData({
      ...updateData,
      [fieldname]: value,
    });
  };

  const [workerFirstNameEdit, setWorkerFirstNameEdit] = useState(false);
  const [workerLastNameEdit, setWorkerLastNameEdit] = useState(false);
  const [workerAgeEdit, setWorkerAgeEdit] = useState(false);
  const [workerRoleEdit, setWorkerRoleEdit] = useState(false);

  const handleSetEditData = (workerId: string) => {
    const currentData: UpdateWorkerData = {
      workerId,
      firstName:
        store.workers.find((storeWorker) => storeWorker._id === workerId)
          ?.firstName ?? "",
      lastName:
        store.workers.find((storeWorker) => storeWorker._id === workerId)
          ?.lastName ?? "",
      age:
        store.workers.find((storeWorker) => storeWorker._id === workerId)
          ?.age ?? 0,
      role:
        store.workers.find((storeWorker) => storeWorker._id === workerId)
          ?.role ?? null,
      image: store.workers.find((storeWorker) => storeWorker._id === workerId)
        ?.image ?? { file: "" },
    };
    console.log("forEditData", currentData);
    setUpdateData(currentData);
    setIsEditForm(true);
  };

  const handleUpdateWorker = async () => {
    setLoading(true);

    const response = await apiCallHandler({
      apiCall: () =>
        updateWorker({
          auth,
          updateAccessToken,
          data: updateData,
        }),
      auth,
      setAuth,
      navigation,
    });

    if (response.status >= 200 && response.status < 400) {
      Alert.alert("Success", response.message);
      await refetchData();
      setUpdateData(defaultUpdateData);
      setWorkerFirstNameEdit(false);
      setWorkerLastNameEdit(false);
      setWorkerRoleEdit(false);
      setWorkerAgeEdit(false);
      setIsEditForm(false);
    } else if (response) {
      Alert.alert("Error", response.message);
      console.log(response.status, response.message);
    }

    setLoading(false);
  };

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

      {!isAddForm && !isEditForm && !showHistory ? (
        <>
          <Header goBack={handleGoBack} />

          {/* title */}
          <View>
            <Text style={[styles.title, { color: activeColors.accent }]}>
              Workers
            </Text>
            {/* add worker button*/}
            <Pressable
              style={styles.addButtonContainer}
              onPress={() => setIsAddForm(true)}
            >
              <AntDesign name="pluscircle" size={26} color="white" />
            </Pressable>
          </View>

          {/* line separator */}
          <View
            style={{
              borderWidth: 1,
              marginHorizontal: 60,
              borderColor: activeColors.tertiary,
            }}
          />

          <ScrollView
            showsVerticalScrollIndicator={false}
            style={{ marginHorizontal: 30, marginVertical: 20 }}
          >
            {store.workers.map((worker) => (
              <View
                key={worker._id}
                style={[
                  styles.card,
                  {
                    borderColor: activeColors.tertiary,
                  },
                ]}
              >
                <View
                  style={[
                    styles.cardContent,
                    {
                      backgroundColor:
                        theme.mode === "dark"
                          ? "rgba(0,0,0,0.4)"
                          : "rgba(255,255,255,0.1)",
                    },
                  ]}
                >
                  <Image
                    source={{ uri: worker.image.file }}
                    style={[styles.image, { borderColor: activeColors.accent }]}
                  />

                  <Text style={[styles.text, { color: activeColors.accent }]}>
                    {worker.firstName} {worker.lastName}
                  </Text>

                  <Text
                    style={[styles.subText, { color: activeColors.accent }]}
                  >
                    Role: {worker.role}
                  </Text>

                  <Text
                    style={[styles.subText, { color: activeColors.accent }]}
                  >
                    Age: {worker.age}
                  </Text>

                  <Pressable
                    style={[
                      styles.historyButton,
                      { backgroundColor: activeColors.accent },
                    ]}
                    onPress={() => handleShowHistory(worker._id ?? "")}
                  >
                    <Text style={{ color: activeColors.primary }}>
                      Absence History
                    </Text>
                  </Pressable>
                </View>

                {/* Delete Icon */}
                <Pressable
                  style={styles.deleteContainer}
                  onPress={() =>
                    Alert.alert(
                      `Are you sure want to delete ${
                        worker.firstName + " " + worker.lastName
                      } ?`,
                      "Choose an option",
                      [
                        {
                          text: "Delete",
                          onPress: () => {
                            handleDeleteWorker(worker._id ?? "");
                          },
                        },
                        { text: "Cancel", style: "cancel" },
                      ],
                      { cancelable: true }
                    )
                  }
                >
                  <AntDesign
                    name="delete"
                    size={20}
                    color={activeColors.accent}
                  />
                </Pressable>

                {/* Edit Icon */}
                <Pressable
                  style={styles.editContainer}
                  onPress={() => {
                    handleSetEditData(worker._id ?? "");
                  }}
                >
                  <FontAwesome5
                    name="edit"
                    size={20}
                    color={activeColors.accent}
                  />
                </Pressable>
              </View>
            ))}
          </ScrollView>
        </>
      ) : showHistory ? (
        <>
          <Header
            goBack={() => {
              setShowHistory(false);
              setWorker(undefined);
            }}
          />

          {/* title */}
          <View>
            <Text style={[styles.title, { color: activeColors.accent }]}>
              {worker?.firstName + " " + worker?.lastName} History
            </Text>
          </View>

          {/* line separator */}
          <View
            style={{
              borderWidth: 1,
              marginHorizontal: 60,
              borderColor: activeColors.tertiary,
            }}
          />

          {/* filter */}
          <View style={styles.filterContainer}>
            <View style={{ flex: 2 }}>
              <DropdownPicker
                key="month"
                options={monthsOptions}
                selectedValue={month}
                onValueChange={setMonth}
                placeHolder="Month..."
                isInput={false}
              />
            </View>

            <View style={{ flex: 1 }}>
              <DropdownPicker
                key="year"
                options={yearsOptions}
                selectedValue={year ?? ""}
                onValueChange={setYear}
                placeHolder="Year..."
                isInput={false}
              />
            </View>
          </View>

          {/* History */}
          {worker?.history && worker?.history?.length > 0 && (
            <ScrollView showsVerticalScrollIndicator={false}>
              {worker?.history
                ?.filter((history) => {
                  if (history) {
                    // console.log("date before", history?.date);
                    // console.log("date", new Date(history?.date));
                    // console.log(
                    //   "month",
                    //   new Date(history?.date).getMonth() + 1
                    // );
                    // console.log("year", new Date(history?.date).getFullYear());

                    return (
                      new Date(history?.date).getMonth() + 1 ===
                        Number.parseInt(month) &&
                      new Date(history?.date).getFullYear() ===
                        Number.parseInt(year ?? "")
                    );
                  }
                })
                .map((history) => (
                  <View
                    key={history?.date.toString()}
                    style={[
                      styles.historyContainer,
                      {
                        borderColor: activeColors.tertiary,
                        backgroundColor: activeColors.secondary,
                      },
                    ]}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Text
                        style={[styles.topText, { color: activeColors.accent }]}
                      >
                        {dateFormat(history.date)}
                      </Text>

                      <Text
                        style={[
                          styles.topText,
                          { color: activeColors.infoColor },
                        ]}
                      >
                        {history.isAbsence ? "Absent" : "Present"}
                      </Text>
                    </View>

                    {history.isAbsence && history.reason && (
                      <Text
                        style={[
                          styles.detailText,
                          { color: activeColors.accent },
                        ]}
                      >
                        Reason:{"\n\t"}
                        {history.reason}
                      </Text>
                    )}

                    {!history.isAbsence && (
                      <>
                        <Text
                          style={[
                            styles.detailText,
                            { color: activeColors.accent },
                          ]}
                        >
                          Clock in: {dateTimeFormat(history?.clockIn ?? null)}
                        </Text>
                        <Text
                          style={[
                            styles.detailText,
                            { color: activeColors.accent },
                          ]}
                        >
                          Clock out: {dateTimeFormat(history?.clockOut ?? null)}
                        </Text>
                      </>
                    )}
                  </View>
                ))}

              {month &&
                year &&
                worker?.history?.filter((history) => {
                  if (history) {
                    return (
                      new Date(history?.date).getMonth() + 1 ===
                        Number.parseInt(month) &&
                      new Date(history?.date).getFullYear() ===
                        Number.parseInt(year ?? "")
                    );
                  }
                }).length === 0 && (
                  <View style={{ alignItems: "center" }}>
                    <Text
                      style={{
                        fontSize: 20,
                        textAlign: "center",
                        color: activeColors.accent,
                      }}
                    >
                      No history for{" "}
                      {monthsOptions.find((m) => m.value === month)?.label}{" "}
                      {year}
                    </Text>
                  </View>
                )}
            </ScrollView>
          )}

          {worker?.history && worker?.history?.length === 0 && (
            <View style={{ alignItems: "center" }}>
              <Text
                style={{
                  fontSize: 20,
                  textAlign: "center",
                  color: activeColors.accent,
                }}
              >
                {worker.firstName + " " + worker.lastName} history is empty
              </Text>
            </View>
          )}
        </>
      ) : (
        <>
          <Header
            goBack={() => {
              isAddForm
                ? (setIsAddForm(false), setAddData(defaultAddData))
                : (setIsEditForm(false),
                  setUpdateData(defaultUpdateData),
                  setWorkerFirstNameEdit(false),
                  setWorkerLastNameEdit(false),
                  setWorkerRoleEdit(false),
                  setWorkerAgeEdit(false));
            }}
          />

          {/* title */}
          <View>
            <Text style={[styles.title, { color: activeColors.accent }]}>
              {isAddForm ? "Add Worker Form" : "Update Worker Form"}
            </Text>
          </View>

          {/* line separator */}
          <View
            style={{
              borderWidth: 1,
              marginHorizontal: 60,
              borderColor: activeColors.tertiary,
            }}
          />

          {/* form worker */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}
          >
            <View
              style={[
                styles.formContainer,
                { borderColor: activeColors.tertiary },
              ]}
            >
              <View>
                <SelectSingleImage
                  imageData={isEditForm ? updateData.image : addData.image}
                  handleSetImage={(image: IImageProps | null) =>
                    isEditForm
                      ? handleUpdateTextChange(image ?? { file: "" }, "image")
                      : handleAddTextChange(image ?? { file: "" }, "image")
                  }
                />

                {/* line separator */}
                <View
                  style={{
                    borderWidth: 1,
                    borderColor: activeColors.tertiary,
                    marginVertical: 10,
                  }}
                />

                <View>
                  {/* firstName */}
                  <Input
                    key="firstName"
                    context="First Name"
                    placeholder="Enter First Name"
                    value={
                      isEditForm
                        ? updateData.firstName
                        : addData.firstName || ""
                    }
                    updateValue={(text: string) =>
                      isEditForm
                        ? handleUpdateTextChange(text, "firstName")
                        : handleAddTextChange(text, "firstName")
                    }
                    isEditable={isEditForm ? workerFirstNameEdit : undefined}
                    setEditable={
                      isEditForm ? setWorkerFirstNameEdit : undefined
                    }
                  />

                  {/* lastName */}
                  <Input
                    key="lastName"
                    context="Last Name"
                    placeholder="Enter Last Name"
                    value={
                      isEditForm ? updateData.lastName : addData.lastName || ""
                    }
                    updateValue={(text: string) =>
                      isEditForm
                        ? handleUpdateTextChange(text, "lastName")
                        : handleAddTextChange(text, "lastName")
                    }
                    isEditable={isEditForm ? workerLastNameEdit : undefined}
                    setEditable={isEditForm ? setWorkerLastNameEdit : undefined}
                  />

                  {/* age */}
                  <Input
                    key="age"
                    context="Age"
                    placeholder="Enter Age"
                    value={
                      isEditForm
                        ? updateData?.age.toString() !== "0"
                          ? updateData?.age.toString()
                          : ""
                        : addData?.age.toString() !== "0"
                        ? addData?.age.toString()
                        : ""
                    }
                    updateValue={(text: string) => {
                      // Validate and accept only numeric input
                      const numericValue = text.replace(/[^0-9]/g, ""); // Remove non-numeric characters
                      isEditForm
                        ? handleUpdateTextChange(
                            Number.parseInt(numericValue || "0"),
                            "age"
                          )
                        : handleAddTextChange(
                            Number.parseInt(numericValue || "0"),
                            "age"
                          ); // Ensure at least "0" is passed if empty
                    }}
                    isEditable={isEditForm ? workerAgeEdit : undefined}
                    setEditable={isEditForm ? setWorkerAgeEdit : undefined}
                  />

                  <View style={styles.roleInputContainer}>
                    <DropdownPicker
                      key={"role"}
                      options={roleOptions}
                      selectedValue={
                        isEditForm ? updateData.role ?? "" : addData.role ?? ""
                      }
                      onValueChange={(text: string) => {
                        isEditForm
                          ? handleUpdateTextChange(
                              text as "admin" | "worker" | "others",
                              "role"
                            )
                          : handleAddTextChange(
                              text as "admin" | "worker" | "others",
                              "role"
                            );
                      }}
                      placeHolder="Select Worker's Role"
                      isInput={true}
                      context="Role"
                      isEditable={isEditForm ? workerRoleEdit : undefined}
                      setEditable={isEditForm ? setWorkerRoleEdit : undefined}
                    />
                  </View>
                </View>

                {/* line separator */}
                <View
                  style={{
                    borderWidth: 1,
                    borderColor: activeColors.tertiary,
                    marginVertical: 10,
                  }}
                />

                {/* create worker */}
                <Pressable
                  style={[
                    styles.createWorkerButton,
                    { backgroundColor: activeColors.accent },
                  ]}
                  onPress={() =>
                    isAddForm ? handleAddWorker() : handleUpdateWorker()
                  }
                >
                  <Text
                    style={{
                      color: activeColors.primary,
                      fontWeight: "bold",
                      fontSize: 16,
                    }}
                  >
                    {isAddForm ? "Add Worker" : "Update Worker"}
                  </Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </>
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
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginVertical: 10,
    textAlign: "center",
  },
  addButtonContainer: {
    position: "absolute",
    top: 20,
    right: 40,
  },
  card: {
    borderWidth: 2,
    borderRadius: 10,
    marginVertical: 5,
    minHeight: 150,
    justifyContent: "center", // Center text
    overflow: "hidden", // Ensures border radius is applied to the background image
  },
  cardContent: {
    alignItems: "center",

    flex: 1,
    justifyContent: "center",
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 10,
  },
  subText: {
    fontSize: 20,
    fontWeight: "400",
    textAlign: "center",
  },
  image: {
    marginTop: 30,
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
  },
  deleteContainer: {
    position: "absolute",
    top: 12,
    left: 10,
  },
  editContainer: {
    position: "absolute",
    top: 12,
    right: 10,
  },
  historyButton: {
    paddingVertical: 7,
    paddingHorizontal: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },

  formContainer: {
    flexDirection: "column",
    alignItems: "center",
    marginHorizontal: 25,
    marginVertical: 20,
    padding: 25,
    borderRadius: 20,
    borderWidth: 2,
  },
  createWorkerButton: {
    width: (screenWidth * 2) / 3 + 50,
    marginTop: 10,
    paddingVertical: 10,
    borderRadius: 50,
    alignItems: "center",
  },
  roleInputContainer: {
    width: (screenWidth * 2) / 3 + 50,
    zIndex: 99,
    marginVertical: 10,
  },

  filterContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 30,
    justifyContent: "space-between",
    gap: 10,
    marginVertical: 10,
  },
  historyContainer: {
    marginHorizontal: 30,
    marginVertical: 10,
    borderWidth: 2,
    padding: 15,
    borderRadius: 10,
  },
  topText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  detailText: {
    fontSize: 15,
    fontWeight: "400",
    marginTop: 5,
  },
});
