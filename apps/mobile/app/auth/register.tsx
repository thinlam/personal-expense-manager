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

import { registerApi } from "../../services/auth.service";
import { saveAuth } from "../../services/auth.storage";

import { colors } from "../../components/styles";
import { registerStyles } from "../../components/styles/auth/register.styles";

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(() => {
    return (
      name.trim().length > 0 &&
      email.trim().length > 0 &&
      password.length >= 6 &&
      !loading
    );
  }, [name, email, password, loading]);

  const submit = async () => {
    try {
      setLoading(true);
      const data = await registerApi({
        name: name.trim(),
        email: email.trim(),
        password,
      });

      // Auto-login sau đăng ký
      await saveAuth(data.token, data.user);
      router.replace("/(tabs)");
    } catch (e: any) {
      Alert.alert("Đăng ký thất bại", e?.message ?? "Có lỗi xảy ra");
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
          contentContainerStyle={registerStyles.container}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={registerStyles.title}>Tạo tài khoản</Text>
          <Text style={registerStyles.subtitle}>
            Bắt đầu quản lý chi tiêu và mục tiêu tài chính của bạn một cách khoa học.
          </Text>

          <View style={registerStyles.card}>
            {/* Name */}
            <Text style={registerStyles.label}>Họ và tên</Text>
            <View style={registerStyles.inputWrap}>
              <Ionicons name="person-outline" size={18} color={colors.muted} />
              <TextInput
                placeholder="Nguyễn Văn A"
                placeholderTextColor={colors.muted2}
                value={name}
                onChangeText={setName}
                style={registerStyles.input}
              />
            </View>

            {/* Email */}
            <Text style={[registerStyles.label, { marginTop: 12 }]}>Email</Text>
            <View style={registerStyles.inputWrap}>
              <Ionicons name="mail-outline" size={18} color={colors.muted} />
              <TextInput
                placeholder="you@example.com"
                placeholderTextColor={colors.muted2}
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                style={registerStyles.input}
              />
            </View>

            {/* Password */}
            <Text style={[registerStyles.label, { marginTop: 12 }]}>Mật khẩu</Text>
            <View style={registerStyles.inputWrap}>
              <Ionicons name="lock-closed-outline" size={18} color={colors.muted} />
              <TextInput
                placeholder="Tối thiểu 6 ký tự"
                placeholderTextColor={colors.muted2}
                secureTextEntry={!showPass}
                value={password}
                onChangeText={setPassword}
                style={registerStyles.input}
              />
              <Pressable
                onPress={() => setShowPass((v) => !v)}
                style={registerStyles.iconBtn}
              >
                <Ionicons
                  name={showPass ? "eye-off-outline" : "eye-outline"}
                  size={18}
                  color={colors.muted}
                />
              </Pressable>
            </View>

            {password.length > 0 && password.length < 6 && (
              <Text style={registerStyles.helper}>
                Mật khẩu phải có ít nhất 6 ký tự.
              </Text>
            )}

            {/* Submit */}
            <Pressable
              onPress={submit}
              disabled={!canSubmit}
              style={({ pressed }) => [
                registerStyles.primaryBtn,
                !canSubmit && registerStyles.primaryBtnDisabled,
                pressed && canSubmit && { transform: [{ scale: 0.98 }] },
              ]}
            >
              {loading ? (
                <ActivityIndicator />
              ) : (
                <Text style={registerStyles.primaryBtnText}>
                  Tạo tài khoản
                </Text>
              )}
            </Pressable>

            <Text style={registerStyles.footerText}>
              Đã có tài khoản?{" "}
              <Link href="/auth/login" style={registerStyles.link}>
                Đăng nhập
              </Link>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
