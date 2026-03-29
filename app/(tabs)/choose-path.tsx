import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PATH_OPTIONS = [
  {
    id: "running",
    icon: "directions-run",
    label: "Running",
    accent: "#2F42C7",
    tint: "#EEF1FF",
  },
  {
    id: "walking",
    icon: "directions-walk",
    label: "Walking",
    accent: "#6A73D6",
    tint: "#F1F0FF",
  },
  {
    id: "cycling",
    icon: "pedal-bike",
    label: "Cycling",
    accent: "#4C72BA",
    tint: "#EEF5FF",
  },
  {
    id: "hiking",
    icon: "terrain",
    label: "Hiking",
    accent: "#7D9B52",
    tint: "#F1F7E8",
  },
];

export default function ChoosePathScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <Pressable
            onPress={async () => {
              await Haptics.selectionAsync();
              router.back();
            }}
            style={styles.iconButton}
          >
            <MaterialIcons color="#2F42C7" name="arrow-back-ios-new" size={22} />
          </Pressable>

          <Text style={styles.headerTitle}>Journey</Text>

          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.introCard}>
          <Text style={styles.eyebrow}>START A SESSION</Text>
          <Text style={styles.pageTitle}>Choose your path</Text>
          <Text style={styles.pageSubtitle}>Pick the type of journey first, then we&apos;ll show matching routes.</Text>
        </View>

        <View style={styles.cardList}>
          {PATH_OPTIONS.map((option) => (
            <Pressable
              key={option.id}
              onPress={async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push({
                  pathname: "/(tabs)/choose-trail",
                  params: {
                    type: option.id,
                  },
                });
              }}
              style={[styles.pathCard, { backgroundColor: option.tint }]}
            >
              <View style={styles.pathInfo}>
                <View style={[styles.pathAccent, { backgroundColor: option.accent }]} />
                <Text style={styles.pathLabel}>{option.label}</Text>
                <Text style={styles.pathMeta}>View routes</Text>
              </View>
              <View style={styles.pathIconWrap}>
                <MaterialIcons
                  color={option.accent}
                  name={option.icon as keyof typeof MaterialIcons.glyphMap}
                  size={48}
                />
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F4EFE8",
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 28,
    gap: 18,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
  },
  headerTitle: {
    color: "#2F42C7",
    fontSize: 24,
    fontWeight: "500",
  },
  headerSpacer: {
    width: 44,
  },
  introCard: {
    backgroundColor: "#FBF9F5",
    borderRadius: 26,
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 8,
  },
  eyebrow: {
    color: "#8F867F",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.1,
  },
  pageTitle: {
    color: "#1B140F",
    fontSize: 32,
    fontWeight: "600",
  },
  pageSubtitle: {
    color: "#756C65",
    fontSize: 14,
    lineHeight: 21,
  },
  cardList: {
    gap: 14,
  },
  pathCard: {
    height: 125,
    borderRadius: 24,
    paddingLeft: 20,
    paddingRight: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    borderWidth: 1,
    borderColor: "rgba(47,66,199,0.08)",
  },
  pathInfo: {
    flex: 1,
    gap: 6,
  },
  pathAccent: {
    width: 38,
    height: 4,
    borderRadius: 999,
  },
  pathLabel: {
    color: "#1B140F",
    fontSize: 22,
    fontWeight: "600",
  },
  pathMeta: {
    color: "#756C65",
    fontSize: 13,
    fontWeight: "600",
  },
  pathIconWrap: {
    width: 88,
    height: 88,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
});
