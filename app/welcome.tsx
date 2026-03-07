import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.background}>
        <View style={styles.topFade} />
      </View>

      <View style={styles.container}>
        <View style={styles.illustrationCard}>
          <View style={styles.pathLine} />
          <View style={styles.pathLineSecondary} />
          <View style={styles.pathNodeTop} />
          <View style={styles.pathNodeBottom} />
          <View style={styles.runnerShadow} />
          <View style={styles.runnerWrap}>
            <Text style={styles.runnerEmoji}>🏃</Text>
          </View>
          <View style={styles.statBadge}>
            <Text style={styles.statText}>50</Text>
          </View>
        </View>

        <View style={styles.progressTrack}>
          <View style={styles.progressFill} />
        </View>

        <Text style={styles.title}>Help us map your journey!</Text>

        <Pressable onPress={() => router.push('/onboarding')} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>→</Text>
        </Pressable>

        <Pressable onPress={() => router.replace('/(tabs)')} style={styles.skipButton}>
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
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
  topFade: {
    position: 'absolute',
    top: -100,
    left: 40,
    right: 40,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#FFFFFF',
    opacity: 0.4,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 20,
  },
  illustrationCard: {
    width: 230,
    height: 260,
    borderRadius: 28,
    backgroundColor: '#F5F1EB',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  pathLine: {
    position: 'absolute',
    top: 86,
    left: 28,
    width: 148,
    height: 2,
    backgroundColor: '#BBC3CB',
    transform: [{ rotate: '-20deg' }],
  },
  pathLineSecondary: {
    position: 'absolute',
    top: 120,
    left: 78,
    width: 102,
    height: 2,
    backgroundColor: '#BBC3CB',
    transform: [{ rotate: '-14deg' }],
  },
  pathNodeTop: {
    position: 'absolute',
    top: 78,
    right: 30,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#223047',
    borderWidth: 3,
    borderColor: '#E2E6EA',
  },
  pathNodeBottom: {
    position: 'absolute',
    top: 116,
    left: 36,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#223047',
    borderWidth: 3,
    borderColor: '#E2E6EA',
  },
  runnerWrap: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8A5CF6',
    transform: [{ rotate: '-6deg' }],
  },
  runnerShadow: {
    position: 'absolute',
    bottom: 46,
    width: 92,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(34, 48, 71, 0.08)',
  },
  runnerEmoji: {
    fontSize: 42,
  },
  statBadge: {
    position: 'absolute',
    right: 18,
    top: 108,
    borderRadius: 10,
    backgroundColor: '#314150',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  statText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  progressTrack: {
    width: 136,
    height: 10,
    borderRadius: 999,
    backgroundColor: '#D8D8D8',
    overflow: 'hidden',
    marginTop: 10,
  },
  progressFill: {
    width: '30%',
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#2E43C8',
  },
  title: {
    color: '#1B140F',
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '500',
    textAlign: 'center',
    maxWidth: 250,
  },
  primaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  primaryButtonText: {
    color: '#2E43C8',
    fontSize: 34,
    lineHeight: 34,
    marginTop: -4,
  },
  skipButton: {
    marginTop: 'auto',
    alignSelf: 'flex-end',
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  skipText: {
    color: '#B7B3C2',
    fontSize: 12,
    fontWeight: '700',
  },
});
