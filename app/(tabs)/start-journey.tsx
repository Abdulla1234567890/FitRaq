import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

type Coordinate = {
  latitude: number;
  longitude: number;
};

type JourneyTemplate = 'cycling' | 'foot';

type ActivityType = {
  hero: {
    label: string;
  };
  icon: string;
  id: string;
  label: string;
  primaryLabels: [string, string, string];
  route: Coordinate[];
  secondaryLabels: string[];
  template: JourneyTemplate;
};

const ACTIVITY_TYPES: ActivityType[] = [
  {
    id: 'cycling',
    icon: 'bike-fast',
    label: 'Cycling',
    hero: {
      label: 'Speed km/h',
    },
    template: 'cycling',
    primaryLabels: ['Distance km', 'Ride time', 'AVG km/h'],
    secondaryLabels: ['Cadence rpm', 'Climb m'],
    route: [
      { latitude: 25.2078, longitude: 55.2711 },
      { latitude: 25.2112, longitude: 55.2733 },
      { latitude: 25.2139, longitude: 55.2781 },
      { latitude: 25.2192, longitude: 55.2814 },
      { latitude: 25.2231, longitude: 55.2868 },
    ],
  },
  {
    id: 'running',
    icon: 'run-fast',
    label: 'Running',
    hero: {
      label: 'Pace /km',
    },
    template: 'foot',
    primaryLabels: ['Distance km', 'Run time', 'AVG pace'],
    secondaryLabels: ['Steps', 'Calories', 'Elevation m'],
    route: [
      { latitude: 25.2018, longitude: 55.2682 },
      { latitude: 25.2042, longitude: 55.2728 },
      { latitude: 25.2073, longitude: 55.2754 },
      { latitude: 25.209, longitude: 55.2798 },
      { latitude: 25.2114, longitude: 55.2834 },
    ],
  },
  {
    id: 'walking',
    icon: 'walk',
    label: 'Walking',
    hero: {
      label: 'Speed km/h',
    },
    template: 'foot',
    primaryLabels: ['Distance km', 'Walk time', 'AVG km/h'],
    secondaryLabels: ['Steps', 'Calories', 'Elevation m'],
    route: [
      { latitude: 25.1976, longitude: 55.2641 },
      { latitude: 25.1985, longitude: 55.2664 },
      { latitude: 25.1994, longitude: 55.2689 },
      { latitude: 25.2008, longitude: 55.2702 },
      { latitude: 25.2021, longitude: 55.272 },
    ],
  },
  {
    id: 'hiking',
    icon: 'hiking',
    label: 'Hiking',
    hero: {
      label: 'Speed km/h',
    },
    template: 'foot',
    primaryLabels: ['Distance km', 'Hike time', 'AVG km/h'],
    secondaryLabels: ['Steps', 'Calories', 'Elevation m'],
    route: [
      { latitude: 25.1898, longitude: 55.2554 },
      { latitude: 25.1912, longitude: 55.2588 },
      { latitude: 25.1941, longitude: 55.2617 },
      { latitude: 25.1967, longitude: 55.2641 },
      { latitude: 25.1983, longitude: 55.2682 },
    ],
  },
];

const DEFAULT_REGION = {
  latitude: 25.2048,
  longitude: 55.2708,
  latitudeDelta: 0.03,
  longitudeDelta: 0.03,
};

const BASE_SPEEDS: Record<string, number> = {
  cycling: 28,
  hiking: 4.4,
  running: 11.5,
  walking: 5.6,
};

export default function StartJourneyScreen() {
  const params = useLocalSearchParams<{ type?: string }>();
  const activeType = ACTIVITY_TYPES.find((type) => type.id === params.type) ?? ACTIVITY_TYPES[0];
  const [sessionActive, setSessionActive] = useState(false);
  const [paused, setPaused] = useState(false);
  const [permissionState, setPermissionState] = useState<'checking' | 'granted' | 'denied'>('checking');
  const [currentLocation, setCurrentLocation] = useState<Coordinate | null>(null);
  const [routePoints, setRoutePoints] = useState<Coordinate[]>(activeType.route);
  const [speedSamples, setSpeedSamples] = useState<number[]>(seedSamples(activeType.id));
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [distanceKm, setDistanceKm] = useState(0);
  const [stepCount, setStepCount] = useState(0);
  const [calories, setCalories] = useState(0);
  const [elevationGain, setElevationGain] = useState(0);
  const mapRef = useRef<MapView | null>(null);

  useEffect(() => {
    setSessionActive(false);
    setPaused(false);
    setRoutePoints(activeType.route);
    setSpeedSamples(seedSamples(activeType.id));
    setElapsedSeconds(0);
    setDistanceKm(0);
    setStepCount(0);
    setCalories(0);
    setElevationGain(0);
  }, [activeType.id, activeType.route]);

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

    mapRef.current.fitToCoordinates(routePoints, {
      animated: true,
      edgePadding: {
        top: 120,
        right: 80,
        bottom: 120,
        left: 80,
      },
    });
  }, [routePoints]);

  useEffect(() => {
    if (!sessionActive || paused) {
      return;
    }

    const intervalId = setInterval(() => {
      setElapsedSeconds((current) => current + 3);

      setSpeedSamples((current) => {
        const tick = current.length;
        const nextValue = computeNextSample(activeType.id, tick, current[current.length - 1] ?? BASE_SPEEDS[activeType.id]);

        setDistanceKm((distance) => distance + (nextValue * 3) / 3600);
        setCalories((value) => value + nextValue * (activeType.template === 'cycling' ? 0.42 : 0.78));
        setElevationGain((value) => value + (activeType.id === 'hiking' ? 0.8 : activeType.id === 'running' ? 0.24 : 0.12));

        if (activeType.template === 'foot') {
          setStepCount((value) => value + Math.max(4, Math.round(nextValue * 2.4)));
        }

        return [...current.slice(-13), nextValue];
      });
    }, 3000);

    return () => {
      clearInterval(intervalId);
    };
  }, [activeType.id, activeType.template, paused, sessionActive]);

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
          setRoutePoints((current) => [...current.slice(-19), nextPoint]);

          if (typeof position.coords.speed === 'number' && position.coords.speed > 0) {
            const speedKmh = position.coords.speed * 3.6;

            setSpeedSamples((current) => {
              const next = [...current.slice(-13), speedKmh];
              return next;
            });
          }
        }
      );
    };

    watchLocation();

    return () => {
      subscription?.remove();
    };
  }, [paused, permissionState, sessionActive]);

  const handleRecenter = async () => {
    await Haptics.selectionAsync();

    if (!currentLocation || !mapRef.current || Platform.OS === 'web') {
      return;
    }

    mapRef.current.animateToRegion(
      {
        ...currentLocation,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      },
      400
    );
  };

  const latestSpeed = speedSamples[speedSamples.length - 1] ?? BASE_SPEEDS[activeType.id];
  const averageSpeed = speedSamples.reduce((sum, value) => sum + value, 0) / speedSamples.length;
  const heroValue =
    activeType.id === 'running' ? formatPace(latestSpeed) : latestSpeed.toFixed(activeType.template === 'cycling' ? 0 : 1);
  const thirdPrimaryValue =
    activeType.id === 'running' ? formatPace(averageSpeed) : averageSpeed.toFixed(activeType.template === 'cycling' ? 0 : 1);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.topBar}>
          <Text style={styles.gpsText}>
            GPS ·{' '}
            {permissionState === 'granted'
              ? 'Connected'
              : permissionState === 'denied'
                ? 'Off'
                : 'Checking'}
          </Text>
          <Text style={styles.headerTitle}>{activeType.label}</Text>
          <Pressable onPress={() => Haptics.selectionAsync()} style={styles.topIconButton}>
            <MaterialIcons color="#5C5A73" name="settings" size={24} />
          </Pressable>
        </View>

        <View style={styles.mapArea}>
          {Platform.OS === 'web' ? (
            <View style={styles.webFallback}>
              <MaterialIcons color="#5466E8" name="map" size={42} />
              <Text style={styles.webFallbackText}>Map preview is available on iOS and Android builds.</Text>
            </View>
          ) : (
            <MapView
              ref={mapRef}
              initialRegion={DEFAULT_REGION}
              showsCompass={false}
              showsMyLocationButton={false}
              showsUserLocation={permissionState === 'granted'}
              style={styles.map}
            >
              <Polyline coordinates={routePoints} strokeColor="#5466E8" strokeWidth={5} />
              <Marker coordinate={routePoints[0]}>
                <View style={styles.markerStart} />
              </Marker>
              <Marker coordinate={routePoints[routePoints.length - 1]}>
                <View style={styles.markerEndOuter}>
                  <View style={styles.markerEndInner} />
                </View>
              </Marker>
            </MapView>
          )}

          <Pressable onPress={() => Haptics.selectionAsync()} style={[styles.mapFloatButton, styles.expandButton]}>
            <MaterialIcons color="#5F63A3" name="open-in-full" size={24} />
          </Pressable>

          <View style={styles.zoomColumn}>
            <Pressable onPress={() => Haptics.selectionAsync()} style={styles.mapFloatButton}>
              <MaterialIcons color="#5F63A3" name="add" size={24} />
            </Pressable>
            <Pressable onPress={() => Haptics.selectionAsync()} style={styles.mapFloatButton}>
              <MaterialIcons color="#5F63A3" name="remove" size={24} />
            </Pressable>
          </View>
        </View>

        <Pressable
          disabled={!sessionActive}
          onPress={async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setPaused((value) => !value);
          }}
          style={[styles.pauseButton, !sessionActive ? styles.pauseButtonDisabled : undefined]}
        >
          <MaterialIcons color="#5466E8" name={paused ? 'play-arrow' : 'pause'} size={36} />
        </Pressable>

        <View style={styles.bottomSheet}>
          <View style={styles.modeHeader}>
            <View style={styles.modeBadge}>
              <MaterialCommunityIcons color="#5466E8" name={activeType.icon as never} size={18} />
              <Text style={styles.modeBadgeText}>{activeType.label} mode</Text>
            </View>
            <Text style={styles.modeCopy}>
              {activeType.template === 'cycling'
                ? 'Ride metrics focused on cadence, speed, and climb.'
                : 'Foot-travel metrics focused on pace, steps, and elevation.'}
            </Text>
          </View>

          <View style={styles.liveRow}>
            <View>
              <Text style={styles.liveValue}>{heroValue}</Text>
              <Text style={styles.liveLabel}>{activeType.hero.label}</Text>
            </View>

            <View style={styles.liveActions}>
              <Pressable onPress={handleRecenter} style={styles.liveActionButton}>
                <MaterialIcons color="#FFFFFF" name="my-location" size={22} />
              </Pressable>
              <Pressable onPress={() => Haptics.selectionAsync()} style={[styles.liveActionButton, styles.liveActionButtonPrimary]}>
                <MaterialIcons color="#FFFFFF" name="graphic-eq" size={22} />
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
            <View style={styles.cyclingHighlightRow}>
              <CyclingHighlight
                label={activeType.secondaryLabels[0]}
                value={Math.round(80 + averageSpeed * 0.18).toString()}
              />
              <CyclingHighlight
                label={activeType.secondaryLabels[1]}
                value={Math.round(elevationGain + distanceKm * 4).toString()}
              />
            </View>
          )}

          <View style={styles.footerRow}>
            <Pressable
              onPress={async () => {
                await Haptics.selectionAsync();
                router.replace('/(tabs)/choose-path');
              }}
              style={styles.footerButton}
            >
              <MaterialIcons color="#5466E8" name="arrow-back" size={20} />
              <Text style={styles.footerButtonText}>Back</Text>
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
              style={[styles.footerButton, styles.footerButtonPrimary]}
            >
              <MaterialIcons color="#FFFFFF" name={sessionActive ? 'stop-circle' : 'play-circle-filled'} size={20} />
              <Text style={[styles.footerButtonText, styles.footerButtonTextPrimary]}>
                {sessionActive ? 'Finish' : 'Start'}
              </Text>
            </Pressable>
          </View>
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
  const width = 292;
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

function CyclingHighlight({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.cyclingHighlightCard}>
      <Text style={styles.cyclingHighlightValue}>{value}</Text>
      <Text style={styles.cyclingHighlightLabel}>{label}</Text>
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
    backgroundColor: '#F8F8FC',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8F8FC',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 18,
  },
  gpsText: {
    color: '#66657A',
    fontSize: 16,
    fontWeight: '500',
  },
  headerTitle: {
    color: '#1D2474',
    fontSize: 22,
    fontWeight: '700',
  },
  topIconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapArea: {
    flex: 1,
    marginHorizontal: 18,
    borderRadius: 28,
    backgroundColor: '#EEF0F7',
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
  mapFloatButton: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#B8BED7',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  expandButton: {
    position: 'absolute',
    left: 18,
    top: 18,
  },
  zoomColumn: {
    position: 'absolute',
    right: 18,
    top: 18,
    gap: 14,
  },
  pauseButton: {
    position: 'absolute',
    left: '50%',
    bottom: 336,
    marginLeft: -48,
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#C9CDE0',
    shadowOpacity: 0.22,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  pauseButtonDisabled: {
    opacity: 0.45,
  },
  bottomSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 22,
    gap: 18,
  },
  modeHeader: {
    gap: 8,
  },
  modeBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 999,
    backgroundColor: '#EEF1FF',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  modeBadgeText: {
    color: '#5466E8',
    fontSize: 13,
    fontWeight: '700',
  },
  modeCopy: {
    color: '#6F7288',
    fontSize: 14,
  },
  liveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  liveValue: {
    color: '#1D2474',
    fontSize: 52,
    fontWeight: '700',
  },
  liveLabel: {
    color: '#6F7288',
    fontSize: 16,
  },
  liveActions: {
    flexDirection: 'row',
    gap: 12,
  },
  liveActionButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#9196B4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveActionButtonPrimary: {
    backgroundColor: '#5466E8',
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
  cyclingHighlightRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cyclingHighlightCard: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: '#EEF1FF',
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 6,
  },
  cyclingHighlightValue: {
    color: '#5466E8',
    fontSize: 18,
    fontWeight: '700',
  },
  cyclingHighlightLabel: {
    color: '#5466E8',
    fontSize: 13,
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    gap: 12,
  },
  footerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 18,
    backgroundColor: '#F2F4FB',
    paddingVertical: 15,
  },
  footerButtonPrimary: {
    backgroundColor: '#5466E8',
  },
  footerButtonText: {
    color: '#5466E8',
    fontSize: 15,
    fontWeight: '700',
  },
  footerButtonTextPrimary: {
    color: '#FFFFFF',
  },
});
