import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY_TOKEN = "pem_token";
const KEY_USER = "pem_user";

export async function saveAuth(token: string, user: any) {
  await AsyncStorage.multiSet([
    [KEY_TOKEN, token],
    [KEY_USER, JSON.stringify(user)],
  ]);
}

export async function getToken() {
  return AsyncStorage.getItem(KEY_TOKEN);
}

export async function clearAuth() {
  await AsyncStorage.multiRemove([KEY_TOKEN, KEY_USER]);
}
