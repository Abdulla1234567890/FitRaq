import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ACTIVITY_WEEKS } from './activity-program';

export default function ActivityWeekScreen() {
  const params = useLocalSearchParams<{ weekId?: string }>();
  const initialWeekId = useMemo(() => {
    return ACTIVITY_WEEKS.find((item) => item.id === params.weekId)?.id ?? ACTIVITY_WEEKS[0].id;
  }, [params.weekId]);
  const [selectedWeekId, setSelectedWeekId] = useState(initialWeekId);
  const week = ACTIVITY_WEEKS.find((item) => item.id === selectedWeekId) ?? ACTIVITY_WEEKS[0];
  const progressValue = week.status === 'completed' ? 100 : week.status === 'current' ? 55 : 0;

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

          <Text style={styles.headerTitle}>Weekly Overview</Text>

          <View style={styles.headerSpacer} />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.weekTabs}>
          {ACTIVITY_WEEKS.map((item) => {
            const isActive = item.id === week.id;

            return (
              <Pressable
                key={item.id}
                onPress={async () => {
                  await Haptics.selectionAsync();
                  setSelectedWeekId(item.id);
                }}
                style={[styles.weekTab, isActive ? styles.weekTabActive : undefined]}
              >
                <Text style={[styles.weekTabTitle, isActive ? styles.weekTabTitleActive : undefined]}>{item.title}</Text>
                <Text style={[styles.weekTabState, isActive ? styles.weekTabStateActive : undefined]}>{item.progressLabel}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.heroCard}>
          <Text style={styles.heroFocus}>{week.focus}</Text>
          <Text style={styles.heroGoal}>{week.goal}</Text>
          <View style={styles.summaryRow}>
            <SummaryCell label="Tasks" value={`${week.tasks.length}`} />
            <SummaryCell label="Progress" value={`${progressValue}%`} />
            <SummaryCell label="State" value={week.progressLabel} />
          </View>
        </View>

        <View style={styles.checklistCard}>
          <Text style={styles.sectionTitle}>Week checklist</Text>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.tableHeaderCategory]}>Category</Text>
            <Text style={[styles.tableHeaderText, styles.tableHeaderTask]}>Task</Text>
            <Text style={[styles.tableHeaderText, styles.tableHeaderState]}>State</Text>
          </View>
          <View style={styles.taskList}>
            {week.tasks.map((task, index) => (
              <View key={`${task.category}-${index}`} style={styles.taskItem}>
                <Text style={styles.taskCategory}>{task.category}</Text>
                <Text style={styles.taskTitle}>{task.title}</Text>
                <View style={styles.taskStatePill}>
                  <Text style={styles.taskStateText}>{week.status === 'completed' ? 'Done' : index === 0 && week.status === 'current' ? 'Now' : 'Queued'}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.stateCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.sectionTitle}>Progress</Text>
            <Text style={styles.progressValue}>{progressValue}%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${Math.max(progressValue, 8)}%` }]} />
          </View>

          <View style={styles.insightRow}>
            <Text style={styles.insightLabel}>Coach note</Text>
            <Text style={styles.insightCopy}>{week.insight}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SummaryCell({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryCell}>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
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
  weekTabs: {
    gap: 10,
  },
  weekTab: {
    minWidth: 110,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 4,
  },
  weekTabActive: {
    backgroundColor: '#2F42C7',
  },
  weekTabTitle: {
    color: '#1B140F',
    fontSize: 15,
    fontWeight: '700',
  },
  weekTabTitleActive: {
    color: '#FFFFFF',
  },
  weekTabState: {
    color: '#7E766F',
    fontSize: 11,
    fontWeight: '600',
  },
  weekTabStateActive: {
    color: '#DCE1FF',
  },
  heroCard: {
    backgroundColor: '#2F42C7',
    borderRadius: 28,
    padding: 20,
    gap: 14,
  },
  heroFocus: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '700',
  },
  heroGoal: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 24,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 10,
  },
  summaryCell: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.16)',
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 4,
  },
  summaryValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  summaryLabel: {
    color: '#DCE1FF',
    fontSize: 11,
    fontWeight: '600',
  },
  checklistCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    gap: 14,
  },
  sectionTitle: {
    color: '#1B140F',
    fontSize: 20,
    fontWeight: '700',
  },
  taskList: {
    gap: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  tableHeaderText: {
    color: '#8F867F',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  tableHeaderCategory: {
    width: 84,
  },
  tableHeaderTask: {
    flex: 1,
  },
  tableHeaderState: {
    width: 64,
    textAlign: 'right',
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 18,
    backgroundColor: '#F8F5F1',
    padding: 12,
  },
  taskCategory: {
    width: 84,
    color: '#8F867F',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  taskTitle: {
    flex: 1,
    color: '#1B140F',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  taskStatePill: {
    width: 64,
    borderRadius: 999,
    backgroundColor: '#EEF1FF',
    paddingVertical: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskStateText: {
    color: '#2F42C7',
    fontSize: 11,
    fontWeight: '700',
  },
  stateCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    gap: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressValue: {
    color: '#2F42C7',
    fontSize: 18,
    fontWeight: '700',
  },
  progressTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: '#E7E0D8',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#2F42C7',
  },
  insightRow: {
    borderRadius: 18,
    backgroundColor: '#F8F5F1',
    padding: 14,
    gap: 6,
  },
  insightLabel: {
    color: '#8F867F',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  insightCopy: {
    color: '#6E665F',
    fontSize: 14,
    lineHeight: 22,
  },
});
