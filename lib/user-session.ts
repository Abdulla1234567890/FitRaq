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
  activityPlan: ActivityPlan | null;
  onboarding: StoredOnboardingAnswers | null;
  profile: StoredUserProfile | null;
};

export type ActivityPlanDayTask = {
  is_required?: boolean;
  label: string;
  target?: string | null;
  type: string;
};

export type ActivityPlanDay = {
  day: string;
  tasks: ActivityPlanDayTask[];
};

export type ActivityPlanWeek = {
  days: ActivityPlanDay[];
  focus: string;
  goal: string;
  week: number;
};

export type ActivityPlan = {
  current_week: number;
  program_title: string;
  summary?: string;
  weeks: ActivityPlanWeek[];
};

const appSession: AppSession = {
  activityPlan: null,
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

export function setCurrentActivityPlan(activityPlan: ActivityPlan | null) {
  appSession.activityPlan = activityPlan;
}

export function getCurrentActivityPlan() {
  return appSession.activityPlan;
}
