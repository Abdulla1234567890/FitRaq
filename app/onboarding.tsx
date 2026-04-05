import * as Haptics from 'expo-haptics';
import { fetchActivityPlan, generateActivityPlan, submitOnboarding } from '@/lib/backend';
import { setCurrentActivityPlan, setCurrentOnboardingAnswers, setCurrentUserProfile } from '@/lib/user-session';
import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type ProfileState = {
  age: string;
  gender: string;
  height: string;
  name: string;
  weight: string;
};

type ProfilePage = {
  id: 'profile';
  kind: 'profile';
  subtitle: string;
  title: string;
};

type OptionPage = {
  id: string;
  kind: 'options';
  options: string[];
  subtitle: string;
  title: string;
};

type OnboardingPage = ProfilePage | OptionPage;

const CORE_PAGES: OnboardingPage[] = [
  {
    id: 'profile',
    kind: 'profile',
    title: 'About you',
    subtitle: 'A few basics to shape the plan.',
  },
  {
    id: 'goal',
    kind: 'options',
    title: 'Main goal',
    subtitle: 'What do you want most right now?',
    options: ['Lose weight', 'Build fitness', 'Boost endurance', 'Move more'],
  },
  {
    id: 'days',
    kind: 'options',
    title: 'Days per week',
    subtitle: 'How often can you realistically train?',
    options: ['1-2 days', '3-4 days', '5+ days'],
  },
  {
    id: 'movement',
    kind: 'options',
    title: 'Preferred movement',
    subtitle: 'Pick the style that feels most natural.',
    options: ['Walking', 'Running', 'Cycling', 'Hiking', 'Mix it up'],
  },
  {
    id: 'level',
    kind: 'options',
    title: 'Current level',
    subtitle: 'Where are you starting from?',
    options: ['Just starting', 'Getting going', 'Consistent', 'Already active'],
  },
  {
    id: 'challenge',
    kind: 'options',
    title: 'Biggest challenge',
    subtitle: 'What usually gets in the way?',
    options: ['Staying consistent', 'Eating better', 'Finding time', 'Knowing what to do'],
  },
];

const GOAL_BRANCHES: Record<string, OptionPage[]> = {
  'Lose weight': [
    {
      id: 'weight_style',
      kind: 'options',
      title: 'Fat-loss style',
      subtitle: 'What feels sustainable?',
      options: ['Gentle start', 'Balanced pace', 'More structured'],
    },
    {
      id: 'nutrition_support',
      kind: 'options',
      title: 'Nutrition support',
      subtitle: 'What would help most?',
      options: ['Portion guidance', 'Meal logging', 'Snack control', 'Protein focus'],
    },
  ],
  'Build fitness': [
    {
      id: 'fitness_style',
      kind: 'options',
      title: 'Training style',
      subtitle: 'How do you like to train?',
      options: ['Short daily', 'Mixed sessions', 'Structured plan'],
    },
    {
      id: 'energy_focus',
      kind: 'options',
      title: 'What matters most?',
      subtitle: 'Pick one main outcome.',
      options: ['More energy', 'Better strength', 'Better routine', 'General fitness'],
    },
  ],
  'Boost endurance': [
    {
      id: 'endurance_focus',
      kind: 'options',
      title: 'Endurance focus',
      subtitle: 'What do you want to improve?',
      options: ['Go longer', 'Go faster', 'Train more often'],
    },
    {
      id: 'session_preference',
      kind: 'options',
      title: 'Session style',
      subtitle: 'What sounds best?',
      options: ['Steady sessions', 'Intervals', 'Weekend long effort'],
    },
  ],
  'Move more': [
    {
      id: 'routine_anchor',
      kind: 'options',
      title: 'Best routine slot',
      subtitle: 'When is movement easiest?',
      options: ['Morning', 'Afternoon', 'Evening', 'Flexible'],
    },
    {
      id: 'motivation_style',
      kind: 'options',
      title: 'Best motivator',
      subtitle: 'What helps you keep going?',
      options: ['Simple goals', 'Daily streaks', 'Light coaching', 'Visible progress'],
    },
  ],
};

const GENDER_OPTIONS = ['Male', 'Female', 'Prefer not to say'];

export default function OnboardingScreen() {
  const { width } = useWindowDimensions();
  const cardWidth = Math.max(width - 48, 296);
  const listRef = useRef<FlatList<OnboardingPage>>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [profile, setProfile] = useState<ProfileState>({
    age: '',
    gender: '',
    height: '',
    name: '',
    weight: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [showGenderDropdown, setShowGenderDropdown] = useState(false);

  const pages = useMemo(() => {
    const goal = answers.goal;
    const goalPages = goal ? GOAL_BRANCHES[goal] ?? [] : [];
    return [...CORE_PAGES, ...goalPages];
  }, [answers.goal]);

  useEffect(() => {
    if (currentPage > pages.length - 1) {
      setCurrentPage(pages.length - 1);
      listRef.current?.scrollToIndex({ index: pages.length - 1, animated: false });
    }
  }, [currentPage, pages.length]);

  const vibrateSelection = async () => {
    await Haptics.selectionAsync();
  };

  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const nextPage = Math.round(event.nativeEvent.contentOffset.x / cardWidth);
    setCurrentPage(nextPage);
  };

  const goToPage = async (page: number) => {
    if (page < 0 || page >= pages.length) {
      return;
    }

    await vibrateSelection();
    listRef.current?.scrollToIndex({ index: page, animated: true });
    setCurrentPage(page);
  };

  const finishOnboarding = async () => {
    const payload = buildOnboardingPayload(profile, answers);

    try {
      setIsSubmitting(true);
      setSubmitMessage('Saving your setup...');

      const response = await submitOnboarding(payload);
      const returnedUserId = response?.user_id ?? response?.user?.id ?? response?.id ?? null;
      const resolvedUserId = returnedUserId || payload.user.name || null;

      setCurrentUserProfile({
        userId: resolvedUserId,
        name: payload.user.name,
        age: payload.user.age,
        weightKg: payload.user.weight_kg,
        heightCm: payload.user.height_cm,
        gender: payload.user.gender,
      });
      setCurrentOnboardingAnswers({
        goal: payload.onboarding.goal ?? undefined,
        days: payload.onboarding.days ?? undefined,
        movement: payload.onboarding.movement ?? undefined,
        level: payload.onboarding.level ?? undefined,
        challenge: payload.onboarding.challenge ?? undefined,
        goalBranch: payload.goal_branch,
      });

      setSubmitMessage('Building your plan...');

      try {
        const planResponse = await generateActivityPlan(payload);
        const returnedPlan = planResponse?.plan ?? planResponse?.result ?? null;
        setCurrentActivityPlan(returnedPlan);
      } catch {
        setCurrentActivityPlan(null);
      }

      const planFetchKeys = [resolvedUserId, payload.user.name].filter(Boolean) as string[];
      for (const key of Array.from(new Set(planFetchKeys))) {
        try {
          const storedPlan = await fetchActivityPlan(key);
          const storedReturned = storedPlan?.plan ?? storedPlan?.result ?? null;
          if (storedReturned) {
            setCurrentActivityPlan(storedReturned);
            break;
          }
        } catch {
          // try next key
        }
      }

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSubmitMessage('');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Could not save onboarding right now.';

      setSubmitMessage(message);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    } finally {
      setIsSubmitting(false);
    }

    router.replace({
      pathname: '/(tabs)',
      params: {
        name: profile.name || 'Janna',
      },
    });
  };

  const bypassBackendAndContinue = async () => {
    const payload = buildOnboardingPayload(profile, answers);

    setCurrentUserProfile({
      userId: null,
      name: payload.user.name,
      age: payload.user.age,
      weightKg: payload.user.weight_kg,
      heightCm: payload.user.height_cm,
      gender: payload.user.gender,
    });
    setCurrentOnboardingAnswers({
      goal: payload.onboarding.goal ?? undefined,
      days: payload.onboarding.days ?? undefined,
      movement: payload.onboarding.movement ?? undefined,
      level: payload.onboarding.level ?? undefined,
      challenge: payload.onboarding.challenge ?? undefined,
      goalBranch: payload.goal_branch,
    });
    setSubmitMessage('Backend bypassed. Using local app state for now.');
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

    router.replace({
      pathname: '/(tabs)',
      params: {
        name: profile.name || 'Janna',
      },
    });
  };

  const handleSelect = async (pageId: string, option: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAnswers((current) => ({ ...current, [pageId]: option }));

    const nextPages = [...CORE_PAGES, ...(pageId === 'goal' ? GOAL_BRANCHES[option] ?? [] : GOAL_BRANCHES[answers.goal] ?? [])];
    const nextIndex = Math.min(currentPage + 1, nextPages.length - 1);

    if (currentPage < nextPages.length - 1) {
      listRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setCurrentPage(nextIndex);
      return;
    }

    await finishOnboarding();
  };

  const updateProfile = (key: keyof ProfileState, value: string) => {
    setProfile((current) => ({ ...current, [key]: value }));
  };

  const renderProfilePage = () => (
    <View style={styles.profileCard}>
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Name</Text>
        <TextInput
          onChangeText={(value) => updateProfile('name', value)}
          placeholder="What should we call you?"
          placeholderTextColor="#A59E97"
          style={styles.input}
          value={profile.name}
        />
      </View>

      <View style={styles.doubleFieldRow}>
        <View style={styles.halfField}>
          <Text style={styles.fieldLabel}>Age</Text>
          <TextInput
            keyboardType="number-pad"
            onChangeText={(value) => updateProfile('age', value)}
            placeholder="Years"
            placeholderTextColor="#A59E97"
            style={styles.input}
            value={profile.age}
          />
        </View>

        <View style={styles.halfField}>
          <Text style={styles.fieldLabel}>Weight</Text>
          <TextInput
            keyboardType="decimal-pad"
            onChangeText={(value) => updateProfile('weight', value)}
            placeholder="kg"
            placeholderTextColor="#A59E97"
            style={styles.input}
            value={profile.weight}
          />
        </View>
      </View>

      <View style={styles.doubleFieldRow}>
        <View style={styles.halfField}>
          <Text style={styles.fieldLabel}>Height</Text>
          <TextInput
            keyboardType="decimal-pad"
            onChangeText={(value) => updateProfile('height', value)}
            placeholder="cm"
            placeholderTextColor="#A59E97"
            style={styles.input}
            value={profile.height}
          />
        </View>

        <View style={styles.halfField}>
          <Text style={styles.fieldLabel}>Gender</Text>
          <Pressable onPress={() => setShowGenderDropdown(true)}>
            <View pointerEvents="none">
              <TextInput
                editable={false}
                placeholder={profile.gender || 'Select Gender'}
                placeholderTextColor={profile.gender ? '#1B140F' : '#A59E97'}
                style={styles.input}
                value={profile.gender}
              />
            </View>
          </Pressable>
        </View>
      </View>

      <Modal animationType="fade" transparent visible={showGenderDropdown}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowGenderDropdown(false)}>
          <View style={styles.dropdownMenu}>
            {GENDER_OPTIONS.map((option, index) => {
              const isLast = index === GENDER_OPTIONS.length - 1;
              return (
                <Pressable
                  key={option}
                  style={[styles.dropdownOption, isLast && { borderBottomWidth: 0 }]}
                  onPress={async () => {
                    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    updateProfile('gender', option);
                    setShowGenderDropdown(false);
                  }}
                >
                  <Text style={styles.dropdownOptionText}>{option}</Text>
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Modal>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.frame}>
        <View style={styles.topBar}>
          <View style={styles.stepPill}>
            <Text style={styles.progressText}>
              {currentPage + 1}/{pages.length}
            </Text>
          </View>

          <Pressable onPress={finishOnboarding} style={styles.skipButton}>
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        </View>

        {submitMessage ? (
          <View style={styles.submitBanner}>
            <Text style={styles.submitBannerText}>{submitMessage}</Text>
          </View>
        ) : null}

        <FlatList
          ref={listRef}
          data={pages}
          horizontal
          keyExtractor={(item) => item.id}
          onMomentumScrollEnd={handleScrollEnd}
          pagingEnabled
          renderItem={({ item }) => (
            <View style={[styles.page, { width: cardWidth }]}>
              <View style={styles.headingBlock}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.subtitle}>{item.subtitle}</Text>
              </View>

              {item.kind === 'profile' ? (
                renderProfilePage()
              ) : (
                <View style={styles.optionGrid}>
                  {item.options.map((option) => {
                    const isSelected = answers[item.id] === option;

                    return (
                      <Pressable
                        key={option}
                        onPress={() => handleSelect(item.id, option)}
                        style={[styles.choiceCard, isSelected ? styles.choiceCardSelected : undefined]}
                      >
                        <Text style={[styles.choiceTitle, isSelected ? styles.choiceTitleSelected : undefined]}>{option}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </View>
          )}
          showsHorizontalScrollIndicator={false}
        />

        <View style={styles.footer}>
          <View style={styles.dotRow}>
            {pages.map((page, index) => {
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
              style={[styles.navButtonSecondary, currentPage === 0 ? styles.navButtonSecondaryDisabled : undefined]}
            >
              <Text style={[styles.navButtonSecondaryText, currentPage === 0 ? styles.navButtonSecondaryTextDisabled : undefined]}>Back</Text>
            </Pressable>

            <Pressable
              disabled={isSubmitting}
              onPress={() => (currentPage === pages.length - 1 ? finishOnboarding() : goToPage(currentPage + 1))}
              style={[styles.navButtonPrimary, isSubmitting ? styles.navButtonPrimaryDisabled : undefined]}
            >
              <Text style={styles.navButtonPrimaryText}>
                {isSubmitting ? 'Saving...' : currentPage === pages.length - 1 ? 'Finish' : 'Next'}
              </Text>
            </Pressable>
          </View>

          {currentPage === pages.length - 1 ? (
            <Pressable onPress={bypassBackendAndContinue} style={styles.bypassButton}>
              <Text style={styles.bypassButtonText}>Continue without backend</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </SafeAreaView>
  );
}

function buildOnboardingPayload(profile: ProfileState, answers: Record<string, string>) {
  const goalBranchKeys = Object.keys(answers).filter(
    (key) => !['goal', 'days', 'movement', 'level', 'challenge'].includes(key)
  );

  return {
    user: {
      name: profile.name.trim() || 'Guest',
      age: parseOptionalNumber(profile.age),
      weight_kg: parseOptionalNumber(profile.weight),
      height_cm: parseOptionalNumber(profile.height),
      gender: profile.gender || null,
    },
    onboarding: {
      goal: answers.goal ?? null,
      days: answers.days ?? null,
      movement: answers.movement ?? null,
      level: answers.level ?? null,
      challenge: answers.challenge ?? null,
    },
    goal_branch: goalBranchKeys.reduce<Record<string, string>>((result, key) => {
      if (answers[key]) {
        result[key] = answers[key];
      }

      return result;
    }, {}),
  };
}

function parseOptionalNumber(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4EFE8',
  },
  frame: {
    flex: 1,
    backgroundColor: '#F4EFE8',
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 24,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  submitBanner: {
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
  },
  submitBannerText: {
    color: '#6A625B',
    fontSize: 13,
    lineHeight: 18,
  },
  stepPill: {
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  progressText: {
    color: '#8D847C',
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
    color: '#A59E97',
    fontSize: 12,
    fontWeight: '700',
  },
  page: {
    flex: 1,
    paddingBottom: 20,
  },
  headingBlock: {
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    marginBottom: 24,
  },
  title: {
    color: '#1B140F',
    fontSize: 30,
    lineHeight: 34,
    fontWeight: '600',
    textAlign: 'center',
  },
  subtitle: {
    color: '#7E766F',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    maxWidth: 260,
  },
  profileCard: {
    width: '100%',
    gap: 24,
    minHeight: 340,
    justifyContent: 'center',
    paddingVertical: 12,
  },
  fieldGroup: {
    gap: 8,
  },
  doubleFieldRow: {
    flexDirection: 'row',
    gap: 12,
  },
  halfField: {
    flex: 1,
    gap: 8,
  },
  fieldLabel: {
    color: '#1B140F',
    fontSize: 13,
    fontWeight: '700',
  },
  input: {
    minHeight: 50,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E8E1D8',
    color: '#1B140F',
    paddingHorizontal: 16,
    fontSize: 14,
  },
  optionGrid: {
    width: '100%',
    gap: 12,
    minHeight: 320,
    justifyContent: 'center',
    paddingVertical: 4,
  },
  choiceCard: {
    width: '100%',
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#E8E1D8',
  },
  choiceCardSelected: {
    borderColor: '#2F42C7',
    backgroundColor: '#EEF1FF',
  },
  choiceTitle: {
    color: '#1B140F',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 18,
  },
  choiceTitleSelected: {
    color: '#2F42C7',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownMenu: {
    width: '75%',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  dropdownOption: {
    paddingVertical: 18,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomWidth: 1.5,
    borderBottomColor: '#F4EFE8',
  },
  dropdownOptionText: {
    color: '#1B140F',
    fontSize: 15,
    fontWeight: '700',
  },
  footer: {
    alignItems: 'center',
    gap: 16,
  },
  dotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
    justifyContent: 'center',
    minHeight: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: '#D0CCC6',
  },
  dotActive: {
    width: 20,
    backgroundColor: '#2F42C7',
  },
  footerActions: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  navButtonPrimary: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 18,
    backgroundColor: '#2F42C7',
    paddingVertical: 15,
  },
  navButtonPrimaryDisabled: {
    opacity: 0.72,
  },
  navButtonPrimaryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  navButtonSecondary: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    paddingVertical: 15,
  },
  navButtonSecondaryDisabled: {
    backgroundColor: '#E7E2DB',
  },
  navButtonSecondaryText: {
    color: '#2F42C7',
    fontSize: 14,
    fontWeight: '700',
  },
  navButtonSecondaryTextDisabled: {
    color: '#B4ADA6',
  },
  bypassButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  bypassButtonText: {
    color: '#7A726B',
    fontSize: 13,
    fontWeight: '600',
  },
});
