import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
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
      new Intl.DateTimeFormat('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(new Date()),
    []
  );

  const handleStartJourney = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(tabs)/journeys');
  };

  const handleOpenMenu = async () => {
    await Haptics.selectionAsync();
  };

  const handleProfile = async () => {
    await Haptics.selectionAsync();
    router.push('/(tabs)/profile');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Pressable onPress={handleOpenMenu} style={styles.iconButton}>
            <MaterialIcons color="#2F42C7" name="menu" size={34} />
          </Pressable>

          <Text style={styles.headerTitle}>Home Page</Text>

          <Pressable onPress={handleProfile} style={styles.avatar}>
            <Text style={styles.avatarText}>{firstName.slice(0, 1).toUpperCase()}</Text>
          </Pressable>
        </View>

        <View style={styles.greetingBlock}>
          <Text style={styles.dateText}>{dateLabel}</Text>
          <Text style={styles.greetingText}>Hi, {firstName}</Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today&apos;s Path</Text>
          <Text style={styles.sectionSubtitle}>Your latest journey at a glance.</Text>
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

        <View style={styles.mapCard}>
          <View style={styles.waterShape} />
          <View style={styles.coastShape} />
          <View style={styles.roadOne} />
          <View style={styles.roadTwo} />
          <View style={styles.roadThree} />

          <View style={styles.routeWrap}>
            <View style={styles.routeDotStart} />
            <View style={styles.routeLine} />
            <View style={styles.routeDotEnd} />
          </View>

          <Text style={[styles.mapLabel, styles.mapLabelDubai]}>Dubai</Text>
          <Text style={[styles.mapLabel, styles.mapLabelSharjah]}>Sharjah</Text>

          <Pressable onPress={handleStartJourney} style={styles.startButton}>
            <Text style={styles.startButtonText}>Start Journey!</Text>
          </Pressable>
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
    paddingTop: 10,
    paddingBottom: 24,
    gap: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#2F42C7',
    fontSize: 24,
    fontWeight: '500',
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#D9D1C8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#1B140F',
    fontSize: 15,
    fontWeight: '700',
  },
  greetingBlock: {
    gap: 8,
  },
  dateText: {
    color: '#756C65',
    fontSize: 14,
  },
  greetingText: {
    color: '#1B140F',
    fontSize: 40,
    lineHeight: 42,
    fontWeight: '500',
  },
  sectionHeader: {
    gap: 6,
  },
  sectionTitle: {
    color: '#1B140F',
    fontSize: 24,
    fontWeight: '500',
  },
  sectionSubtitle: {
    color: '#756C65',
    fontSize: 14,
  },
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2F42C7',
    borderRadius: 22,
    paddingVertical: 16,
    paddingHorizontal: 14,
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
  mapCard: {
    height: 430,
    borderRadius: 32,
    backgroundColor: '#DCC7A7',
    overflow: 'hidden',
    position: 'relative',
  },
  waterShape: {
    position: 'absolute',
    top: -30,
    left: -70,
    width: 300,
    height: 360,
    borderBottomRightRadius: 220,
    borderTopRightRadius: 180,
    borderBottomLeftRadius: 180,
    backgroundColor: '#4766A8',
  },
  coastShape: {
    position: 'absolute',
    right: -60,
    top: -10,
    width: 240,
    height: 450,
    borderTopLeftRadius: 140,
    borderBottomLeftRadius: 120,
    backgroundColor: '#E8D1AF',
    transform: [{ rotate: '8deg' }],
  },
  roadOne: {
    position: 'absolute',
    right: 20,
    top: 110,
    width: 210,
    height: 8,
    borderRadius: 999,
    backgroundColor: '#D9D9D9',
    transform: [{ rotate: '-38deg' }],
  },
  roadTwo: {
    position: 'absolute',
    right: -10,
    top: 220,
    width: 240,
    height: 8,
    borderRadius: 999,
    backgroundColor: '#D9D9D9',
    transform: [{ rotate: '-28deg' }],
  },
  roadThree: {
    position: 'absolute',
    right: 30,
    bottom: 110,
    width: 180,
    height: 8,
    borderRadius: 999,
    backgroundColor: '#D9D9D9',
    transform: [{ rotate: '-12deg' }],
  },
  routeWrap: {
    position: 'absolute',
    left: 138,
    top: 144,
    alignItems: 'center',
  },
  routeDotStart: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#2F42C7',
  },
  routeLine: {
    width: 4,
    height: 120,
    backgroundColor: '#2F42C7',
    borderRadius: 999,
    marginVertical: 4,
  },
  routeDotEnd: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#2F42C7',
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  mapLabel: {
    position: 'absolute',
    color: 'rgba(255,255,255,0.92)',
    fontSize: 26,
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  mapLabelDubai: {
    left: 148,
    top: 170,
  },
  mapLabelSharjah: {
    left: 218,
    top: 94,
  },
  startButton: {
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
    backgroundColor: '#2F42C7',
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 999,
    shadowColor: '#2F42C7',
    shadowOpacity: 0.22,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '500',
  },
});
