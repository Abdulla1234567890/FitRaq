export type StoredUserProfile = {
  age: number | null;
  gender: string | null;
  heightCm: number | null;
  name: string;
  userId: string | null;
  weightKg: number | null;
};

type StoredOnboardingAnswers = {
  challenge?: string;
  days?: string;
  goal?: string;
  goalBranch?: Record<string, string>;
  level?: string;
  movement?: string;
};

type AppSession = {
  onboarding: StoredOnboardingAnswers | null;
  profile: StoredUserProfile | null;
};

const appSession: AppSession = {
  onboarding: null,
  profile: null,
};

export function setCurrentUserProfile(profile: StoredUserProfile) {
  appSession.profile = profile;
}

export function getCurrentUserProfile() {
  return appSession.profile;
}

export function setCurrentOnboardingAnswers(onboarding: StoredOnboardingAnswers) {
  appSession.onboarding = onboarding;
}

export function getCurrentOnboardingAnswers() {
  return appSession.onboarding;
}
