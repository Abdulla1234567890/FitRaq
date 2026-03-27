import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
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
            <View style={styles.brandSection}>
              <Image
                contentFit="contain"
                source={require("@/assets/images/FITRAQ2.png")}
                style={styles.illustrationImage}
              />
            </View>

            <View style={styles.formWrap}>
              <View style={styles.form}>
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Username</Text>
                  <View style={styles.inputShell}>
                    <MaterialCommunityIcons
                      color="#2F42C7"
                      name="account-circle-outline"
                      size={20}
                    />
                    <TextInput
                      autoCapitalize="none"
                      onChangeText={setUsername}
                      placeholder="Enter Username"
                      placeholderTextColor="#9B948B"
                      style={styles.input}
                      value={username}
                    />
                  </View>
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Password</Text>
                  <View style={styles.inputShell}>
                    <MaterialCommunityIcons
                      color="#2F42C7"
                      name="shield-lock-outline"
                      size={20}
                    />
                    <TextInput
                      autoCapitalize="none"
                      onChangeText={setPassword}
                      placeholder="Enter Password"
                      placeholderTextColor="#9B948B"
                      secureTextEntry={!showPassword}
                      style={styles.input}
                      value={password}
                    />
                    <Pressable
                      onPress={togglePassword}
                      style={styles.trailingAction}
                    >
                      <MaterialCommunityIcons
                        color="#2F42C7"
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

                <View style={styles.progressTrack}>
                  <View style={styles.progressFill} />
                </View>
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
    justifyContent: "space-between",
    paddingHorizontal: 22,
    paddingVertical: 28,
  },
  screenCard: {
    flex: 1,
    backgroundColor: "#F4EFE8",
    borderRadius: 32,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  brandSection: {
    paddingTop: 8,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  illustrationImage: {
    width: 270,
    height: 150,
  },
  formWrap: {
    flex: 1,
    justifyContent: "flex-start",
    paddingTop: 58,
  },
  form: {
    gap: 30,
  },
  fieldGroup: {
    gap: 14,
  },
  label: {
    color: "#1F160F",
    fontSize: 17,
    fontWeight: "500",
  },
  inputShell: {
    minHeight: 54,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "rgba(127, 142, 87, 0.16)",
  },
  input: {
    flex: 1,
    color: "#1F160F",
    fontSize: 15,
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
    marginTop: 10,
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
  progressTrack: {
    width: "100%",
    height: 10,
    borderRadius: 999,
    backgroundColor: "#E4DFD5",
    overflow: "hidden",
    marginTop: 18,
  },
  progressFill: {
    width: "82%",
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#2F42C7",
  },
});
