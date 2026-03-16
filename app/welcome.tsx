import { Image } from "expo-image";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.background}>
        <View style={styles.topFade} />
      </View>

      <View style={styles.container}>
        <View style={styles.illustrationCard}>
          <Image
            contentFit="contain"
            source={require("@/assets/images/Onbording_2.png")}
            style={styles.illustrationImage}
          />
        </View>

        <View style={styles.contentBlock}>
          <View style={styles.progressTrack}>
            <View style={styles.progressFill} />
          </View>

          <Text style={styles.title}>Help us map your journey!</Text>

          <Pressable
            onPress={() => router.push("/onboarding")}
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>→</Text>
          </Pressable>
        </View>

        <Pressable
          onPress={() => router.replace("/(tabs)")}
          style={styles.skipButton}
        >
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F2EEE8",
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#F2EEE8",
  },
  topFade: {
    position: "absolute",
    top: -100,
    left: 40,
    right: 40,
    height: 180,
    borderRadius: 90,
    backgroundColor: "#FFFFFF",
    opacity: 0.4,
  },
  container: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 24,
  },
  illustrationCard: {
    width: "100%",
    maxWidth: 340,
    height: 430,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  illustrationImage: {
    width: "100%",
    height: "100%",
  },
  contentBlock: {
    alignItems: "center",
    marginTop: 8,
    gap: 18,
  },
  progressTrack: {
    width: 136,
    height: 10,
    borderRadius: 999,
    backgroundColor: "#D8D8D8",
    overflow: "hidden",
  },
  progressFill: {
    width: "30%",
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#2E43C8",
  },
  title: {
    color: "#1B140F",
    fontSize: 30,
    lineHeight: 34,
    fontWeight: "600",
    textAlign: "center",
    maxWidth: 280,
  },
  primaryButton: {
    justifyContent: "center",
    alignItems: "center",
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  primaryButtonText: {
    color: "#2E43C8",
    fontSize: 34,
    lineHeight: 34,
    marginTop: -4,
  },
  skipButton: {
    marginTop: "auto",
    alignSelf: "flex-end",
    backgroundColor: "#FFFFFF",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  skipText: {
    color: "#B7B3C2",
    fontSize: 12,
    fontWeight: "700",
  },
});
