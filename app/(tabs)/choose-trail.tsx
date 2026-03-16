import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ACTIVITY_TYPES, TRAILS } from './journey-data';

export default function ChooseTrailScreen() {
  const params = useLocalSearchParams<{ type?: string }>();
  const selectedType = ACTIVITY_TYPES.find((type) => type.id === params.type) ?? ACTIVITY_TYPES[0];
  const trails = TRAILS.filter((trail) => trail.type === selectedType.id);

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

          <Text style={styles.headerTitle}>Select Trail</Text>

          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.introCard}>
          <Text style={styles.introEyebrow}>{selectedType.label.toUpperCase()}</Text>
          <Text style={styles.introTitle}>Choose a route from the trail database</Text>
          <Text style={styles.introCopy}>
            Pick a saved path first, then we&apos;ll open the live map already focused on that route.
          </Text>
        </View>

        <View style={styles.cardList}>
          {trails.map((trail) => (
            <Pressable
              key={trail.id}
              onPress={async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push({
                  pathname: '/(tabs)/start-journey',
                  params: {
                    trail: trail.id,
                    type: selectedType.id,
                  },
                });
              }}
              style={styles.trailCard}
            >
              <View style={styles.trailCardHeader}>
                <View>
                  <Text style={styles.trailTitle}>{trail.title}</Text>
                  <Text style={styles.trailArea}>{trail.area}</Text>
                </View>
                <View style={styles.difficultyBadge}>
                  <Text style={styles.difficultyText}>{trail.difficulty}</Text>
                </View>
              </View>

              <Text style={styles.trailDescription}>{trail.description}</Text>

              <View style={styles.trailMetaRow}>
                <View style={styles.metaItem}>
                  <Text style={styles.metaValue}>{trail.distanceKm.toFixed(1)} km</Text>
                  <Text style={styles.metaLabel}>Distance</Text>
                </View>
                <View style={styles.metaItem}>
                  <Text style={styles.metaValue}>{trail.estimatedTime}</Text>
                  <Text style={styles.metaLabel}>Estimated</Text>
                </View>
                <View style={styles.metaItem}>
                  <Text style={styles.metaValue}>{selectedType.label}</Text>
                  <Text style={styles.metaLabel}>Mode</Text>
                </View>
              </View>
            </Pressable>
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
    paddingHorizontal: 20,
    paddingTop: 12,
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#2F42C7',
    fontSize: 24,
    fontWeight: '600',
  },
  headerSpacer: {
    width: 42,
  },
  introCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    padding: 20,
    gap: 8,
  },
  introEyebrow: {
    color: '#8A837C',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.1,
  },
  introTitle: {
    color: '#1B140F',
    fontSize: 28,
    fontWeight: '600',
    lineHeight: 32,
  },
  introCopy: {
    color: '#6E665F',
    fontSize: 14,
    lineHeight: 22,
  },
  cardList: {
    gap: 14,
  },
  trailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    gap: 14,
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  trailCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  trailTitle: {
    color: '#1B140F',
    fontSize: 20,
    fontWeight: '600',
  },
  trailArea: {
    color: '#6E665F',
    fontSize: 14,
    marginTop: 4,
  },
  difficultyBadge: {
    borderRadius: 999,
    backgroundColor: '#EEF1FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  difficultyText: {
    color: '#2F42C7',
    fontSize: 12,
    fontWeight: '700',
  },
  trailDescription: {
    color: '#6E665F',
    fontSize: 14,
    lineHeight: 22,
  },
  trailMetaRow: {
    flexDirection: 'row',
    gap: 10,
  },
  metaItem: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: '#F7F4EF',
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 4,
  },
  metaValue: {
    color: '#1B140F',
    fontSize: 15,
    fontWeight: '700',
  },
  metaLabel: {
    color: '#8A837C',
    fontSize: 12,
  },
});
