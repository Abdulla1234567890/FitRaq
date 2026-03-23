import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TRAILS, type Coordinate } from './journey-data';

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

  const mapRegion = useMemo(() => createRegionFromRoute(latestTrail.route), [latestTrail.route]);

  const handleStartJourney = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(tabs)/choose-path');
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
          {Platform.OS === 'web' ? (
            <View style={styles.webFallback}>
              <MaterialIcons color="#2F42C7" name="map" size={42} />
              <Text style={styles.webFallbackText}>Map preview is available on iOS and Android.</Text>
            </View>
          ) : (
            <MapView
              initialRegion={mapRegion}
              pointerEvents="none"
              rotateEnabled={false}
              scrollEnabled={false}
              showsCompass={false}
              showsPointsOfInterest={false}
              showsScale={false}
              style={styles.map}
              zoomEnabled={false}
            >
              <Polyline coordinates={latestTrail.route} strokeColor="#2F42C7" strokeWidth={5} />
              <Marker coordinate={latestTrail.route[0]}>
                <View style={styles.routeDotStart} />
              </Marker>
              <Marker coordinate={latestTrail.route[latestTrail.route.length - 1]}>
                <View style={styles.routeDotEnd} />
              </Marker>
            </MapView>
          )}

          <View style={styles.mapOverlay}>
            <Text style={styles.mapMetaLabel}>{latestTrail.area}</Text>
            <Text style={styles.mapMetaTitle}>{latestTrail.title}</Text>
          </View>

          <Pressable onPress={handleStartJourney} style={styles.startButton}>
            <Text style={styles.startButtonText}>Start Journey!</Text>
          </Pressable>
        </View>
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
    latitudeDelta: Math.max((maxLat - minLat) * 1.9, 0.02),
    longitudeDelta: Math.max((maxLng - minLng) * 1.9, 0.02),
  };
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
    backgroundColor: '#E6E0D7',
    overflow: 'hidden',
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  webFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 28,
  },
  webFallbackText: {
    color: '#2F42C7',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  mapOverlay: {
    position: 'absolute',
    top: 18,
    left: 18,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.88)',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 2,
  },
  mapMetaLabel: {
    color: '#756C65',
    fontSize: 12,
    fontWeight: '600',
  },
  mapMetaTitle: {
    color: '#1B140F',
    fontSize: 16,
    fontWeight: '700',
  },
  routeDotStart: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#FFFFFF',
    borderWidth: 4,
    borderColor: '#2F42C7',
  },
  routeDotEnd: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#2F42C7',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.8)',
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
