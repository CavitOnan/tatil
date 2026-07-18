import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { SubscriptionProvider } from "./src/lib/entitlements";
import RootNavigator from "./src/navigation/RootNavigator";

export default function App() {
  return (
    <SafeAreaProvider>
      <SubscriptionProvider>
        <RootNavigator />
        <StatusBar style="auto" />
      </SubscriptionProvider>
    </SafeAreaProvider>
  );
}
