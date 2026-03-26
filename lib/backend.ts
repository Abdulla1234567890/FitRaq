import { API_BASE_URL } from '@/constants/api';

export type OnboardingPayload = {
  goal_branch: Record<string, string>;
  onboarding: {
    challenge: string | null;
    days: string | null;
    goal: string | null;
    level: string | null;
    movement: string | null;
  };
  user: {
    age: number | null;
    gender: string | null;
    height_cm: number | null;
    name: string;
    weight_kg: number | null;
  };
};

export type JourneyPayload = {
  ended_at: string;
  journey: {
    activity_type: string;
    average_pace: string | null;
    average_speed_kmh: number;
    calories_estimated: number;
    distance_km: number;
    duration_seconds: number;
    route_mode: 'free' | 'trail';
    route_points: {
      latitude: number;
      longitude: number;
    }[];
    trail_id: string | null;
    xp_earned: number;
  };
  started_at: string;
  user_id: string | null;
};

export type ActivityPlanPayload = OnboardingPayload;

export async function submitOnboarding(payload: OnboardingPayload) {
  return postJson('/onboarding', payload);
}

export async function generateActivityPlan(payload: ActivityPlanPayload) {
  return postJson('/generate-activity-plan', payload);
}

export async function submitJourney(payload: JourneyPayload) {
  return postJson('/journeys', payload);
}

async function postJson(path: string, payload: unknown) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error || `Request failed for ${path}.`);
  }

  return data;
}
