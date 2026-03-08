import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const profileStats = [
  { label: 'Age', value: '24' },
  { label: 'Weight', value: '62 kg' },
  { label: 'Height', value: '170 cm' },
];

const activityStats = [
  { icon: 'local-fire-department', label: 'Weekly streak', value: '5 days' },
  { icon: 'directions-run', label: 'Total distance', value: '31.4 km' },
  { icon: 'favorite', label: 'Resting pulse', value: '64 bpm' },
];

const preferenceItems = [
  { label: 'Primary goal', value: 'Build stamina' },
  { label: 'Preferred terrain', value: 'Urban streets' },
  { label: 'Movement style', value: 'Steady endurance' },
];

const accountActions = [
  { icon: 'person-outline', label: 'Edit profile' },
  { icon: 'notifications-none', label: 'Notifications' },
  { icon: 'security', label: 'Privacy & security' },
  { icon: 'help-outline', label: 'Help & support' },
];

export default function ProfileScreen() {
  const params = useLocalSearchParams<{ name?: string }>();
  const firstName = useMemo(() => {
    const rawName = Array.isArray(params.name) ? params.name[0] : params.name;
    return rawName?.trim() || 'Janna';
  }, [params.name]);

  const handlePress = async () => {
    await Haptics.selectionAsync();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.eyebrow}>FITRAQ PROFILE</Text>
            <Text style={styles.title}>Profile</Text>
          </View>

          <Pressable onPress={handlePress} style={styles.headerAction}>
            <MaterialIcons color="#2F42C7" name="edit" size={22} />
          </Pressable>
        </View>

        <View style={styles.heroCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{firstName.slice(0, 1).toUpperCase()}</Text>
          </View>

          <Text style={styles.name}>{firstName}</Text>
          <Text style={styles.subtitle}>Focused on consistent progress and better recovery.</Text>

          <View style={styles.goalBadge}>
            <MaterialIcons color="#FFFFFF" name="flag" size={16} />
            <Text style={styles.goalBadgeText}>Goal: 4 workouts this week</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basics</Text>
          <View style={styles.statsRow}>
            {profileStats.map((item) => (
              <View key={item.label} style={styles.statCard}>
                <Text style={styles.statValue}>{item.value}</Text>
                <Text style={styles.statLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activity Snapshot</Text>
          <View style={styles.listCard}>
            {activityStats.map((item) => (
              <View key={item.label} style={styles.listRow}>
                <View style={styles.listIconWrap}>
                  <MaterialIcons color="#2F42C7" name={item.icon as never} size={20} />
                </View>
                <View style={styles.listTextWrap}>
                  <Text style={styles.listLabel}>{item.label}</Text>
                  <Text style={styles.listValue}>{item.value}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.listCard}>
            {preferenceItems.map((item) => (
              <View key={item.label} style={styles.preferenceRow}>
                <Text style={styles.preferenceLabel}>{item.label}</Text>
                <Text style={styles.preferenceValue}>{item.value}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.listCard}>
            {accountActions.map((item) => (
              <Pressable key={item.label} onPress={handlePress} style={styles.actionRow}>
                <View style={styles.actionLeft}>
                  <MaterialIcons color="#2F42C7" name={item.icon as never} size={20} />
                  <Text style={styles.actionText}>{item.label}</Text>
                </View>
                <MaterialIcons color="#8C837B" name="chevron-right" size={22} />
              </Pressable>
            ))}
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
    gap: 22,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eyebrow: {
    color: '#8C837B',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.1,
  },
  title: {
    color: '#1B140F',
    fontSize: 32,
    fontWeight: '600',
    marginTop: 4,
  },
  headerAction: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingHorizontal: 22,
    paddingVertical: 26,
    gap: 12,
  },
  avatar: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: '#2F42C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
  },
  name: {
    color: '#1B140F',
    fontSize: 28,
    fontWeight: '600',
  },
  subtitle: {
    color: '#756C65',
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    maxWidth: 260,
  },
  goalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#2F42C7',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  goalBadgeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    color: '#1B140F',
    fontSize: 20,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 10,
    alignItems: 'center',
    gap: 6,
  },
  statValue: {
    color: '#2F42C7',
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    color: '#756C65',
    fontSize: 12,
    fontWeight: '600',
  },
  listCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  listIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EEF1FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listTextWrap: {
    gap: 2,
  },
  listLabel: {
    color: '#756C65',
    fontSize: 13,
  },
  listValue: {
    color: '#1B140F',
    fontSize: 16,
    fontWeight: '600',
  },
  preferenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0ECE7',
  },
  preferenceLabel: {
    color: '#756C65',
    fontSize: 14,
  },
  preferenceValue: {
    color: '#1B140F',
    fontSize: 14,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0ECE7',
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionText: {
    color: '#1B140F',
    fontSize: 15,
    fontWeight: '500',
  },
});
