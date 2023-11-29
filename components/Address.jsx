import {
  View,
  Text,
  TouchableOpacity,
  Button,
  Pressable,
  Modal,
  ToastAndroid,
  KeyboardAvoidingView,
} from "react-native";
import Animated, {
  FadeIn,
  FadeInUp,
  FadeOut,
  BounceIn,
  FadeInDown,
} from "react-native-reanimated";
import React, { useEffect, useState } from "react";
import { TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { addDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../config/authentication";
import useAuth from "../hooks/useAuth";
import AddressEdit from "./AddressEdit";
import { useWindowDimensions } from "react-native";
import Calendar from "./Calander";

const Address = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");
  const [data, setData] = useState([]);
  const [error, setError] = useState(false);
  const [editAddress, setEditAddress] = useState(false);
  const [success, setSuccess] = useState(false);
  const [reload, setReload] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  const width = useWindowDimensions().width;
  let getAddress;
  let userid;
  let exist = false;

  async function confirm(action) {
    if (action === "confirm") {
      const colRef = collection(db, "Address");
      const docsSnap = await getDocs(colRef);
      docsSnap.forEach((doc) => {
        data?.push(doc.data());
      });
      userid = data.find((val) => {
        return val.user === user.uid;
      });
      if (userid == undefined) {
        const myCollection = collection(db, "Address");
        const newDocRef = await addDoc(myCollection, {
          name: name,
          address: address,
          pincode: pincode,
          user: user.uid,
        });

        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
        }, 2000);
      } else {
        console.log("errorrr");
        setError(true);
        setTimeout(() => {
          setError(false);
        }, 2000);
      }
    } else {
      setModalVisible(false);
    }
  }
  useEffect(() => {
    (async function () {
      const colRef = collection(db, "Address");
      const docsSnap = await getDocs(colRef);
      const newData = [];
      docsSnap.forEach((doc) => {
        newData.push(doc.data());
      });
      setData(newData);
    })();
  }, [reload]);
  (function () {
    getAddress = data.find((val) => {
      return user.uid === val.user;
    });

    if (getAddress !== undefined) {
      if (Object?.keys(getAddress).length > 0) {
        exist = true;
      }
    }
  })();

  return (
    <SafeAreaView>
      <View className="font-bold p-3">
        <Text className="font-semibold">-pickup</Text>
      </View>
      <View className="bg-white m-2 h-24 p-2 flex-row justify-between">
        {exist ? (
          <View className="w-40 h-fit p-2">
            <View className="w-60">
              <Text className="font-medium">Name:{getAddress?.name}</Text>
            </View>
            <View className="w-60">
              <Text className="font-medium">Name:{getAddress?.address}</Text>
            </View>
            <View className="w-60">
              <Text className="font-medium">Name:{getAddress?.pincode}</Text>
            </View>
          </View>
        ) : (
          <View className="w-40 h-fit p-2">
            <Text className="font-medium">Add Your Address</Text>
          </View>
        )}
        <View>
          <TouchableOpacity
            className="bg-blue-400  w-20 h-7 rounded-lg"
            onPress={() => setModalVisible(true)}
          >
            <Text className="text-white text-center mt-1">ADD</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-blue-400  w-20 h-7 rounded-lg mt-2"
            onPress={() => setEditAddress(true)}
          >
            <Text className="text-white text-center mt-1">EDIT</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View className=" w-screen h-full mt-40 flex items-center justify-center pb-20">
          <View className=" w-10/12 h-80 border p-2 shadow">
            <KeyboardAvoidingView className="flex flex-col gap-4  w-80">
              <TextInput
                placeholder="Enter you name"
                autoCapitalize="none"
                className="bg-white rounded-sm pl-2"
                value={name}
                onChangeText={setName}
              />

              <TextInput
                placeholder="enter your address"
                autoCapitalize="none"
                keyboardType="email-address"
                className="bg-white rounded-sm pl-2"
                value={address}
                onChangeText={setAddress}
              />

              <TextInput
                placeholder="enter your pincode"
                className="bg-white rounded-sm pl-2"
                value={pincode}
                onChangeText={setPincode}
              />
            </KeyboardAvoidingView>
            <View className="flex-row items-center gap-2 pl-1 my-8">
              <View>
                <Button
                  title="confirm"
                  onPress={() => confirm("confirm")}
                  variant="success"
                />
              </View>
              <View>
                <Button
                  title="cancel"
                  onPress={() => confirm("cancel")}
                  variant="success"
                  className="mt-3"
                />
              </View>
            </View>

            {error && (
              <Animated.View
                entering={BounceIn.delay(100)
                  .duration(1000)
                  .springify()
                  .damping(3)}
                className="items-center pb-4"
              >
                <View className="w-72 h-9 bg-blue-400 rounded-2xl justify-center">
                  <Text className="text-white text-center">Alleady Added</Text>
                </View>
              </Animated.View>
            )}
            {success && (
              <Animated.View
                entering={BounceIn.delay(100)
                  .duration(1000)
                  .springify()
                  .damping(3)}
                className="items-center pb-4"
              >
                <View className="w-72 h-9 bg-blue-400 rounded-2xl justify-center">
                  <Text className="text-white text-center">Address added</Text>
                </View>
              </Animated.View>
            )}
          </View>
        </View>
      </Modal>
      {editAddress && (
        <AddressEdit
          editAddress={editAddress}
          setEditAddress={setEditAddress}
          setReload={setReload}
        />
      )}
      <Text className="m-2">Pick Up Date</Text>
      <Calendar onSelectDate={setSelectedDate} selected={selectedDate} />
    </SafeAreaView>
  );
};

export default Address;
