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
  Switch,
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

  const [enable2FA, setEnable2FA] = useState(false);
  const [remember, setRemember] = useState(false);

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
    <LinearGradient colors={[colors.bg0, colors.bg0, colors.bg1]} style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.select({ ios: "padding", android: undefined })}
      >
        <ScrollView
          contentContainerStyle={loginStyles.container}
          keyboardShouldPersistTaps="handled"
        >
          

          {/* Logo */}
          <View style={loginStyles.logoWrap}>
            <View style={loginStyles.logoBox}>
              <Ionicons name="wallet-outline" size={32} color="#0B1220" />
            </View>
            <Text style={loginStyles.welcomeTitle}>Chào mừng trở lại</Text>
            <Text style={loginStyles.welcomeSubtitle}>
              Vui lòng đăng nhập để quản lý tài chính của bạn
            </Text>
          </View>

          {/* Card */}
          <View style={loginStyles.card}>
            {/* Email */}
            <Text style={loginStyles.label}>Email hoặc Số điện thoại</Text>
            <View style={loginStyles.inputWrap}>
              <TextInput
                placeholder="email@example.com"
                placeholderTextColor={colors.muted2}
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                style={loginStyles.input}
              />
            </View>

            {/* Password */}
            <Text style={[loginStyles.label, { marginTop: 12 }]}>Mật khẩu</Text>
            <View style={loginStyles.inputWrap}>
              <TextInput
                placeholder="Nhập mật khẩu"
                placeholderTextColor={colors.muted2}
                secureTextEntry={!showPass}
                value={password}
                onChangeText={setPassword}
                style={loginStyles.input}
              />
              <Pressable onPress={() => setShowPass(v => !v)}>
                <Ionicons
                  name={showPass ? "eye-off-outline" : "eye-outline"}
                  size={18}
                  color={colors.muted}
                />
              </Pressable>
            </View>
            <View style={loginStyles.toggleRow}>
              <View style={loginStyles.toggleLeft}>
                <Ionicons name="shield-checkmark-outline" size={18} color="#1FEE6D" />
                <Text style={loginStyles.toggleText}>Bật bảo mật 2 lớp (2FA)</Text>
              </View>
              <Switch value={enable2FA} onValueChange={setEnable2FA} />
            </View>
            {/* Remember + Forgot (cùng hàng) */}
              <View style={loginStyles.rowBetween}>
                <View style={loginStyles.rememberInline}>
                  <Switch value={remember} onValueChange={setRemember} />
                  <Text style={loginStyles.rememberText}>Ghi nhớ đăng nhập</Text>
                </View>

                <Link href="/auth/forgot-password" style={loginStyles.linkMuted}>
                  Quên mật khẩu?
                </Link>
              </View> 

            {/* Submit */}
            <Pressable
              onPress={submit}
              disabled={!canSubmit}
              style={[
                loginStyles.primaryBtn,
                !canSubmit && loginStyles.primaryBtnDisabled,
                { marginTop: 16 },
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
              <Text style={loginStyles.dividerText}>Hoặc</Text>
              <View style={loginStyles.dividerLine} />
            </View>

            {/* Google */}
            <Pressable style={loginStyles.googleBtn}>
              <Ionicons name="logo-google" size={18} color="#DB4437" />
              <Text style={loginStyles.googleText}>Đăng nhập với Google</Text>
            </Pressable>

            <Text style={loginStyles.footerText}>
              Bạn chưa có tài khoản?{" "}
              <Link href="/auth/register" style={loginStyles.link}>
                Đăng ký ngay
              </Link>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
