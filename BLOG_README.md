# Fitraq Blog Notes

This file is a copy-friendly guide for writing a technical blog post about Fitraq.

## 1. How Fitraq Is Organized

Fitraq is built with Expo Router and split into two layers: a root stack for authentication/onboarding, and a tabbed app shell for the main product experience. That keeps the first-time flow separate from the daily-use screens, while still letting hidden detail pages live inside the tab structure.

Use this snippet from [app/_layout.tsx](/Users/abdulla/Developer/New%20Projects/Fitraq/app/_layout.tsx):

```tsx
<Stack initialRouteName="Login">
  <Stack.Screen name="Login" options={{ headerShown: false }} />
  <Stack.Screen name="welcome" options={{ headerShown: false }} />
  <Stack.Screen name="onboarding" options={{ headerShown: false }} />
  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
</Stack>
```

Why it matters:
This small block explains the entire navigation hierarchy of the app without needing to dump folder trees or multiple files.

## 2. Onboarding Slideshow + Questionnaire

The onboarding flow is not just UI. It captures a profile, core intent, and branching goal-specific answers, then converts that into one structured payload for the backend. That payload becomes the basis for personalization later.

Use this snippet from [app/onboarding.tsx](/Users/abdulla/Developer/New%20Projects/Fitraq/app/onboarding.tsx):

```ts
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
    if (answers[key]) result[key] = answers[key];
    return result;
  }, {}),
};
```

Why it matters:
It shows how the questionnaire becomes structured data instead of staying as raw UI state.

## 3. Journey Flow: Start -> Session -> Finish

The journey flow is where Fitraq becomes an actual fitness product. A session starts from either a chosen trail or a free-start mode, tracks movement in real time, then produces a summary that can be saved or shown back to the user.

Use this snippet from [app/(tabs)/start-journey.tsx](/Users/abdulla/Developer/New%20Projects/Fitraq/app/%28tabs%29/start-journey.tsx):

```ts
const summary: JourneySummary = {
  averageDisplay: thirdPrimaryValue,
  calories,
  distanceKm,
  durationDisplay: formatDuration(elapsedSeconds),
  durationSeconds: elapsedSeconds,
  endedAt,
  routeMode: selectedTrail ? 'trail' : 'free',
  startedAt,
  xp: sessionXp,
};

await submitJourney({
  user_id: currentUserProfile?.userId ?? null,
  started_at: startedAt,
  ended_at: endedAt,
  journey: {
    activity_type: activeType.id,
    trail_id: selectedTrail?.id ?? null,
    route_mode: selectedTrail ? 'trail' : 'free',
    route_points: routePoints,
    duration_seconds: elapsedSeconds,
    distance_km: distanceKm,
    average_speed_kmh: averageSpeed,
    calories_estimated: calories,
    xp_earned: sessionXp,
  },
});
```

Why it matters:
It shows both the user-facing summary and the backend-facing data model in one concise example.

## 4. Core Analytics: Nutrition and Weekly Progress

Fitraq’s analytics screens are built around lightweight daily logging and weekly progress feedback. One side is nutrition input and calorie analysis; the other is task completion, week progression, and daily guidance.

For the nutrition/backend connection, use this snippet from [app/(tabs)/nutrition.tsx](/Users/abdulla/Developer/New%20Projects/Fitraq/app/%28tabs%29/nutrition.tsx):

```ts
const response = await fetch(`${API_BASE_URL}/analyze-nutrition`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    date: `2026-03-${selectedDay.dateNumber.padStart(2, "0")}`,
    meals: selectedDay.meals,
    extras: selectedDay.extras.filter((item) => item.trim()),
  }),
});
```

Why it matters:
It clearly shows how the app turns meal input into an AI-backed nutrition workflow.

## 5. Data Handling & APIs

Under the UI, the app works by packaging meaningful events into backend-friendly payloads: onboarding, nutrition submissions, and completed journeys. The key design choice is that frontend screens collect input, but the backend owns analysis and plan generation.

Good files to reference:

- [lib/backend.ts](/Users/abdulla/Developer/New%20Projects/Fitraq/lib/backend.ts)
- [constants/api.ts](/Users/abdulla/Developer/New%20Projects/Fitraq/constants/api.ts)
- [lib/user-session.ts](/Users/abdulla/Developer/New%20Projects/Fitraq/lib/user-session.ts)

If you only want one code sample in this section, reuse the nutrition API call above or show a helper from `lib/backend.ts`.

## 6. Adaptive + Gamification Logic

This is the most distinctive part of Fitraq. The app does not only show fixed screens; it resolves what the user should do today based on the current plan, the current week, and the current day. That makes the experience feel adaptive rather than static.

Use this snippet from [lib/activity-program.ts](/Users/abdulla/Developer/New%20Projects/Fitraq/lib/activity-program.ts):

```ts
const currentWeek = plan.weeks.find((week) => week.week === plan.current_week) ?? plan.weeks[0];
const todayLabel = DAY_LABELS[new Date().getDay()];
const currentDay =
  currentWeek.days.find((day) => day.day.toLowerCase() === todayLabel.toLowerCase()) ?? currentWeek.days[0];

return currentDay.tasks.map((task, index) => ({
  id: `${currentWeek.week}-${currentDay.day}-${index}`,
  label: task.label,
  progress: task.target ?? 'Planned',
  done: false,
  icon: iconForTaskType(task.type),
}));
```

Why it matters:
This shows the app’s “today-first” logic in a very readable way. It is a strong example of personalization, adaptive planning, and gamified progression working together.

## Suggested Screenshots

- App structure: folder tree + login/onboarding flow
- Onboarding: questionnaire screen
- Journey flow: start session + session summary
- Analytics: nutrition page + activity page
- Adaptive/gamification: weekly activity view + XP/home dashboard

## Best Files To Pull From

- [app/_layout.tsx](/Users/abdulla/Developer/New%20Projects/Fitraq/app/_layout.tsx)
- [app/(tabs)/_layout.tsx](/Users/abdulla/Developer/New%20Projects/Fitraq/app/%28tabs%29/_layout.tsx)
- [app/Login.tsx](/Users/abdulla/Developer/New%20Projects/Fitraq/app/Login.tsx)
- [app/welcome.tsx](/Users/abdulla/Developer/New%20Projects/Fitraq/app/welcome.tsx)
- [app/onboarding.tsx](/Users/abdulla/Developer/New%20Projects/Fitraq/app/onboarding.tsx)
- [app/(tabs)/homepage.tsx](/Users/abdulla/Developer/New%20Projects/Fitraq/app/%28tabs%29/homepage.tsx)
- [app/(tabs)/journeys.tsx](/Users/abdulla/Developer/New%20Projects/Fitraq/app/%28tabs%29/journeys.tsx)
- [app/(tabs)/profile.tsx](/Users/abdulla/Developer/New%20Projects/Fitraq/app/%28tabs%29/profile.tsx)
- [app/(tabs)/choose-path.tsx](/Users/abdulla/Developer/New%20Projects/Fitraq/app/%28tabs%29/choose-path.tsx)
- [app/(tabs)/choose-trail.tsx](/Users/abdulla/Developer/New%20Projects/Fitraq/app/%28tabs%29/choose-trail.tsx)
- [app/(tabs)/start-journey.tsx](/Users/abdulla/Developer/New%20Projects/Fitraq/app/%28tabs%29/start-journey.tsx)
- [app/(tabs)/journey-details.tsx](/Users/abdulla/Developer/New%20Projects/Fitraq/app/%28tabs%29/journey-details.tsx)
- [app/(tabs)/nutrition.tsx](/Users/abdulla/Developer/New%20Projects/Fitraq/app/%28tabs%29/nutrition.tsx)
- [app/(tabs)/activity.tsx](/Users/abdulla/Developer/New%20Projects/Fitraq/app/%28tabs%29/activity.tsx)
- [app/(tabs)/activity-week.tsx](/Users/abdulla/Developer/New%20Projects/Fitraq/app/%28tabs%29/activity-week.tsx)
- [lib/activity-program.ts](/Users/abdulla/Developer/New%20Projects/Fitraq/lib/activity-program.ts)
- [lib/backend.ts](/Users/abdulla/Developer/New%20Projects/Fitraq/lib/backend.ts)
- [lib/user-session.ts](/Users/abdulla/Developer/New%20Projects/Fitraq/lib/user-session.ts)
- [constants/api.ts](/Users/abdulla/Developer/New%20Projects/Fitraq/constants/api.ts)
