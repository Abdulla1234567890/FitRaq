import { API_BASE_URL } from "@/constants/api";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Haptics from "expo-haptics";
import { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

type NutritionDay = {
  calories: number;
  dateNumber: string;
  extras: string[];
  id: string;
  meals: {
    breakfast: string;
    dinner: string;
    lunch: string;
  };
  weekday: string;
};

type NutritionAnalysis = {
  daily_total: number;
  items: {
    estimated_calories: number;
    meal: string;
    name: string;
  }[];
  meal_totals: {
    breakfast: number;
    dinner: number;
    extras: number;
    lunch: number;
  };
  notes: string[];
};

const INITIAL_DAYS: NutritionDay[] = [
  ...createNutritionDays(new Date()),
];

export default function NutritionScreen() {
  const [selectedDayId, setSelectedDayId] = useState(createNutritionDayId(new Date()));
  const [days, setDays] = useState(INITIAL_DAYS);
  const [submitState, setSubmitState] = useState(
    "Meals ready to send to the calorie model.",
  );
  const [analysis, setAnalysis] = useState<NutritionAnalysis | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [calendarVisible, setCalendarVisible] = useState(false);
  const monthLabel = useMemo(
    () =>
      new Intl.DateTimeFormat("en-US", {
        month: "long",
        year: "numeric",
      }).format(createDateFromId(selectedDayId)),
    [selectedDayId],
  );

  const selectedDay = days.find((day) => day.id === selectedDayId) ?? days[0];
  const hasMealContent = useMemo(
    () =>
      Boolean(
        selectedDay.meals.breakfast.trim() ||
        selectedDay.meals.lunch.trim() ||
        selectedDay.meals.dinner.trim() ||
        selectedDay.extras.some((item) => item.trim()),
      ),
    [selectedDay],
  );

  const updateMeal = (meal: keyof NutritionDay["meals"], value: string) => {
    setDays((current) =>
      current.map((day) =>
        day.id === selectedDayId
          ? {
              ...day,
              meals: {
                ...day.meals,
                [meal]: value,
              },
            }
          : day,
      ),
    );
  };

  const updateExtra = (index: number, value: string) => {
    setDays((current) =>
      current.map((day) =>
        day.id === selectedDayId
          ? {
              ...day,
              extras: day.extras.map((extra, extraIndex) =>
                extraIndex === index ? value : extra,
              ),
            }
          : day,
      ),
    );
  };

  const addExtraField = async () => {
    await Haptics.selectionAsync();
    setDays((current) =>
      current.map((day) =>
        day.id === selectedDayId
          ? {
              ...day,
              extras: [...day.extras, ""],
            }
          : day,
      ),
    );
  };

  const deleteExtra = async (index: number) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDays((current) =>
      current.map((day) =>
        day.id === selectedDayId
          ? {
              ...day,
              extras: day.extras.filter(
                (_, extraIndex) => extraIndex !== index,
              ),
            }
          : day,
      ),
    );
  };

  const submitMeals = async () => {
    if (!hasMealContent) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      setSubmitState(
        "Add at least one meal or snack before sending it for analysis.",
      );
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitState("Sending meals to the nutrition model...");

      const response = await fetch(`${API_BASE_URL}/analyze-nutrition`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: `2026-03-${selectedDay.dateNumber.padStart(2, "0")}`,
          meals: selectedDay.meals,
          extras: selectedDay.extras.filter((item) => item.trim()),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.ok || !data.result) {
        throw new Error(data.error || "Nutrition analysis failed.");
      }

      const nextAnalysis = data.result as NutritionAnalysis;

      setAnalysis(nextAnalysis);
      setDays((current) =>
        current.map((day) =>
          day.id === selectedDayId
            ? {
                ...day,
                calories: nextAnalysis.daily_total,
              }
            : day,
        ),
      );
      setSubmitState(
        `Analysis complete. Estimated ${nextAnalysis.daily_total} calories for this day.`,
      );
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Could not reach the backend. If you are testing on a phone, swap the API URL to your Mac local IP.";
      setSubmitState(message);
      setAnalysis(null);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topSection}>
          <View style={styles.headerRow}>
            <View style={styles.headerTextBlock}>
              <Text style={styles.eyebrow}>NUTRITION</Text>
              <Text style={styles.title}>Daily Fuel</Text>
            </View>

            <Pressable
              onPress={async () => {
                await Haptics.selectionAsync();
                setCalendarVisible(true);
              }}
              style={styles.headerIcon}
            >
              <MaterialIcons color="#2F42C7" name="calendar-month" size={24} />
            </Pressable>
          </View>

          <View style={styles.calendarCard}>
            <View style={styles.calendarHeaderInline}>
              <Text style={styles.calendarMonthHero}>{monthLabel}</Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.calendarRow}
            >
              {days.map((day) => {
                const isActive = day.id === selectedDayId;

                return (
                  <Pressable
                    key={day.id}
                    onPress={async () => {
                      await Haptics.selectionAsync();
                      setSelectedDayId(day.id);
                    }}
                    style={styles.dayItem}
                  >
                    <Text style={styles.weekday}>{day.weekday}</Text>
                    <View
                      style={[
                        styles.dateCircle,
                        isActive ? styles.dateCircleActive : undefined,
                      ]}
                    >
                      <Text
                        style={[
                          styles.dateNumber,
                          isActive ? styles.dateNumberActive : undefined,
                        ]}
                      >
                        {day.dateNumber}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.calorieCompactCard}>
            <View>
              <Text style={styles.calorieCompactLabel}>
                {selectedDay.weekday} {selectedDay.dateNumber}
              </Text>
              <Text style={styles.calorieCompactValue}>
                {selectedDay.calories > 0
                  ? `${selectedDay.calories} cal`
                  : "No calories yet"}
              </Text>
            </View>
            <View style={styles.calorieBadge}>
              <MaterialIcons
                color="#2F42C7"
                name="local-fire-department"
                size={18}
              />
              <Text style={styles.calorieBadgeText}>Daily total</Text>
            </View>
          </View>

        </View>

        <View style={styles.mealSection}>
          <MealField
            label="Breakfast"
            onChangeText={(value) => updateMeal("breakfast", value)}
            value={selectedDay.meals.breakfast}
          />
          <MealField
            label="Lunch"
            onChangeText={(value) => updateMeal("lunch", value)}
            value={selectedDay.meals.lunch}
          />
          <MealField
            label="Dinner"
            onChangeText={(value) => updateMeal("dinner", value)}
            value={selectedDay.meals.dinner}
          />
        </View>

        <View style={styles.extraHeader}>
          <View style={styles.extraHeaderText}>
            <Text style={styles.sectionTitle}>Snacks & extras</Text>
            <Text style={styles.sectionCopy}>
              Add small extras here. Swipe left on a card to delete it.
            </Text>
          </View>
          <Pressable onPress={addExtraField} style={styles.addButton}>
            <MaterialIcons color="#FFFFFF" name="add" size={20} />
          </Pressable>
        </View>

        <View style={styles.extraList}>
          {selectedDay.extras.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>
                No extra items yet. Tap + to add one.
              </Text>
            </View>
          ) : (
            selectedDay.extras.map((extra, index) => (
              <Swipeable
                key={`${selectedDay.id}-extra-${index}`}
                overshootRight={false}
                renderRightActions={() => (
                  <Pressable
                    onPress={() => deleteExtra(index)}
                    style={styles.deleteAction}
                  >
                    <MaterialIcons
                      color="#FFFFFF"
                      name="delete-outline"
                      size={22}
                    />
                    <Text style={styles.deleteActionText}>Delete</Text>
                  </Pressable>
                )}
              >
                <View style={styles.extraCard}>
                  <Text style={styles.extraLabel}>Extra item {index + 1}</Text>
                  <TextInput
                    onChangeText={(value) => updateExtra(index, value)}
                    placeholder="Protein shake, dessert, coffee, snack..."
                    placeholderTextColor="#A39C95"
                    style={styles.extraInput}
                    value={extra}
                  />
                </View>
              </Swipeable>
            ))
          )}
        </View>

        <View style={styles.submitCard}>
          <Text style={styles.submitStatus}>{submitState}</Text>
          <Pressable
            disabled={isSubmitting}
            onPress={submitMeals}
            style={[
              styles.submitButton,
              isSubmitting ? styles.submitButtonDisabled : undefined,
            ]}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? "Analyzing..." : "Submit for analysis"}
            </Text>
          </Pressable>
        </View>

        {analysis ? (
          <View style={styles.analysisCard}>
            <Text style={styles.analysisTitle}>Latest calorie breakdown</Text>

            <View style={styles.analysisTotalsRow}>
              <AnalysisPill
                label="Breakfast"
                value={analysis.meal_totals.breakfast}
              />
              <AnalysisPill label="Lunch" value={analysis.meal_totals.lunch} />
              <AnalysisPill
                label="Dinner"
                value={analysis.meal_totals.dinner}
              />
              <AnalysisPill
                label="Extras"
                value={analysis.meal_totals.extras}
              />
            </View>

            <View style={styles.analysisList}>
              {analysis.items.map((item, index) => (
                <View
                  key={`${item.meal}-${item.name}-${index}`}
                  style={styles.analysisItem}
                >
                  <View style={styles.analysisItemText}>
                    <Text style={styles.analysisItemName}>{item.name}</Text>
                    <Text style={styles.analysisItemMeal}>{item.meal}</Text>
                  </View>
                  <Text style={styles.analysisItemCalories}>
                    {item.estimated_calories} cal
                  </Text>
                </View>
              ))}
            </View>

            {analysis.notes.length > 0 ? (
              <Text style={styles.analysisNote}>{analysis.notes[0]}</Text>
            ) : null}
          </View>
        ) : null}
      </ScrollView>

      <Modal
        animationType="fade"
        onRequestClose={() => setCalendarVisible(false)}
        transparent
        visible={calendarVisible}
      >
        <View style={styles.modalBackdrop}>
          <Pressable
            style={styles.modalDismissLayer}
            onPress={() => setCalendarVisible(false)}
          />

          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Pick a date</Text>
              <Pressable
                onPress={async () => {
                  await Haptics.selectionAsync();
                  setCalendarVisible(false);
                }}
                style={styles.modalCloseButton}
              >
                <MaterialIcons color="#2F42C7" name="close" size={20} />
              </Pressable>
            </View>

            <Text style={styles.modalMonthLabel}>{monthLabel}</Text>

            <View style={styles.monthWeekHeader}>
              {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => (
                <Text
                  key={`${day}-${index}`}
                  style={styles.monthWeekHeaderText}
                >
                  {day}
                </Text>
              ))}
            </View>

            <View style={styles.monthGrid}>
              {days.map((day) => {
                const isActive = day.id === selectedDayId;

                return (
                  <Pressable
                    key={day.id}
                    onPress={async () => {
                      await Haptics.selectionAsync();
                      setSelectedDayId(day.id);
                      setCalendarVisible(false);
                    }}
                    style={[
                      styles.monthDayCell,
                      isActive ? styles.monthDayCellActive : undefined,
                    ]}
                  >
                    <Text
                      style={[
                        styles.monthDayText,
                        isActive ? styles.monthDayTextActive : undefined,
                      ]}
                    >
                      {day.dateNumber}
                    </Text>
                    <Text
                      style={[
                        styles.monthDaySubtext,
                        isActive ? styles.monthDaySubtextActive : undefined,
                      ]}
                    >
                      {day.weekday}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function MealField({
  label,
  onChangeText,
  value,
}: {
  label: string;
  onChangeText: (value: string) => void;
  value: string;
}) {
  return (
    <View style={styles.mealCard}>
      <Text style={styles.mealLabel}>{label}</Text>
      <TextInput
        multiline
        onChangeText={onChangeText}
        placeholder={`Add ${label.toLowerCase()} here`}
        placeholderTextColor="#A39C95"
        style={styles.mealInput}
        textAlignVertical="top"
        value={value}
      />
    </View>
  );
}

function AnalysisPill({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.analysisPill}>
      <Text style={styles.analysisPillValue}>{value}</Text>
      <Text style={styles.analysisPillLabel}>{label}</Text>
    </View>
  );
}

function createNutritionDays(anchor: Date): NutritionDay[] {
  const today = new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate());
  const dayOfWeek = today.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);

    return {
      id: createNutritionDayId(date),
      weekday: new Intl.DateTimeFormat("en-US", { weekday: "short" })
        .format(date)
        .slice(0, 2)
        .toUpperCase(),
      dateNumber: `${date.getDate()}`,
      calories: 0,
      meals: {
        breakfast: "",
        lunch: "",
        dinner: "",
      },
      extras: [],
    };
  });
}

function createNutritionDayId(date: Date) {
  return `day-${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, "0")}-${`${date.getDate()}`.padStart(2, "0")}`;
}

function createDateFromId(id: string) {
  const parts = id.replace("day-", "").split("-");
  const [year, month, day] = parts.map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F4EFE8",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
    gap: 16,
  },
  topSection: {
    gap: 14,
    marginBottom: 4,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
  },
  headerTextBlock: {
    flex: 1,
  },
  eyebrow: {
    color: "#8F867F",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.1,
  },
  title: {
    color: "#1B140F",
    fontSize: 30,
    fontWeight: "600",
    marginTop: 4,
  },
  headerCopy: {
    color: "#7E766F",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
    maxWidth: 240,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 18, 38, 0.28)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  modalDismissLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 20,
    gap: 16,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modalTitle: {
    color: "#1B140F",
    fontSize: 22,
    fontWeight: "700",
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F4EFE8",
    alignItems: "center",
    justifyContent: "center",
  },
  modalMonthLabel: {
    color: "#2F42C7",
    fontSize: 18,
    fontWeight: "700",
  },
  monthWeekHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  monthWeekHeaderText: {
    width: 36,
    textAlign: "center",
    color: "#8F867F",
    fontSize: 12,
    fontWeight: "700",
  },
  monthGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  monthDayCell: {
    width: 46,
    borderRadius: 16,
    backgroundColor: "#F7F4EF",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    gap: 4,
  },
  monthDayCellActive: {
    backgroundColor: "#2F42C7",
  },
  monthDayText: {
    color: "#1B140F",
    fontSize: 16,
    fontWeight: "700",
  },
  monthDayTextActive: {
    color: "#FFFFFF",
  },
  monthDaySubtext: {
    color: "#8F867F",
    fontSize: 10,
    fontWeight: "700",
  },
  monthDaySubtextActive: {
    color: "#DCE1FF",
  },
  calendarCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 10,
    shadowColor: "#000000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  calendarHeaderInline: {
    paddingHorizontal: 6,
    paddingBottom: 12,
  },
  calendarMonthHero: {
    color: "#1B140F",
    fontSize: 24,
    fontWeight: "700",
  },
  calendarRow: {
    gap: 12,
  },
  dayItem: {
    width: 44,
    alignItems: "center",
    gap: 8,
  },
  weekday: {
    color: "#1B140F",
    fontSize: 14,
    fontWeight: "500",
  },
  dateCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  dateCircleActive: {
    backgroundColor: "#2F42C7",
    shadowColor: "#2F42C7",
    shadowOpacity: 0.24,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  dateNumber: {
    color: "#1B140F",
    fontSize: 15,
    fontWeight: "500",
  },
  dateNumberActive: {
    color: "#FFFFFF",
  },
  calorieCompactCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: "#000000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  calorieCompactLabel: {
    color: "#7E766F",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  calorieCompactValue: {
    color: "#1B140F",
    fontSize: 24,
    fontWeight: "700",
    marginTop: 4,
  },
  calorieBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    backgroundColor: "#EEF1FF",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  calorieBadgeText: {
    color: "#2F42C7",
    fontSize: 12,
    fontWeight: "700",
  },
  mealSection: {
    gap: 12,
  },
  mealCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 16,
    gap: 10,
  },
  mealLabel: {
    color: "#1B140F",
    fontSize: 16,
    fontWeight: "600",
  },
  mealInput: {
    minHeight: 84,
    borderRadius: 16,
    backgroundColor: "#F7F4EF",
    color: "#1B140F",
    fontSize: 14,
    lineHeight: 22,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  extraHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  extraHeaderText: {
    flex: 1,
    gap: 4,
  },
  sectionTitle: {
    color: "#1B140F",
    fontSize: 20,
    fontWeight: "600",
  },
  sectionCopy: {
    color: "#7E766F",
    fontSize: 13,
    lineHeight: 20,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#2F42C7",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  extraList: {
    gap: 12,
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
  },
  emptyText: {
    color: "#8F867F",
    fontSize: 14,
  },
  extraCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 16,
    gap: 10,
  },
  extraLabel: {
    color: "#1B140F",
    fontSize: 15,
    fontWeight: "600",
  },
  extraInput: {
    minHeight: 54,
    borderRadius: 16,
    backgroundColor: "#F7F4EF",
    color: "#1B140F",
    fontSize: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  deleteAction: {
    width: 92,
    height: "100%",
    borderRadius: 22,
    backgroundColor: "#D9534F",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginLeft: 10,
  },
  deleteActionText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  submitCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
    gap: 14,
  },
  submitStatus: {
    color: "#6F675F",
    fontSize: 14,
    lineHeight: 22,
  },
  submitButton: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    backgroundColor: "#2F42C7",
    paddingVertical: 16,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  analysisCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
    gap: 14,
  },
  analysisTitle: {
    color: "#1B140F",
    fontSize: 18,
    fontWeight: "700",
  },
  analysisTotalsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  analysisPill: {
    borderRadius: 16,
    backgroundColor: "#F7F4EF",
    paddingHorizontal: 12,
    paddingVertical: 10,
    minWidth: 74,
    gap: 2,
  },
  analysisPillValue: {
    color: "#1B140F",
    fontSize: 15,
    fontWeight: "700",
  },
  analysisPillLabel: {
    color: "#7E766F",
    fontSize: 11,
    fontWeight: "600",
  },
  analysisList: {
    gap: 10,
  },
  analysisItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    borderRadius: 18,
    backgroundColor: "#F9F6F2",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  analysisItemText: {
    flex: 1,
    gap: 2,
  },
  analysisItemName: {
    color: "#1B140F",
    fontSize: 14,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  analysisItemMeal: {
    color: "#8F867F",
    fontSize: 12,
    textTransform: "capitalize",
  },
  analysisItemCalories: {
    color: "#2F42C7",
    fontSize: 13,
    fontWeight: "700",
  },
  analysisNote: {
    color: "#6F675F",
    fontSize: 13,
    lineHeight: 20,
  },
});
