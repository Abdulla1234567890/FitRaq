import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TRAILS } from './journey-data';

export default function HomePageScreen() {
  const latestTrail = TRAILS[0];
  const params = useLocalSearchParams<{ name?: string }>();
  const firstName = useMemo(() => {
    const rawName = Array.isArray(params.name) ? params.name[0] : params.name;
    return rawName?.trim() || 'Janna';
  }, [params.name]);

  const dateLabel = useMemo(
    () =>
      new Intl.DateTimeFormat('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(new Date()),
    []
  );

  const handleOpenMenu = async () => {
    await Haptics.selectionAsync();
  };

  const handleProfile = async () => {
    await Haptics.selectionAsync();
    router.push('/(tabs)/profile');
  };

  const handleOpenJourneys = async () => {
    await Haptics.selectionAsync();
    router.push('/(tabs)/journeys');
  };

  const handleOpenActivity = async () => {
    await Haptics.selectionAsync();
    router.push('/(tabs)/activity');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Pressable onPress={handleOpenMenu} style={styles.iconButton}>
            <MaterialIcons color="#2F42C7" name="menu" size={34} />
          </Pressable>

          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerTitle}>Home Page</Text>
          </View>

          <Pressable onPress={handleProfile} style={styles.avatar}>
            <Text style={styles.avatarText}>{firstName.slice(0, 1).toUpperCase()}</Text>
          </Pressable>
        </View>

        <View style={styles.topSection}>
          <View style={styles.heroIntroCard}>
            <View style={styles.heroIntroTop}>
              <View style={styles.greetingBlock}>
                <Text style={styles.greetingOverline}>{dateLabel}</Text>
                <Text style={styles.greetingText}>Hi, {firstName}</Text>
              </View>

              <View style={styles.heroMiniBadge}>
                <MaterialIcons color="#2F42C7" name="bolt" size={16} />
                <Text style={styles.heroMiniBadgeText}>Ready</Text>
              </View>
            </View>

            <View style={styles.heroStatsRow}>
              <View style={styles.heroStatCard}>
                <Text style={styles.heroStatValue}>71%</Text>
                <Text style={styles.heroStatLabel}>Week score</Text>
              </View>

              <View style={styles.heroStatCard}>
                <Text style={styles.heroStatValue}>3</Text>
                <Text style={styles.heroStatLabel}>Day streak</Text>
              </View>

              <View style={styles.heroStatCardWide}>
                <View style={styles.heroProgressTop}>
                  <Text style={styles.heroProgressValue}>2 / 4</Text>
                  <Text style={styles.heroProgressLabel}>Weekly goal</Text>
                </View>
                <View style={styles.heroProgressTrack}>
                  <View style={styles.heroProgressFillSoft} />
                </View>
              </View>
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today&apos;s Path</Text>
            <Text style={styles.sectionSubtitle}>Your latest journey at a glance.</Text>
          </View>
        </View>

        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>6,625</Text>
            <Text style={styles.statLabel}>Steps</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>7.1</Text>
            <Text style={styles.statLabel}>KM</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>396</Text>
            <Text style={styles.statLabel}>XP</Text>
          </View>
        </View>

        <View style={styles.summaryGrid}>
          <View style={styles.summaryCardPrimary}>
            <View style={styles.summaryCardTop}>
              <Text style={styles.summaryEyebrow}>Latest route</Text>
              <View style={styles.summaryBadge}>
                <MaterialIcons color="#FFFFFF" name="alt-route" size={14} />
                <Text style={styles.summaryBadgeText}>Logbook</Text>
              </View>
            </View>

            <Text style={styles.summaryTitle}>{latestTrail.title}</Text>
            <Text style={styles.summarySubtitle}>{latestTrail.area}</Text>

            <View style={styles.summaryMetricRow}>
              <View style={styles.summaryMetric}>
                <Text style={styles.summaryMetricValue}>{latestTrail.distanceKm.toFixed(1)} km</Text>
                <Text style={styles.summaryMetricLabel}>Distance</Text>
              </View>
              <View style={styles.summaryMetric}>
                <Text style={styles.summaryMetricValue}>{latestTrail.durationMinutes} min</Text>
                <Text style={styles.summaryMetricLabel}>Time</Text>
              </View>
            </View>
          </View>

          <View style={styles.summaryCardSoft}>
            <Text style={styles.summaryEyebrowSoft}>Today</Text>
            <Text style={styles.summaryBigValue}>3 / 5</Text>
            <Text style={styles.summarySoftLabel}>tasks done</Text>

            <View style={styles.summaryMiniTrack}>
              <View style={styles.summaryMiniFill} />
            </View>

            <View style={styles.summaryPill}>
              <MaterialIcons color="#2F42C7" name="local-fire-department" size={14} />
              <Text style={styles.summaryPillText}>1,640 kcal logged</Text>
            </View>
          </View>
        </View>

        <View style={styles.quickActionsCard}>
          <View style={styles.quickActionsHeader}>
            <View style={styles.quickActionLead}>
              <Text style={styles.quickActionsTitle}>Quick Overview</Text>
              <Text style={styles.quickActionsSubtitle}>Use the center tab to jump straight into a journey.</Text>
            </View>
          </View>

          <View style={styles.quickActionRow}>
            <Pressable onPress={handleOpenJourneys} style={styles.quickActionButton}>
              <MaterialIcons color="#2F42C7" name="map" size={18} />
              <Text style={styles.quickActionButtonText}>Open Logbook</Text>
            </Pressable>

            <Pressable onPress={handleOpenActivity} style={styles.quickActionButton}>
              <MaterialIcons color="#2F42C7" name="checklist" size={18} />
              <Text style={styles.quickActionButtonText}>View Plan</Text>
            </Pressable>
          </View>
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
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 28,
    gap: 18,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  headerTitleWrap: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    color: '#2F42C7',
    fontSize: 23,
    fontWeight: '600',
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(47,66,199,0.08)',
  },
  avatarText: {
    color: '#2F42C7',
    fontSize: 14,
    fontWeight: '700',
  },
  topSection: {
    gap: 16,
    paddingTop: 6,
    paddingBottom: 4,
  },
  heroIntroCard: {
    borderRadius: 28,
    backgroundColor: '#FBF9F5',
    paddingHorizontal: 18,
    paddingVertical: 18,
    gap: 16,
    shadowColor: '#000000',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  heroIntroTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  heroMiniBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  heroMiniBadgeText: {
    color: '#2F42C7',
    fontSize: 12,
    fontWeight: '700',
  },
  greetingBlock: {
    flex: 1,
    gap: 6,
  },
  greetingOverline: {
    color: '#756C65',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  greetingText: {
    color: '#1B140F',
    fontSize: 38,
    lineHeight: 40,
    fontWeight: '700',
  },
  heroStatsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  heroStatCard: {
    flex: 1,
    minWidth: 92,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 4,
  },
  heroStatCardWide: {
    width: '100%',
    borderRadius: 18,
    backgroundColor: '#EEF1FF',
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 10,
  },
  heroStatValue: {
    color: '#2F42C7',
    fontSize: 24,
    fontWeight: '700',
  },
  heroStatLabel: {
    color: '#756C65',
    fontSize: 12,
    fontWeight: '600',
  },
  heroProgressTop: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 8,
  },
  heroProgressValue: {
    color: '#2F42C7',
    fontSize: 22,
    fontWeight: '700',
  },
  heroProgressLabel: {
    color: '#5F6DCB',
    fontSize: 12,
    fontWeight: '700',
  },
  heroProgressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(47,66,199,0.14)',
    overflow: 'hidden',
  },
  heroProgressFillSoft: {
    width: '50%',
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#2F42C7',
  },
  sectionHeader: {
    gap: 4,
  },
  sectionTitle: {
    color: '#1B140F',
    fontSize: 24,
    fontWeight: '500',
  },
  sectionSubtitle: {
    color: '#756C65',
    fontSize: 14,
    lineHeight: 20,
  },
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2F42C7',
    borderRadius: 22,
    paddingVertical: 18,
    paddingHorizontal: 16,
    shadowColor: '#2F42C7',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '500',
  },
  statLabel: {
    color: '#E5E8FF',
    fontSize: 12,
    letterSpacing: 0.6,
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  summaryCardPrimary: {
    flex: 1.2,
    borderRadius: 28,
    backgroundColor: '#2F42C7',
    padding: 18,
    gap: 16,
    shadowColor: '#2F42C7',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  summaryCardTop: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  summaryEyebrow: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  summaryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.16)',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  summaryBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  summaryTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    lineHeight: 28,
    fontWeight: '700',
  },
  summarySubtitle: {
    color: 'rgba(255,255,255,0.76)',
    fontSize: 14,
    marginTop: -8,
  },
  summaryMetricRow: {
    flexDirection: 'row',
    gap: 10,
  },
  summaryMetric: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 4,
  },
  summaryMetricValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  summaryMetricLabel: {
    color: 'rgba(255,255,255,0.68)',
    fontSize: 11,
    fontWeight: '600',
  },
  summaryCardSoft: {
    flex: 0.9,
    borderRadius: 28,
    backgroundColor: '#FBF9F5',
    padding: 18,
    gap: 12,
    shadowColor: '#000000',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  summaryEyebrowSoft: {
    color: '#756C65',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  summaryBigValue: {
    color: '#1B140F',
    fontSize: 34,
    lineHeight: 36,
    fontWeight: '700',
  },
  summarySoftLabel: {
    color: '#756C65',
    fontSize: 13,
    fontWeight: '600',
    marginTop: -4,
  },
  summaryMiniTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: '#ECE7DD',
    overflow: 'hidden',
  },
  summaryMiniFill: {
    width: '60%',
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#2F42C7',
  },
  summaryPill: {
    marginTop: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    backgroundColor: '#EEF1FF',
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  summaryPillText: {
    color: '#2F42C7',
    fontSize: 12,
    fontWeight: '700',
  },
  quickActionsCard: {
    borderRadius: 28,
    backgroundColor: '#FBF9F5',
    padding: 18,
    gap: 16,
    shadowColor: '#000000',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  quickActionsHeader: {
    gap: 4,
  },
  quickActionLead: {
    flex: 1,
    gap: 4,
  },
  quickActionsTitle: {
    color: '#1B140F',
    fontSize: 24,
    fontWeight: '700',
  },
  quickActionsSubtitle: {
    color: '#756C65',
    fontSize: 14,
    lineHeight: 20,
  },
  quickActionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  quickActionButtonText: {
    color: '#2F42C7',
    fontSize: 14,
    fontWeight: '700',
  },
});
