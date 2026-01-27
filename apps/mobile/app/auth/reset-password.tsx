import React, { useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator,
} from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { resetPasswordApi } from "../../services/auth.service";

function calcStrength(pw: string) {
  // Score 0..4
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;

  const pct = Math.min(100, Math.round((s / 4) * 100));

  let label = "Mật khẩu yếu";
  if (s >= 4) label = "Mật khẩu mạnh";
  else if (s === 3) label = "Mật khẩu khá";
  else if (s === 2) label = "Mật khẩu trung bình";

  return { score: s, pct, label };
}

export default function ResetPasswordScreen() {
  const { email, otp } = useLocalSearchParams<{ email: string; otp: string }>();

  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const strength = useMemo(() => calcStrength(newPassword), [newPassword]);

  const canSubmit = useMemo(() => {
    return !loading && newPassword.length >= 8 && newPassword === confirm;
  }, [loading, newPassword, confirm]);

  const submit = async () => {
    if (!email || !otp) {
      Alert.alert("Thiếu dữ liệu", "Vui lòng quay lại các bước trước.");
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert("Mật khẩu quá ngắn", "Mật khẩu tối thiểu 8 ký tự.");
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
        {/* Header giống hình */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.headerBtn} hitSlop={10}>
            <Ionicons name="chevron-back" size={22} color="white" />
          </Pressable>

          <Text style={styles.headerTitle}>Đặt Lại Mật Khẩu</Text>

          <View style={styles.headerBtn} />
        </View>

        <View style={{ height: 14 }} />

        <Text style={styles.title}>Mật khẩu mới</Text>
        <Text style={styles.subTitle}>
          Vui lòng nhập mật khẩu mới của bạn. Đảm bảo{"\n"}
          mật khẩu này khác với mật khẩu cũ để bảo mật{"\n"}
          hơn.
        </Text>

        <View style={{ height: 18 }} />

        {/* New password */}
        <Text style={styles.label}>MẬT KHẨU MỚI</Text>
        <View style={styles.inputWrap}>
          <TextInput
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="Nhập mật khẩu ít nhất 8 ký tự"
            placeholderTextColor="rgba(255,255,255,0.45)"
            secureTextEntry={!showNew}
            style={styles.input}
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="newPassword"
          />
          <Pressable onPress={() => setShowNew((s) => !s)} hitSlop={10} style={styles.eyeBtn}>
            <Ionicons name={showNew ? "eye-outline" : "eye-off-outline"} size={18} color="rgba(255,255,255,0.65)" />
          </Pressable>
        </View>

        {/* Strength bar + text */}
        <View style={{ height: 10 }} />
        <View style={styles.strengthTrack}>
          <View style={[styles.strengthFill, { width: `${strength.pct}%` }]} />
        </View>
        <Text style={styles.strengthText}>{strength.label}</Text>

        <View style={{ height: 16 }} />

        {/* Confirm */}
        <Text style={styles.label}>XÁC NHẬN MẬT KHẨU MỚI</Text>
        <View style={styles.inputWrap}>
          <TextInput
            value={confirm}
            onChangeText={setConfirm}
            placeholder="Nhập lại mật khẩu mới"
            placeholderTextColor="rgba(255,255,255,0.45)"
            secureTextEntry={!showConfirm}
            style={styles.input}
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="password"
          />
          <Pressable onPress={() => setShowConfirm((s) => !s)} hitSlop={10} style={styles.eyeBtn}>
            <Ionicons
              name={showConfirm ? "eye-outline" : "eye-off-outline"}
              size={18}
              color="rgba(255,255,255,0.65)"
            />
          </Pressable>
        </View>

        <View style={{ flex: 1 }} />

        {/* Button */}
        <Pressable
          onPress={submit}
          disabled={!canSubmit}
          style={[styles.primaryBtn, !canSubmit && styles.primaryBtnDisabled]}
        >
          {loading ? (
            <ActivityIndicator />
          ) : (
            <View style={styles.btnRow}>
              <Text style={styles.primaryBtnText}>Cập nhật mật khẩu</Text>
              <Ionicons name="checkmark-circle" size={18} color="#062012" />
            </View>
          )}
        </Pressable>

        <Text style={styles.footerText}>
          Bằng cách cập nhật, bạn đồng ý với các điều khoản{"\n"}bảo mật của chúng tôi.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#071C14" },
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 18 },

  header: { height: 44, flexDirection: "row", alignItems: "center" },
  headerBtn: { width: 44, height: 44, justifyContent: "center" },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    color: "rgba(255,255,255,0.9)",
    fontWeight: "800",
  },

  title: { color: "white", fontSize: 30, fontWeight: "900", marginTop: 2 },
  subTitle: { color: "rgba(255,255,255,0.62)", marginTop: 10, lineHeight: 20 },

  label: {
    color: "rgba(255,255,255,0.70)",
    marginBottom: 10,
    fontWeight: "900",
    letterSpacing: 1,
    fontSize: 12,
  },

  inputWrap: {
    height: 52,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(120,255,180,0.18)",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  input: { flex: 1, color: "white", fontSize: 14 },
  eyeBtn: { width: 40, alignItems: "flex-end" },

  strengthTrack: {
    height: 4,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.10)",
    overflow: "hidden",
  },
  strengthFill: {
    height: 4,
    borderRadius: 999,
    backgroundColor: "#1BE06A",
  },
  strengthText: {
    marginTop: 8,
    color: "#1BE06A",
    fontWeight: "900",
    fontSize: 12,
  },

  primaryBtn: {
    height: 56,
    borderRadius: 14,
    backgroundColor: "#1BE06A",
    justifyContent: "center",
    alignItems: "center",
  },
  primaryBtnDisabled: { opacity: 0.55 },
  btnRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  primaryBtnText: { color: "#062012", fontWeight: "900", fontSize: 16 },

  footerText: {
    marginTop: 10,
    textAlign: "center",
    color: "rgba(255,255,255,0.35)",
    fontSize: 11,
    lineHeight: 16,
  },
});
