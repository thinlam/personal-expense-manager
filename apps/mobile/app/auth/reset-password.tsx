import React, { useMemo, useState } from "react";
import { Alert, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View, ActivityIndicator } from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { resetPasswordApi } from "../../services/auth.service";

export default function ResetPasswordScreen() {
  const { email, otp } = useLocalSearchParams<{ email: string; otp: string }>();
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(() => {
    return !loading && newPassword.length >= 6 && newPassword === confirm;
  }, [loading, newPassword, confirm]);

  const submit = async () => {
    if (!email || !otp) {
      Alert.alert("Thiếu dữ liệu", "Vui lòng quay lại các bước trước.");
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert("Mật khẩu quá ngắn", "Mật khẩu tối thiểu 6 ký tự.");
      return;
    }
    if (newPassword !== confirm) {
      Alert.alert("Không khớp", "Mật khẩu nhập lại không khớp.");
      return;
    }

    try {
      setLoading(true);
      await resetPasswordApi({
        email: String(email),
        otp: String(otp),
        newPassword,
      });

      Alert.alert("Thành công", "Bạn đã đặt lại mật khẩu. Vui lòng đăng nhập lại.");
      router.replace("/auth/login");
    } catch (e: any) {
      Alert.alert("Không đặt lại được", e?.message ?? "Có lỗi xảy ra");
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

        <Text style={styles.title}>Mật khẩu mới</Text>
        <Text style={styles.subTitle}>Vui lòng tạo mật khẩu mới cho tài khoản của bạn.</Text>

        <View style={{ height: 18 }} />

        <Text style={styles.label}>Mật khẩu mới</Text>
        <View style={styles.inputWrap}>
          <TextInput
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="Nhập mật khẩu mới"
            placeholderTextColor="rgba(255,255,255,0.45)"
            secureTextEntry
            style={styles.input}
          />
        </View>

        <View style={{ height: 12 }} />

        <Text style={styles.label}>Nhập lại mật khẩu</Text>
        <View style={styles.inputWrap}>
          <TextInput
            value={confirm}
            onChangeText={setConfirm}
            placeholder="Nhập lại mật khẩu"
            placeholderTextColor="rgba(255,255,255,0.45)"
            secureTextEntry
            style={styles.input}
          />
        </View>

        <View style={{ flex: 1 }} />

        <Pressable onPress={submit} disabled={!canSubmit} style={[styles.primaryBtn, !canSubmit && styles.primaryBtnDisabled]}>
          {loading ? <ActivityIndicator /> : <Text style={styles.primaryBtnText}>Xác nhận</Text>}
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
    justifyContent: "center",
  },
  input: { color: "white", fontSize: 14 },

  primaryBtn: { height: 52, borderRadius: 12, backgroundColor: "#1BE06A", justifyContent: "center", alignItems: "center" },
  primaryBtnDisabled: { opacity: 0.55 },
  primaryBtnText: { color: "#062012", fontWeight: "900", fontSize: 16 },
});
