import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TRAILS, type Coordinate } from '@/lib/journey-data';

const FILTERS = ['All', 'Walks', 'Runs', 'Hikes'] as const;

const JOURNEYS = [
  {
    id: 'morning-run',
    calories: '486 kcal',
    date: '24 February 2026',
    distance: '7.2 km',
    duration: '46 min',
    location: 'Al Qouz, Dubai',
    month: 'February 2026',
    title: 'Morning Run',
    trailId: 'run-downtown-loop',
    type: 'Runs',
    xp: '78 XP',
  },
  {
    id: 'sunset-walk',
    calories: '264 kcal',
    date: '18 February 2026',
    distance: '4.6 km',
    duration: '38 min',
    location: 'Business Bay, Dubai',
    month: 'February 2026',
    title: 'Sunset Walk',
    trailId: 'walk-marina-stroll',
    type: 'Walks',
    xp: '52 XP',
  },
  {
    id: 'creek-hike',
    calories: '612 kcal',
    date: '12 January 2026',
    distance: '9.1 km',
    duration: '1h 54m',
    location: 'Dubai Creek, Dubai',
    month: 'January 2026',
    title: 'Creek Hike',
    trailId: 'hike-hatta-ridge',
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
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
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

            {items.map((journey) => {
              const trail = TRAILS.find((item) => item.id === journey.trailId) ?? TRAILS[0];
              const region = createRegionFromRoute(trail.route);

              return (
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
                        trailId: journey.trailId,
                        title: journey.title,
                        xp: journey.xp,
                      },
                    });
                  }}
                  style={styles.cardWrap}
                >
                  <View style={styles.cardShell}>
                    <View style={styles.mapCard}>
                      {Platform.OS === 'web' ? (
                        <View style={styles.webFallback}>
                          <MaterialIcons color="#2F42C7" name="map" size={36} />
                        </View>
                      ) : (
                        <MapView
                          initialRegion={region}
                          pointerEvents="none"
                          rotateEnabled={false}
                          scrollEnabled={false}
                          showsCompass={false}
                          showsPointsOfInterest={false}
                          showsScale={false}
                          style={styles.map}
                          zoomEnabled={false}
                        >
                          <Polyline coordinates={trail.route} strokeColor="#2F42C7" strokeWidth={4} />
                          <Marker coordinate={trail.route[0]}>
                            <View style={styles.routeDotStart} />
                          </Marker>
                          <Marker coordinate={trail.route[trail.route.length - 1]}>
                            <View style={styles.routeDotEnd} />
                          </Marker>
                        </MapView>
                      )}

                      <View style={styles.mapOverlay}>
                        <Text style={styles.cardLocation}>{journey.location.split(',')[0]}</Text>
                        <View style={styles.cardMeta}>
                          <Text style={styles.cardTitle}>{journey.title}</Text>
                          <Text style={styles.cardDistance}>{journey.distance}</Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.cardDetails}>
                      <View style={styles.cardStatsRow}>
                        <View style={styles.cardStatPill}>
                          <MaterialIcons color="#2F42C7" name="calendar-month" size={13} />
                          <Text style={styles.cardStatTextCompact}>{formatShortDate(journey.date)}</Text>
                        </View>
                        <View style={styles.cardStatPill}>
                          <MaterialIcons color="#2F42C7" name="schedule" size={13} />
                          <Text style={styles.cardStatTextCompact}>{journey.duration}</Text>
                        </View>
                        <View style={styles.cardStatPill}>
                          <MaterialIcons color="#2F42C7" name="local-fire-department" size={13} />
                          <Text style={styles.cardStatTextCompact}>{journey.calories}</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function createRegionFromRoute(route: Coordinate[]) {
  const latitudes = route.map((point) => point.latitude);
  const longitudes = route.map((point) => point.longitude);
  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  const minLng = Math.min(...longitudes);
  const maxLng = Math.max(...longitudes);

  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: Math.max((maxLat - minLat) * 2, 0.03),
    longitudeDelta: Math.max((maxLng - minLng) * 2, 0.03),
  };
}

function formatShortDate(date: string) {
  const parts = date.split(' ');
  const day = parts[0];
  const month = parts[1];

  if (!day || !month) {
    return date;
  }

  return `${day} ${month.slice(0, 3)}`;
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
  cardShell: {
    borderRadius: 34,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOpacity: 0.14,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
  mapCard: {
    height: 160,
    backgroundColor: '#E0DBD3',
    overflow: 'hidden',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  webFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapOverlay: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 18,
    backgroundColor: 'rgba(12, 21, 46, 0.12)',
  },
  cardLocation: {
    color: '#F5F7FF',
    fontSize: 14,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  cardMeta: {
    gap: 4,
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  cardDistance: {
    color: '#DCE6FF',
    fontSize: 14,
  },
  cardDetails: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  cardStatsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'nowrap',
  },
  cardStatPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flex: 1,
    borderRadius: 999,
    backgroundColor: '#F5F7FF',
    paddingHorizontal: 8,
    paddingVertical: 5,
    justifyContent: 'center',
  },
  cardStatText: {
    color: '#2F42C7',
    fontSize: 12,
    fontWeight: '700',
  },
  cardStatTextCompact: {
    color: '#2F42C7',
    fontSize: 9.5,
    fontWeight: '600',
  },
  routeDotStart: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#2F42C7',
  },
  routeDotEnd: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#2F42C7',
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
});
