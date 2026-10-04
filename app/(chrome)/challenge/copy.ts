// Every user-visible string on /challenge lives here.

export const copy = {
  metaTitle: "No Doomscroll Challenge · Aroop Biswal",
  metaDescription: "Lowest average daily TikTok and Instagram time wins the pot.",
  title: "No Doomscroll Challenge",
  context:
    "My friends and I want to cut down on our screentime, so we decided to add some social/monetary pressure to help us this month. We're all putting in $25 and the person with the lowest screentime on TikTok and Instagram wins it all.",

  notConfigured: "The challenge data is not available right now.",
  noEntries: "No entries have been logged yet.",

  pot: (amount: number) => `Pot: $${amount}`,
  range: (start: string, end: string) => `${start} to ${end}`,
  before: (start: string) => `The challenge starts ${start}.`,
  dayOf: (day: number, total: number) => `Day ${day} of ${total}`,
  daysLeft: (n: number) => (n === 1 ? "1 day left" : `${n} days left`),
  over: "The challenge is over.",
  winner: (names: string) => `Winner: ${names}`,

  leaderboardHeading: "Leaderboard",
  average: "Average per day",
  totalLabel: "Total",
  daysLogged: "Days logged",
  tiktok: "TikTok",
  instagram: "Instagram",
  noValue: "–",
  goalKey: "Goal",
  goalEmoji: "🎯",
  underGoal: "Under goal?",
  underGoalYes: "✅",
  yes: "Yes",

  goalLabel: (goal: string) => `Goal ${goal}`,

  raceHeading: "Running average",
  raceLabel: "Running average minutes per day, by player",
  dailyHeading: "Daily minutes",
  dailyLabel: "Total minutes per day, by player",
  chartHint: "Select a day to see each player's value.",

  splitHeading: "us compared to our goals!",
  funHeading: "our best days",
  bestDay: "Best day",

  flagDuplicate: (player: string, date: string) => `${player} has more than one entry for ${date}; the latest is used.`,
  flagOutOfRange: (player: string, date: string) => `${player}'s entry for ${date} has an impossible value and was ignored.`,
  updated: (time: string) => `Last updated ${time}`,
};
