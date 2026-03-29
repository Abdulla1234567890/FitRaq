import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomePageScreen() {
  const params = useLocalSearchParams<{ name?: string }>();
  const firstName = useMemo(() => {
    const rawName = Array.isArray(params.name) ? params.name[0] : params.name;
    return rawName?.trim() || 'Janna';
  }, [params.name]);

  const dateLabel = useMemo(
    () =>
      new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      }).format(new Date()).toUpperCase(),
    []
  );

  const handleOpenMenu = async () => {
    await Haptics.selectionAsync();
  };

  const handleProfile = async () => {
    await Haptics.selectionAsync();
    router.push('/(tabs)/profile');
  };

  const handleOpenFocus = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(tabs)/activity');
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Pressable onPress={handleOpenMenu} style={styles.iconButton}>
            <MaterialIcons color="#1E1A17" name="menu" size={32} />
          </Pressable>

          <Text style={styles.headerTitle}>FitRaq</Text>

          <Pressable onPress={handleProfile} style={styles.avatar}>
            <Text style={styles.avatarText}>{firstName.slice(0, 2).toUpperCase()}</Text>
          </Pressable>
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={styles.heroCopy}>
              <Text style={styles.heroEyebrow}>{dateLabel}</Text>
              <Text style={styles.heroTitle}>Hey {firstName},{'\n'}keep pushing.</Text>
            </View>

            <View style={styles.levelCard}>
              <Text style={styles.levelValue}>12</Text>
              <Text style={styles.levelLabel}>LEVEL</Text>
            </View>
          </View>

          <View style={styles.heroProgressTrack}>
            <View style={styles.heroProgressFill} />
          </View>

          <View style={styles.heroBottomRow}>
            <Text style={styles.heroFootnote}>396 XP today</Text>
            <Text style={styles.heroFootnote}>620 XP to level 13</Text>
          </View>
        </View>

        <View style={styles.metricRow}>
          <MetricCard label="STEPS" value="6,625" />
          <MetricCard label="KM" value="7.1" />
          <MetricCard label="STREAK" value="7" accent icon="local-fire-department" />
        </View>

        <View style={styles.questCard}>
          <View style={styles.questTopRow}>
            <View style={styles.questBadge}>
              <Text style={styles.questBadgeText}>DAILY QUEST</Text>
            </View>
            <Text style={styles.questXp}>+150 XP</Text>
          </View>

          <Text style={styles.questTitle}>Desert Dash —{'\n'}Run 5km today</Text>

          <View style={styles.questProgressTrack}>
            <View style={styles.questProgressFill} />
          </View>

          <View style={styles.questBottomRow}>
            <Text style={styles.questMeta}>2.1 km done</Text>
            <Text style={styles.questMeta}>5 km goal</Text>
          </View>
        </View>

        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Today&apos;s focus</Text>
          <Pressable onPress={handleOpenFocus}>
            <Text style={styles.sectionLink}>Plan →</Text>
          </Pressable>
        </View>

        <View style={styles.focusCard}>
          <View style={styles.focusTopRow}>
            <View>
              <Text style={styles.focusEyebrow}>Today&apos;s focus</Text>
              <Text style={styles.focusTitle}>20 min walk or run</Text>
            </View>
            <Text style={styles.focusXP}>+80 XP</Text>
          </View>

          <View style={styles.focusInfoRow}>
            <View style={styles.focusInfoPill}>
              <MaterialIcons color="#2F42C7" name="schedule" size={16} />
              <Text style={styles.focusInfoText}>20 min</Text>
            </View>

            <View style={styles.focusInfoPill}>
              <MaterialIcons color="#2F42C7" name="flag" size={16} />
              <Text style={styles.focusInfoText}>Week 2 target</Text>
            </View>
          </View>

          <View style={styles.focusProgressRow}>
            <View style={styles.focusProgressTrack}>
              <View style={styles.focusProgressFill} />
            </View>
            <Text style={styles.focusProgressText}>3/5 done</Text>
          </View>

          <View style={styles.focusActionRow}>
            <Pressable onPress={handleOpenFocus} style={styles.focusButtonPrimary}>
              <Text style={styles.focusButtonPrimaryText}>Open plan</Text>
            </Pressable>

            <View style={styles.focusMiniCard}>
              <MaterialIcons color="#2F42C7" name="local-fire-department" size={16} />
              <Text style={styles.focusMiniCardText}>Streak on</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function MetricCard({
  label,
  value,
  accent = false,
  icon,
}: {
  label: string;
  value: string;
  accent?: boolean;
  icon?: keyof typeof MaterialIcons.glyphMap;
}) {
  return (
    <View style={styles.metricCard}>
      <View style={styles.metricTopRow}>
        {icon ? (
          <MaterialIcons
            color={accent ? '#FF6F3C' : '#1E1A17'}
            name={icon}
            size={20}
          />
        ) : null}
        <Text style={[styles.metricValue, accent ? styles.metricValueAccent : undefined]}>{value}</Text>
      </View>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4EFE8',
  },
  content: {
    paddingHorizontal: 14,
    paddingTop: 22,
    paddingBottom: 28,
    gap: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#2F42C7',
    fontSize: 24,
    fontWeight: '700',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: 'rgba(47,66,199,0.14)',
  },
  avatarText: {
    color: '#2F42C7',
    fontSize: 14,
    fontWeight: '800',
  },
  heroCard: {
    borderRadius: 28,
    backgroundColor: '#FBF9F5',
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: 'rgba(47,66,199,0.08)',
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 14,
  },
  heroCopy: {
    flex: 1,
    gap: 8,
  },
  heroEyebrow: {
    color: '#8F867F',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  heroTitle: {
    color: '#1B140F',
    fontSize: 23,
    lineHeight: 29,
    fontWeight: '800',
  },
  levelCard: {
    width: 58,
    borderRadius: 18,
    backgroundColor: '#EEF1FF',
    borderWidth: 1,
    borderColor: 'rgba(47,66,199,0.08)',
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelValue: {
    color: '#2F42C7',
    fontSize: 26,
    fontWeight: '800',
    lineHeight: 26,
  },
  levelLabel: {
    color: '#5F6DCB',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  heroProgressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: '#E6E8F7',
    overflow: 'hidden',
  },
  heroProgressFill: {
    width: '56%',
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#2F42C7',
  },
  heroBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  heroFootnote: {
    color: '#7D756F',
    fontSize: 12,
    fontWeight: '600',
  },
  metricRow: {
    flexDirection: 'row',
    gap: 10,
  },
  metricCard: {
    flex: 1,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    shadowColor: '#000000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  metricTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricValue: {
    color: '#1E1A17',
    fontSize: 18,
    fontWeight: '800',
  },
  metricValueAccent: {
    color: '#D46D45',
  },
  metricLabel: {
    color: '#9A938B',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  questCard: {
    borderRadius: 24,
    backgroundColor: '#FBF9F5',
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: 'rgba(30,32,49,0.08)',
  },
  questTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  questBadge: {
    borderRadius: 999,
    backgroundColor: '#FFF1E8',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  questBadgeText: {
    color: '#FF7B45',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  questXp: {
    color: '#D46D45',
    fontSize: 20,
    fontWeight: '800',
  },
  questTitle: {
    color: '#1E1A17',
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '800',
  },
  questProgressTrack: {
    height: 6,
    borderRadius: 999,
    backgroundColor: '#E7E2DB',
    overflow: 'hidden',
  },
  questProgressFill: {
    width: '44%',
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#D46D45',
  },
  questBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  questMeta: {
    color: '#7D756F',
    fontSize: 12,
    fontWeight: '600',
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  sectionTitle: {
    color: '#1E1A17',
    fontSize: 28,
    fontWeight: '800',
  },
  sectionLink: {
    color: '#2F42C7',
    fontSize: 14,
    fontWeight: '700',
  },
  focusCard: {
    borderRadius: 24,
    backgroundColor: '#F7F8FE',
    paddingHorizontal: 18,
    paddingVertical: 18,
    gap: 12,
    shadowColor: '#000000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(47,66,199,0.06)',
  },
  focusTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  focusEyebrow: {
    color: '#8B84A0',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  focusXP: {
    color: '#2F42C7',
    fontSize: 20,
    fontWeight: '800',
  },
  focusTitle: {
    color: '#1E1A17',
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '800',
  },
  focusInfoRow: {
    flexDirection: 'row',
    gap: 10,
  },
  focusInfoPill: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  focusInfoText: {
    color: '#2F42C7',
    fontSize: 13,
    fontWeight: '700',
  },
  focusProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  focusProgressTrack: {
    flex: 1,
    height: 8,
    borderRadius: 999,
    backgroundColor: '#E0E5FA',
    overflow: 'hidden',
  },
  focusProgressFill: {
    width: '60%',
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#2F42C7',
  },
  focusProgressText: {
    color: '#6D6A86',
    fontSize: 12,
    fontWeight: '700',
  },
  focusActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  focusButtonPrimary: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: '#2F42C7',
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  focusButtonPrimaryText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  focusMiniCard: {
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  focusMiniCardText: {
    color: '#2F42C7',
    fontSize: 13,
    fontWeight: '700',
  },
});
