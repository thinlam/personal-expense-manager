import React, { useEffect, useMemo, useRef, useState } from "react";
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
import { forgotPasswordApi } from "../../services/auth.service";

export default function VerifyOtpScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();

  const inputRef = useRef<TextInput>(null);

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(60);

  useEffect(() => {
    const t = setInterval(() => {
      setCooldown((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
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

  const goForgot = () => {
    // Replace để tránh back quay lại verify-otp
    router.replace({
      pathname: "/auth/forgot-password",
    });
  };

  const resend = async () => {
    if (!email) return;
    if (cooldown > 0 || loading) return;

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

  const focusInput = () => inputRef.current?.focus();

  return (
    <SafeAreaView style={styles.safe}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.container}>
        {/* Header như hình */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.headerBtn} hitSlop={10}>
            <Ionicons name="chevron-back" size={22} color="white" />
          </Pressable>

          <Text style={styles.headerTitle}>Xác minh OTP</Text>

          <View style={styles.headerBtn} />
        </View>

        <View style={{ height: 14 }} />

        <Text style={styles.title}>Nhập mã xác minh</Text>
        <Text style={styles.subTitle}>
          Mã xác minh gồm 6 chữ số đã được gửi{"\n"}đến email{" "}
          <Text style={styles.emailText}>{String(email ?? "")}</Text>
        </Text>

        <View style={{ height: 22 }} />

        {/* OTP Boxes */}
        <Pressable onPress={focusInput} style={styles.otpRow}>
          {Array.from({ length: 6 }).map((_, i) => {
            const digit = otp[i] ?? "";
            const isActive = i === otp.length && otp.length < 6;
            const isFilled = digit.length > 0;

            return (
              <View
                key={i}
                style={[
                  styles.otpBox,
                  isFilled && styles.otpBoxFilled,
                  isActive && styles.otpBoxActive,
                ]}
              >
                <Text style={styles.otpDigit}>{digit}</Text>
              </View>
            );
          })}

          {/* Hidden input để gõ số, UI hiển thị bằng 6 ô */}
          <TextInput
            ref={inputRef}
            value={otp}
            onChangeText={(t) => setOtp(t.replace(/[^\d]/g, "").slice(0, 6))}
            keyboardType="number-pad"
            maxLength={6}
            autoFocus
            textContentType="oneTimeCode"
            style={styles.hiddenInput}
          />
        </Pressable>

        <View style={{ height: 18 }} />

        {/* Pill countdown như hình */}
        <View style={styles.timerPill}>
          <Ionicons name="time-outline" size={16} color="#1BE06A" />
          <Text style={styles.timerText}>
            {cooldown > 0 ? `${cooldown} giây` : "Bạn có thể gửi lại"}
          </Text>
        </View>

        <View style={{ height: 14 }} />

        {/* "Bạn chưa nhận được mã? Gửi lại" */}
        <Text style={styles.resendLine}>
          Bạn chưa nhận được mã?{" "}
          <Text
            onPress={resend}
            style={[
              styles.resendText,
              (cooldown > 0 || loading) && styles.resendTextDisabled,
            ]}
          >
            Gửi lại
          </Text>
        </Text>

        {/* Nút trở về forgot_password */}
        <Pressable onPress={goForgot} disabled={loading} style={styles.backForgotBtn}>
          <Text style={styles.backForgotText}>Trở về Quên mật khẩu</Text>
        </Pressable>

        <View style={{ flex: 1 }} />

        {/* Confirm button */}
        <Pressable
          onPress={continueNext}
          disabled={!canContinue}
          style={[styles.primaryBtn, !canContinue && styles.primaryBtnDisabled]}
        >
          {loading ? <ActivityIndicator /> : <Text style={styles.primaryBtnText}>Xác nhận</Text>}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#071C14" },
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 18 },

  header: {
    height: 44,
    flexDirection: "row",
    alignItems: "center",
  },
  headerBtn: { width: 44, height: 44, justifyContent: "center" },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    color: "rgba(255,255,255,0.9)",
    fontWeight: "800",
  },

  title: { color: "white", fontSize: 28, fontWeight: "900", marginTop: 2 },
  subTitle: { color: "rgba(255,255,255,0.65)", marginTop: 10, lineHeight: 20 },
  emailText: { color: "rgba(255,255,255,0.9)", fontWeight: "900" },

  otpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  otpBox: {
    flex: 1,
    height: 56,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    alignItems: "center",
    justifyContent: "center",
  },
  otpBoxActive: {
    borderColor: "rgba(27,224,106,0.55)",
    backgroundColor: "rgba(27,224,106,0.06)",
  },
  otpBoxFilled: {
    borderColor: "rgba(255,255,255,0.16)",
  },
  otpDigit: {
    color: "white",
    fontSize: 20,
    fontWeight: "900",
  },
  hiddenInput: {
    position: "absolute",
    opacity: 0,
    width: 1,
    height: 1,
  },

  timerPill: {
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    height: 36,
    borderRadius: 999,
    backgroundColor: "rgba(27,224,106,0.10)",
    borderWidth: 1,
    borderColor: "rgba(27,224,106,0.20)",
  },
  timerText: { color: "rgba(27,224,106,0.95)", fontWeight: "900" },

  resendLine: { textAlign: "center", color: "rgba(255,255,255,0.55)" },
  resendText: { color: "#1BE06A", fontWeight: "900" },
  resendTextDisabled: { opacity: 0.5 },

  backForgotBtn: {
    alignSelf: "center",
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  backForgotText: { color: "rgba(255,255,255,0.7)", fontWeight: "800" },

  primaryBtn: {
    height: 56,
    borderRadius: 14,
    backgroundColor: "#1BE06A",
    justifyContent: "center",
    alignItems: "center",
  },
  primaryBtnDisabled: { opacity: 0.55 },
  primaryBtnText: { color: "#062012", fontWeight: "900", fontSize: 16 },
});
