import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ACTIVITY_TYPES, TRAILS, type Trail } from './journey-data';

export default function ChooseTrailScreen() {
  const params = useLocalSearchParams<{ type?: string }>();
  const { width } = useWindowDimensions();
  const selectedType = ACTIVITY_TYPES.find((type) => type.id === params.type) ?? ACTIVITY_TYPES[0];
  const trails = TRAILS.filter((trail) => trail.type === selectedType.id);
  const [activeSlides, setActiveSlides] = useState<Record<string, number>>({});
  const cardWidth = width - 40;

  const handleOpenTrail = async (trail: Trail) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: '/(tabs)/start-journey',
      params: {
        trail: trail.id,
        type: selectedType.id,
      },
    });
  };

  const handleGalleryEnd = (trailId: string, event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const pageWidth = event.nativeEvent.layoutMeasurement.width;
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / pageWidth);

    setActiveSlides((current) => ({
      ...current,
      [trailId]: nextIndex,
    }));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
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
          <Text style={styles.introTitle}>Pick a trail from the photos</Text>
          <Text style={styles.introCopy}>
            Swipe inside each trail card to preview the vibe, then open the route you want.
          </Text>
        </View>

        <View style={styles.trailList}>
          {trails.map((trail) => {
            const activeSlide = activeSlides[trail.id] ?? 0;

            return (
              <View key={trail.id} style={styles.trailCard}>
                <View style={styles.previewFrame}>
                  <FlatList
                    data={trail.gallery}
                    horizontal
                    keyExtractor={(item, index) => `${trail.id}-gallery-${index}`}
                    onMomentumScrollEnd={(event) => handleGalleryEnd(trail.id, event)}
                    pagingEnabled
                    renderItem={({ item }) => (
                      <View style={[styles.gallerySlide, { width: cardWidth - 2 }]}>
                        <Image contentFit="cover" source={item.image} style={styles.previewImage} />
                        <View style={styles.previewOverlay}>
                          <View style={styles.previewTopRow}>
                            <View style={styles.previewBadge}>
                              <Text style={styles.previewBadgeText}>{trail.difficulty}</Text>
                            </View>

                            <View style={styles.previewCountBadge}>
                              <Text style={styles.previewCountText}>
                                {activeSlide + 1}/{trail.gallery.length}
                              </Text>
                            </View>
                          </View>

                          <View style={styles.previewBottomCopy}>
                            <Text style={styles.previewArea}>{trail.area}</Text>
                            <Text style={styles.previewCaption}>{item.caption}</Text>
                          </View>
                        </View>
                      </View>
                    )}
                    showsHorizontalScrollIndicator={false}
                  />

                  <View style={styles.photoDotRow}>
                    {trail.gallery.map((_, index) => (
                      <View
                        key={`${trail.id}-dot-${index}`}
                        style={[
                          styles.photoDot,
                          index === activeSlide ? styles.photoDotActive : undefined,
                        ]}
                      />
                    ))}
                  </View>
                </View>

                <View style={styles.trailBody}>
                  <View style={styles.titleRow}>
                    <Text style={styles.trailTitle}>{trail.title}</Text>
                    <Pressable onPress={() => handleOpenTrail(trail)} style={styles.inlineOpenButton}>
                      <Text style={styles.inlineOpenButtonText}>Open</Text>
                    </Pressable>
                  </View>

                  <Text style={styles.trailCopy}>{trail.description}</Text>

                  <View style={styles.metaRow}>
                    <MetaPill label={`${trail.distanceKm.toFixed(1)} km`} />
                    <MetaPill label={trail.estimatedTime} />
                    <MetaPill label={selectedType.label} />
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function MetaPill({ label }: { label: string }) {
  return (
    <View style={styles.metaPill}>
      <Text style={styles.metaPillText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4EFE8',
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 36,
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
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#FBF9F5',
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
    fontSize: 30,
    fontWeight: '600',
  },
  introCopy: {
    color: '#6E665F',
    fontSize: 14,
    lineHeight: 22,
  },
  trailList: {
    gap: 16,
  },
  trailCard: {
    borderRadius: 28,
    backgroundColor: '#FBF9F5',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(47,66,199,0.08)',
  },
  previewFrame: {
    height: 240,
    position: 'relative',
    backgroundColor: '#E8E3DB',
  },
  gallerySlide: {
    width: '100%',
    height: 240,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'rgba(19, 20, 35, 0.14)',
  },
  previewTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  previewBadge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  previewBadgeText: {
    color: '#2F42C7',
    fontSize: 12,
    fontWeight: '700',
  },
  previewCountBadge: {
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.24)',
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  previewCountText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  previewBottomCopy: {
    gap: 4,
  },
  previewArea: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.22)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  previewCaption: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: 13,
    fontWeight: '500',
  },
  photoDotRow: {
    position: 'absolute',
    left: 16,
    bottom: 16,
    flexDirection: 'row',
    gap: 6,
  },
  photoDot: {
    width: 7,
    height: 7,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  photoDotActive: {
    width: 18,
    backgroundColor: '#FFFFFF',
  },
  trailBody: {
    paddingHorizontal: 18,
    paddingVertical: 18,
    gap: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  trailTitle: {
    flex: 1,
    color: '#1B140F',
    fontSize: 22,
    fontWeight: '600',
  },
  inlineOpenButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#2F42C7',
  },
  inlineOpenButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  trailCopy: {
    color: '#6E665F',
    fontSize: 14,
    lineHeight: 21,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metaPill: {
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  metaPillText: {
    color: '#756C65',
    fontSize: 12,
    fontWeight: '700',
  },
});
