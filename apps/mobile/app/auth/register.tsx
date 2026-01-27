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

import { registerApi } from "../../services/auth.service";
import { saveAuth } from "../../services/auth.storage";

import { colors } from "../../components/styles";
import { registerStyles } from "../../components/styles/auth/register.styles";

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [accepted, setAccepted] = useState(false);

  const canSubmit = useMemo(() => {
    return (
      name.trim().length > 0 &&
      email.trim().length > 0 &&
      password.length >= 6 &&
      password === confirm &&
      accepted &&
      !loading
    );
  }, [name, email, password, confirm, accepted, loading]);

  const submit = async () => {
    try {
      setLoading(true);
      const data = await registerApi({
        name: name.trim(),
        email: email.trim(),
        password,
      });
      await saveAuth(data.token, data.user);
      router.replace("/(tabs)");
    } catch (e: any) {
      Alert.alert("Đăng ký thất bại", e?.message ?? "Có lỗi xảy ra");
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
          contentContainerStyle={registerStyles.container}
          keyboardShouldPersistTaps="handled"
        >

          <Text style={registerStyles.bigTitle}>Đăng Ký Tài Khoản</Text>
          <Text style={registerStyles.subtitle}>
            Bắt đầu quản lý tài chính thông minh ngay hôm nay.
          </Text>

          <View style={registerStyles.card}>
            {/* Name */}
            <Text style={registerStyles.label}>Họ và tên</Text>
            <View style={registerStyles.inputWrap}>
              <TextInput
                placeholder="Nhập họ và tên"
                placeholderTextColor={colors.muted2}
                value={name}
                onChangeText={setName}
                style={registerStyles.input}
              />
            </View>

            {/* Email */}
            <Text style={[registerStyles.label, { marginTop: 12 }]}>Email</Text>
            <View style={registerStyles.inputWrap}>
              <TextInput
                placeholder="example@gmail.com"
                placeholderTextColor={colors.muted2}
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                style={registerStyles.input}
              />
            </View>

            {/* Password */}
            <Text style={[registerStyles.label, { marginTop: 12 }]}>Mật khẩu</Text>
            <View style={registerStyles.inputWrap}>
              <TextInput
                placeholder="••••••••"
                placeholderTextColor={colors.muted2}
                secureTextEntry={!showPass}
                value={password}
                onChangeText={setPassword}
                style={registerStyles.input}
              />
              <Pressable onPress={() => setShowPass(v => !v)}>
                <Ionicons
                  name={showPass ? "eye-off-outline" : "eye-outline"}
                  size={18}
                  color={colors.muted}
                />
              </Pressable>
            </View>

            {/* Confirm */}
            <Text style={[registerStyles.label, { marginTop: 12 }]}>
              Xác nhận mật khẩu
            </Text>
            <View style={registerStyles.inputWrap}>
              <TextInput
                placeholder="••••••••"
                placeholderTextColor={colors.muted2}
                secureTextEntry={!showPass}
                value={confirm}
                onChangeText={setConfirm}
                style={registerStyles.input}
              />
              <Pressable onPress={() => setShowPass(v => !v)}>
                <Ionicons
                  name={showPass ? "eye-off-outline" : "eye-outline"}
                  size={18}
                  color={colors.muted}
                />
              </Pressable>
            </View>

            {/* Terms */}
            <View style={registerStyles.checkboxRow}>
              <Switch value={accepted} onValueChange={setAccepted} />
              <Text style={registerStyles.checkboxText}>
                Tôi đồng ý với{" "}
                <Text style={registerStyles.linkInline}>Điều khoản</Text> &{" "}
                <Text style={registerStyles.linkInline}>Chính sách bảo mật</Text>
              </Text>
            </View>

            {/* Submit */}
            <Pressable
              onPress={submit}
              disabled={!canSubmit}
              style={[
                registerStyles.primaryBtn,
                !canSubmit && registerStyles.primaryBtnDisabled,
                { marginTop: 16 },
              ]}
            >
              {loading ? (
                <ActivityIndicator />
              ) : (
                <Text style={registerStyles.primaryBtnText}>Đăng ký</Text>
              )}
            </Pressable>

            {/* Divider */}
            <View style={registerStyles.dividerRow}>
              <View style={registerStyles.dividerLine} />
              <Text style={registerStyles.dividerText}>HOẶC</Text>
              <View style={registerStyles.dividerLine} />
            </View>

            {/* Google */}
            <Pressable style={registerStyles.googleBtn}>
              <Ionicons name="logo-google" size={18} color="#DB4437" />
              <Text style={registerStyles.googleText}>
                Đăng ký bằng Google
              </Text>
            </Pressable>

            <Text style={registerStyles.footerText}>
              Bạn đã có tài khoản?{" "}
              <Link href="/auth/login" style={registerStyles.link}>
                Đăng nhập ngay
              </Link>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
