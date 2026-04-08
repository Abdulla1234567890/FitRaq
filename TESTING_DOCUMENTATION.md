# Fitraq Testing Documentation

## 1. Types of Testing Applied to Fitraq

### Unit Testing

| ID | Real Fitraq Example | Code Location | Status |
|---|---|---|---|
| UT-01 | Clamp/round nutrition calories in session (`-10`, `NaN` -> `0`) | `lib/user-session.ts` | Theoretical |
| UT-02 | Return latest nutrition calories from session | `lib/user-session.ts` | Theoretical |
| UT-03 | Build stable day id `day-YYYY-MM-DD` for nutrition days | `app/(tabs)/nutrition.tsx` | Theoretical |
| UT-04 | Date formatting to backend payload `YYYY-MM-DD` | `app/(tabs)/nutrition.tsx` | Theoretical |
| UT-05 | Activity day mapping (`MO` -> `Monday`) for task lookup | `app/(tabs)/activity.tsx` | Theoretical |
| UT-06 | Resolve selected day tasks with safe fallback | `lib/activity-program.ts` | Theoretical |

### Integration Testing

| ID | Real Fitraq Integration | Components | Status |
|---|---|---|---|
| IT-01 | Submit onboarding profile + answers to backend | Onboarding UI + `submitOnboarding()` + `/onboarding` | Performed |
| IT-02 | Generate activity plan after onboarding | Onboarding + `generateActivityPlan()` + `/generate-activity-plan` | Performed |
| IT-03 | Fetch stored plan fallback by user key | Onboarding + `fetchActivityPlan()` + `/activity-plan` | Performed |
| IT-04 | Nutrition submit updates Home calories | Nutrition + `/analyze-nutrition` + session + Home | Performed |
| IT-05 | Activity page refreshes latest plan on focus | Activity `useFocusEffect` + session state | Performed |
| IT-06 | Calendar day tap updates checklist | Activity calendar + `resolveTasksForDay()` | Performed |

### System Testing

| ID | Real End-to-End Scenario | Scope | Status |
|---|---|---|---|
| ST-01 | Login/welcome -> onboarding -> tabs | Full app flow | Performed |
| ST-02 | Onboarding -> Gemini plan -> Activity renders week/tasks | Frontend + backend + model response | Performed |
| ST-03 | Nutrition entry -> analysis -> totals + itemized list shown | Full nutrition workflow | Performed |
| ST-04 | Activity date change across week days updates task list | UI + logic + state | Performed |
| ST-05 | Home calories remain `0` until nutrition analysis updates | Cross-tab data flow | Performed |
| ST-06 | Backend timeout/502 handled with user error message | Failure-path system behavior | Performed |

### Acceptance Testing

| ID | User/Stakeholder Requirement | Acceptance Check | Status |
|---|---|---|---|
| AT-01 | Activity page should be less text-heavy | Visual review approved | Performed |
| AT-02 | Nutrition default should stay compact | Compact strip visible by default | Performed |
| AT-03 | Full calendar should open from icon | Modal full calendar opens on icon tap | Performed |
| AT-04 | Home calories must come from nutrition | Value updates only after nutrition submit | Performed |
| AT-05 | Remove hardcoded name fallback ("Janna") | Uses route/session name, fallback `User` | Performed |
| AT-06 | Keep app behavior stable in Expo Go real-device runs | Manual runs on phone successful | Performed |

---

## 2. Test Cases (Detailed)

### Unit Test Cases

| Test Case ID | Description | Pre-conditions | Steps to Execute | Expected Result | Actual Result | Pass/Fail |
|---|---|---|---|---|---|---|
| UT-TC-01 | Clamp negative nutrition calories to 0 | `user-session.ts` loaded | Call `setCurrentNutritionCalories(-10)` then `getCurrentNutritionCalories()` | Returns `0` | Returned `0` | Pass |
| UT-TC-02 | Clamp invalid nutrition calories to 0 | Same | Call `setCurrentNutritionCalories(NaN)` then get | Returns `0` | Returned `0` | Pass |
| UT-TC-03 | Round valid nutrition calories | Same | Call `setCurrentNutritionCalories(1640.7)` then get | Returns `1641` | Returned `1641` | Pass |
| UT-TC-04 | Day ID format for nutrition date | `nutrition.tsx` helper available | Create date Apr 8 2026 -> run `createNutritionDayId` | `day-2026-04-08` format | Matched format | Pass |
| UT-TC-05 | Date payload formatting for backend | Same | Run `formatDateAsIso(new Date(2026,3,8))` | `2026-04-08` | Returned `2026-04-08` | Pass |

### Integration Test Cases

| Test Case ID | Description | Pre-conditions | Steps to Execute | Expected Result | Actual Result | Pass/Fail |
|---|---|---|---|---|---|---|
| IT-TC-01 | Onboarding submit to backend | Flask backend running | Complete onboarding and submit | `/onboarding` returns success | HTTP 200 observed | Pass |
| IT-TC-02 | Generate activity plan from onboarding payload | Gemini key valid, backend up | Submit onboarding and trigger plan generation | Plan JSON returned and stored | Plan parsed + stored | Pass |
| IT-TC-03 | Fetch stored activity plan fallback | Stored plan exists for user key | Run onboarding, then fetch by `user_id/name` | Plan fetched from `/activity-plan` | Plan fetched successfully | Pass |
| IT-TC-04 | Nutrition submit updates Home calories | Nutrition + Home tabs accessible | Submit meals in Nutrition, switch to Home | Home calories reflect latest daily total | Updated on focus | Pass |
| IT-TC-05 | Activity refetch on screen focus | Session has activity plan | Navigate away from Activity and back | Activity reloads latest plan | Reload confirmed | Pass |

### System Test Cases

| Test Case ID | Description | Pre-conditions | Steps to Execute | Expected Result | Actual Result | Pass/Fail |
|---|---|---|---|---|---|---|
| ST-TC-01 | End-to-end: Welcome -> Onboarding -> Tabs | App starts cleanly | Launch app, complete flow | User lands in tabbed app with data | Completed successfully | Pass |
| ST-TC-02 | End-to-end nutrition workflow | Backend reachable | Add meals, submit, view breakdown | Totals + item list + status message shown | Shown correctly | Pass |
| ST-TC-03 | Activity day selection behavior | Activity plan loaded | Tap different dates in activity calendar | Checklist changes by selected weekday | Behavior correct after fix | Pass |
| ST-TC-04 | Error path for backend timeout | Simulate slow/unreachable backend | Submit nutrition/onboarding | Error message shown, app doesn't crash | Handled safely | Pass |
| ST-TC-05 | Cross-tab data consistency | Session active | Update nutrition then visit Home and Activity | Shared state is consistent across screens | Consistent | Pass |

### Acceptance Test Cases

| Test Case ID | Description | Pre-conditions | Steps to Execute | Expected Result | Actual Result | Pass/Fail |
|---|---|---|---|---|---|---|
| AT-TC-01 | Activity page less text-heavy | Latest UI build | Open Activity page | Cleaner visual hierarchy, reduced text blocks | Accepted by stakeholder | Pass |
| AT-TC-02 | Nutrition default compact calendar | Latest Nutrition screen | Open Nutrition | Compact strip visible by default | Confirmed | Pass |
| AT-TC-03 | Full calendar opens from icon | Same | Tap calendar icon in Nutrition | Full month picker opens in modal | Confirmed | Pass |
| AT-TC-04 | Home calories from nutrition only | No nutrition submit yet | Check Home then submit Nutrition then check Home | Starts at `0`, updates after submit | Confirmed | Pass |
| AT-TC-05 | Remove hardcoded user name | Updated homepage | Open Home without name param | Uses profile/param, fallback `User` | Confirmed | Pass |

---

## 3. Simple Unit Test (Jest)

Use this as a starter unit test for backend/session logic:

```ts
// file: lib/user-session.test.ts
import {
  getCurrentNutritionCalories,
  setCurrentNutritionCalories,
} from "@/lib/user-session";

describe("user-session nutrition calories", () => {
  test("stores rounded non-negative calories", () => {
    setCurrentNutritionCalories(1640.4);
    expect(getCurrentNutritionCalories()).toBe(1640);
  });

  test("clamps invalid and negative values to zero", () => {
    setCurrentNutritionCalories(Number.NaN);
    expect(getCurrentNutritionCalories()).toBe(0);

    setCurrentNutritionCalories(-25);
    expect(getCurrentNutritionCalories()).toBe(0);
  });
});
```

---

## 4. Integration Testing (Two Interacting Components)

1. Onboarding screen + `lib/backend.ts submitOnboarding()` + backend `/onboarding`.
2. Onboarding screen + `generateActivityPlan()` + Activity screen plan render.
3. Nutrition screen + backend `/analyze-nutrition` + `setCurrentNutritionCalories()`.
4. Home screen + `getCurrentNutritionCalories()` with `useFocusEffect`.
5. Activity screen calendar day select + `resolveTasksForDay()` checklist output.
6. Nutrition calendar popup select + selected date payload (`formatDateAsIso`) for backend call.

