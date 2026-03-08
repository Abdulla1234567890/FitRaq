import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const traceSections = [
  {
    color: '#16142D',
    label: 'Heart Rate',
    peak: '144 BPM peak',
    points: [
      { width: 80, rotate: '-18deg', top: 18 },
      { width: 78, rotate: '-8deg', top: 4 },
      { width: 76, rotate: '14deg', top: 8 },
      { width: 86, rotate: '-16deg', top: 22 },
      { width: 90, rotate: '-20deg', top: 10 },
    ],
  },
  {
    color: '#AFA4FF',
    label: 'Breathing Rate',
    peak: '21 br/min peak',
    points: [
      { width: 84, rotate: '-10deg', top: 20 },
      { width: 82, rotate: '-6deg', top: 14 },
      { width: 72, rotate: '8deg', top: 10 },
      { width: 86, rotate: '-8deg', top: 6 },
      { width: 78, rotate: '-2deg', top: 4 },
    ],
  },
  {
    color: '#E57D6C',
    label: 'Ambient Temperature',
    peak: '40 °C peak',
    points: [
      { width: 74, rotate: '-12deg', top: 24 },
      { width: 84, rotate: '-8deg', top: 18 },
      { width: 88, rotate: '-6deg', top: 14 },
      { width: 82, rotate: '-6deg', top: 10 },
      { width: 72, rotate: '-4deg', top: 8 },
    ],
  },
];

export default function JourneyDetailsScreen() {
  const params = useLocalSearchParams<{
    date?: string;
    distance?: string;
    location?: string;
    title?: string;
    xp?: string;
  }>();

  const title = Array.isArray(params.title) ? params.title[0] : params.title || 'Morning Run';
  const location =
    (Array.isArray(params.location) ? params.location[0] : params.location) || 'Al Qouz, Dubai';
  const date = Array.isArray(params.date) ? params.date[0] : params.date || '24 February 2026';
  const xp = Array.isArray(params.xp) ? params.xp[0] : params.xp || '78 XP';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Pressable
            onPress={async () => {
              await Haptics.selectionAsync();
              router.back();
            }}
            style={styles.iconButton}
          >
            <MaterialIcons color="#2F42C7" name="arrow-back-ios-new" size={22} />
          </Pressable>
          <Text style={styles.headerTitle}>Journey Details</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.titleRow}>
          <View style={styles.titleBlock}>
            <Text style={styles.runTitle}>{title}</Text>
            <Text style={styles.locationText}>{location}</Text>
          </View>
          <Text style={styles.dateText}>{date}</Text>
        </View>

        <View style={styles.mapCard}>
          <View style={styles.mapWater} />
          <View style={styles.mapLand} />
          <View style={styles.mapRoadOne} />
          <View style={styles.mapRoadTwo} />
          <View style={styles.routeTrace} />
        </View>

        <View style={styles.scoreCard}>
          <View style={styles.scoreBadge}>
            <Text style={styles.scoreBadgeText}>{xp}</Text>
          </View>
          <View style={styles.scoreTextWrap}>
            <Text style={styles.scoreTitle}>Effort Score</Text>
            <Text style={styles.scoreSubtitle}>38°C ambient heat added</Text>
            <Text style={styles.scoreSubtitle}>+13 bonus for this path</Text>
          </View>
        </View>

        <View style={styles.traceBlock}>
          <Text style={styles.traceTitle}>Biometric Trace</Text>

          {traceSections.map((section) => (
            <View key={section.label} style={styles.traceSection}>
              <View style={styles.traceRow}>
                <Text style={styles.traceLabel}>{section.label}</Text>
                <Text style={styles.tracePeak}>{section.peak}</Text>
              </View>

              <View style={styles.traceCanvas}>
                {section.points.map((point, index) => (
                  <View
                    key={`${section.label}-${index}`}
                    style={[
                      styles.traceSegment,
                      {
                        backgroundColor: section.color,
                        top: point.top,
                        width: point.width,
                        left: index * 64,
                        transform: [{ rotate: point.rotate }],
                      },
                    ]}
                  />
                ))}
              </View>
            </View>
          ))}
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
    paddingBottom: 28,
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
    fontSize: 26,
    fontWeight: '500',
  },
  headerSpacer: {
    width: 44,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 20,
  },
  titleBlock: {
    gap: 8,
    flex: 1,
  },
  runTitle: {
    color: '#2F42C7',
    fontSize: 28,
    fontWeight: '600',
  },
  locationText: {
    color: '#514944',
    fontSize: 15,
  },
  dateText: {
    color: '#8F867F',
    fontSize: 14,
    alignSelf: 'flex-start',
    paddingTop: 10,
  },
  mapCard: {
    height: 140,
    borderRadius: 34,
    backgroundColor: '#4678C7',
    overflow: 'hidden',
  },
  mapWater: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#4678C7',
  },
  mapLand: {
    position: 'absolute',
    left: -30,
    top: 0,
    width: 150,
    height: 170,
    borderTopRightRadius: 100,
    borderBottomRightRadius: 90,
    backgroundColor: '#18345B',
  },
  mapRoadOne: {
    position: 'absolute',
    top: 34,
    left: 56,
    width: 250,
    height: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(5,19,46,0.65)',
    transform: [{ rotate: '-18deg' }],
  },
  mapRoadTwo: {
    position: 'absolute',
    top: 78,
    left: 20,
    width: 220,
    height: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(5,19,46,0.65)',
    transform: [{ rotate: '10deg' }],
  },
  routeTrace: {
    position: 'absolute',
    left: 110,
    top: 48,
    width: 160,
    height: 6,
    borderRadius: 999,
    backgroundColor: '#A7BEFF',
    transform: [{ rotate: '-12deg' }],
  },
  scoreCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    backgroundColor: '#2F42C7',
    borderRadius: 34,
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
  scoreBadge: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: '#5E70DD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreBadgeText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  scoreTextWrap: {
    flex: 1,
    gap: 4,
  },
  scoreTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '600',
  },
  scoreSubtitle: {
    color: '#DDE3FF',
    fontSize: 14,
  },
  traceBlock: {
    gap: 18,
  },
  traceTitle: {
    color: '#514944',
    fontSize: 18,
    fontWeight: '500',
  },
  traceSection: {
    gap: 12,
  },
  traceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  traceLabel: {
    color: '#B0AAA5',
    fontSize: 16,
  },
  tracePeak: {
    color: '#6E665F',
    fontSize: 16,
  },
  traceCanvas: {
    height: 72,
    position: 'relative',
    overflow: 'hidden',
  },
  traceSegment: {
    position: 'absolute',
    height: 3,
    borderRadius: 999,
  },
});
