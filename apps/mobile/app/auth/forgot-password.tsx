import React, { useMemo, useState } from "react";
import { Alert, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View, ActivityIndicator } from "react-native";
import { Stack, router } from "expo-router";
import { forgotPasswordApi } from "../../services/auth.service";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(() => email.trim().length >= 5 && !loading, [email, loading]);

  const submit = async () => {
    const value = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(value)) {
      Alert.alert("Email không hợp lệ", "Vui lòng nhập đúng định dạng email.");
      return;
    }

    try {
      setLoading(true);
      await forgotPasswordApi({ email: value });

      router.push({
        pathname: "/auth/verify-otp",
        params: { email: value },
      });
    } catch (e: any) {
      Alert.alert("Không gửi được OTP", e?.message ?? "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.container}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={10}>
          <Text style={styles.backText}>←</Text>
        </Pressable>

        <Text style={styles.title}>Quên mật khẩu</Text>
        <Text style={styles.subTitle}>Vui lòng nhập email của bạn để nhận mã OTP khôi phục mật khẩu.</Text>

        <View style={{ height: 18 }} />

        <Text style={styles.label}>Email</Text>
        <View style={styles.inputWrap}>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Nhập email của bạn"
            placeholderTextColor="rgba(255,255,255,0.45)"
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
          />
          <Text style={styles.icon}>✉</Text>
        </View>

        <View style={{ flex: 1 }} />

        <Pressable onPress={submit} disabled={!canSubmit} style={[styles.primaryBtn, !canSubmit && styles.primaryBtnDisabled]}>
          {loading ? <ActivityIndicator /> : <Text style={styles.primaryBtnText}>Gửi mã OTP</Text>}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#071C14" },
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 18 },
  backBtn: { width: 44, height: 44, justifyContent: "center" },
  backText: { color: "white", fontSize: 22, fontWeight: "700" },

  title: { color: "white", fontSize: 28, fontWeight: "800", marginTop: 2 },
  subTitle: { color: "rgba(255,255,255,0.65)", marginTop: 8, lineHeight: 20 },

  label: { color: "rgba(255,255,255,0.8)", marginBottom: 8, fontWeight: "700" },
  inputWrap: {
    height: 48,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(120,255,180,0.18)",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  input: { flex: 1, color: "white", fontSize: 14 },
  icon: { color: "rgba(255,255,255,0.55)", fontSize: 16 },

  primaryBtn: {
    height: 52,
    borderRadius: 12,
    backgroundColor: "#1BE06A",
    justifyContent: "center",
    alignItems: "center",
  },
  primaryBtnDisabled: { opacity: 0.55 },
  primaryBtnText: { color: "#062012", fontWeight: "900", fontSize: 16 },
});
