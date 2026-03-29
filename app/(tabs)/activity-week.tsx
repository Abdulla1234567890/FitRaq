import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import { useFocusEffect } from '@react-navigation/native';
import { getCurrentActivityPlan } from '@/lib/user-session';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { resolveActivityWeeks } from './activity-program';

export default function ActivityWeekScreen() {
  const params = useLocalSearchParams<{ weekId?: string }>();
  const [activityPlan, setActivityPlan] = useState(() => getCurrentActivityPlan());

  useFocusEffect(
    useCallback(() => {
      setActivityPlan(getCurrentActivityPlan());
    }, [])
  );

  const activityWeeks = useMemo(() => resolveActivityWeeks(activityPlan), [activityPlan]);
  const defaultExpandedWeek =
    activityWeeks.find((item) => item.id === params.weekId)?.id ??
    activityWeeks.find((item) => item.status === 'current')?.id ??
    activityWeeks[0]?.id;
  const [expandedWeekId, setExpandedWeekId] = useState(defaultExpandedWeek);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Pressable
            onPress={async () => {
              await Haptics.selectionAsync();
              router.back();
            }}
            style={styles.iconButton}
          >
            <MaterialIcons color="#2F42C7" name="arrow-back-ios-new" size={20} />
          </Pressable>

          <Text style={styles.headerTitle}>Weekly Progress</Text>

          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.introCard}>
          <Text style={styles.introEyebrow}>GAMIFIED PLAN</Text>
          <Text style={styles.introTitle}>Unlock your next weeks one by one.</Text>
          <Text style={styles.introSubtitle}>Completed weeks stay visible, the current week stays open, and future weeks remain locked until you earn them.</Text>
        </View>

        <View style={styles.weekList}>
          {activityWeeks.map((week, index) => {
            const isLocked = week.status === 'locked';
            const isCurrent = week.status === 'current';
            const isCompleted = week.status === 'completed';
            const isExpanded = expandedWeekId === week.id && !isLocked;
            const progressValue = isCompleted ? 100 : isCurrent ? 55 : 0;

            return (
              <Pressable
                key={week.id}
                disabled={isLocked}
                onPress={async () => {
                  if (isLocked) {
                    return;
                  }

                  await Haptics.selectionAsync();
                  setExpandedWeekId((current) => (current === week.id ? '' : week.id));
                }}
                style={[
                  styles.weekCard,
                  isCurrent ? styles.weekCardCurrent : undefined,
                  isCompleted ? styles.weekCardCompleted : undefined,
                  isLocked ? styles.weekCardLocked : undefined,
                ]}
              >
                <View style={styles.weekCardTop}>
                  <View style={styles.weekTitleBlock}>
                    <View style={styles.weekTitleRow}>
                      <Text style={[styles.weekTitle, isLocked ? styles.weekTitleLocked : undefined]}>{week.title}</Text>
                      {isCurrent ? (
                        <View style={styles.currentPill}>
                          <Text style={styles.currentPillText}>Current</Text>
                        </View>
                      ) : null}
                    </View>
                    <Text style={[styles.weekFocus, isLocked ? styles.weekFocusLocked : undefined]}>{week.focus}</Text>
                  </View>

                  <View
                    style={[
                      styles.weekStateBadge,
                      isCurrent ? styles.weekStateBadgeCurrent : undefined,
                      isCompleted ? styles.weekStateBadgeCompleted : undefined,
                      isLocked ? styles.weekStateBadgeLocked : undefined,
                    ]}
                  >
                    <MaterialIcons
                      color={
                        isCurrent ? '#2F42C7' : isCompleted ? '#2D7D46' : '#8A817A'
                      }
                      name={isCurrent ? 'bolt' : isCompleted ? 'check-circle' : 'lock'}
                      size={16}
                    />
                    {!isCurrent ? (
                      <Text
                        style={[
                          styles.weekStateText,
                          isCompleted ? styles.weekStateTextCompleted : undefined,
                          isLocked ? styles.weekStateTextLocked : undefined,
                        ]}
                      >
                        {week.progressLabel}
                      </Text>
                    ) : null}
                  </View>
                </View>

                <Text style={[styles.weekGoal, isLocked ? styles.weekGoalLocked : undefined]}>{week.goal}</Text>

                <View style={styles.progressRow}>
                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${Math.max(progressValue, 8)}%` }]} />
                  </View>
                  <Text style={[styles.progressLabel, isLocked ? styles.progressLabelLocked : undefined]}>
                    {progressValue}%
                  </Text>
                </View>

                {isLocked ? (
                  <View style={styles.lockedHintRow}>
                    <MaterialIcons color="#8A817A" name="lock-outline" size={16} />
                    <Text style={styles.lockedHintText}>Finish {index === 0 ? 'the current week' : activityWeeks[index - 1].title} to unlock this one.</Text>
                  </View>
                ) : isExpanded ? (
                  <View style={styles.expandedBlock}>
                    <Text style={styles.checklistTitle}>Week checklist</Text>
                    <View style={styles.taskList}>
                      {week.tasks.map((task, taskIndex) => (
                        <View key={`${week.id}-${taskIndex}`} style={styles.taskRow}>
                          <View style={styles.taskDot} />
                          <View style={styles.taskCopy}>
                            <Text style={styles.taskCategory}>{task.category}</Text>
                            <Text style={styles.taskText}>{task.title}</Text>
                          </View>
                        </View>
                      ))}
                    </View>

                    <View style={styles.insightCard}>
                      <Text style={styles.insightLabel}>Coach note</Text>
                      <Text style={styles.insightText}>{week.insight}</Text>
                    </View>
                  </View>
                ) : (
                  <Text style={styles.tapHint}>Tap to view this week</Text>
                )}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
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
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#2F42C7',
    fontSize: 22,
    fontWeight: '700',
  },
  headerSpacer: {
    width: 42,
  },
  introCard: {
    borderRadius: 24,
    backgroundColor: '#FBF9F5',
    paddingHorizontal: 18,
    paddingVertical: 18,
    gap: 8,
  },
  introEyebrow: {
    color: '#8F867F',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  introTitle: {
    color: '#1B140F',
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '700',
  },
  introSubtitle: {
    color: '#756C65',
    fontSize: 14,
    lineHeight: 20,
  },
  weekList: {
    gap: 14,
  },
  weekCard: {
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingVertical: 18,
    gap: 14,
    borderWidth: 1,
    borderColor: 'rgba(47,66,199,0.08)',
  },
  weekCardCurrent: {
    backgroundColor: '#EEF1FF',
    borderColor: 'rgba(47,66,199,0.14)',
  },
  weekCardCompleted: {
    backgroundColor: '#F8FBF8',
    borderColor: 'rgba(45,125,70,0.12)',
  },
  weekCardLocked: {
    backgroundColor: '#F0ECE6',
    borderColor: 'rgba(138,129,122,0.14)',
  },
  weekCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  weekTitleBlock: {
    flex: 1,
    gap: 4,
  },
  weekTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  weekTitle: {
    color: '#1B140F',
    fontSize: 24,
    fontWeight: '800',
  },
  currentPill: {
    borderRadius: 999,
    backgroundColor: '#DDE5FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  currentPillText: {
    color: '#2F42C7',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  weekTitleLocked: {
    color: '#746C66',
  },
  weekFocus: {
    color: '#5F6DCB',
    fontSize: 14,
    fontWeight: '700',
  },
  weekFocusLocked: {
    color: '#8A817A',
  },
  weekStateBadge: {
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  weekStateBadgeCurrent: {
    backgroundColor: '#FFFFFF',
  },
  weekStateBadgeCompleted: {
    backgroundColor: '#EFF8F1',
  },
  weekStateBadgeLocked: {
    backgroundColor: '#E6E0D8',
  },
  weekStateText: {
    color: '#1B140F',
    fontSize: 12,
    fontWeight: '700',
  },
  weekStateTextCurrent: {
    color: '#2F42C7',
  },
  weekStateTextCompleted: {
    color: '#2D7D46',
  },
  weekStateTextLocked: {
    color: '#746C66',
  },
  weekGoal: {
    color: '#1B140F',
    fontSize: 16,
    lineHeight: 23,
    fontWeight: '600',
  },
  weekGoalLocked: {
    color: '#746C66',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  progressTrack: {
    flex: 1,
    height: 8,
    borderRadius: 999,
    backgroundColor: '#E5E8F7',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#2F42C7',
  },
  progressLabel: {
    color: '#2F42C7',
    fontSize: 12,
    fontWeight: '700',
  },
  progressLabelLocked: {
    color: '#8A817A',
  },
  lockedHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  lockedHintText: {
    flex: 1,
    color: '#746C66',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  expandedBlock: {
    gap: 14,
  },
  checklistTitle: {
    color: '#1B140F',
    fontSize: 16,
    fontWeight: '700',
  },
  taskList: {
    gap: 10,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  taskDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: '#2F42C7',
    marginTop: 6,
  },
  taskCopy: {
    flex: 1,
    gap: 2,
  },
  taskCategory: {
    color: '#8F867F',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  taskText: {
    color: '#1B140F',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  insightCard: {
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 4,
  },
  insightLabel: {
    color: '#8F867F',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  insightText: {
    color: '#1B140F',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  tapHint: {
    color: '#7A726B',
    fontSize: 13,
    fontWeight: '600',
  },
});
