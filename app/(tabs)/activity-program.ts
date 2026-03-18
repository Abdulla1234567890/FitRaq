export type WeekTask = {
  category: string;
  title: string;
};

export type ActivityWeek = {
  description: string;
  focus: string;
  goal: string;
  id: string;
  insight: string;
  progressLabel: string;
  status: 'completed' | 'current' | 'locked';
  tasks: WeekTask[];
  title: string;
};

export const ACTIVITY_WEEKS: ActivityWeek[] = [
  {
    id: 'week-1',
    title: 'Week 1',
    focus: 'Build consistency',
    goal: 'Set a weekly rhythm and make movement easy to repeat.',
    description: 'This first week is about building momentum with low-friction wins in movement, food logging, and sleep.',
    progressLabel: 'Completed',
    status: 'completed',
    tasks: [
      { category: 'Movement', title: 'Complete 3 light sessions of 20-30 minutes' },
      { category: 'Nutrition', title: 'Log breakfast, lunch, and dinner at least 5 days' },
      { category: 'Recovery', title: 'Aim for 7 hours of sleep on 4 nights' },
    ],
    insight: 'A strong first week is about repeatability, not intensity.',
  },
  {
    id: 'week-2',
    title: 'Week 2',
    focus: 'Tighten the routine',
    goal: 'Increase structure around steps, meals, and one focused workout.',
    description: 'Now that the basics are in place, the goal is to make the plan feel more intentional without overwhelming the user.',
    progressLabel: 'Current',
    status: 'current',
    tasks: [
      { category: 'Movement', title: 'Hit 8,000+ steps on 5 days this week' },
      { category: 'Training', title: 'Finish 1 focused run or ride session' },
      { category: 'Nutrition', title: 'Keep dinner inside your calorie target 4 nights' },
      { category: 'Recovery', title: 'Take 1 lighter recovery day' },
    ],
    insight: 'This is the week where routine starts turning into real progress.',
  },
  {
    id: 'week-3',
    title: 'Week 3',
    focus: 'Build capacity',
    goal: 'Push endurance slightly while holding nutrition consistency.',
    description: 'With the habit foundation set, this week introduces a longer session and slightly more structure to meals.',
    progressLabel: 'Locked',
    status: 'locked',
    tasks: [
      { category: 'Movement', title: 'Add 1 longer weekend session' },
      { category: 'Training', title: 'Complete 2 moderate training efforts' },
      { category: 'Nutrition', title: 'Stay within calorie range for 5 of 7 days' },
      { category: 'Recovery', title: 'Stretch or mobility work after 3 sessions' },
    ],
    insight: 'Capacity only matters if recovery keeps pace with it.',
  },
  {
    id: 'week-4',
    title: 'Week 4',
    focus: 'Lock in the system',
    goal: 'Finish the phase with repeatable habits you can carry forward.',
    description: 'The last week in this static sample program focuses on consistency, recovery, and confidence in the routine.',
    progressLabel: 'Locked',
    status: 'locked',
    tasks: [
      { category: 'Movement', title: 'Hit every planned movement session this week' },
      { category: 'Nutrition', title: 'Pre-log one meal each day before eating' },
      { category: 'Recovery', title: 'Keep one full rest or active recovery day' },
      { category: 'Review', title: 'Reflect on what felt easiest to maintain' },
    ],
    insight: 'The best plan is the one the user can actually sustain after the phase ends.',
  },
];
