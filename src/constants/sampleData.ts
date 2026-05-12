export interface Note {
  id: string;
  title: string;
  content: string;
  date: string;
  timestamp: string;
  tag: string;
  tagIndex: number;
  pinned: boolean;
}

export const SAMPLE_NOTES: Note[] = [
  {
    id: '1',
    title: 'Morning Reflections',
    content:
      'Today started with a beautiful sunrise. I felt a deep sense of gratitude watching the golden light spread across the sky. The coffee was perfect — dark roast, no sugar.',
    date: 'May 12, 2026',
    timestamp: '08:32 AM',
    tag: 'Personal',
    tagIndex: 0,
    pinned: true,
  },
  {
    id: '2',
    title: 'Project Ideas – Q2',
    content:
      'Brainstorming for next quarter: mobile redesign, performance optimization, onboarding flow improvements. Need to loop in the design team for the component library update.',
    date: 'May 11, 2026',
    timestamp: '02:15 PM',
    tag: 'Work',
    tagIndex: 1,
    pinned: false,
  },
  {
    id: '3',
    title: 'Book Notes: Atomic Habits',
    content:
      'The 1% rule: small improvements compound over time. Identity-based habits are more powerful than outcome-based ones. Systems beat goals. Focus on the process.',
    date: 'May 10, 2026',
    timestamp: '09:45 PM',
    tag: 'Learning',
    tagIndex: 0,
    pinned: false,
  },
  {
    id: '4',
    title: 'Weekend Trip Planning',
    content:
      'Options: hill station, beach getaway, or a cozy staycation with great food. Need to book accommodation by Thursday. Check weather forecast before confirming.',
    date: 'May 9, 2026',
    timestamp: '06:20 PM',
    tag: 'Personal',
    tagIndex: 2,
    pinned: false,
  },
  {
    id: '5',
    title: 'Lemon Pasta Recipe',
    content:
      'Pasta, olive oil, garlic, lemon zest, parmesan, salt, pepper, fresh basil. Cook al dente. Sauté garlic in oil, add lemon zest and pasta water, toss together.',
    date: 'May 8, 2026',
    timestamp: '07:00 PM',
    tag: 'Personal',
    tagIndex: 1,
    pinned: false,
  },
  {
    id: '6',
    title: 'Design Review Meeting',
    content:
      'Key takeaways: typography needs updating, spacing inconsistencies in cards, color contrast issues on mobile. Follow up with Priya on the new component library.',
    date: 'May 7, 2026',
    timestamp: '11:00 AM',
    tag: 'Work',
    tagIndex: 0,
    pinned: false,
  },
];
