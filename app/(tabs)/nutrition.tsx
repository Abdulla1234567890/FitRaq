import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import { API_BASE_URL } from '@/constants/api';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

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
  {
    id: 'mon-09',
    weekday: 'MO',
    dateNumber: '9',
    calories: 1840,
    meals: {
      breakfast: 'Greek yogurt with berries and honey',
      lunch: 'Chicken shawarma bowl with rice',
      dinner: 'Salmon, potatoes, and green beans',
    },
    extras: ['Protein bar after workout'],
  },
  {
    id: 'tue-10',
    weekday: 'TU',
    dateNumber: '10',
    calories: 1720,
    meals: {
      breakfast: 'Oatmeal with banana',
      lunch: 'Turkey sandwich and salad',
      dinner: 'Pasta with grilled chicken',
    },
    extras: ['Coffee and dates'],
  },
  {
    id: 'we-11',
    weekday: 'WE',
    dateNumber: '11',
    calories: 1960,
    meals: {
      breakfast: 'Eggs and toast',
      lunch: 'Beef wrap and yogurt',
      dinner: 'Rice bowl with vegetables',
    },
    extras: [],
  },
  {
    id: 'th-12',
    weekday: 'TH',
    dateNumber: '12',
    calories: 1630,
    meals: {
      breakfast: '',
      lunch: '',
      dinner: '',
    },
    extras: [],
  },
  {
    id: 'fr-13',
    weekday: 'FR',
    dateNumber: '13',
    calories: 0,
    meals: {
      breakfast: '',
      lunch: '',
      dinner: '',
    },
    extras: [],
  },
  {
    id: 'sa-14',
    weekday: 'SA',
    dateNumber: '14',
    calories: 0,
    meals: {
      breakfast: '',
      lunch: '',
      dinner: '',
    },
    extras: [],
  },
  {
    id: 'su-15',
    weekday: 'SU',
    dateNumber: '15',
    calories: 0,
    meals: {
      breakfast: '',
      lunch: '',
      dinner: '',
    },
    extras: [],
  },
];

export default function NutritionScreen() {
  const [selectedDayId, setSelectedDayId] = useState('sa-14');
  const [days, setDays] = useState(INITIAL_DAYS);
  const [submitState, setSubmitState] = useState('Meals ready to send to the calorie model.');
  const [analysis, setAnalysis] = useState<NutritionAnalysis | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedDay = days.find((day) => day.id === selectedDayId) ?? days[0];
  const hasMealContent = useMemo(
    () =>
      Boolean(
        selectedDay.meals.breakfast.trim() ||
          selectedDay.meals.lunch.trim() ||
          selectedDay.meals.dinner.trim() ||
          selectedDay.extras.some((item) => item.trim())
      ),
    [selectedDay]
  );

  const updateMeal = (meal: keyof NutritionDay['meals'], value: string) => {
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
          : day
      )
    );
  };

  const updateExtra = (index: number, value: string) => {
    setDays((current) =>
      current.map((day) =>
        day.id === selectedDayId
          ? {
              ...day,
              extras: day.extras.map((extra, extraIndex) => (extraIndex === index ? value : extra)),
            }
          : day
      )
    );
  };

  const addExtraField = async () => {
    await Haptics.selectionAsync();
    setDays((current) =>
      current.map((day) =>
        day.id === selectedDayId
          ? {
              ...day,
              extras: [...day.extras, ''],
            }
          : day
      )
    );
  };

  const deleteExtra = async (index: number) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDays((current) =>
      current.map((day) =>
        day.id === selectedDayId
          ? {
              ...day,
              extras: day.extras.filter((_, extraIndex) => extraIndex !== index),
            }
          : day
      )
    );
  };

  const submitMeals = async () => {
    if (!hasMealContent) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      setSubmitState('Add at least one meal or snack before sending it for analysis.');
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitState('Sending meals to the nutrition model...');

      const response = await fetch(`${API_BASE_URL}/analyze-nutrition`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: `2026-03-${selectedDay.dateNumber.padStart(2, '0')}`,
          meals: selectedDay.meals,
          extras: selectedDay.extras.filter((item) => item.trim()),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.ok || !data.result) {
        throw new Error(data.error || 'Nutrition analysis failed.');
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
            : day
        )
      );
      setSubmitState(`Analysis complete. Estimated ${nextAnalysis.daily_total} calories for this day.`);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Could not reach the backend. If you are testing on a phone, swap the API URL to your Mac local IP.';
      setSubmitState(message);
      setAnalysis(null);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.eyebrow}>NUTRITION</Text>
            <Text style={styles.title}>Daily Fuel</Text>
          </View>

          <View style={styles.headerIcon}>
            <MaterialIcons color="#2F42C7" name="calendar-month" size={24} />
          </View>
        </View>

        <View style={styles.calendarCard}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.calendarRow}>
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
                  <View style={[styles.dateCircle, isActive ? styles.dateCircleActive : undefined]}>
                    <Text style={[styles.dateNumber, isActive ? styles.dateNumberActive : undefined]}>
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
              {selectedDay.calories > 0 ? `${selectedDay.calories} cal` : 'No calories yet'}
            </Text>
          </View>
          <View style={styles.calorieBadge}>
            <MaterialIcons color="#2F42C7" name="local-fire-department" size={18} />
            <Text style={styles.calorieBadgeText}>Daily total</Text>
          </View>
        </View>

        <View style={styles.mealSection}>
          <MealField
            label="Breakfast"
            onChangeText={(value) => updateMeal('breakfast', value)}
            value={selectedDay.meals.breakfast}
          />
          <MealField
            label="Lunch"
            onChangeText={(value) => updateMeal('lunch', value)}
            value={selectedDay.meals.lunch}
          />
          <MealField
            label="Dinner"
            onChangeText={(value) => updateMeal('dinner', value)}
            value={selectedDay.meals.dinner}
          />
        </View>

        <View style={styles.extraHeader}>
          <View style={styles.extraHeaderText}>
            <Text style={styles.sectionTitle}>Snacks & extras</Text>
            <Text style={styles.sectionCopy}>Add small extras here. Swipe left on a card to delete it.</Text>
          </View>
          <Pressable onPress={addExtraField} style={styles.addButton}>
            <MaterialIcons color="#FFFFFF" name="add" size={20} />
          </Pressable>
        </View>

        <View style={styles.extraList}>
          {selectedDay.extras.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No extra items yet. Tap + to add one.</Text>
            </View>
          ) : (
            selectedDay.extras.map((extra, index) => (
              <Swipeable
                key={`${selectedDay.id}-extra-${index}`}
                overshootRight={false}
                renderRightActions={() => (
                  <Pressable onPress={() => deleteExtra(index)} style={styles.deleteAction}>
                    <MaterialIcons color="#FFFFFF" name="delete-outline" size={22} />
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
          <Pressable disabled={isSubmitting} onPress={submitMeals} style={[styles.submitButton, isSubmitting ? styles.submitButtonDisabled : undefined]}>
            <Text style={styles.submitButtonText}>{isSubmitting ? 'Analyzing...' : 'Submit for analysis'}</Text>
          </Pressable>
        </View>

        {analysis ? (
          <View style={styles.analysisCard}>
            <Text style={styles.analysisTitle}>Latest calorie breakdown</Text>

            <View style={styles.analysisTotalsRow}>
              <AnalysisPill label="Breakfast" value={analysis.meal_totals.breakfast} />
              <AnalysisPill label="Lunch" value={analysis.meal_totals.lunch} />
              <AnalysisPill label="Dinner" value={analysis.meal_totals.dinner} />
              <AnalysisPill label="Extras" value={analysis.meal_totals.extras} />
            </View>

            <View style={styles.analysisList}>
              {analysis.items.map((item, index) => (
                <View key={`${item.meal}-${item.name}-${index}`} style={styles.analysisItem}>
                  <View style={styles.analysisItemText}>
                    <Text style={styles.analysisItemName}>{item.name}</Text>
                    <Text style={styles.analysisItemMeal}>{item.meal}</Text>
                  </View>
                  <Text style={styles.analysisItemCalories}>{item.estimated_calories} cal</Text>
                </View>
              ))}
            </View>

            {analysis.notes.length > 0 ? <Text style={styles.analysisNote}>{analysis.notes[0]}</Text> : null}
          </View>
        ) : null}
      </ScrollView>
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4EFE8',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
    gap: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eyebrow: {
    color: '#8F867F',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.1,
  },
  title: {
    color: '#1B140F',
    fontSize: 30,
    fontWeight: '600',
    marginTop: 4,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 10,
  },
  calendarRow: {
    gap: 12,
  },
  dayItem: {
    width: 44,
    alignItems: 'center',
    gap: 8,
  },
  weekday: {
    color: '#1B140F',
    fontSize: 14,
    fontWeight: '500',
  },
  dateCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateCircleActive: {
    backgroundColor: '#2F42C7',
    shadowColor: '#2F42C7',
    shadowOpacity: 0.24,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  dateNumber: {
    color: '#1B140F',
    fontSize: 15,
    fontWeight: '500',
  },
  dateNumberActive: {
    color: '#FFFFFF',
  },
  calorieCompactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  calorieCompactLabel: {
    color: '#7E766F',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  calorieCompactValue: {
    color: '#1B140F',
    fontSize: 24,
    fontWeight: '700',
    marginTop: 4,
  },
  calorieBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    backgroundColor: '#EEF1FF',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  calorieBadgeText: {
    color: '#2F42C7',
    fontSize: 12,
    fontWeight: '700',
  },
  mealSection: {
    gap: 12,
  },
  mealCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    gap: 10,
  },
  mealLabel: {
    color: '#1B140F',
    fontSize: 16,
    fontWeight: '600',
  },
  mealInput: {
    minHeight: 84,
    borderRadius: 16,
    backgroundColor: '#F7F4EF',
    color: '#1B140F',
    fontSize: 14,
    lineHeight: 22,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  extraHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  extraHeaderText: {
    flex: 1,
    gap: 4,
  },
  sectionTitle: {
    color: '#1B140F',
    fontSize: 20,
    fontWeight: '600',
  },
  sectionCopy: {
    color: '#7E766F',
    fontSize: 13,
    lineHeight: 20,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2F42C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  extraList: {
    gap: 12,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
  },
  emptyText: {
    color: '#8F867F',
    fontSize: 14,
  },
  extraCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    gap: 10,
  },
  extraLabel: {
    color: '#1B140F',
    fontSize: 15,
    fontWeight: '600',
  },
  extraInput: {
    minHeight: 54,
    borderRadius: 16,
    backgroundColor: '#F7F4EF',
    color: '#1B140F',
    fontSize: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  deleteAction: {
    width: 92,
    height: '100%',
    borderRadius: 22,
    backgroundColor: '#D9534F',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginLeft: 10,
  },
  deleteActionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  submitCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    gap: 14,
  },
  submitStatus: {
    color: '#6F675F',
    fontSize: 14,
    lineHeight: 22,
  },
  submitButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: '#2F42C7',
    paddingVertical: 16,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  analysisCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    gap: 14,
  },
  analysisTitle: {
    color: '#1B140F',
    fontSize: 18,
    fontWeight: '700',
  },
  analysisTotalsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  analysisPill: {
    borderRadius: 16,
    backgroundColor: '#F7F4EF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    minWidth: 74,
    gap: 2,
  },
  analysisPillValue: {
    color: '#1B140F',
    fontSize: 15,
    fontWeight: '700',
  },
  analysisPillLabel: {
    color: '#7E766F',
    fontSize: 11,
    fontWeight: '600',
  },
  analysisList: {
    gap: 10,
  },
  analysisItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    borderRadius: 18,
    backgroundColor: '#F9F6F2',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  analysisItemText: {
    flex: 1,
    gap: 2,
  },
  analysisItemName: {
    color: '#1B140F',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  analysisItemMeal: {
    color: '#8F867F',
    fontSize: 12,
    textTransform: 'capitalize',
  },
  analysisItemCalories: {
    color: '#2F42C7',
    fontSize: 13,
    fontWeight: '700',
  },
  analysisNote: {
    color: '#6F675F',
    fontSize: 13,
    lineHeight: 20,
  },
});
