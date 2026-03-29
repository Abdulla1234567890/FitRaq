import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SLIDES = [
  {
    id: 'intro',
    theme: 'dark',
    title: 'Your fitness journey\nstarts here',
    subtitle: 'Turn every walk, run, and ride into an adventure worth remembering.',
  },
  {
    id: 'routes',
    theme: 'light',
    title: 'Track every path\nyou take',
    subtitle: 'Log your runs, walks, hikes, and cycles. Every route saved to your logbook.',
  },
  {
    id: 'xp',
    theme: 'light',
    title: 'Earn XP,\nunlock badges',
    subtitle: 'Every km earns points. Level up, collect badges, and build your streak.',
  },
  {
    id: 'ready',
    theme: 'night',
    title: "You're all set,\nlet's go!",
    subtitle: 'Pick your first path and start earning XP today.',
  },
] as const;

export default function WelcomeScreen() {
  const [stepIndex, setStepIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const liftAnim = useRef(new Animated.Value(26)).current;
  const xpFillAnim = useRef(new Animated.Value(0)).current;
  const xpCountAnim = useRef(new Animated.Value(0)).current;
  const timeoutRef = useRef<number | null>(null);

  const activeSlide = SLIDES[stepIndex];

  useEffect(() => {
    const listener = xpCountAnim.addListener(({ value }) => {
      xpCountRef.current = Math.round(value);
    });

    return () => {
      xpCountAnim.removeListener(listener);
    };
  }, [xpCountAnim]);

  const xpCountRef = useRef(0);
  const [xpCount, setXpCount] = useState(0);

  useEffect(() => {
    const listener = xpCountAnim.addListener(({ value }) => {
      setXpCount(Math.round(value));
    });

    return () => {
      xpCountAnim.removeListener(listener);
    };
  }, [xpCountAnim]);

  useEffect(() => {
    fadeAnim.setValue(0);
    liftAnim.setValue(22);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 650,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(liftAnim, {
        toValue: 0,
        duration: 650,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    if (activeSlide.id === 'xp') {
      xpFillAnim.setValue(0);
      xpCountAnim.setValue(0);
      Animated.parallel([
        Animated.timing(xpFillAnim, {
          toValue: 0.62,
          duration: 1300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
        Animated.timing(xpCountAnim, {
          toValue: 620,
          duration: 1300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
      ]).start();
    }

    timeoutRef.current = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 420,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(liftAnim, {
          toValue: -16,
          duration: 420,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (!finished) {
          return;
        }

        if (stepIndex < SLIDES.length - 1) {
          setStepIndex((current) => current + 1);
        } else {
          router.replace('/onboarding');
        }
      });
    }, stepIndex === SLIDES.length - 1 ? 2800 : 2500) as unknown as number;

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [activeSlide.id, fadeAnim, liftAnim, stepIndex, xpCountAnim, xpFillAnim]);

  const xpWidth = xpFillAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const isDark = activeSlide.theme === 'dark' || activeSlide.theme === 'night';

  const slideStyle = useMemo(
    () => [
      styles.slide,
      activeSlide.theme === 'dark'
        ? styles.slideDark
        : activeSlide.theme === 'night'
          ? styles.slideNight
          : styles.slideLight,
      {
        opacity: fadeAnim,
        transform: [{ translateY: liftAnim }],
      },
    ],
    [activeSlide.theme, fadeAnim, liftAnim]
  );

  return (
    <SafeAreaView style={[styles.safeArea, isDark ? styles.safeAreaDark : styles.safeAreaLight]}>
      <View style={[styles.screen, isDark ? styles.screenDark : styles.screenLight]}>
        <View style={styles.topBar}>
          <View style={styles.dotRow}>
            {SLIDES.map((slide, index) => {
              const active = index === stepIndex;
              const darkDot = activeSlide.theme === 'light';
              return (
                <View
                  key={slide.id}
                  style={[
                    styles.dot,
                    darkDot ? styles.dotLightTrack : styles.dotDarkTrack,
                    active ? (darkDot ? styles.dotLightActive : styles.dotDarkActive) : undefined,
                  ]}
                />
              );
            })}
          </View>

          <Pressable onPress={() => router.replace('/onboarding')} style={styles.skipButton}>
            <Text style={[styles.skipText, isDark ? styles.skipTextDark : styles.skipTextLight]}>Skip</Text>
          </Pressable>
        </View>

        <Animated.View style={slideStyle}>
          {activeSlide.id === 'intro' ? (
            <>
              <View style={styles.logoLockup}>
                <View style={styles.logoBox}>
                  <Image contentFit="contain" source={require('@/assets/images/FITRAQ2.png')} style={styles.logoImage} />
                </View>
                <Text style={styles.brandTitle}>FitRaq</Text>
                <Text style={styles.brandTagline}>Move. Explore. Level up.</Text>
              </View>

              <Text style={styles.darkTitle}>{activeSlide.title}</Text>
              <Text style={styles.darkSubtitle}>{activeSlide.subtitle}</Text>
            </>
          ) : null}

          {activeSlide.id === 'routes' ? (
            <>
              <View style={styles.demoCard}>
                <View style={styles.mapDemo}>
                  <View style={styles.mapGridHorizontalTop} />
                  <View style={styles.mapGridHorizontalBottom} />
                  <View style={styles.mapGridVerticalLeft} />
                  <View style={styles.mapGridVerticalRight} />
                  <View style={styles.mapRoutePath} />
                  <View style={styles.mapRouteLine} />
                  <View style={styles.mapDotStart} />
                  <View style={styles.mapDotEnd} />
                  <View style={styles.mapLabel}>
                    <Text style={styles.mapLabelText}>Dubai Marina</Text>
                  </View>
                </View>

                <View style={styles.statRow}>
                  <StatPill label="km" value="7.1" />
                  <StatPill label="steps" value="6,625" />
                  <StatPill label="temp" value="38°" />
                </View>
              </View>

              <Text style={styles.lightTitle}>{activeSlide.title}</Text>
              <Text style={styles.lightSubtitle}>{activeSlide.subtitle}</Text>
            </>
          ) : null}

          {activeSlide.id === 'xp' ? (
            <>
              <View style={styles.demoCard}>
                <View style={styles.xpTopRow}>
                  <View>
                    <Text style={styles.xpEyebrow}>Your level</Text>
                    <Text style={styles.xpRole}>Level 1 · Explorer</Text>
                  </View>

                  <View style={styles.xpCounterCard}>
                    <Text style={styles.xpCounterValue}>{xpCount}</Text>
                    <Text style={styles.xpCounterLabel}>XP</Text>
                  </View>
                </View>

                <View style={styles.xpBarTrack}>
                  <Animated.View style={[styles.xpBarFill, { width: xpWidth }]} />
                </View>

                <View style={styles.xpMetaRow}>
                  <Text style={styles.xpMeta}>Lv 1</Text>
                  <Text style={styles.xpMetaAccent}>Move to earn XP</Text>
                  <Text style={styles.xpMeta}>Lv 2</Text>
                </View>

                <View style={styles.badgeRow}>
                  <Badge emoji="🏃" label="First Run" earned />
                  <Badge emoji="🌅" label="Early Bird" earned />
                  <Badge emoji="🔥" label="7-Day Streak" />
                  <Badge emoji="🏆" label="Trailblazer" />
                </View>
              </View>

              <Text style={styles.lightTitle}>{activeSlide.title}</Text>
              <Text style={styles.lightSubtitle}>{activeSlide.subtitle}</Text>
            </>
          ) : null}

          {activeSlide.id === 'ready' ? (
            <>
              <View style={styles.readyIcon}>
                <MaterialIcons color="#FFD34D" name="directions-run" size={38} />
              </View>
              <Text style={styles.darkTitle}>{activeSlide.title}</Text>
              <Text style={styles.darkSubtitle}>{activeSlide.subtitle}</Text>

              <View style={styles.readyButton}>
                <Text style={styles.readyButtonText}>Starting onboarding…</Text>
              </View>
            </>
          ) : null}
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

function StatPill({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.statPill}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function Badge({ emoji, label, earned = false }: { emoji: string; label: string; earned?: boolean }) {
  return (
    <View style={[styles.badge, earned ? styles.badgeEarned : styles.badgeLocked]}>
      <Text style={[styles.badgeEmoji, earned ? undefined : styles.badgeEmojiLocked]}>{emoji}</Text>
      <Text style={[styles.badgeLabel, earned ? styles.badgeLabelEarned : styles.badgeLabelLocked]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  safeAreaLight: {
    backgroundColor: '#F5F2EC',
  },
  safeAreaDark: {
    backgroundColor: '#F5F2EC',
  },
  screen: {
    flex: 1,
    overflow: 'hidden',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 18,
  },
  screenLight: {
    backgroundColor: '#F5F2EC',
  },
  screenDark: {
    backgroundColor: '#F5F2EC',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 2,
  },
  dotRow: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    height: 6,
    borderRadius: 999,
  },
  dotDarkTrack: {
    width: 6,
    backgroundColor: 'rgba(0,0,0,0.12)',
  },
  dotDarkActive: {
    width: 20,
    backgroundColor: '#2F42C7',
  },
  dotLightTrack: {
    width: 6,
    backgroundColor: 'rgba(0,0,0,0.12)',
  },
  dotLightActive: {
    width: 20,
    backgroundColor: '#2F42C7',
  },
  skipButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  skipText: {
    fontSize: 13,
    fontWeight: '700',
  },
  skipTextLight: {
    color: '#8D857E',
  },
  skipTextDark: {
    color: '#8D857E',
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 32,
  },
  slideDark: {
    gap: 22,
  },
  slideLight: {
    gap: 20,
  },
  slideNight: {
    gap: 24,
  },
  logoLockup: {
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  logoBox: {
    width: 76,
    height: 76,
    borderRadius: 22,
    backgroundColor: '#F7F9FF',
    borderWidth: 1,
    borderColor: '#D9E2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 58,
    height: 58,
  },
  brandTitle: {
    color: '#2F42C7',
    fontSize: 34,
    fontWeight: '800',
  },
  brandTagline: {
    color: '#8A837C',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2.2,
    textTransform: 'uppercase',
  },
  darkTitle: {
    color: '#1B140F',
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '800',
    textAlign: 'center',
    maxWidth: 290,
  },
  darkSubtitle: {
    color: '#6F675F',
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    maxWidth: 292,
  },
  lightTitle: {
    color: '#1A1A2E',
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    textAlign: 'center',
  },
  lightSubtitle: {
    color: '#7F7770',
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    maxWidth: 294,
  },
  demoCard: {
    width: '100%',
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    padding: 18,
    gap: 14,
  },
  mapDemo: {
    height: 140,
    borderRadius: 16,
    backgroundColor: '#1A1A2E',
    overflow: 'hidden',
  },
  mapGridHorizontalTop: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '33%',
    height: 1,
    backgroundColor: 'rgba(47,42,181,0.12)',
  },
  mapGridHorizontalBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '66%',
    height: 1,
    backgroundColor: 'rgba(47,42,181,0.12)',
  },
  mapGridVerticalLeft: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '33%',
    width: 1,
    backgroundColor: 'rgba(47,42,181,0.12)',
  },
  mapGridVerticalRight: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '66%',
    width: 1,
    backgroundColor: 'rgba(47,42,181,0.12)',
  },
  mapRoutePath: {
    position: 'absolute',
    top: '20%',
    left: '15%',
    width: '70%',
    height: '55%',
    borderRadius: 40,
    borderWidth: 2,
    borderBottomWidth: 0,
    borderColor: 'rgba(47,66,199,0.4)',
  },
  mapRouteLine: {
    position: 'absolute',
    top: '50%',
    left: '14%',
    width: '72%',
    height: 2,
    backgroundColor: '#2F42C7',
  },
  mapDotStart: {
    position: 'absolute',
    top: '47%',
    left: '12%',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFD34D',
  },
  mapDotEnd: {
    position: 'absolute',
    top: '47%',
    right: '12%',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF7A45',
  },
  mapLabel: {
    position: 'absolute',
    left: 10,
    bottom: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(47,66,199,0.92)',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  mapLabelText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  statRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statPill: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: '#F5F2EC',
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  statValue: {
    color: '#1A1A2E',
    fontSize: 16,
    fontWeight: '800',
  },
  statLabel: {
    color: '#AAA39A',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  xpTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  xpEyebrow: {
    color: '#AAA39A',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  xpRole: {
    color: '#1A1A2E',
    fontSize: 18,
    fontWeight: '800',
  },
  xpCounterCard: {
    borderRadius: 12,
    backgroundColor: '#EEEDFE',
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  xpCounterValue: {
    color: '#2F42C7',
    fontSize: 17,
    fontWeight: '800',
  },
  xpCounterLabel: {
    color: '#8884CC',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  xpBarTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: '#EEEEEE',
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#2F42C7',
  },
  xpMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  xpMeta: {
    color: '#AAA39A',
    fontSize: 11,
    fontWeight: '600',
  },
  xpMetaAccent: {
    color: '#2F42C7',
    fontSize: 11,
    fontWeight: '700',
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  badge: {
    width: 58,
    height: 58,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 3,
  },
  badgeEarned: {
    backgroundColor: '#EEEDFE',
  },
  badgeLocked: {
    backgroundColor: '#F0EDE6',
  },
  badgeEmoji: {
    fontSize: 18,
  },
  badgeEmojiLocked: {
    opacity: 0.35,
  },
  badgeLabel: {
    fontSize: 8,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 10,
  },
  badgeLabelEarned: {
    color: '#2F42C7',
  },
  badgeLabelLocked: {
    color: '#C0BAB2',
  },
  readyIcon: {
    width: 84,
    height: 84,
    borderRadius: 28,
    backgroundColor: '#2F42C7',
    borderWidth: 2,
    borderColor: '#C9D6FF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2F42C7',
    shadowOpacity: 0.16,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  readyButton: {
    width: '100%',
    borderRadius: 18,
    backgroundColor: '#2F42C7',
    paddingVertical: 17,
    alignItems: 'center',
    marginTop: 2,
  },
  readyButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
