import { Platform } from "react-native";

export const API_BASE_URL = Platform.select({
  android: "http://192.168.1.228:5001",
  default: "http://192.168.1.228:5001",
});
