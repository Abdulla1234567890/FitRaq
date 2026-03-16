import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PATH_OPTIONS = [
  {
    id: "running",
    image: require("@/assets/images/Running.png"),
    label: "Running",
    tint: "#FFFFFF",
  },
  {
    id: "walking",
    image: require("@/assets/images/Walking.png"),
    label: "Walking",
    tint: "#CFC7F5",
  },
  {
    id: "cycling",
    image: require("@/assets/images/Cycling.png"),
    label: "Cycling",
    tint: "#B3B3B3",
  },
  {
    id: "hiking",
    image: require("@/assets/images/Hiking.png"),
    label: "Hiking",
    tint: "#C7E69C",
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
            <MaterialIcons color="#2F42C7" name="menu" size={34} />
          </Pressable>

          <Text style={styles.headerTitle}>Journey</Text>

          <View style={styles.headerSpacer} />
        </View>

        <Text style={styles.pageTitle}>Choose Your Path</Text>

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
              <Text style={styles.pathLabel}>{option.label}</Text>
              <Image
                contentFit="contain"
                source={option.image}
                style={styles.pathImage}
              />
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
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: "#2F42C7",
    fontSize: 24,
    fontWeight: "500",
  },
  headerSpacer: {
    width: 44,
  },
  pageTitle: {
    color: "#1B140F",
    fontSize: 36,
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 28,
  },
  cardList: {
    gap: 18,
  },
  pathCard: {
    height: 125,
    borderRadius: 22,
    paddingLeft: 24,
    paddingRight: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  pathLabel: {
    color: "#1B140F",
    fontSize: 18,
    fontWeight: "500",
  },
  pathImage: {
    width: 124,
    height: 120,
  },
});
