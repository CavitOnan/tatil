import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "../screens/HomeScreen";
import BridgeDaysScreen from "../screens/BridgeDaysScreen";
import CostCalculatorScreen from "../screens/CostCalculatorScreen";
import ProfileScreen from "../screens/ProfileScreen";

const Tab = createBottomTabNavigator();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator screenOptions={{ headerTitleAlign: "center" }}>
        <Tab.Screen
          name="Takvim"
          component={HomeScreen}
          options={{ title: "Tatil Takvimi" }}
        />
        <Tab.Screen
          name="KoprulerGunler"
          component={BridgeDaysScreen}
          options={{ title: "Köprü Günleri" }}
        />
        <Tab.Screen
          name="Maliyet"
          component={CostCalculatorScreen}
          options={{ title: "Maliyet Hesapla" }}
        />
        <Tab.Screen
          name="Profil"
          component={ProfileScreen}
          options={{ title: "Profil" }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
