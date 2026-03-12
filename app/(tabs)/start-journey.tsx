import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

type Coordinate = {
  latitude: number;
  longitude: number;
};

type ActivityType = {
  id: string;
  icon: string;
  label: string;
  metrics: {
    avgLabel: string;
    avgValue: string;
    distance: string;
    liveLabel: string;
    liveValue: string;
    time: string;
  };
  route: Coordinate[];
};

const ACTIVITY_TYPES: ActivityType[] = [
  {
    id: 'cycling',
    icon: 'bike-fast',
    label: 'Cycling',
    metrics: {
      avgLabel: 'AVG km/h',
      avgValue: '30',
      distance: '15 km',
      liveLabel: 'Speed km/h',
      liveValue: '30',
      time: '00:30:00',
    },
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
    metrics: {
      avgLabel: 'AVG pace',
      avgValue: '5:20',
      distance: '6.4 km',
      liveLabel: 'Pace /km',
      liveValue: '5:12',
      time: '00:34:10',
    },
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
    metrics: {
      avgLabel: 'AVG km/h',
      avgValue: '5.8',
      distance: '3.2 km',
      liveLabel: 'Speed km/h',
      liveValue: '5.6',
      time: '00:38:40',
    },
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
    metrics: {
      avgLabel: 'AVG km/h',
      avgValue: '4.2',
      distance: '8.7 km',
      liveLabel: 'Speed km/h',
      liveValue: '4.0',
      time: '01:42:20',
    },
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

export default function StartJourneyScreen() {
  const params = useLocalSearchParams<{ type?: string }>();
  const initialType = ACTIVITY_TYPES.find((type) => type.id === params.type) ?? ACTIVITY_TYPES[0];
  const [selectedType, setSelectedType] = useState<ActivityType | null>(initialType);
  const [paused, setPaused] = useState(false);
  const [permissionState, setPermissionState] = useState<'checking' | 'granted' | 'denied'>('checking');
  const [currentLocation, setCurrentLocation] = useState<Coordinate | null>(null);
  const mapRef = useRef<MapView | null>(null);

  const activeType = selectedType ?? ACTIVITY_TYPES[0];

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

      const nextLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };

      setCurrentLocation(nextLocation);
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

    mapRef.current.fitToCoordinates(activeType.route, {
      animated: true,
      edgePadding: {
        top: 120,
        right: 80,
        bottom: 120,
        left: 80,
      },
    });
  }, [activeType]);

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

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.topBar}>
          <Text style={styles.gpsText}>
            GPS · {permissionState === 'granted' ? 'Connected' : permissionState === 'denied' ? 'Off' : 'Checking'}
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
              <Polyline coordinates={activeType.route} strokeColor="#5466E8" strokeWidth={5} />
              <Marker coordinate={activeType.route[0]}>
                <View style={styles.markerStart} />
              </Marker>
              <Marker coordinate={activeType.route[activeType.route.length - 1]}>
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
          onPress={async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setPaused((value) => !value);
          }}
          style={styles.pauseButton}
        >
          <MaterialIcons color="#5466E8" name={paused ? 'play-arrow' : 'pause'} size={36} />
        </Pressable>

        <View style={styles.bottomSheet}>
          <View style={styles.typeSelector}>
            <Text style={styles.selectorLabel}>Select journey type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.typeRow}>
              {ACTIVITY_TYPES.map((type) => {
                const isActive = type.id === activeType.id;

                return (
                  <Pressable
                    key={type.id}
                    onPress={async () => {
                      await Haptics.selectionAsync();
                      setSelectedType(type);
                    }}
                    style={[styles.typeChip, isActive ? styles.typeChipActive : undefined]}
                  >
                    <MaterialCommunityIcons
                      color={isActive ? '#FFFFFF' : '#5466E8'}
                      name={type.icon as never}
                      size={18}
                    />
                    <Text style={[styles.typeChipText, isActive ? styles.typeChipTextActive : undefined]}>
                      {type.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.liveRow}>
            <View>
              <Text style={styles.liveValue}>{activeType.metrics.liveValue}</Text>
              <Text style={styles.liveLabel}>{activeType.metrics.liveLabel}</Text>
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

          <View style={styles.waveRow}>
            <View style={[styles.waveSegment, styles.waveSegmentOne]} />
            <View style={[styles.waveSegment, styles.waveSegmentTwo]} />
            <View style={[styles.waveSegment, styles.waveSegmentThree]} />
          </View>

          <View style={styles.metricsRow}>
            <View style={styles.metricCard}>
              <MaterialCommunityIcons color="#6D73DF" name="map-marker-distance" size={22} />
              <Text style={styles.metricValue}>{activeType.metrics.distance}</Text>
              <Text style={styles.metricLabel}>Distance</Text>
            </View>
            <View style={styles.metricCard}>
              <MaterialIcons color="#6D73DF" name="timer" size={22} />
              <Text style={styles.metricValue}>{activeType.metrics.time}</Text>
              <Text style={styles.metricLabel}>Journey time</Text>
            </View>
            <View style={styles.metricCard}>
              <MaterialIcons color="#6D73DF" name="speed" size={22} />
              <Text style={styles.metricValue}>{activeType.metrics.avgValue}</Text>
              <Text style={styles.metricLabel}>{activeType.metrics.avgLabel}</Text>
            </View>
          </View>

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
              onPress={() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)}
              style={[styles.footerButton, styles.footerButtonPrimary]}
            >
              <MaterialIcons color="#FFFFFF" name="play-circle-filled" size={20} />
              <Text style={[styles.footerButtonText, styles.footerButtonTextPrimary]}>Start</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
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
    bottom: 306,
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
  bottomSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    paddingHorizontal: 22,
    paddingTop: 26,
    paddingBottom: 22,
    gap: 20,
  },
  typeSelector: {
    gap: 12,
  },
  selectorLabel: {
    color: '#6F7288',
    fontSize: 14,
    fontWeight: '600',
  },
  typeRow: {
    gap: 12,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 999,
    backgroundColor: '#F1F3FF',
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  typeChipActive: {
    backgroundColor: '#5466E8',
  },
  typeChipText: {
    color: '#5466E8',
    fontSize: 14,
    fontWeight: '600',
  },
  typeChipTextActive: {
    color: '#FFFFFF',
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
  waveRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 8,
    height: 28,
  },
  waveSegment: {
    width: 56,
    borderTopWidth: 3,
    borderColor: '#CBD0F8',
  },
  waveSegmentOne: {
    height: 14,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  waveSegmentTwo: {
    height: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  waveSegmentThree: {
    height: 18,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
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
