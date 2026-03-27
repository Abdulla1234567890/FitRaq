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
  mapCard: {
    height: 430,
    borderRadius: 32,
    backgroundColor: '#E6E0D7',
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
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
    gap: 4,
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
