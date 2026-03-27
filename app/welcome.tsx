import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SEQUENCE = [
  {
    id: 'welcome',
    title: 'Welcome to Fitraq',
    subtitle: 'A calmer way to track movement, meals, and progress.',
  },
  {
    id: 'purpose',
    title: 'We shape the app around you',
    subtitle: 'Your goals, routine, and pace will guide what comes next.',
  },
  {
    id: 'handoff',
    title: 'Let’s get into onboarding',
    subtitle: 'A few quick questions will help us personalize your journey.',
  },
] as const;

export default function WelcomeScreen() {
  const [stepIndex, setStepIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const liftAnim = useRef(new Animated.Value(18)).current;
  const glowAnim = useRef(new Animated.Value(0.94)).current;
  const timeoutsRef = useRef<number[]>([]);

  const playStep = useCallback((index: number) => {
    setStepIndex(index);
    fadeAnim.setValue(0);
    liftAnim.setValue(18);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(liftAnim, {
        toValue: 0,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    const holdTimeout = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 320,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(liftAnim, {
          toValue: -12,
          duration: 320,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (index < SEQUENCE.length - 1) {
          playStep(index + 1);
          return;
        }

        router.replace('/onboarding');
      });
    }, index === SEQUENCE.length - 1 ? 1600 : 1800);

    timeoutsRef.current.push(holdTimeout as unknown as number);
  }, [fadeAnim, liftAnim]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1.05,
          duration: 2200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.94,
          duration: 2200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    ).start();

    playStep(0);

    return () => {
      timeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
      timeoutsRef.current = [];
    };
  }, [glowAnim, playStep]);

  const step = SEQUENCE[stepIndex];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.background}>
        <Animated.View
          style={[
            styles.glowPrimary,
            {
              transform: [{ scale: glowAnim }],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.glowSecondary,
            {
              transform: [{ scale: glowAnim }],
            },
          ]}
        />
      </View>

      <View style={styles.container}>
        <View style={styles.topBar}>
          <View style={styles.dotRow}>
            {SEQUENCE.map((item, index) => (
              <View
                key={item.id}
                style={[styles.dot, index === stepIndex ? styles.dotActive : undefined]}
              />
            ))}
          </View>

          <Pressable onPress={() => router.replace('/onboarding')} style={styles.skipButton}>
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        </View>

        <Animated.View
          style={[
            styles.heroBlock,
            {
              opacity: fadeAnim,
              transform: [{ translateY: liftAnim }],
            },
          ]}
        >
          <View style={styles.orbStack}>
            <View style={styles.orbOuter} />
            <View style={styles.orbInner} />
          </View>

          <Text style={styles.title}>{step.title}</Text>
          <Text style={styles.subtitle}>{step.subtitle}</Text>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F2EEE8',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#F2EEE8',
  },
  glowPrimary: {
    position: 'absolute',
    top: 120,
    left: 26,
    right: 26,
    height: 280,
    borderRadius: 52,
    backgroundColor: '#E7ECFF',
  },
  glowSecondary: {
    position: 'absolute',
    top: 190,
    left: 86,
    right: 86,
    height: 170,
    borderRadius: 44,
    backgroundColor: '#FFFFFF',
    opacity: 0.7,
  },
  container: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 18,
    paddingBottom: 28,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dotRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: '#D7D1C9',
  },
  dotActive: {
    width: 22,
    backgroundColor: '#2F42C7',
  },
  skipButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  skipText: {
    color: '#8D857E',
    fontSize: 13,
    fontWeight: '700',
  },
  heroBlock: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
  },
  orbStack: {
    width: 110,
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  orbOuter: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 999,
    backgroundColor: 'rgba(47,66,199,0.12)',
  },
  orbInner: {
    width: 54,
    height: 54,
    borderRadius: 999,
    backgroundColor: '#2F42C7',
    shadowColor: '#2F42C7',
    shadowOpacity: 0.16,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  title: {
    color: '#1B140F',
    fontSize: 36,
    lineHeight: 40,
    fontWeight: '700',
    textAlign: 'center',
    maxWidth: 300,
  },
  subtitle: {
    color: '#6F665F',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    maxWidth: 292,
  },
});
