import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import { submitJourney } from '@/lib/backend';
import { getCurrentUserProfile } from '@/lib/user-session';
import * as Location from 'expo-location';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ACTIVITY_TYPES, TRAILS, type Coordinate } from '@/lib/journey-data';

const DEFAULT_REGION = {
  latitude: 25.2048,
  longitude: 55.2708,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

const DEFAULT_USER_WEIGHT_KG = 75;

type JourneySummary = {
  averageDisplay: string;
  calories: number;
  distanceKm: number;
  durationDisplay: string;
  durationSeconds: number;
  endedAt: string;
  routeMode: 'free' | 'trail';
  startedAt: string;
  xp: number;
};

export default function StartJourneyScreen() {
  const params = useLocalSearchParams<{ trail?: string; type?: string }>();
  const activeType = ACTIVITY_TYPES.find((type) => type.id === params.type) ?? ACTIVITY_TYPES[0];
  const availableTrails = TRAILS.filter((trail) => trail.type === activeType.id);
  const selectedTrail = availableTrails.find((trail) => trail.id === params.trail) ?? null;

  const [sessionActive, setSessionActive] = useState(false);
  const [paused, setPaused] = useState(false);
  const [permissionState, setPermissionState] = useState<'checking' | 'granted' | 'denied'>('checking');
  const [currentLocation, setCurrentLocation] = useState<Coordinate | null>(null);
  const [routePoints, setRoutePoints] = useState<Coordinate[]>([]);
  const [speedSamples, setSpeedSamples] = useState<number[]>([]);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [distanceKm, setDistanceKm] = useState(0);
  const [sessionStartedAt, setSessionStartedAt] = useState<string | null>(null);
  const [journeySummary, setJourneySummary] = useState<JourneySummary | null>(null);
  const [summaryVisible, setSummaryVisible] = useState(false);
  const [summaryStatus, setSummaryStatus] = useState('');
  const mapRef = useRef<MapView | null>(null);
  const previousTrackedPointRef = useRef<Coordinate | null>(null);
  const previousTrackedTimestampRef = useRef<number | null>(null);
  const initialRegion = useMemo(() => {
    if (selectedTrail) {
      return createRegionFromRoute(selectedTrail.route);
    }

    if (currentLocation) {
      return {
        ...currentLocation,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      };
    }

    return DEFAULT_REGION;
  }, [currentLocation, selectedTrail]);

  useEffect(() => {
    setSessionActive(false);
    setPaused(false);
    setRoutePoints([]);
    setSpeedSamples([]);
    setElapsedSeconds(0);
    setDistanceKm(0);
    previousTrackedPointRef.current = null;
    previousTrackedTimestampRef.current = null;
  }, [activeType.id, selectedTrail?.id]);

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
    if (!mapRef.current || Platform.OS === 'web' || !selectedTrail) {
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
  }, [selectedTrail]);

  useEffect(() => {
    if (!sessionActive || paused) {
      return;
    }

    const intervalId = setInterval(() => {
      setElapsedSeconds((current) => current + 3);
    }, 3000);

    return () => {
      clearInterval(intervalId);
    };
  }, [paused, sessionActive]);

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

          if (sessionActive && !paused) {
            setRoutePoints((current) => {
              if (current.length === 0) {
                previousTrackedPointRef.current = nextPoint;
                previousTrackedTimestampRef.current = position.timestamp;
                return [nextPoint];
              }

              const previousPoint = previousTrackedPointRef.current ?? current[current.length - 1];
              const segmentDistance = previousPoint ? calculateDistanceKm(previousPoint, nextPoint) : 0;
              const previousTimestamp = previousTrackedTimestampRef.current ?? position.timestamp;
              const elapsedHours = Math.max((position.timestamp - previousTimestamp) / 3600000, 0.0001);
              const derivedSpeedKmh = segmentDistance / elapsedHours;

              previousTrackedPointRef.current = nextPoint;
              previousTrackedTimestampRef.current = position.timestamp;
              setDistanceKm((value) => value + segmentDistance);
              setSpeedSamples((samples) => [...samples.slice(-15), derivedSpeedKmh]);

              return [...current, nextPoint];
            });
          }
        }
      );
    };

    watchLocation();

    return () => {
      subscription?.remove();
    };
  }, [paused, permissionState, selectedTrail, sessionActive]);

  const latestSpeed = speedSamples[speedSamples.length - 1] ?? 0;
  const averageSpeed = speedSamples.length
    ? speedSamples.reduce((sum, value) => sum + value, 0) / speedSamples.length
    : 0;
  const currentUserProfile = getCurrentUserProfile();
  const effectiveWeightKg = currentUserProfile?.weightKg ?? DEFAULT_USER_WEIGHT_KG;
  const heroValue =
    activeType.id === 'running'
      ? formatPace(latestSpeed)
      : latestSpeed.toFixed(activeType.template === 'cycling' ? 0 : 1);
  const thirdPrimaryValue =
    activeType.id === 'running'
      ? formatPace(averageSpeed)
      : averageSpeed.toFixed(activeType.template === 'cycling' ? 0 : 1);
  const elapsedHours = elapsedSeconds / 3600;
  const calories = Math.round(estimateCalories(activeType.id, averageSpeed, effectiveWeightKg, elapsedHours));
  const sessionXp = Math.round(
    12 +
      distanceKm * (activeType.id === 'cycling' ? 5 : activeType.id === 'hiking' ? 7 : 6) +
      elapsedSeconds / 90 +
      (selectedTrail ? 10 : 0)
  );
  const routeModeLabel = selectedTrail ? 'Preset trail' : 'Free start';
  const trackingQualityLabel =
    permissionState === 'granted' ? (speedSamples.length > 0 ? 'GPS live' : 'Waiting for movement') : 'GPS unavailable';

  const resetSessionState = () => {
    setPaused(false);
    setRoutePoints(currentLocation ? [currentLocation] : []);
    setSpeedSamples([]);
    setElapsedSeconds(0);
    setDistanceKm(0);
    previousTrackedPointRef.current = currentLocation;
    previousTrackedTimestampRef.current = Date.now();
  };

  const handleStartSession = async () => {
    resetSessionState();
    setJourneySummary(null);
    setSummaryVisible(false);
    setSummaryStatus('');
    setSessionStartedAt(new Date().toISOString());
    setSessionActive(true);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleFinishSession = async () => {
    const startedAt = sessionStartedAt ?? new Date(Date.now() - elapsedSeconds * 1000).toISOString();
    const endedAt = new Date().toISOString();
    const summary: JourneySummary = {
      averageDisplay: thirdPrimaryValue,
      calories,
      distanceKm,
      durationDisplay: formatDuration(elapsedSeconds),
      durationSeconds: elapsedSeconds,
      endedAt,
      routeMode: selectedTrail ? 'trail' : 'free',
      startedAt,
      xp: sessionXp,
    };

    setJourneySummary(summary);
    setSummaryVisible(true);
    setSessionActive(false);
    setPaused(false);
    setSummaryStatus('Saving journey...');

    try {
      await submitJourney({
        user_id: currentUserProfile?.userId ?? null,
        started_at: startedAt,
        ended_at: endedAt,
        journey: {
          activity_type: activeType.id,
          trail_id: selectedTrail?.id ?? null,
          route_mode: selectedTrail ? 'trail' : 'free',
          route_points: routePoints,
          duration_seconds: elapsedSeconds,
          distance_km: distanceKm,
          average_speed_kmh: averageSpeed,
          average_pace: activeType.id === 'running' ? thirdPrimaryValue : null,
          calories_estimated: calories,
          xp_earned: sessionXp,
        },
      });
      setSummaryStatus('Journey saved.');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Could not save this journey.';
      setSummaryStatus(message);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

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
            <Text style={styles.headerTitle}>{selectedTrail?.title ?? `Live ${activeType.label}`}</Text>
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
              {selectedTrail ? (
                <>
                  <Polyline coordinates={selectedTrail.route} strokeColor="#5466E8" strokeWidth={6} />
                  <Marker coordinate={selectedTrail.route[0]}>
                    <View style={styles.markerStart} />
                  </Marker>
                  <Marker coordinate={selectedTrail.route[selectedTrail.route.length - 1]}>
                    <View style={styles.markerEndOuter}>
                      <View style={styles.markerEndInner} />
                    </View>
                  </Marker>
                </>
              ) : null}

              {!selectedTrail && routePoints.length > 1 ? (
                <Polyline coordinates={routePoints} strokeColor="#5466E8" strokeWidth={6} />
              ) : null}
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
                <MaterialIcons color="#6A6F93" name="flag" size={20} />
              </Pressable>
              <Pressable
                onPress={async () => {
                  if (!sessionActive) {
                    await handleStartSession();
                    return;
                  }

                  await handleFinishSession();
                }}
                style={styles.liveActionButtonPrimary}
              >
                <MaterialIcons color="#FFFFFF" name={sessionActive ? 'stop-circle' : 'play-circle-filled'} size={22} />
                <Text style={styles.liveActionPrimaryText}>{sessionActive ? 'Finish' : 'Start'}</Text>
              </Pressable>
            </View>
          </View>

          <SessionSummaryCard
            items={[
              { label: 'Tracking', value: trackingQualityLabel },
              { label: 'Route', value: routeModeLabel },
              { label: 'XP', value: `${sessionXp}` },
              { label: 'Calories', value: `${calories} est.` },
            ]}
          />

          <View style={styles.metricsRow}>
            <MetricCard label={activeType.primaryLabels[0]} value={distanceKm.toFixed(1)} />
            <MetricCard label={activeType.primaryLabels[1]} value={formatDuration(elapsedSeconds)} />
            <MetricCard label={activeType.primaryLabels[2]} value={thirdPrimaryValue} />
          </View>

          <View style={styles.secondaryRow}>
            <CompactMetric label="Calories" value={`${calories}`} />
            <CompactMetric label="XP" value={`${sessionXp}`} />
            <CompactMetric label="Route mode" value={selectedTrail ? 'Trail' : 'Free'} />
          </View>
        </View>

        <Modal animationType="slide" transparent visible={summaryVisible}>
          <View style={styles.summaryOverlay}>
            <View style={styles.summarySheet}>
              <Text style={styles.summaryEyebrow}>SESSION COMPLETE</Text>
              <Text style={styles.summaryTitle}>{selectedTrail?.title ?? `${activeType.label} summary`}</Text>

              {journeySummary ? (
                <>
                  <View style={styles.summaryStatsRow}>
                    <MetricCard label="Distance km" value={journeySummary.distanceKm.toFixed(1)} />
                    <MetricCard label="Duration" value={journeySummary.durationDisplay} />
                  </View>

                  <View style={styles.summaryStatsRow}>
                    <MetricCard label={activeType.primaryLabels[2]} value={journeySummary.averageDisplay} />
                    <MetricCard label="XP earned" value={journeySummary.xp.toString()} />
                  </View>

                  <View style={styles.summaryFooterRow}>
                    <CompactMetric label="Calories" value={journeySummary.calories.toString()} />
                    <CompactMetric label="Route mode" value={journeySummary.routeMode === 'trail' ? 'Trail' : 'Free'} />
                  </View>
                </>
              ) : null}

              {summaryStatus ? <Text style={styles.summaryStatus}>{summaryStatus}</Text> : null}

              <Pressable
                onPress={async () => {
                  await Haptics.selectionAsync();
                  setSummaryVisible(false);
                }}
                style={styles.summaryButton}
              >
                <Text style={styles.summaryButtonText}>Done</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

function SessionSummaryCard({
  items,
}: {
  items: {
    label: string;
    value: string;
  }[];
}) {
  return (
    <View style={styles.chartCard}>
      <Text style={styles.chartLabel}>Live session</Text>
      <View style={styles.summaryGrid}>
        {items.map((item) => (
          <View key={item.label} style={styles.summaryCell}>
            <Text style={styles.summaryValue}>{item.value}</Text>
            <Text style={styles.summaryLabel}>{item.label}</Text>
          </View>
        ))}
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

function calculateDistanceKm(from: Coordinate, to: Coordinate) {
  const earthRadiusKm = 6371;
  const latitudeDelta = toRadians(to.latitude - from.latitude);
  const longitudeDelta = toRadians(to.longitude - from.longitude);
  const fromLatitude = toRadians(from.latitude);
  const toLatitudeValue = toRadians(to.latitude);

  const a =
    Math.sin(latitudeDelta / 2) * Math.sin(latitudeDelta / 2) +
    Math.cos(fromLatitude) *
      Math.cos(toLatitudeValue) *
      Math.sin(longitudeDelta / 2) *
      Math.sin(longitudeDelta / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
}

function toRadians(value: number) {
  return (value * Math.PI) / 180;
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
  if (speedKmh <= 0) {
    return '--:--';
  }

  const paceMinutes = 60 / Math.max(speedKmh, 0.1);
  const minutes = Math.floor(paceMinutes);
  const seconds = Math.round((paceMinutes - minutes) * 60)
    .toString()
    .padStart(2, '0');

  return `${minutes}:${seconds}`;
}

function estimateCalories(typeId: string, averageSpeedKmh: number, weightKg: number, durationHours: number) {
  if (durationHours <= 0) {
    return 0;
  }

  const met = getMetValue(typeId, averageSpeedKmh);
  return met * weightKg * durationHours;
}

function getMetValue(typeId: string, averageSpeedKmh: number) {
  if (typeId === 'running') {
    if (averageSpeedKmh >= 12) return 11.5;
    if (averageSpeedKmh >= 10) return 9.8;
    return 8.3;
  }

  if (typeId === 'cycling') {
    if (averageSpeedKmh >= 26) return 10;
    if (averageSpeedKmh >= 20) return 8;
    return 6.8;
  }

  if (typeId === 'hiking') {
    return 6;
  }

  return averageSpeedKmh >= 5.5 ? 4.3 : 3.5;
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
  summaryOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 18, 38, 0.35)',
    justifyContent: 'flex-end',
  },
  summarySheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 28,
    gap: 16,
  },
  summaryEyebrow: {
    color: '#8A837C',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.1,
  },
  summaryTitle: {
    color: '#1D2474',
    fontSize: 28,
    fontWeight: '700',
  },
  summaryStatsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  summaryFooterRow: {
    flexDirection: 'row',
    gap: 10,
  },
  summaryStatus: {
    color: '#6F7288',
    fontSize: 13,
    lineHeight: 18,
  },
  summaryButton: {
    borderRadius: 20,
    backgroundColor: '#5466E8',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  summaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
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
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  summaryCell: {
    width: '47%',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 4,
  },
  summaryValue: {
    color: '#1D2474',
    fontSize: 15,
    fontWeight: '700',
  },
  summaryLabel: {
    color: '#6F7288',
    fontSize: 12,
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
