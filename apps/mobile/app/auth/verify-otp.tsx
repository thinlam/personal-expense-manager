import React, { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View, ActivityIndicator } from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { forgotPasswordApi } from "../../services/auth.service";

export default function VerifyOtpScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const [cooldown, setCooldown] = useState(60);

  useEffect(() => {
    const t = setInterval(() => setCooldown((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);

  const canContinue = useMemo(() => /^\d{6}$/.test(otp) && !loading, [otp, loading]);

  const continueNext = () => {
    if (!email) {
      Alert.alert("Thiếu email", "Vui lòng quay lại bước trước.");
      return;
    }
    if (!/^\d{6}$/.test(otp)) {
      Alert.alert("OTP không hợp lệ", "OTP phải gồm 6 chữ số.");
      return;
    }

    router.push({
      pathname: "/auth/reset-password",
      params: { email, otp },
    });
  };

  const resend = async () => {
    if (!email) return;
    if (cooldown > 0) return;

    try {
      setLoading(true);
      await forgotPasswordApi({ email: String(email) });
      setCooldown(60);
      Alert.alert("Đã gửi lại OTP", "Vui lòng kiểm tra email của bạn.");
    } catch (e: any) {
      Alert.alert("Không gửi lại được", e?.message ?? "Có lỗi xảy ra");
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

        <Text style={styles.title}>Nhập mã OTP</Text>
        <Text style={styles.subTitle}>
          Mã OTP đã được gửi tới email:{" "}
          <Text style={{ color: "rgba(255,255,255,0.9)", fontWeight: "800" }}>{String(email ?? "")}</Text>
        </Text>

        <View style={{ height: 18 }} />

        <Text style={styles.label}>OTP</Text>
        <View style={styles.inputWrap}>
          <TextInput
            value={otp}
            onChangeText={(t) => setOtp(t.replace(/[^\d]/g, "").slice(0, 6))}
            placeholder="Nhập 6 chữ số"
            placeholderTextColor="rgba(255,255,255,0.45)"
            keyboardType="number-pad"
            style={styles.input}
            maxLength={6}
          />
        </View>

        <View style={{ height: 12 }} />

        <Pressable onPress={resend} disabled={loading || cooldown > 0} style={styles.linkBtn}>
          {loading ? (
            <ActivityIndicator />
          ) : (
            <Text style={styles.linkText}>{cooldown > 0 ? `Gửi lại OTP (${cooldown}s)` : "Gửi lại OTP"}</Text>
          )}
        </Pressable>

        <View style={{ flex: 1 }} />

        <Pressable onPress={continueNext} disabled={!canContinue} style={[styles.primaryBtn, !canContinue && styles.primaryBtnDisabled]}>
          <Text style={styles.primaryBtnText}>Tiếp tục</Text>
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
  input: { color: "white", fontSize: 16, letterSpacing: 4 },

  linkBtn: { paddingVertical: 8 },
  linkText: { color: "#1BE06A", fontWeight: "800" },

  primaryBtn: { height: 52, borderRadius: 12, backgroundColor: "#1BE06A", justifyContent: "center", alignItems: "center" },
  primaryBtnDisabled: { opacity: 0.55 },
  primaryBtnText: { color: "#062012", fontWeight: "900", fontSize: 16 },
});
