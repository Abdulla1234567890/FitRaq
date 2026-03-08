import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const FILTERS = ['All', 'Walks', 'Runs', 'Hikes'] as const;

const JOURNEYS = [
  {
    id: 'morning-run',
    date: '24 February 2026',
    distance: '7.2 km',
    location: 'Al Qouz, Dubai',
    month: 'February 2026',
    title: 'Morning Run',
    type: 'Runs',
    xp: '78 XP',
  },
  {
    id: 'sunset-walk',
    date: '18 February 2026',
    distance: '4.6 km',
    location: 'Business Bay, Dubai',
    month: 'February 2026',
    title: 'Sunset Walk',
    type: 'Walks',
    xp: '52 XP',
  },
  {
    id: 'creek-hike',
    date: '12 January 2026',
    distance: '9.1 km',
    location: 'Dubai Creek, Dubai',
    month: 'January 2026',
    title: 'Creek Hike',
    type: 'Hikes',
    xp: '96 XP',
  },
];

export default function JourneysScreen() {
  const [activeFilter, setActiveFilter] = useState<(typeof FILTERS)[number]>('All');

  const filteredJourneys =
    activeFilter === 'All' ? JOURNEYS : JOURNEYS.filter((journey) => journey.type === activeFilter);

  const groupedJourneys = filteredJourneys.reduce<Record<string, typeof JOURNEYS>>((groups, journey) => {
    if (!groups[journey.month]) {
      groups[journey.month] = [];
    }

    groups[journey.month].push(journey);
    return groups;
  }, {});

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => Haptics.selectionAsync()} style={styles.iconButton}>
            <MaterialIcons color="#2F42C7" name="menu" size={34} />
          </Pressable>
          <Text style={styles.headerTitle}>Logbook</Text>
          <View style={styles.headerSpacer} />
        </View>

        <Text style={styles.summaryText}>14 paths collected | 62.4 km</Text>

        <ScrollView
          horizontal
          contentContainerStyle={styles.filterRow}
          showsHorizontalScrollIndicator={false}
        >
          {FILTERS.map((filter) => {
            const isActive = filter === activeFilter;

            return (
              <Pressable
                key={filter}
                onPress={async () => {
                  await Haptics.selectionAsync();
                  setActiveFilter(filter);
                }}
                style={[styles.filterChip, isActive ? styles.filterChipActive : undefined]}
              >
                <Text style={[styles.filterText, isActive ? styles.filterTextActive : undefined]}>
                  {filter}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {Object.entries(groupedJourneys).map(([month, items]) => (
          <View key={month} style={styles.monthSection}>
            <Text style={styles.monthLabel}>{month}</Text>

            {items.map((journey) => (
              <Pressable
                key={journey.id}
                onPress={async () => {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push({
                    pathname: '/(tabs)/journey-details',
                    params: {
                      date: journey.date,
                      distance: journey.distance,
                      location: journey.location,
                      title: journey.title,
                      xp: journey.xp,
                    },
                  });
                }}
                style={styles.cardWrap}
              >
                <View style={styles.mapCard}>
                  <View style={styles.mapWater} />
                  <View style={styles.mapLand} />
                  <View style={styles.mapRoadOne} />
                  <View style={styles.mapRoadTwo} />
                  <View style={styles.mapRoadThree} />

                  <Text style={styles.cardLocation}>{journey.location.split(',')[0]}</Text>
                  <View style={styles.cardMeta}>
                    <Text style={styles.cardTitle}>{journey.title}</Text>
                    <Text style={styles.cardDistance}>{journey.distance}</Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        ))}
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
    gap: 18,
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
    fontSize: 26,
    fontWeight: '500',
  },
  headerSpacer: {
    width: 44,
  },
  summaryText: {
    color: '#645B54',
    fontSize: 15,
    textAlign: 'center',
  },
  filterRow: {
    gap: 12,
    paddingVertical: 8,
  },
  filterChip: {
    minWidth: 88,
    alignItems: 'center',
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 22,
    paddingVertical: 14,
    shadowColor: '#000000',
    shadowOpacity: 0.09,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  filterChipActive: {
    backgroundColor: '#2F42C7',
  },
  filterText: {
    color: '#2F42C7',
    fontSize: 15,
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  monthSection: {
    gap: 14,
  },
  monthLabel: {
    color: '#8F867F',
    fontSize: 15,
  },
  cardWrap: {
    marginBottom: 10,
  },
  mapCard: {
    height: 160,
    borderRadius: 34,
    backgroundColor: '#4678C7',
    overflow: 'hidden',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 18,
    shadowColor: '#000000',
    shadowOpacity: 0.14,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
  mapWater: {
    position: 'absolute',
    inset: 0,
    backgroundColor: '#4678C7',
  },
  mapLand: {
    position: 'absolute',
    left: -40,
    top: -20,
    width: 170,
    height: 200,
    borderTopRightRadius: 100,
    borderBottomRightRadius: 90,
    backgroundColor: '#18345B',
  },
  mapRoadOne: {
    position: 'absolute',
    top: 24,
    left: 70,
    width: 260,
    height: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(5,19,46,0.65)',
    transform: [{ rotate: '-20deg' }],
  },
  mapRoadTwo: {
    position: 'absolute',
    top: 74,
    left: -24,
    width: 280,
    height: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(5,19,46,0.65)',
    transform: [{ rotate: '16deg' }],
  },
  mapRoadThree: {
    position: 'absolute',
    bottom: 34,
    left: 50,
    width: 230,
    height: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(5,19,46,0.65)',
    transform: [{ rotate: '-8deg' }],
  },
  cardLocation: {
    color: '#F5F7FF',
    fontSize: 14,
    fontWeight: '600',
  },
  cardMeta: {
    gap: 4,
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '600',
  },
  cardDistance: {
    color: '#DCE6FF',
    fontSize: 14,
  },
});
