# Fitraq Backend Handoff

This document is a backend-facing reference for the current Fitraq app flow.

It covers:

- the user profile data we collect
- the onboarding questionnaire data we collect
- the payload shape recommended for backend storage
- the payload shape recommended for Gemini plan generation
- the expected AI response shape for the Activity page

## Current Product Flow

The current frontend flow is:

1. Login
2. Welcome
3. Onboarding
4. Home page
5. Other tabs: Journeys, Activity, Nutrition, Profile

For backend work, the first important data flow is:

1. user completes onboarding
2. profile data is stored
3. onboarding answers are stored
4. backend builds a Gemini payload from both
5. Gemini returns a structured activity plan
6. app renders the Activity page from that structured plan

## Recommended Tables

Recommended initial backend tables:

1. `users`
2. `onboarding_responses`
3. `activity_plans` (later, after Gemini plan generation is wired)

## Table 1: users

This stores the basic profile fields from the first onboarding screen.

### Fields

- `id`
- `name`
- `age`
- `weight_kg`
- `height_cm`
- `gender`
- `created_at`
- `updated_at`

### Example record

```json
{
  "id": "user_123",
  "name": "Abdulla",
  "age": 24,
  "weight_kg": 75,
  "height_cm": 178,
  "gender": "Male"
}
```

## Table 2: onboarding_responses

This stores the questionnaire answers after the basic profile screen.

The current frontend onboarding flow collects:

- `goal`
- `days`
- `movement`
- `level`
- `challenge`

Then it branches based on `goal`.

### Core fields

- `id`
- `user_id`
- `goal`
- `days`
- `movement`
- `level`
- `challenge`
- `created_at`
- `updated_at`

### Branch fields

Only some of these are populated depending on the selected goal:

- `weight_style`
- `nutrition_support`
- `fitness_style`
- `energy_focus`
- `endurance_focus`
- `session_preference`
- `routine_anchor`
- `motivation_style`

### Example record

```json
{
  "id": "onboard_123",
  "user_id": "user_123",
  "goal": "Lose weight",
  "days": "3-4 days",
  "movement": "Walking",
  "level": "Getting going",
  "challenge": "Staying consistent",
  "weight_style": "Balanced pace",
  "nutrition_support": "Meal logging",
  "fitness_style": null,
  "energy_focus": null,
  "endurance_focus": null,
  "session_preference": null,
  "routine_anchor": null,
  "motivation_style": null
}
```

## Current Frontend Onboarding Values

These are the current selectable values in the app.

### goal

- `Lose weight`
- `Build fitness`
- `Boost endurance`
- `Move more`

### days

- `1-2 days`
- `3-4 days`
- `5+ days`

### movement

- `Walkingg`
- `Running`
- `Cycling`
- `Hiking`
- `Mix it up`

### level

- `Just starting`
- `Getting going`
- `Consistent`
- `Already active`

### challenge

- `Staying consistent`
- `Eating better`
- `Finding time`
- `Knowing what to do`

### Branch options by goal

#### Lose weight

- `weight_style`
  - `Gentle start`
  - `Balanced pace`
  - `More structured`
- `nutrition_support`
  - `Portion guidance`
  - `Meal logging`
  - `Snack control`
  - `Protein focus`

#### Build fitness

- `fitness_style`
  - `Short daily`
  - `Mixed sessions`
  - `Structured plan`
- `energy_focus`
  - `More energy`
  - `Better strength`
  - `Better routine`
  - `General fitness`

#### Boost endurance

- `endurance_focus`
  - `Go longer`
  - `Go faster`
  - `Train more often`
- `session_preference`
  - `Steady sessions`
  - `Intervals`
  - `Weekend long effort`

#### Move more

- `routine_anchor`
  - `Morning`
  - `Afternoon`
  - `Evening`
  - `Flexible`
- `motivation_style`
  - `Simple goals`
  - `Daily streaks`
  - `Light coaching`
  - `Visible progress`

## Recommended Frontend -> Backend Payload

This is the clean payload the frontend should send after onboarding.

```json
{
  "user": {
    "name": "Abdulla",
    "age": 24,
    "weight_kg": 75,
    "height_cm": 178,
    "gender": "Male"
  },
  "onboarding": {
    "goal": "Lose weight",
    "days": "3-4 days",
    "movement": "Walking",
    "level": "Getting going",
    "challenge": "Staying consistent"
  },
  "goal_branch": {
    "weight_style": "Balanced pace",
    "nutrition_support": "Meal logging"
  }
}
```

Notes:

- `user` comes from the first onboarding screen
- `onboarding` contains the common questions
- `goal_branch` contains only the goal-specific answers for the selected goal

This structure is cleaner than sending a large flat object with many null values.

## Recommended Backend -> Gemini Payload

The backend can pass through almost the same structure to Gemini.

Example:

```json
{
  "user": {
    "name": "Abdulla",
    "age": 24,
    "weight_kg": 75,
    "height_cm": 178,
    "gender": "Male"
  },
  "onboarding": {
    "goal": "Lose weight",
    "days": "3-4 days",
    "movement": "Walking",
    "level": "Getting going",
    "challenge": "Staying consistent"
  },
  "goal_branch": {
    "weight_style": "Balanced pace",
    "nutrition_support": "Meal logging"
  }
}
```

## Gemini Prompt Intent

Gemini should generate a structured activity plan based on:

- user profile
- goal
- training frequency
- preferred movement
- current level
- biggest challenge
- branch answers

Important:

- Gemini should return strict JSON only
- Gemini should not return long-form prose
- the returned data should be directly renderable by the app

## Expected Gemini Response Shape

Recommended response shape:

```json
{
  "program_title": "4-Week Fat Loss Foundation",
  "summary": "A simple consistency-first plan built around walking and meal tracking.",
  "current_week": 1,
  "weeks": [
    {
      "week": 1,
      "focus": "Build consistency",
      "goal": "Create a repeatable routine without overload.",
      "days": [
        {
          "day": "Monday",
          "tasks": [
            {
              "type": "movement",
              "label": "20 min walk",
              "target": "Easy pace",
              "is_required": true
            },
            {
              "type": "nutrition",
              "label": "Log all meals",
              "target": null,
              "is_required": true
            },
            {
              "type": "recovery",
              "label": "Sleep before 11 PM",
              "target": null,
              "is_required": false
            }
          ]
        }
      ]
    }
  ]
}
```

## Future Table: activity_plans

Suggested later table for storing generated plans:

- `id`
- `user_id`
- `program_title`
- `summary`
- `current_week`
- `plan_json`
- `source_model`
- `created_at`
- `updated_at`

Example:

```json
{
  "id": "plan_123",
  "user_id": "user_123",
  "program_title": "4-Week Fat Loss Foundation",
  "summary": "A simple consistency-first plan built around walking and meal tracking.",
  "current_week": 1,
  "plan_json": {
    "weeks": []
  },
  "source_model": "gemini-2.5-flash"
}
```

## Recommended Backend Order of Operations

1. Create user record in `users`
2. Create onboarding record in `onboarding_responses`
3. Build Gemini payload from both
4. Send payload to Gemini
5. Save returned plan to `activity_plans`
6. Return the generated plan to the app

## Notes For Backend Developer

- Keep profile data and onboarding answers separate
- Keep the Gemini prompt and output strongly structured
- Store the raw generated plan JSON so the app can evolve without changing the DB every time
- Avoid relying on Gemini prose responses; always request JSON
- The current frontend is already moving toward rendering the Activity page from structured weekly/daily task data

## Project File Reference

Current onboarding source in frontend:

- [app/onboarding.tsx](/Users/abdulla/Developer/New%20Projects/Fitraq/app/onboarding.tsx)

Current Activity page direction:

- [app/(tabs)/activity.tsx](/Users/abdulla/Developer/New%20Projects/Fitraq/app/%28tabs%29/activity.tsx)
- [app/(tabs)/activity-week.tsx](/Users/abdulla/Developer/New%20Projects/Fitraq/app/%28tabs%29/activity-week.tsx)
