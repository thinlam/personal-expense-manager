import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { router } from "expo-router";
import { getToken } from "../services/auth.storage";

export default function Index() {
  useEffect(() => {
    (async () => {
      const token = await getToken();
      if (token) router.replace("/(tabs)");
      else router.replace("/auth/login");
    })();
  }, []);

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator />
    </View>
  );
}
