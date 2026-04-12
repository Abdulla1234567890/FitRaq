import { Platform } from "react-native";

export const API_BASE_URL = Platform.select({
  android: "https://fitraq-backend.onrender.com",
  default: "https://fitraq-backend.onrender.com",
});
