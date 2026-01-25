import React from "react";
import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import { clearAuth } from "../../services/auth.storage";

export default function Settings() {
  const logout = async () => {
    await clearAuth();
    router.replace("/auth/login");
  };

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 22, fontWeight: "700" }}>Cài đặt</Text>
      <Pressable onPress={logout} style={{ borderWidth: 1, padding: 14, borderRadius: 10 }}>
        <Text>Đăng xuất</Text>
      </Pressable>
    </View>
  );
}
