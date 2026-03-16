import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ACTIVITY_TYPES, TRAILS, type Coordinate } from './journey-data';

const DEFAULT_REGION = {
  latitude: 25.2048,
  longitude: 55.2708,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

const BASE_SPEEDS: Record<string, number> = {
  cycling: 28,
  hiking: 4.4,
  running: 11.5,
  walking: 5.6,
};

export default function StartJourneyScreen() {
  const params = useLocalSearchParams<{ trail?: string; type?: string }>();
  const activeType = ACTIVITY_TYPES.find((type) => type.id === params.type) ?? ACTIVITY_TYPES[0];
  const availableTrails = TRAILS.filter((trail) => trail.type === activeType.id);
  const selectedTrail =
    availableTrails.find((trail) => trail.id === params.trail) ??
    availableTrails[0] ??
    TRAILS[0];
  const initialRegion = useMemo(() => createRegionFromRoute(selectedTrail.route), [selectedTrail.route]);

  const [sessionActive, setSessionActive] = useState(false);
  const [paused, setPaused] = useState(false);
  const [permissionState, setPermissionState] = useState<'checking' | 'granted' | 'denied'>('checking');
  const [currentLocation, setCurrentLocation] = useState<Coordinate | null>(null);
  const [speedSamples, setSpeedSamples] = useState<number[]>(() => seedSamples(activeType.id));
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [distanceKm, setDistanceKm] = useState(0);
  const [stepCount, setStepCount] = useState(0);
  const [calories, setCalories] = useState(0);
  const [elevationGain, setElevationGain] = useState(0);
  const mapRef = useRef<MapView | null>(null);

  useEffect(() => {
    setSessionActive(false);
    setPaused(false);
    setSpeedSamples(seedSamples(activeType.id));
    setElapsedSeconds(0);
    setDistanceKm(0);
    setStepCount(0);
    setCalories(0);
    setElevationGain(0);
  }, [activeType.id, selectedTrail.id]);

  useEffect(() => {
    let isMounted = true;

    const loadLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (!isMounted) {
        return;
      }

      if (status !== 'granted') {
        setPermissionState('denied');
        return;
      }

      setPermissionState('granted');

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      if (!isMounted) {
        return;
      }

      setCurrentLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    };

    loadLocation();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || Platform.OS === 'web') {
      return;
    }

    mapRef.current.fitToCoordinates(selectedTrail.route, {
      animated: true,
      edgePadding: {
        top: 120,
        right: 80,
        bottom: 220,
        left: 80,
      },
    });
  }, [selectedTrail.id, selectedTrail.route]);

  useEffect(() => {
    if (!sessionActive || paused) {
      return;
    }

    const intervalId = setInterval(() => {
      setElapsedSeconds((current) => current + 3);

      setSpeedSamples((current) => {
        const tick = current.length;
        const previousValue = current[current.length - 1] ?? BASE_SPEEDS[activeType.id];
        const nextValue = computeNextSample(activeType.id, tick, previousValue);

        setDistanceKm((distance) => {
          const seededDistance = selectedTrail.distanceKm * 0.08;
          const nextDistance = distance + (nextValue * 3) / 3600;
          return Math.min(selectedTrail.distanceKm, Math.max(nextDistance, seededDistance));
        });
        setCalories((value) => value + nextValue * (activeType.template === 'cycling' ? 0.42 : 0.78));
        setElevationGain((value) => value + (activeType.id === 'hiking' ? 0.8 : activeType.id === 'running' ? 0.24 : 0.12));

        if (activeType.template === 'foot') {
          setStepCount((value) => value + Math.max(4, Math.round(nextValue * 2.4)));
        }

        return [...current.slice(-15), nextValue];
      });
    }, 3000);

    return () => {
      clearInterval(intervalId);
    };
  }, [activeType.id, activeType.template, paused, selectedTrail.distanceKm, sessionActive]);

  useEffect(() => {
    if (permissionState !== 'granted' || !sessionActive || paused || Platform.OS === 'web') {
      return;
    }

    let subscription: Location.LocationSubscription | null = null;

    const watchLocation = async () => {
      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          distanceInterval: 8,
          timeInterval: 4000,
        },
        (position) => {
          const nextPoint = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };

          setCurrentLocation(nextPoint);

          if (typeof position.coords.speed === 'number' && position.coords.speed > 0) {
            const speedKmh = position.coords.speed * 3.6;

            setSpeedSamples((current) => [...current.slice(-15), speedKmh]);
          }
        }
      );
    };

    watchLocation();

    return () => {
      subscription?.remove();
    };
  }, [paused, permissionState, sessionActive]);

  const latestSpeed = speedSamples[speedSamples.length - 1] ?? BASE_SPEEDS[activeType.id];
  const averageSpeed = speedSamples.reduce((sum, value) => sum + value, 0) / Math.max(speedSamples.length, 1);
  const heroValue =
    activeType.id === 'running' ? formatPace(latestSpeed) : latestSpeed.toFixed(activeType.template === 'cycling' ? 0 : 1);
  const thirdPrimaryValue =
    activeType.id === 'running' ? formatPace(averageSpeed) : averageSpeed.toFixed(activeType.template === 'cycling' ? 0 : 1);

  const handleRecenter = async () => {
    await Haptics.selectionAsync();

    if (!mapRef.current || Platform.OS === 'web') {
      return;
    }

    if (currentLocation) {
      mapRef.current.animateToRegion(
        {
          ...currentLocation,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        },
        400
      );
      return;
    }

    mapRef.current.animateToRegion(initialRegion, 400);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.topBar}>
          <Pressable
            onPress={async () => {
              await Haptics.selectionAsync();
              router.replace({
                pathname: '/(tabs)/choose-trail',
                params: { type: activeType.id },
              });
            }}
            style={styles.topCircleButton}
          >
            <MaterialIcons color="#1D2474" name="arrow-back-ios-new" size={20} />
          </Pressable>

          <View style={styles.topTitleWrap}>
            <Text style={styles.headerEyebrow}>{activeType.label.toUpperCase()}</Text>
            <Text style={styles.headerTitle}>{selectedTrail.title}</Text>
          </View>

          <Pressable onPress={() => Haptics.selectionAsync()} style={styles.topCircleButton}>
            <MaterialIcons color="#1D2474" name="settings" size={22} />
          </Pressable>
        </View>

        <View style={styles.mapFrame}>
          {Platform.OS === 'web' ? (
            <View style={styles.webFallback}>
              <MaterialIcons color="#5466E8" name="map" size={42} />
              <Text style={styles.webFallbackText}>Map preview is available on iOS and Android builds.</Text>
            </View>
          ) : (
            <MapView
              ref={mapRef}
              initialRegion={initialRegion}
              showsCompass={false}
              showsMyLocationButton={false}
              showsUserLocation={permissionState === 'granted'}
              style={styles.map}
            >
              <Polyline coordinates={selectedTrail.route} strokeColor="#5466E8" strokeWidth={6} />
              <Marker coordinate={selectedTrail.route[0]}>
                <View style={styles.markerStart} />
              </Marker>
              <Marker coordinate={selectedTrail.route[selectedTrail.route.length - 1]}>
                <View style={styles.markerEndOuter}>
                  <View style={styles.markerEndInner} />
                </View>
              </Marker>
            </MapView>
          )}

          <View style={styles.mapOverlayTop}>
            <View style={styles.statusPill}>
              <Text style={styles.statusText}>
                GPS{' '}
                {permissionState === 'granted'
                  ? 'connected'
                  : permissionState === 'denied'
                    ? 'off'
                    : 'checking'}
              </Text>
            </View>
            <Pressable onPress={handleRecenter} style={styles.mapIconButton}>
              <MaterialIcons color="#1D2474" name="my-location" size={20} />
            </Pressable>
          </View>

          <View style={styles.mapOverlayBottom}>
            {!sessionActive ? (
              <View style={styles.trailCard}>
                <View style={styles.trailCardHeader}>
                  <View style={styles.routeModeChip}>
                    <MaterialCommunityIcons color="#5466E8" name={activeType.icon as never} size={16} />
                    <Text style={styles.routeModeChipText}>{activeType.label}</Text>
                  </View>
                  <Text style={styles.routeDifficulty}>{selectedTrail.difficulty}</Text>
                </View>

                <Text style={styles.trailArea}>{selectedTrail.area}</Text>
                <Text style={styles.trailDescription}>{selectedTrail.description}</Text>

                <View style={styles.trailMetaRow}>
                  <TrailMeta label="Distance" value={`${selectedTrail.distanceKm.toFixed(1)} km`} />
                  <TrailMeta label="Estimate" value={selectedTrail.estimatedTime} />
                </View>
              </View>
            ) : null}

            <Pressable
              disabled={!sessionActive}
              onPress={async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setPaused((value) => !value);
              }}
              style={[
                styles.pauseButton,
                !sessionActive ? styles.pauseButtonIdle : undefined,
                !sessionActive ? styles.pauseButtonDisabled : undefined,
              ]}
            >
              <MaterialIcons color="#5466E8" name={paused ? 'play-arrow' : 'pause'} size={34} />
            </Pressable>
          </View>
        </View>

        <View style={styles.bottomPanel}>
          <View style={styles.liveHeader}>
            <View>
              <Text style={styles.liveValue}>{heroValue}</Text>
              <Text style={styles.liveLabel}>{activeType.hero.label}</Text>
            </View>

            <View style={styles.liveActionRow}>
              <Pressable
                onPress={() => Haptics.selectionAsync()}
                style={[styles.liveActionButton, styles.liveActionButtonMuted]}
              >
                <MaterialIcons color="#6A6F93" name="graphic-eq" size={20} />
              </Pressable>
              <Pressable
                onPress={async () => {
                  if (!sessionActive) {
                    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    setSessionActive(true);
                    setPaused(false);
                    return;
                  }

                  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  setSessionActive(false);
                  setPaused(false);
                }}
                style={styles.liveActionButtonPrimary}
              >
                <MaterialIcons color="#FFFFFF" name={sessionActive ? 'stop-circle' : 'play-circle-filled'} size={22} />
                <Text style={styles.liveActionPrimaryText}>{sessionActive ? 'Finish' : 'Start'}</Text>
              </Pressable>
            </View>
          </View>

          <TrendChart
            color={activeType.template === 'cycling' ? '#5466E8' : '#3F4FE0'}
            label={activeType.id === 'running' ? 'Live pace trend' : 'Live speed trend'}
            secondaryColor={activeType.template === 'cycling' ? '#B8C0FF' : '#A3ACEF'}
            values={speedSamples}
          />

          <View style={styles.metricsRow}>
            <MetricCard label={activeType.primaryLabels[0]} value={distanceKm.toFixed(1)} />
            <MetricCard label={activeType.primaryLabels[1]} value={formatDuration(elapsedSeconds)} />
            <MetricCard label={activeType.primaryLabels[2]} value={thirdPrimaryValue} />
          </View>

          {activeType.template === 'foot' ? (
            <View style={styles.secondaryRow}>
              <CompactMetric label={activeType.secondaryLabels[0]} value={stepCount.toLocaleString()} />
              <CompactMetric label={activeType.secondaryLabels[1]} value={Math.round(calories).toString()} />
              <CompactMetric label={activeType.secondaryLabels[2]} value={Math.round(elevationGain).toString()} />
            </View>
          ) : (
            <View style={styles.secondaryRow}>
              <CompactMetric label={activeType.secondaryLabels[0]} value={Math.round(80 + averageSpeed * 0.18).toString()} />
              <CompactMetric label={activeType.secondaryLabels[1]} value={Math.round(elevationGain + distanceKm * 4).toString()} />
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

function TrendChart({
  color,
  label,
  secondaryColor,
  values,
}: {
  color: string;
  label: string;
  secondaryColor: string;
  values: number[];
}) {
  const width = 300;
  const height = 62;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(max - min, 1);

  const points = values.map((value, index) => ({
    x: (index / Math.max(values.length - 1, 1)) * (width - 16),
    y: height - 12 - ((value - min) / range) * (height - 28),
  }));

  return (
    <View style={styles.chartCard}>
      <Text style={styles.chartLabel}>{label}</Text>
      <View style={styles.chartCanvas}>
        {points.slice(0, -1).map((point, index) => {
          const nextPoint = points[index + 1];
          const deltaX = nextPoint.x - point.x;
          const deltaY = nextPoint.y - point.y;
          const length = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
          const angle = Math.atan2(deltaY, deltaX);

          return (
            <View
              key={`segment-${index}`}
              style={[
                styles.chartSegment,
                {
                  backgroundColor: index < points.length - 2 ? color : secondaryColor,
                  left: point.x + 8,
                  top: point.y,
                  width: length,
                  transform: [{ rotate: `${angle}rad` }],
                },
              ]}
            />
          );
        })}
      </View>
    </View>
  );
}

function TrailMeta({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.trailMetaCard}>
      <Text style={styles.trailMetaValue}>{value}</Text>
      <Text style={styles.trailMetaLabel}>{label}</Text>
    </View>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function CompactMetric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.compactMetric}>
      <Text style={styles.compactMetricValue}>{value}</Text>
      <Text style={styles.compactMetricLabel}>{label}</Text>
    </View>
  );
}

function seedSamples(typeId: string) {
  const base = BASE_SPEEDS[typeId];
  return Array.from({ length: 8 }, (_, index) => base + Math.sin(index * 0.7) * (typeId === 'cycling' ? 2.6 : 0.7));
}

function computeNextSample(typeId: string, tick: number, previousValue: number) {
  const base = BASE_SPEEDS[typeId];
  const amplitude = typeId === 'cycling' ? 2.4 : typeId === 'running' ? 0.8 : 0.45;
  const drift = Math.sin(tick * 0.75) * amplitude;
  const smoothing = previousValue * 0.35 + base * 0.65;
  return Math.max(2.5, smoothing + drift);
}

function createRegionFromRoute(route: Coordinate[]) {
  if (route.length === 0) {
    return DEFAULT_REGION;
  }

  const latitudes = route.map((point) => point.latitude);
  const longitudes = route.map((point) => point.longitude);
  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  const minLng = Math.min(...longitudes);
  const maxLng = Math.max(...longitudes);

  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: Math.max((maxLat - minLat) * 1.8, 0.02),
    longitudeDelta: Math.max((maxLng - minLng) * 1.8, 0.02),
  };
}

function formatDuration(seconds: number) {
  const hours = Math.floor(seconds / 3600)
    .toString()
    .padStart(2, '0');
  const minutes = Math.floor((seconds % 3600) / 60)
    .toString()
    .padStart(2, '0');
  const remainingSeconds = Math.floor(seconds % 60)
    .toString()
    .padStart(2, '0');

  return `${hours}:${minutes}:${remainingSeconds}`;
}

function formatPace(speedKmh: number) {
  const paceMinutes = 60 / Math.max(speedKmh, 0.1);
  const minutes = Math.floor(paceMinutes);
  const seconds = Math.round((paceMinutes - minutes) * 60)
    .toString()
    .padStart(2, '0');

  return `${minutes}:${seconds}`;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4EFE8',
  },
  container: {
    flex: 1,
    backgroundColor: '#F4EFE8',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 6,
    paddingBottom: 12,
    gap: 12,
  },
  topCircleButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  topTitleWrap: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  headerEyebrow: {
    color: '#8A837C',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.3,
  },
  headerTitle: {
    color: '#1D2474',
    fontSize: 20,
    fontWeight: '700',
  },
  mapFrame: {
    flex: 1,
    marginHorizontal: 16,
    borderRadius: 32,
    overflow: 'hidden',
    backgroundColor: '#DDE2F7',
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  webFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 36,
    gap: 14,
  },
  webFallbackText: {
    color: '#5466E8',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  markerStart: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#5466E8',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  markerEndOuter: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(84, 102, 232, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerEndInner: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#5466E8',
  },
  mapOverlayTop: {
    position: 'absolute',
    top: 18,
    left: 18,
    right: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusPill: {
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  statusText: {
    color: '#5C5A73',
    fontSize: 13,
    fontWeight: '600',
  },
  mapIconButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapOverlayBottom: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 18,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  trailCard: {
    flex: 1,
    borderRadius: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    padding: 16,
    gap: 10,
  },
  trailCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  routeModeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    borderRadius: 999,
    backgroundColor: '#EEF1FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  routeModeChipText: {
    color: '#5466E8',
    fontSize: 12,
    fontWeight: '700',
  },
  routeDifficulty: {
    color: '#8A837C',
    fontSize: 12,
    fontWeight: '700',
  },
  trailArea: {
    color: '#1B140F',
    fontSize: 20,
    fontWeight: '700',
  },
  trailDescription: {
    color: '#6E665F',
    fontSize: 13,
    lineHeight: 20,
  },
  trailMetaRow: {
    flexDirection: 'row',
    gap: 10,
  },
  trailMetaCard: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: '#F7F4EF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 4,
  },
  trailMetaValue: {
    color: '#1B140F',
    fontSize: 15,
    fontWeight: '700',
  },
  trailMetaLabel: {
    color: '#8A837C',
    fontSize: 12,
  },
  pauseButton: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  pauseButtonIdle: {
    marginLeft: 'auto',
  },
  pauseButtonDisabled: {
    opacity: 0.45,
  },
  bottomPanel: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -14,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 20,
    gap: 16,
  },
  liveHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  liveValue: {
    color: '#1D2474',
    fontSize: 42,
    fontWeight: '700',
  },
  liveLabel: {
    color: '#6F7288',
    fontSize: 14,
  },
  liveActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  liveActionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveActionButtonMuted: {
    backgroundColor: '#F2F4FB',
  },
  liveActionButtonPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 24,
    backgroundColor: '#5466E8',
    paddingHorizontal: 16,
    height: 48,
  },
  liveActionPrimaryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  chartCard: {
    borderRadius: 18,
    backgroundColor: '#F7F8FD',
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 12,
    gap: 10,
  },
  chartLabel: {
    color: '#6F7288',
    fontSize: 13,
    fontWeight: '600',
  },
  chartCanvas: {
    height: 62,
    position: 'relative',
  },
  chartSegment: {
    position: 'absolute',
    height: 4,
    borderRadius: 999,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  metricCard: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#ECEEFA',
    paddingHorizontal: 12,
    paddingVertical: 14,
    gap: 8,
  },
  metricValue: {
    color: '#1D2474',
    fontSize: 18,
    fontWeight: '700',
  },
  metricLabel: {
    color: '#6F7288',
    fontSize: 13,
  },
  secondaryRow: {
    flexDirection: 'row',
    gap: 10,
  },
  compactMetric: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: '#F7F8FD',
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 6,
  },
  compactMetricValue: {
    color: '#1D2474',
    fontSize: 16,
    fontWeight: '700',
  },
  compactMetricLabel: {
    color: '#6F7288',
    fontSize: 12,
  },
});
