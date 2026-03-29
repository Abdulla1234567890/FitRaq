import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import { useFocusEffect } from '@react-navigation/native';
import { getCurrentActivityPlan } from '@/lib/user-session';
import { router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { resolveActivityWeeks, resolveTodayTasks, resolveWeekBars } from './activity-program';

export default function ActivityScreen() {
  const insets = useSafeAreaInsets();
  const [activityPlan, setActivityPlan] = useState(() => getCurrentActivityPlan());

  useFocusEffect(
    useCallback(() => {
      setActivityPlan(getCurrentActivityPlan());
    }, [])
  );

  const todayTasks = useMemo(() => resolveTodayTasks(activityPlan), [activityPlan]);
  const weekDays = useMemo(() => resolveWeekBars(activityPlan), [activityPlan]);
  const resolvedWeeks = useMemo(() => resolveActivityWeeks(activityPlan), [activityPlan]);
  const currentWeek = resolvedWeeks.find((week) => week.status === 'current') ?? resolvedWeeks[0];
  const today = useMemo(() => startOfDay(new Date()), []);
  const [selectedDate, setSelectedDate] = useState(today);
  const [displayedMonth, setDisplayedMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [calendarExpanded, setCalendarExpanded] = useState(false);
  const selectedDay = useMemo(() => createCalendarDay(selectedDate, today), [selectedDate, today]);
  const visibleDays = useMemo(
    () => Array.from({ length: 7 }, (_, index) => createCalendarDay(addDays(selectedDate, index - 3), today)),
    [selectedDate, today]
  );
  const monthDays = useMemo(() => getMonthDays(displayedMonth, today), [displayedMonth, today]);
  const monthLabel = useMemo(
    () =>
      new Intl.DateTimeFormat('en-US', {
        month: 'long',
        year: 'numeric',
      }).format(displayedMonth),
    [displayedMonth]
  );
  const completedToday = todayTasks.filter((task) => task.done).length;
  const completionRatio = todayTasks.length ? completedToday / todayTasks.length : 0;

  return (
    <SafeAreaView edges={['left', 'right']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.calendarSection, { paddingTop: insets.top + 12 }]}>
          <View style={styles.calendarCard}>
            <View style={styles.calendarHeaderInline}>
              <Text style={styles.calendarMonthHero}>{monthLabel}</Text>

              <Pressable
                onPress={async () => {
                  await Haptics.selectionAsync();
                  setCalendarExpanded(true);
                }}
                style={styles.calendarOpenButton}
              >
                <MaterialIcons color="#2F42C7" name="calendar-month" size={18} />
              </Pressable>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.calendarRow}>
              {visibleDays.map((day) => {
                const isActive = day.id === selectedDay.id;

                return (
                  <Pressable
                    key={day.id}
                    onPress={async () => {
                      await Haptics.selectionAsync();
                      setSelectedDate(day.date);
                      setDisplayedMonth(new Date(day.date.getFullYear(), day.date.getMonth(), 1));
                    }}
                    style={styles.dayItem}
                  >
                    <Text
                      style={[
                        styles.calendarWeekday,
                        day.isToday ? styles.calendarWeekdayToday : undefined,
                        isActive ? styles.calendarWeekdayActive : undefined,
                      ]}
                    >
                      {day.day}
                    </Text>
                    <View
                      style={[
                        styles.calendarDateCircle,
                        day.isToday ? styles.calendarDateCircleToday : undefined,
                        isActive ? styles.calendarDateCircleActive : undefined,
                      ]}
                    >
                      <Text
                        style={[
                          styles.calendarDateText,
                          day.isToday ? styles.calendarDateTextToday : undefined,
                          isActive ? styles.calendarDateTextActive : undefined,
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
        </View>

        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Today&apos;s checklist</Text>
          <Text style={styles.sectionMeta}>Tap to update later</Text>
        </View>

        <View style={styles.taskList}>
          {todayTasks.map((task) => (
            <Pressable
              key={task.id}
              onPress={async () => {
                await Haptics.selectionAsync();
              }}
              style={styles.taskCard}
            >
              <View style={[styles.taskIcon, task.done ? styles.taskIconDone : undefined]}>
                <MaterialIcons
                  color={task.done ? '#2D7D46' : '#2F42C7'}
                  name={task.done ? 'check' : (task.icon as keyof typeof MaterialIcons.glyphMap)}
                  size={20}
                />
              </View>

              <View style={styles.taskBody}>
                <Text style={styles.taskLabel}>{task.label}</Text>
                <Text style={styles.taskProgress}>{task.progress}</Text>
              </View>

              <View style={[styles.taskState, task.done ? styles.taskStateDone : styles.taskStatePending]}>
                <Text style={[styles.taskStateText, task.done ? styles.taskStateTextDone : styles.taskStateTextPending]}>
                  {task.done ? 'Done' : 'Open'}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View>
              <Text style={styles.heroLabel}>Current week</Text>
              <Text style={styles.heroTitle}>{currentWeek.title}</Text>
            </View>

            <View style={styles.ringWrap}>
              <View style={styles.ringOuter}>
                <View style={styles.ringInner}>
                  <Text style={styles.ringValue}>{Math.round(completionRatio * 100)}%</Text>
                </View>
              </View>
            </View>
          </View>

          <Text style={styles.heroFocus}>{currentWeek.focus}</Text>

          <View style={styles.heroProgressTrack}>
            <View style={[styles.heroProgressFill, { width: `${Math.max(completionRatio * 100, 8)}%` }]} />
          </View>

          <View style={styles.heroWeekStrip}>
            {weekDays.map((item, index) => (
              <View key={`${item.day}-${index}`} style={styles.dayColumn}>
                <View style={[styles.heroDayBarTrack, item.active ? styles.heroDayBarTrackActive : undefined]}>
                  <View
                    style={[
                      styles.heroDayBarFill,
                      item.active ? styles.heroDayBarFillActive : undefined,
                      { height: `${Math.max(item.score * 100, 12)}%` },
                    ]}
                  />
                </View>
                <Text style={[styles.heroDayLabel, item.active ? styles.heroDayLabelActive : undefined]}>{item.day}</Text>
              </View>
            ))}
          </View>

          <View style={styles.heroStatsRow}>
            <WeekStat inverted label="Days done" value={`${completedToday}/${todayTasks.length || 0}`} />
            <WeekStat inverted label="Current" value={currentWeek.title} />
            <WeekStat inverted label="Plan" value={resolvedWeeks.length ? `${resolvedWeeks.length} weeks` : 'Static'} />
          </View>

          <Pressable
            onPress={async () => {
              await Haptics.selectionAsync();
              router.push({
                pathname: '/(tabs)/activity-week',
                params: { weekId: currentWeek.id },
              });
            }}
            style={styles.heroOverviewButton}
          >
            <Text style={styles.heroOverviewButtonText}>View all weeks</Text>
            <MaterialIcons color="#2F42C7" name="east" size={18} />
          </Pressable>
        </View>

      </ScrollView>

      <Modal animationType="fade" onRequestClose={() => setCalendarExpanded(false)} transparent visible={calendarExpanded}>
        <View style={styles.modalBackdrop}>
          <Pressable style={styles.modalDismissLayer} onPress={() => setCalendarExpanded(false)} />

          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Pick a date</Text>
              <Pressable
                onPress={async () => {
                  await Haptics.selectionAsync();
                  setCalendarExpanded(false);
                }}
                style={styles.modalCloseButton}
              >
                <MaterialIcons color="#2F42C7" name="close" size={20} />
              </Pressable>
            </View>

            <View style={styles.modalMonthRow}>
              <Pressable
                onPress={async () => {
                  await Haptics.selectionAsync();
                  setDisplayedMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1));
                }}
                style={styles.calendarNavButton}
              >
                <MaterialIcons color="#2F42C7" name="chevron-left" size={22} />
              </Pressable>

              <Text style={styles.modalMonthLabel}>{monthLabel}</Text>

              <Pressable
                onPress={async () => {
                  await Haptics.selectionAsync();
                  setDisplayedMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1));
                }}
                style={styles.calendarNavButton}
              >
                <MaterialIcons color="#2F42C7" name="chevron-right" size={22} />
              </Pressable>
            </View>

            <View style={styles.monthView}>
              <View style={styles.monthWeekHeader}>
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
                  <Text key={`${day}-${index}`} style={styles.monthWeekHeaderText}>
                    {day}
                  </Text>
                ))}
              </View>

              <View style={styles.monthGrid}>
                {monthDays.map((day) => {
                  const isActive = day.id === selectedDay.id;

                  return (
                    <Pressable
                      key={day.id}
                      onPress={async () => {
                        await Haptics.selectionAsync();
                        setSelectedDate(day.date);
                        setDisplayedMonth(new Date(day.date.getFullYear(), day.date.getMonth(), 1));
                        setCalendarExpanded(false);
                      }}
                      style={[
                        styles.monthDayCell,
                        day.isFaded ? styles.monthDayCellFaded : undefined,
                        day.isToday ? styles.monthDayCellToday : undefined,
                        isActive ? styles.monthDayCellActive : undefined,
                      ]}
                    >
                      <Text
                        style={[
                          styles.monthDayText,
                          day.isFaded ? styles.monthDayTextFaded : undefined,
                          day.isToday ? styles.monthDayTextToday : undefined,
                          isActive ? styles.monthDayTextActive : undefined,
                        ]}
                      >
                        {day.dateNumber}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function WeekStat({ label, value, inverted = false }: { label: string; value: string; inverted?: boolean }) {
  return (
    <View style={[styles.weekStat, inverted ? styles.weekStatInverted : undefined]}>
      <Text style={[styles.weekStatValue, inverted ? styles.weekStatValueInverted : undefined]}>{value}</Text>
      <Text style={[styles.weekStatLabel, inverted ? styles.weekStatLabelInverted : undefined]}>{label}</Text>
    </View>
  );
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, amount: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return startOfDay(next);
}

function sameDay(left: Date, right: Date) {
  return left.toDateString() === right.toDateString();
}

function createCalendarDay(date: Date, today: Date, isFaded = false) {
  const weekdayFormatter = new Intl.DateTimeFormat('en-US', { weekday: 'short' });

  return {
    id: date.toISOString(),
    date,
    day: weekdayFormatter.format(date).slice(0, 2).toUpperCase(),
    dateNumber: `${date.getDate()}`,
    isToday: sameDay(date, today),
    isFaded,
  };
}

function getMonthDays(displayedMonth: Date, today: Date) {
  const firstDay = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth(), 1);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const startDate = addDays(firstDay, -startOffset);

  return Array.from({ length: 35 }, (_, index) => {
    const date = addDays(startDate, index);
    const isFaded = date.getMonth() !== displayedMonth.getMonth();
    return createCalendarDay(date, today, isFaded);
  });
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4EFE8',
  },
  content: {
    paddingTop: 0,
    paddingBottom: 28,
    gap: 16,
  },
  calendarSection: {
    paddingHorizontal: 20,
  },
  calendarCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 10,
    gap: 12,
  },
  calendarHeaderInline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 6,
  },
  calendarMonthHero: {
    color: '#1B140F',
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
  },
  calendarOpenButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F4EFE8',
  },
  calendarRow: {
    gap: 12,
  },
  dayItem: {
    width: 44,
    alignItems: 'center',
    gap: 8,
  },
  calendarWeekday: {
    color: '#1B140F',
    fontSize: 14,
    fontWeight: '500',
  },
  calendarWeekdayActive: {
    color: '#2F42C7',
  },
  calendarWeekdayToday: {
    color: '#2F42C7',
  },
  calendarDateCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarDateCircleActive: {
    backgroundColor: '#2F42C7',
    shadowColor: '#2F42C7',
    shadowOpacity: 0.24,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  calendarDateCircleToday: {
    backgroundColor: 'rgba(47, 66, 199, 0.08)',
  },
  calendarDateText: {
    color: '#1B140F',
    fontSize: 15,
    fontWeight: '500',
  },
  calendarDateTextToday: {
    color: '#2F42C7',
  },
  calendarDateTextActive: {
    color: '#FFFFFF',
  },
  monthView: {
    gap: 12,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(18, 15, 12, 0.22)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalDismissLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  modalCard: {
    backgroundColor: '#F8F4EE',
    borderRadius: 28,
    padding: 18,
    gap: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    color: '#1B140F',
    fontSize: 20,
    fontWeight: '700',
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalMonthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  calendarNavButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalMonthLabel: {
    color: '#2F42C7',
    fontSize: 16,
    fontWeight: '700',
  },
  monthWeekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  monthWeekHeaderText: {
    width: '14.2%',
    textAlign: 'center',
    color: '#8F867F',
    fontSize: 11,
    fontWeight: '700',
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 10,
  },
  monthDayCell: {
    width: '14.28%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 16,
  },
  monthDayCellFaded: {
    opacity: 0.38,
  },
  monthDayCellToday: {
    backgroundColor: 'rgba(47, 66, 199, 0.08)',
  },
  monthDayCellActive: {
    backgroundColor: '#2F42C7',
  },
  monthDayText: {
    color: '#1B140F',
    fontSize: 14,
    fontWeight: '600',
  },
  monthDayTextFaded: {
    color: '#8F867F',
  },
  monthDayTextToday: {
    color: '#2F42C7',
  },
  monthDayTextActive: {
    color: '#FFFFFF',
  },
  heroCard: {
    marginHorizontal: 20,
    backgroundColor: '#2F42C7',
    borderRadius: 28,
    padding: 20,
    gap: 14,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroLabel: {
    color: '#DCE1FF',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '700',
    marginTop: 4,
  },
  ringWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringOuter: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(255,255,255,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringInner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringValue: {
    color: '#2F42C7',
    fontSize: 14,
    fontWeight: '800',
  },
  heroFocus: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  heroProgressTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.24)',
    overflow: 'hidden',
  },
  heroProgressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
  },
  heroWeekStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 8,
  },
  heroDayBarTrack: {
    width: 20,
    height: 64,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  heroDayBarTrackActive: {
    backgroundColor: 'rgba(255,255,255,0.24)',
  },
  heroDayBarFill: {
    width: '100%',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  heroDayBarFillActive: {
    backgroundColor: '#FFFFFF',
  },
  heroDayLabel: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 12,
    fontWeight: '700',
  },
  heroDayLabelActive: {
    color: '#FFFFFF',
  },
  heroStatsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  heroOverviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
  },
  heroOverviewButtonText: {
    color: '#2F42C7',
    fontSize: 14,
    fontWeight: '700',
  },
  sectionRow: {
    marginHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: '#1B140F',
    fontSize: 20,
    fontWeight: '700',
  },
  sectionMeta: {
    color: '#8F867F',
    fontSize: 12,
    fontWeight: '600',
  },
  taskList: {
    paddingHorizontal: 20,
    gap: 10,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 14,
  },
  taskIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EEF1FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskIconDone: {
    backgroundColor: '#EEF8EF',
  },
  taskBody: {
    flex: 1,
    gap: 3,
  },
  taskLabel: {
    color: '#1B140F',
    fontSize: 15,
    fontWeight: '700',
  },
  taskProgress: {
    color: '#7E766F',
    fontSize: 13,
  },
  taskState: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  taskStateDone: {
    backgroundColor: '#EEF8EF',
  },
  taskStatePending: {
    backgroundColor: '#EEF1FF',
  },
  taskStateText: {
    fontSize: 12,
    fontWeight: '700',
  },
  taskStateTextDone: {
    color: '#2D7D46',
  },
  taskStateTextPending: {
    color: '#2F42C7',
  },
  dayColumn: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  weekStat: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: '#F8F5F1',
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 4,
  },
  weekStatValue: {
    color: '#1B140F',
    fontSize: 15,
    fontWeight: '700',
  },
  weekStatLabel: {
    color: '#8F867F',
    fontSize: 11,
    fontWeight: '600',
  },
  weekStatInverted: {
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  weekStatValueInverted: {
    color: '#FFFFFF',
  },
  weekStatLabelInverted: {
    color: '#DCE1FF',
  },
});
