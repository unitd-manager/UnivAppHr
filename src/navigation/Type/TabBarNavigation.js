import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";
import Home from "../../containers/tabbar/main/HomeTab";
import Account from "../../containers/tabbar/main/LeaveTab";
import TaskTab from "../../containers/tabbar/taskList/TaskTab";
import { createStackNavigator } from "@react-navigation/stack";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false, // Hide the default header
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === "Home") {
            iconName = "home-outline";
          } else if (route.name === "LeaveTab") {
            iconName = "person-outline";
          } else if (route.name === "AttendanceTab") {
            iconName = "grid-outline";
          }
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#1EB1C5",
        tabBarInactiveTintColor: "gray",
      })}
    >
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          headerShown: false,
          headerTitle: "Smart wave",
          headerStyle: { backgroundColor: "#1EB1C5" , borderBottomLeftRadius:20 , borderBottomRightRadius:20 }, // Style the header
          headerTintColor: "#fff", // Style the text
        }}
      />
      <Tab.Screen
        name="AttendanceTab"
        component={TaskTab}
        options={{
          headerShown: false,
          headerTitle: "AttendanceTab",
          headerStyle: { backgroundColor: "#1EB1C5" , borderBottomLeftRadius:20 , borderBottomRightRadius:20 },
          headerTintColor: "#fff",
        }}
      />
      <Tab.Screen
        name="LeaveTab"
        component={Account}
        options={{
          headerShown: false,
          headerTitle: "LeaveTab",
          headerStyle: { backgroundColor: "#1EB1C5" , borderBottomLeftRadius:20 , borderBottomRightRadius:20 },
          headerTintColor: "#fff",
        }}
      />
    </Tab.Navigator>
  );
}
