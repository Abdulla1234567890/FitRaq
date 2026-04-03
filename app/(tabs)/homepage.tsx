import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const WEEK_BARS = [
  { day: "M", value: 0.4 },
  { day: "T", value: 0.48 },
  { day: "W", value: 0.63 },
  { day: "T", value: 0.88, active: true },
  { day: "F", value: 0.56 },
  { day: "S", value: 0.34 },
  { day: "S", value: 0.24 },
] as const;

export default function HomePageScreen() {
  const params = useLocalSearchParams<{ name?: string }>();
  const firstName = useMemo(() => {
    const rawName = Array.isArray(params.name) ? params.name[0] : params.name;
    return rawName?.trim() || "Janna";
  }, [params.name]);

  const handleOpenMenu = async () => {
    await Haptics.selectionAsync();
  };

  const handleProfile = async () => {
    await Haptics.selectionAsync();
    router.push("/(tabs)/profile");
  };

  const handleOpenFocus = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/(tabs)/activity");
  };

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <Pressable onPress={handleOpenMenu} style={styles.iconButton}>
            <MaterialIcons color="#1E1A17" name="menu" size={32} />
          </Pressable>

          <Text style={styles.headerTitle}>Fitraq</Text>

          <Pressable onPress={handleProfile} style={styles.avatar}>
            <Text style={styles.avatarText}>
              {firstName.slice(0, 2).toUpperCase()}
            </Text>
          </Pressable>
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={styles.heroCopy}>
              <Text style={styles.heroEyebrow}>TODAY&apos;S XP</Text>
              <View style={styles.heroValueRow}>
                <Text style={styles.heroValue}>396</Text>
                <Text style={styles.heroValueUnit}>xp</Text>
              </View>
            </View>

            <View style={styles.levelCard}>
              <Text style={styles.levelValue}>12</Text>
              <Text style={styles.levelLabel}>TRAILBLAZER</Text>
            </View>
          </View>

          <View style={styles.heroProgressTrack}>
            <View style={styles.heroProgressFill} />
          </View>

          <View style={styles.heroBottomRow}>
            <Text style={styles.heroFootnote}>2,480 xp</Text>
            <Text style={styles.heroFootnote}>620 xp to Level 13</Text>
          </View>

          <View style={styles.heroMetricsRow}>
            <HeroMetric label="STEPS" value="6,625" />
            <HeroMetric label="DISTANCE" value="7.1 km" />
            <HeroMetric label="ACTIVE" value="42 min" />
          </View>
        </View>

        <View style={styles.insightRow}>
          <InsightCard
            accent="+8%"
            accentColor="#FF7B45"
            icon="local-fire-department"
            label="Calories"
            tone="warm"
            unit="kcal"
            value="320"
          />
          <InsightCard
            accent="Steady"
            accentColor="#2DBD5A"
            icon="monitor-heart"
            label="Active minutes"
            tone="cool"
            unit="min"
            value="42"
          />
        </View>

        <View style={styles.stepsCard}>
          <View style={styles.stepsTopRow}>
            <View>
              <Text style={styles.stepsEyebrow}>STEPS</Text>
              <Text style={styles.stepsValue}>6,625</Text>
              <Text style={styles.stepsSubcopy}>
                Daily goal <Text style={styles.stepsGoalAccent}>10,000</Text>
              </Text>
            </View>

            <Pressable onPress={handleOpenFocus} style={styles.thisWeekPill}>
              <Text style={styles.thisWeekText}>This week</Text>
            </Pressable>
          </View>

          <View style={styles.barChartRow}>
            {WEEK_BARS.map((bar, index) => (
              <View key={`${bar.day}-${index}`} style={styles.barChartItem}>
                <View
                  style={[
                    styles.barTrack,
                    bar.active ? styles.barTrackActive : undefined,
                  ]}
                >
                  <View
                    style={[
                      styles.barFill,
                      bar.active ? styles.barFillActive : undefined,
                      { height: `${Math.max(bar.value * 100, 14)}%` },
                    ]}
                  />
                </View>
                <Text
                  style={[
                    styles.barLabel,
                    bar.active ? styles.barLabelActive : undefined,
                  ]}
                >
                  {bar.day}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.nutritionCard}>
          <View style={styles.nutritionHeader}>
            <View>
              <Text style={styles.nutritionEyebrow}>TODAY&apos;S FUEL</Text>
              <Text style={styles.nutritionTitle}>1,640 kcal</Text>
              <Text style={styles.nutritionSubcopy}>of 2,000 kcal target</Text>
            </View>

            <Pressable
              onPress={async () => {
                await Haptics.selectionAsync();
                router.push("/(tabs)/nutrition");
              }}
              style={styles.nutritionBadge}
            >
              <Text style={styles.nutritionBadgeValue}>82%</Text>
              <Text style={styles.nutritionBadgeLabel}>logged</Text>
            </Pressable>
          </View>

          <View style={styles.nutritionMealsRow}>
            <MealStatusChip done label="Breakfast" />
            <MealStatusChip done label="Lunch" />
            <MealStatusChip label="Dinner" />
          </View>

          <View style={styles.nutritionFooterRow}>
            <View style={styles.nutritionMetaPill}>
              <MaterialIcons color="#FF7B45" name="local-cafe" size={15} />
              <Text style={styles.nutritionMetaText}>1 snack</Text>
            </View>

            <View style={styles.nutritionMetaPill}>
              <MaterialIcons
                color="#2DBD5A"
                name="check-circle-outline"
                size={15}
              />
              <Text style={styles.nutritionMetaText}>On track</Text>
            </View>

            <Pressable
              onPress={async () => {
                await Haptics.selectionAsync();
                router.push("/(tabs)/nutrition");
              }}
              style={styles.nutritionButton}
            >
              <Text style={styles.nutritionButtonText}>Open</Text>
            </Pressable>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

function HeroMetric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.heroMetricCard}>
      <Text style={styles.heroMetricValue}>{value}</Text>
      <Text style={styles.heroMetricLabel}>{label}</Text>
    </View>
  );
}

function InsightCard({
  accent,
  accentColor,
  icon,
  label,
  tone,
  unit,
  value,
}: {
  accent: string;
  accentColor: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  tone: "cool" | "warm";
  unit: string;
  value: string;
}) {
  return (
    <View style={styles.insightCard}>
      <View style={styles.insightTopRow}>
        <View
          style={[
            styles.insightIcon,
            tone === "warm" ? styles.insightIconWarm : styles.insightIconCool,
          ]}
        >
          <MaterialIcons
            color={tone === "warm" ? "#FF7B45" : "#2DBD5A"}
            name={icon}
            size={16}
          />
        </View>

        <View style={styles.insightAccentPill}>
          <Text style={[styles.insightAccentText, { color: accentColor }]}>
            {accent}
          </Text>
        </View>
      </View>

      <View style={styles.insightValueRow}>
        <Text style={styles.insightValue}>{value}</Text>
        <Text style={styles.insightUnit}>{unit}</Text>
      </View>
      <Text style={styles.insightLabel}>{label}</Text>

      <View style={styles.sparklineRow}>
        {[0.22, 0.3, 0.26, 0.46, 0.38, 0.54, 0.47, 0.58].map(
          (height, index) => (
            <View
              key={`${label}-${index}`}
              style={[
                styles.sparklineSegment,
                {
                  height: 18 + height * 20,
                  backgroundColor: tone === "warm" ? "#FF7B45" : "#62CB84",
                  opacity: index === 0 || index === 7 ? 0.6 : 1,
                },
              ]}
            />
          ),
        )}
      </View>
    </View>
  );
}

function MealStatusChip({
  done,
  label,
}: {
  done?: boolean;
  label: string;
}) {
  return (
    <View
      style={[
        styles.mealStatusChip,
        done ? styles.mealStatusChipDone : undefined,
      ]}
    >
      <View
        style={[
          styles.mealStatusDot,
          done ? styles.mealStatusDotDone : undefined,
        ]}
      >
        {done ? <MaterialIcons color="#FFFFFF" name="check" size={13} /> : null}
      </View>
      <Text
        style={[
          styles.mealStatusText,
          done ? styles.mealStatusTextDone : undefined,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F4EFE8",
  },
  content: {
    paddingHorizontal: 14,
    paddingTop: 22,
    paddingBottom: 28,
    gap: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: "#2F42C7",
    fontSize: 24,
    fontWeight: "700",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "rgba(47,66,199,0.14)",
  },
  avatarText: {
    color: "#2F42C7",
    fontSize: 14,
    fontWeight: "800",
  },
  heroCard: {
    borderRadius: 28,
    backgroundColor: "#2F42C7",
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 16,
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 14,
  },
  heroCopy: {
    flex: 1,
  },
  heroEyebrow: {
    color: "rgba(255,255,255,0.68)",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.9,
  },
  heroValueRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 4,
    marginTop: 2,
  },
  heroValue: {
    color: "#FFFFFF",
    fontSize: 50,
    lineHeight: 52,
    fontWeight: "800",
  },
  heroValueUnit: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 7,
  },
  levelCard: {
    minWidth: 98,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    paddingHorizontal: 12,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  levelValue: {
    color: "#FFD34D",
    fontSize: 30,
    fontWeight: "800",
    lineHeight: 30,
  },
  levelLabel: {
    color: "rgba(255,255,255,0.74)",
    fontSize: 10,
    fontWeight: "700",
    marginTop: 4,
  },
  heroProgressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.18)",
    overflow: "hidden",
  },
  heroProgressFill: {
    width: "56%",
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#FFD34D",
  },
  heroBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  heroFootnote: {
    color: "rgba(255,255,255,0.76)",
    fontSize: 12,
    fontWeight: "600",
  },
  heroMetricsRow: {
    flexDirection: "row",
    gap: 10,
  },
  heroMetricCard: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 12,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  heroMetricValue: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
  },
  heroMetricLabel: {
    color: "rgba(255,255,255,0.68)",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  nutritionCard: {
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 16,
  },
  nutritionHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  nutritionEyebrow: {
    color: "#8F867F",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  nutritionTitle: {
    color: "#1E1A17",
    fontSize: 30,
    fontWeight: "800",
    marginTop: 2,
  },
  nutritionSubcopy: {
    color: "#8F867F",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 4,
  },
  nutritionBadge: {
    minWidth: 70,
    borderRadius: 18,
    backgroundColor: "#FFF8F4",
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  nutritionBadgeValue: {
    color: "#FF7B45",
    fontSize: 22,
    fontWeight: "800",
    lineHeight: 22,
  },
  nutritionBadgeLabel: {
    color: "#C38972",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  nutritionMealsRow: {
    flexDirection: "row",
    gap: 10,
  },
  mealStatusChip: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: "#F6F2EE",
    paddingHorizontal: 10,
    paddingVertical: 12,
    alignItems: "center",
    gap: 8,
  },
  mealStatusChipDone: {
    backgroundColor: "#EEF2FF",
  },
  mealStatusDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#E3DDD7",
  },
  mealStatusDotDone: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2F42C7",
  },
  mealStatusText: {
    color: "#8F867F",
    fontSize: 12,
    fontWeight: "700",
  },
  mealStatusTextDone: {
    color: "#2F42C7",
  },
  nutritionFooterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  nutritionMetaPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    backgroundColor: "#FFF8F4",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  nutritionMetaText: {
    color: "#6F6761",
    fontSize: 12,
    fontWeight: "700",
  },
  nutritionButton: {
    marginLeft: "auto",
    borderRadius: 999,
    backgroundColor: "#2F42C7",
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  nutritionButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
  stepsCard: {
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 18,
    paddingVertical: 18,
    gap: 16,
  },
  stepsTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  stepsEyebrow: {
    color: "#8F867F",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  stepsValue: {
    color: "#1E1A17",
    fontSize: 48,
    lineHeight: 50,
    fontWeight: "800",
  },
  stepsSubcopy: {
    color: "#8F867F",
    fontSize: 14,
    marginTop: 4,
  },
  stepsGoalAccent: {
    color: "#2F42C7",
    fontSize: 14,
    fontWeight: "700",
  },
  thisWeekPill: {
    alignSelf: "flex-start",
    borderRadius: 999,
    backgroundColor: "#F3F1EC",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  thisWeekText: {
    color: "#9B948C",
    fontSize: 12,
    fontWeight: "700",
  },
  barChartRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  barChartItem: {
    flex: 1,
    alignItems: "center",
    gap: 8,
  },
  barTrack: {
    width: "100%",
    height: 78,
    borderRadius: 10,
    backgroundColor: "#EEECFA",
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  barTrackActive: {
    backgroundColor: "#DDD8FF",
  },
  barFill: {
    width: "100%",
    borderRadius: 10,
    backgroundColor: "#D8D5EA",
  },
  barFillActive: {
    backgroundColor: "#2F42C7",
  },
  barLabel: {
    color: "#A6A19A",
    fontSize: 11,
    fontWeight: "700",
  },
  barLabelActive: {
    color: "#2F42C7",
  },
  insightRow: {
    flexDirection: "row",
    gap: 10,
  },
  insightCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 10,
  },
  insightTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  insightIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  insightIconWarm: {
    backgroundColor: "#FFF1E8",
  },
  insightIconCool: {
    backgroundColor: "#EAFBF1",
  },
  insightAccentPill: {
    borderRadius: 999,
    backgroundColor: "#FFF7F3",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  insightAccentText: {
    fontSize: 11,
    fontWeight: "700",
  },
  insightValueRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 4,
  },
  insightValue: {
    color: "#1E1A17",
    fontSize: 36,
    lineHeight: 38,
    fontWeight: "800",
  },
  insightUnit: {
    color: "#8F867F",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 5,
  },
  insightLabel: {
    color: "#8F867F",
    fontSize: 14,
  },
  sparklineRow: {
    height: 42,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 4,
    marginTop: 2,
  },
  sparklineSegment: {
    flex: 1,
    borderRadius: 999,
  },
});
