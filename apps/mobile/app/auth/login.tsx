import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Link, router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import { loginApi } from "../../services/auth.service";
import { saveAuth } from "../../services/auth.storage";

import { colors } from "../../components/styles";
import { loginStyles } from "../../components/styles/auth/login.styles";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(() => {
    return email.trim().length > 0 && password.length >= 6 && !loading;
  }, [email, password, loading]);

  const submit = async () => {
    try {
      setLoading(true);
      const data = await loginApi({
        email: email.trim(),
        password,
      });
      await saveAuth(data.token, data.user);
      router.replace("/(tabs)");
    } catch (e: any) {
      Alert.alert("Đăng nhập thất bại", e?.message ?? "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={[colors.bg0, colors.bg0, colors.bg1]}
      style={{ flex: 1 }}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.select({ ios: "padding", android: undefined })}
      >
        <ScrollView
          contentContainerStyle={loginStyles.container}
          keyboardShouldPersistTaps="handled"
        >
          {/* Brand */}
          <View style={loginStyles.brandRow}>
            <View style={loginStyles.brandIcon}>
              <Ionicons name="wallet-outline" size={20} color={colors.text} />
            </View>
            <Text style={loginStyles.brandText}>FinanceMate</Text>
          </View>

          <Text style={loginStyles.title}>Đăng nhập</Text>
          <Text style={loginStyles.subtitle}>
            Quản lý chi tiêu, ngân sách và mục tiêu tài chính của bạn một cách khoa học.
          </Text>

          <View style={loginStyles.card}>
            {/* Email */}
            <Text style={loginStyles.label}>Email</Text>
            <View style={loginStyles.inputWrap}>
              <Ionicons name="mail-outline" size={18} color={colors.muted} />
              <TextInput
                placeholder="you@example.com"
                placeholderTextColor={colors.muted2}
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                style={loginStyles.input}
              />
            </View>

            {/* Password */}
            <Text style={[loginStyles.label, { marginTop: 12 }]}>Mật khẩu</Text>
            <View style={loginStyles.inputWrap}>
              <Ionicons name="lock-closed-outline" size={18} color={colors.muted} />
              <TextInput
                placeholder="Tối thiểu 6 ký tự"
                placeholderTextColor={colors.muted2}
                secureTextEntry={!showPass}
                value={password}
                onChangeText={setPassword}
                style={loginStyles.input}
                onSubmitEditing={() => canSubmit && submit()}
              />
              <Pressable
                onPress={() => setShowPass((v) => !v)}
                style={loginStyles.iconBtn}
              >
                <Ionicons
                  name={showPass ? "eye-off-outline" : "eye-outline"}
                  size={18}
                  color={colors.muted}
                />
              </Pressable>
            </View>

            {/* Helper */}
            <View style={loginStyles.rowBetween}>
              <Text style={loginStyles.helper}>
                {password.length > 0 && password.length < 6
                  ? "Mật khẩu quá ngắn."
                  : " "}
              </Text>
              <Link href="/auth/forgot" style={loginStyles.linkMuted}>
                Quên mật khẩu?
              </Link>
            </View>

            {/* Submit */}
            <Pressable
              onPress={submit}
              disabled={!canSubmit}
              style={({ pressed }) => [
                loginStyles.primaryBtn,
                !canSubmit && loginStyles.primaryBtnDisabled,
                pressed && canSubmit && { transform: [{ scale: 0.98 }] },
              ]}
            >
              {loading ? (
                <ActivityIndicator />
              ) : (
                <Text style={loginStyles.primaryBtnText}>Đăng nhập</Text>
              )}
            </Pressable>

            {/* Divider */}
            <View style={loginStyles.dividerRow}>
              <View style={loginStyles.dividerLine} />
              <Text style={loginStyles.dividerText}>hoặc</Text>
              <View style={loginStyles.dividerLine} />
            </View>

            {/* Google */}
            <Pressable style={loginStyles.secondaryBtn}>
              <Ionicons name="logo-google" size={18} color={colors.text} />
              <Text style={loginStyles.secondaryBtnText}>
                Tiếp tục với Google
              </Text>
            </Pressable>

            <Text style={loginStyles.footerText}>
              Chưa có tài khoản?{" "}
              <Link href="/auth/register" style={loginStyles.link}>
                Đăng ký
              </Link>
            </Text>
          </View>

          <Text style={loginStyles.disclaimer}>
            Bằng việc đăng nhập, bạn đồng ý với Điều khoản & Chính sách bảo mật.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
