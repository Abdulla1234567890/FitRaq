import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type QuestionPage = {
  id: string;
  title: string;
  options: string[];
};

const QUESTION_PAGES: QuestionPage[] = [
  {
    id: 'movement',
    title: 'How do you prefer\nto move?',
    options: ['High-Intensity Bursts', 'Steady Endurance', 'Mindful Recovery'],
  },
  {
    id: 'terrain',
    title: 'What’s your\nprimary terrain?',
    options: ['Urban Streets', 'Nature Trails', 'Gym or Studio', 'Home'],
  },
  {
    id: 'elements',
    title: 'How do you handle\nthe elements?',
    options: ['I love the heat', 'I prefer the shade', 'I’m an indoor explorer'],
  },
  {
    id: 'goal',
    title: 'What is your\n"North Star"\nfor this journey?',
    options: ['Building Strength', 'Increasing Stamina', 'Better Sleep', 'Daily Consistency'],
  },
  {
    id: 'frequency',
    title: 'How many days a\nweek are you\nhitting the trail?',
    options: ['1-2 (Exploring)', '3-4 (Active)', '5+ (Trailblazer)'],
  },
  {
    id: 'level',
    title: 'What’s your current\n"Basics" level?',
    options: ['Just starting out', 'Consistent mover', 'Seasoned active'],
  },
];

export default function OnboardingScreen() {
  const { width } = useWindowDimensions();
  const cardWidth = Math.max(width - 56, 280);
  const listRef = useRef<FlatList<QuestionPage>>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const vibrateSelection = async () => {
    await Haptics.selectionAsync();
  };

  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const nextPage = Math.round(event.nativeEvent.contentOffset.x / cardWidth);
    setCurrentPage(nextPage);
  };

  const goToPage = async (page: number) => {
    if (page < 0 || page >= QUESTION_PAGES.length) {
      return;
    }

    await vibrateSelection();
    listRef.current?.scrollToIndex({ index: page, animated: true });
    setCurrentPage(page);
  };

  const finishOnboarding = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace('/(tabs)');
  };

  const handleSelect = async (pageId: string, option: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAnswers((current) => ({ ...current, [pageId]: option }));

    if (currentPage < QUESTION_PAGES.length - 1) {
      listRef.current?.scrollToIndex({ index: currentPage + 1, animated: true });
      setCurrentPage(currentPage + 1);
      return;
    }

    await finishOnboarding();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.frame}>
        <View style={styles.topBar}>
          <Text style={styles.progressText}>
            {currentPage + 1}/{QUESTION_PAGES.length}
          </Text>
          <Pressable
            onPress={finishOnboarding}
            style={styles.skipButton}
          >
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        </View>

        <FlatList
          ref={listRef}
          data={QUESTION_PAGES}
          horizontal
          keyExtractor={(item) => item.id}
          onMomentumScrollEnd={handleScrollEnd}
          pagingEnabled
          renderItem={({ item }) => (
            <View style={[styles.page, { width: cardWidth }]}>
              <Text style={styles.title}>{item.title}</Text>

              <View style={styles.optionList}>
                {item.options.map((option) => {
                  const isSelected = answers[item.id] === option;

                  return (
                    <Pressable
                      key={option}
                      onPress={() => handleSelect(item.id, option)}
                      style={[styles.optionButton, isSelected ? styles.optionButtonSelected : undefined]}
                    >
                      <MaterialCommunityIcons
                        color="#FFFFFF"
                        name="star-four-points-circle-outline"
                        size={16}
                      />
                      <Text style={styles.optionText}>{option}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}
          showsHorizontalScrollIndicator={false}
        />

        <View style={styles.footer}>
          <View style={styles.dotRow}>
            {QUESTION_PAGES.map((page, index) => {
              const isActive = index === currentPage;

              return (
                <Pressable
                  key={page.id}
                  onPress={() => goToPage(index)}
                  style={[styles.dot, isActive ? styles.dotActive : undefined]}
                />
              );
            })}
          </View>

          <View style={styles.footerActions}>
            <Pressable
              disabled={currentPage === 0}
              onPress={() => goToPage(currentPage - 1)}
              style={[styles.navButton, currentPage === 0 ? styles.navButtonDisabled : undefined]}
            >
              <Text style={styles.navButtonText}>Back</Text>
            </Pressable>

            <Pressable
              onPress={() =>
                currentPage === QUESTION_PAGES.length - 1
                  ? finishOnboarding()
                  : goToPage(currentPage + 1)
              }
              style={styles.navButton}
            >
              <Text style={styles.navButtonText}>
                {currentPage === QUESTION_PAGES.length - 1 ? 'Finish' : 'Next'}
              </Text>
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
    backgroundColor: '#F4EFE8',
  },
  frame: {
    flex: 1,
    backgroundColor: '#F4EFE8',
    paddingHorizontal: 28,
    paddingTop: 8,
    paddingBottom: 24,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressText: {
    color: '#9B928A',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  skipButton: {
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
  page: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 24,
  },
  title: {
    color: '#1B140F',
    fontSize: 28,
    lineHeight: 37,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 42,
    maxWidth: 260,
  },
  optionList: {
    width: '100%',
    alignItems: 'center',
    gap: 24,
    minHeight: 320,
    justifyContent: 'center',
  },
  optionButton: {
    minWidth: 148,
    maxWidth: 232,
    borderRadius: 999,
    backgroundColor: '#2F42C7',
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#2F42C7',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  optionButtonSelected: {
    backgroundColor: '#2236A9',
  },
  optionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    flexShrink: 1,
  },
  footer: {
    alignItems: 'center',
    gap: 20,
  },
  dotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
    justifyContent: 'center',
    minHeight: 16,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: '#D0D0D0',
  },
  dotActive: {
    width: 22,
    backgroundColor: '#2F42C7',
  },
  footerActions: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: '#2F42C7',
    paddingVertical: 14,
  },
  navButtonDisabled: {
    backgroundColor: '#CBD2F8',
  },
  navButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
