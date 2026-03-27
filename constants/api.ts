import { Platform } from "react-native";

export const API_BASE_URL = Platform.select({
  android: "http://192.168.1.70:5001",
  default: "http://192.168.1.70:5001",
});
