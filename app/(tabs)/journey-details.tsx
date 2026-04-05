import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { Image, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TRAILS, type Coordinate } from '@/lib/journey-data';

export default function JourneyDetailsScreen() {
  const params = useLocalSearchParams<{
    date?: string;
    distance?: string;
    location?: string;
    title?: string;
    trailId?: string;
    xp?: string;
  }>();

  const title = Array.isArray(params.title) ? params.title[0] : params.title || 'Morning Run';
  const location = (Array.isArray(params.location) ? params.location[0] : params.location) || 'Dubai';
  const date = Array.isArray(params.date) ? params.date[0] : params.date || '24 February 2026';
  const distance = Array.isArray(params.distance) ? params.distance[0] : params.distance || '7.2 km';
  const xp = Array.isArray(params.xp) ? params.xp[0] : params.xp || '78 XP';
  const trailId = Array.isArray(params.trailId) ? params.trailId[0] : params.trailId;

  const selectedTrail =
    TRAILS.find((trail) => trail.id === trailId) ??
    TRAILS.find((trail) => trail.title.toLowerCase() === title.toLowerCase()) ??
    null;

  const mapRegion = selectedTrail ? createRegionFromRoute(selectedTrail.route) : DEFAULT_REGION;
  const heroImage = selectedTrail?.gallery[0];
  const effortLabel = selectedTrail?.difficulty ?? 'Moderate';
  const areaLabel = selectedTrail?.area ?? location;
  const timeLabel = selectedTrail?.estimatedTime ?? '34 min';
  const description =
    selectedTrail?.description ?? 'A clean session summary with route context, effort, and the essentials from your journey.';

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
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

          <Text style={styles.headerTitle}>Journey</Text>

          <Pressable
            onPress={async () => {
              await Haptics.selectionAsync();
            }}
            style={styles.iconButton}
          >
            <MaterialIcons color="#2F42C7" name="ios-share" size={20} />
          </Pressable>
        </View>

        <View style={styles.heroIntro}>
          <Text style={styles.heroDate}>{date}</Text>
          <Text style={styles.heroTitle}>{title}</Text>
          <Text style={styles.heroLocation}>{areaLabel}</Text>
        </View>

        <View style={styles.mapCard}>
          {Platform.OS === 'web' || !selectedTrail ? (
            <View style={styles.webFallback}>
              <MaterialIcons color="#2F42C7" name="map" size={36} />
            </View>
          ) : (
            <MapView
              initialRegion={mapRegion}
              pointerEvents="none"
              rotateEnabled={false}
              scrollEnabled={false}
              showsCompass={false}
              showsScale={false}
              showsPointsOfInterest={false}
              style={styles.map}
              zoomEnabled={false}
            >
              <Polyline coordinates={selectedTrail.route} strokeColor="#2F42C7" strokeWidth={4} />
              <Marker coordinate={selectedTrail.route[0]}>
                <View style={styles.routeDotStart} />
              </Marker>
              <Marker coordinate={selectedTrail.route[selectedTrail.route.length - 1]}>
                <View style={styles.routeDotEnd} />
              </Marker>
            </MapView>
          )}

          <View style={styles.mapOverlay}>
            <View style={styles.mapBadgeRow}>
              <View style={styles.mapBadge}>
                <MaterialIcons color="#2F42C7" name="route" size={14} />
                <Text style={styles.mapBadgeText}>{selectedTrail ? 'Trail route' : 'Session route'}</Text>
              </View>
              <View style={styles.mapBadge}>
                <MaterialIcons color="#2F42C7" name="local-fire-department" size={14} />
                <Text style={styles.mapBadgeText}>{xp}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.metricsGrid}>
          <MetricCard icon="straighten" label="Distance" value={distance} />
          <MetricCard icon="schedule" label="Time" value={timeLabel} />
          <MetricCard icon="terrain" label="Effort" value={effortLabel} />
          <MetricCard icon="location-on" label="Area" value={areaLabel} />
        </View>

        <View style={styles.storyCard}>
          <View style={styles.storyHeader}>
            <View>
              <Text style={styles.storyEyebrow}>Route snapshot</Text>
              <Text style={styles.storyTitle}>What this path felt like</Text>
            </View>
            <View style={styles.storyChip}>
              <Text style={styles.storyChipText}>{xp}</Text>
            </View>
          </View>

          <Text style={styles.storyText}>{description}</Text>

          {heroImage ? (
            <View style={styles.previewCard}>
              <Image resizeMode="cover" source={heroImage.image} style={styles.previewImage} />
              <View style={styles.previewOverlay}>
                <Text style={styles.previewCaption}>{heroImage.caption}</Text>
              </View>
            </View>
          ) : null}
        </View>

        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>Highlights</Text>

          <View style={styles.highlightList}>
            <HighlightRow icon="bolt" label="XP earned" value={xp} />
            <HighlightRow icon="explore" label="Route mode" value={selectedTrail ? 'Preset trail' : 'Free run'} />
            <HighlightRow icon="calendar-month" label="Logged on" value={date} />
          </View>
        </View>

        <Pressable
          onPress={async () => {
            await Haptics.selectionAsync();
            if (selectedTrail) {
              router.push({
                pathname: '/(tabs)/start-journey',
                params: { trail: selectedTrail.id, type: selectedTrail.type },
              });
              return;
            }

            router.push('/(tabs)/start-shortcut');
          }}
          style={styles.primaryButton}
        >
          <Text style={styles.primaryButtonText}>{selectedTrail ? 'Start this route again' : 'Start a new journey'}</Text>
          <MaterialIcons color="#FFFFFF" name="north-east" size={18} />
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function MetricCard({ icon, label, value }: { icon: keyof typeof MaterialIcons.glyphMap; label: string; value: string }) {
  return (
    <View style={styles.metricCard}>
      <View style={styles.metricIcon}>
        <MaterialIcons color="#2F42C7" name={icon} size={18} />
      </View>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text numberOfLines={2} style={styles.metricValue}>
        {value}
      </Text>
    </View>
  );
}

function HighlightRow({ icon, label, value }: { icon: keyof typeof MaterialIcons.glyphMap; label: string; value: string }) {
  return (
    <View style={styles.highlightRow}>
      <View style={styles.highlightIcon}>
        <MaterialIcons color="#2F42C7" name={icon} size={18} />
      </View>
      <View style={styles.highlightBody}>
        <Text style={styles.highlightLabel}>{label}</Text>
        <Text style={styles.highlightValue}>{value}</Text>
      </View>
    </View>
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
    latitudeDelta: Math.max((maxLat - minLat) * 1.9, 0.03),
    longitudeDelta: Math.max((maxLng - minLng) * 1.9, 0.03),
  };
}

const DEFAULT_REGION = {
  latitude: 25.2048,
  longitude: 55.2708,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4EFE8',
  },
  content: {
    paddingHorizontal: 22,
    paddingTop: 8,
    paddingBottom: 28,
    gap: 18,
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
    fontSize: 24,
    fontWeight: '600',
  },
  heroIntro: {
    gap: 6,
  },
  heroDate: {
    color: '#8F867F',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  heroTitle: {
    color: '#1B140F',
    fontSize: 34,
    lineHeight: 38,
    fontWeight: '700',
  },
  heroLocation: {
    color: '#645B54',
    fontSize: 15,
  },
  mapCard: {
    height: 220,
    borderRadius: 30,
    overflow: 'hidden',
    backgroundColor: '#E0DBD3',
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
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
    padding: 16,
    backgroundColor: 'rgba(12,21,46,0.08)',
  },
  mapBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  mapBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  mapBadgeText: {
    color: '#2F42C7',
    fontSize: 12,
    fontWeight: '700',
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
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    width: '47%',
    minHeight: 108,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 14,
    justifyContent: 'space-between',
  },
  metricIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#EEF1FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricLabel: {
    color: '#8F867F',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metricValue: {
    color: '#1B140F',
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '700',
  },
  storyCard: {
    gap: 14,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    padding: 18,
  },
  storyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 14,
  },
  storyEyebrow: {
    color: '#8F867F',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  storyTitle: {
    color: '#1B140F',
    fontSize: 24,
    fontWeight: '700',
    marginTop: 4,
  },
  storyChip: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    backgroundColor: '#EEF1FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  storyChipText: {
    color: '#2F42C7',
    fontSize: 12,
    fontWeight: '700',
  },
  storyText: {
    color: '#645B54',
    fontSize: 15,
    lineHeight: 22,
  },
  previewCard: {
    height: 170,
    borderRadius: 24,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: 'rgba(12,21,46,0.22)',
  },
  previewCaption: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  sectionBlock: {
    gap: 12,
  },
  sectionTitle: {
    color: '#1B140F',
    fontSize: 24,
    fontWeight: '700',
  },
  highlightList: {
    gap: 12,
  },
  highlightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  highlightIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EEF1FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  highlightBody: {
    flex: 1,
    gap: 2,
  },
  highlightLabel: {
    color: '#8F867F',
    fontSize: 13,
    fontWeight: '600',
  },
  highlightValue: {
    color: '#1B140F',
    fontSize: 16,
    fontWeight: '700',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 24,
    backgroundColor: '#2F42C7',
    paddingVertical: 18,
    marginTop: 4,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
