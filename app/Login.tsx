import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleContinue = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.replace("/welcome");
  };

  const togglePassword = async () => {
    await Haptics.selectionAsync();
    setShowPassword((value) => !value);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.screenCard}>
            <View style={styles.illustrationWrap}>
              <Image
                contentFit="contain"
                source={require("@/assets/images/FITRAQ2.png")}
                style={styles.illustrationImage}
              />
            </View>

            <View style={styles.form}>
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Username</Text>
                <View style={styles.inputShell}>
                  <MaterialCommunityIcons
                    color="#FFFFFF"
                    name="account-circle-outline"
                    size={20}
                  />
                  <TextInput
                    autoCapitalize="none"
                    onChangeText={setUsername}
                    placeholder="Enter Username"
                    placeholderTextColor="#C9D1FF"
                    style={styles.input}
                    value={username}
                  />
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.inputShell}>
                  <MaterialCommunityIcons
                    color="#FFFFFF"
                    name="shield-lock-outline"
                    size={20}
                  />
                  <TextInput
                    autoCapitalize="none"
                    onChangeText={setPassword}
                    placeholder="Enter Password"
                    placeholderTextColor="#C9D1FF"
                    secureTextEntry={!showPassword}
                    style={styles.input}
                    value={password}
                  />
                  <Pressable
                    onPress={togglePassword}
                    style={styles.trailingAction}
                  >
                    <MaterialCommunityIcons
                      color="#FFFFFF"
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={18}
                    />
                  </Pressable>
                </View>
              </View>

              <View style={styles.registerRow}>
                <Text style={styles.registerCopy}>Not a Member?</Text>
                <Pressable>
                  <Text style={styles.registerLink}>Register</Text>
                </Pressable>
              </View>

              <Pressable onPress={handleContinue} style={styles.ctaButton}>
                <MaterialCommunityIcons
                  color="#2F42C7"
                  name="arrow-right"
                  size={30}
                />
              </Pressable>

              <View style={styles.progressTrack}>
                <View style={styles.progressFill} />
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F4EFE8",
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 22,
    paddingVertical: 28,
  },
  screenCard: {
    backgroundColor: "#F4EFE8",
    borderRadius: 32,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  illustrationWrap: {
    height: 250,
    marginBottom: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  illustrationImage: {
    width: 320,
    height: 220,
  },
  form: {
    gap: 18,
  },
  fieldGroup: {
    gap: 10,
  },
  label: {
    color: "#1F160F",
    fontSize: 17,
    fontWeight: "500",
  },
  inputShell: {
    minHeight: 54,
    borderRadius: 999,
    backgroundColor: "#2F42C7",
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    shadowColor: "#2F42C7",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
  input: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 14,
    paddingVertical: 14,
  },
  trailingAction: {
    paddingLeft: 4,
    paddingVertical: 6,
  },
  registerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  registerCopy: {
    color: "#1F160F",
    fontSize: 14,
  },
  registerLink: {
    color: "#1F160F",
    fontSize: 14,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  ctaButton: {
    width: 68,
    height: 68,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 34,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000000",
    shadowOpacity: 0.16,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
    marginTop: 6,
  },
  progressTrack: {
    width: "100%",
    height: 10,
    borderRadius: 999,
    backgroundColor: "#D8D8D8",
    overflow: "hidden",
    marginTop: 8,
  },
  progressFill: {
    width: "82%",
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#2F42C7",
  },
});
