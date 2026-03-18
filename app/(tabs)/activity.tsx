import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const TODAY_TASKS = [
  { id: 'steps', label: '8,000 steps', progress: '6.3k / 8k', done: false, icon: 'directions-walk' },
  { id: 'journey', label: '20 min walk or run', progress: 'Pending', done: false, icon: 'directions-run' },
  { id: 'meals', label: 'Log all meals', progress: '2 / 3', done: false, icon: 'restaurant' },
  { id: 'water', label: '2.5L water', progress: 'Done', done: true, icon: 'water-drop' },
];

const WEEK_DAYS = [
  { day: 'M', score: 1, active: false },
  { day: 'T', score: 1, active: false },
  { day: 'W', score: 0.7, active: true },
  { day: 'T', score: 0.2, active: false },
  { day: 'F', score: 0, active: false },
  { day: 'S', score: 0, active: false },
  { day: 'S', score: 0, active: false },
];

export default function ActivityScreen() {
  const completedToday = TODAY_TASKS.filter((task) => task.done).length;
  const completionRatio = completedToday / TODAY_TASKS.length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.eyebrow}>DAILY TRACKER</Text>
            <Text style={styles.title}>Today</Text>
          </View>

          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>{completedToday}/{TODAY_TASKS.length}</Text>
          </View>
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View>
              <Text style={styles.heroLabel}>Current week</Text>
              <Text style={styles.heroTitle}>Week 2</Text>
            </View>

            <View style={styles.ringWrap}>
              <View style={styles.ringOuter}>
                <View style={styles.ringInner}>
                  <Text style={styles.ringValue}>{Math.round(completionRatio * 100)}%</Text>
                </View>
              </View>
            </View>
          </View>

          <Text style={styles.heroFocus}>Tighten the routine</Text>

          <View style={styles.heroProgressTrack}>
            <View style={[styles.heroProgressFill, { width: `${Math.max(completionRatio * 100, 8)}%` }]} />
          </View>
        </View>

        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Today&apos;s checklist</Text>
          <Text style={styles.sectionMeta}>Tap to update later</Text>
        </View>

        <View style={styles.taskList}>
          {TODAY_TASKS.map((task) => (
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

        <View style={styles.weekCard}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>This week</Text>
            <Pressable
              onPress={async () => {
                await Haptics.selectionAsync();
                router.push({
                  pathname: '/(tabs)/activity-week',
                  params: { weekId: 'week-2' },
                });
              }}
            >
              <Text style={styles.weekLink}>Overview</Text>
            </Pressable>
          </View>

          <View style={styles.weekStrip}>
            {WEEK_DAYS.map((item, index) => (
              <View key={`${item.day}-${index}`} style={styles.dayColumn}>
                <View style={[styles.dayBarTrack, item.active ? styles.dayBarTrackActive : undefined]}>
                  <View
                    style={[
                      styles.dayBarFill,
                      item.active ? styles.dayBarFillActive : undefined,
                      { height: `${Math.max(item.score * 100, 12)}%` },
                    ]}
                  />
                </View>
                <Text style={[styles.dayLabel, item.active ? styles.dayLabelActive : undefined]}>{item.day}</Text>
              </View>
            ))}
          </View>

          <View style={styles.weekStatsRow}>
            <WeekStat label="Days done" value="2/7" />
            <WeekStat label="Streak" value="3 days" />
            <WeekStat label="Week score" value="71%" />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function WeekStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.weekStat}>
      <Text style={styles.weekStatValue}>{value}</Text>
      <Text style={styles.weekStatLabel}>{label}</Text>
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
  headerBadge: {
    minWidth: 56,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: 'center',
  },
  headerBadgeText: {
    color: '#2F42C7',
    fontSize: 14,
    fontWeight: '700',
  },
  heroCard: {
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
  sectionRow: {
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
  weekCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    gap: 16,
  },
  weekLink: {
    color: '#2F42C7',
    fontSize: 13,
    fontWeight: '700',
  },
  weekStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 8,
  },
  dayColumn: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  dayBarTrack: {
    width: 20,
    height: 76,
    borderRadius: 999,
    backgroundColor: '#ECE5DC',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  dayBarTrackActive: {
    backgroundColor: '#D9E0FF',
  },
  dayBarFill: {
    width: '100%',
    borderRadius: 999,
    backgroundColor: '#B9B3AB',
  },
  dayBarFillActive: {
    backgroundColor: '#2F42C7',
  },
  dayLabel: {
    color: '#8F867F',
    fontSize: 12,
    fontWeight: '700',
  },
  dayLabelActive: {
    color: '#2F42C7',
  },
  weekStatsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  weekStat: {
    flex: 1,
    borderRadius: 18,
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
});
