/**
 * ============================================================
 * COACH MODULE MOCK DATA
 * ============================================================
 *
 * Mock data for coach module development.
 * Based on COACH_MODULE_FUNCTIONS.md specification.
 *
 * CRITICAL RULES:
 * - Athlete lists ALWAYS sorted alphabetically A-Å
 * - No athlete ranking or "best/worst" indicators
 * - Neutral presentation throughout
 * ============================================================
 */

// ============================================================
// TYPES
// ============================================================

export interface Athlete {
  id: string;
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  hcp: number;
  category: 'A' | 'B' | 'C' | 'D';
  lastActivityAt: string;
  injuryStatus: 'ready' | 'limited' | 'injured';
  hasPlan: boolean;
  avatarUrl?: string;
}

export interface Alert {
  id: string;
  type: 'proof_uploaded' | 'plan_pending' | 'note_request' | 'milestone' | 'injury' | 'test_completed';
  athleteId: string;
  athleteName: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}

export interface PendingItem {
  id: string;
  type: 'proof' | 'note' | 'plan' | 'booking';
  athleteId: string;
  athleteName: string;
  description: string;
  createdAt: string;
}

export interface Tournament {
  id: string;
  name: string;
  location: string;
  startDate: string;
  endDate: string;
  participants: string[];
  participantCount: number;
}

export interface BookingSlot {
  id: string;
  date: string;
  time: string;
  status: 'available' | 'booked' | 'pending' | 'blocked';
  athleteId?: string;
  athleteName?: string;
  sessionType?: string;
  notes?: string;
}

export interface Message {
  id: string;
  subject: string;
  preview: string;
  category: 'training' | 'tournament' | 'important' | 'general';
  recipientType: 'player' | 'group' | 'all';
  recipientName: string;
  status: 'pending' | 'delivered' | 'read';
  sentAt: string;
  scheduledFor?: string;
  hasAttachment: boolean;
  direction?: 'sent' | 'received'; // Direction: sent by coach or received by coach
  senderName?: string; // For received messages
  isRead?: boolean; // For received messages
}

export interface Exercise {
  id: string;
  name: string;
  description: string;
  category: 'putting' | 'driving' | 'iron' | 'wedge' | 'bunker' | 'mental' | 'fitness';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // minutes
  equipment: string[];
  hasMedia: boolean;
  isFavorite: boolean;
  usageCount: number;
  rating: number;
}

export interface StatsOverview {
  improvingCount: number;
  regressingCount: number;
  stableCount: number;
  avgHcpChange: number;
  totalSessions: number;
  totalHours: number;
  activePlayers: number;
}

export interface ModificationRequest {
  id: string;
  athleteId: string;
  athleteName: string;
  type: string;
  description: string;
  notes: string;
  priority: 'low' | 'medium' | 'high';
  status: 'waiting' | 'in_review' | 'resolved' | 'rejected';
  createdAt: string;
  resolvedAt?: string;
  responseNote?: string;
}

export interface Group {
  id: string;
  name: string;
  type: 'WANG' | 'Team Norway' | 'Custom';
  memberCount: number;
  members: string[];
  hasPlan: boolean;
  createdAt: string;
}

// ============================================================
// HELPER: Sort alphabetically by displayName (Norwegian locale)
// ============================================================

function sortAlphabetically<T extends { displayName?: string; lastName?: string; firstName?: string }>(
  items: T[]
): T[] {
  return [...items].sort((a, b) => {
    const nameA = a.displayName || `${a.lastName}, ${a.firstName}` || '';
    const nameB = b.displayName || `${b.lastName}, ${b.firstName}` || '';
    return nameA.localeCompare(nameB, 'nb-NO');
  });
}

// ============================================================
// COACH GREETING
// ============================================================

export function getCoachGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

// ============================================================
// ATHLETE LIST (ALWAYS ALPHABETICAL)
// ============================================================

const rawAthletes: Omit<Athlete, 'displayName'>[] = [
  // Real players from TIER Golf - All Oslo GK, WANG Toppidrett Oslo, Team Norway Junior
  { id: '1', firstName: 'Anders', lastName: 'Kristiansen', email: 'anders.kristiansen@demo.com', hcp: 2.1, category: 'A', lastActivityAt: '2026-01-03T10:30:00Z', injuryStatus: 'ready', hasPlan: true },
  { id: '2', firstName: 'Caroline', lastName: 'Diethelm', email: 'caroline.diethelm@demo.com', hcp: 3.2, category: 'A', lastActivityAt: '2026-01-03T09:00:00Z', injuryStatus: 'ready', hasPlan: true },
  { id: '3', firstName: 'Carl Johan', lastName: 'Gustavsson', email: 'carl.gustavsson@demo.com', hcp: 8.5, category: 'C', lastActivityAt: '2026-01-02T14:00:00Z', injuryStatus: 'ready', hasPlan: true },
  { id: '4', firstName: 'Nils Jonas', lastName: 'Lilja', email: 'nils.lilja@demo.com', hcp: 5.2, category: 'B', lastActivityAt: '2026-01-02T16:00:00Z', injuryStatus: 'ready', hasPlan: true },
  { id: '5', firstName: 'Øyvind', lastName: 'Rohjan', email: 'oyvind.rohjan@demo.com', hcp: 4.8, category: 'B', lastActivityAt: '2026-01-03T11:00:00Z', injuryStatus: 'ready', hasPlan: true },
  { id: '6', firstName: 'Demo', lastName: 'Player', email: 'player@demo.com', hcp: 5.4, category: 'B', lastActivityAt: '2026-01-01T12:00:00Z', injuryStatus: 'ready', hasPlan: true },
];

// Add displayName and sort alphabetically
export const athleteList: Athlete[] = sortAlphabetically(
  rawAthletes.map(a => ({
    ...a,
    displayName: `${a.lastName}, ${a.firstName}`,
  }))
);

// ============================================================
// ALERTS FEED (grouped by athlete name alphabetically)
// ============================================================

const rawAlerts: Alert[] = [
  { id: 'a1', type: 'proof_uploaded', athleteId: '1', athleteName: 'Kristiansen, Anders', message: 'Uploaded new training video', createdAt: '2026-01-03T08:30:00Z', isRead: false },
  { id: 'a2', type: 'test_completed', athleteId: '5', athleteName: 'Rohjan, Øyvind', message: 'Completed driver clubhead speed test', createdAt: '2026-01-02T15:00:00Z', isRead: false },
  { id: 'a3', type: 'milestone', athleteId: '4', athleteName: 'Lilja, Nils Jonas', message: 'Reached milestone: 50 sessions', createdAt: '2026-01-02T10:00:00Z', isRead: true },
  { id: 'a4', type: 'plan_pending', athleteId: '3', athleteName: 'Gustavsson, Carl Johan', message: 'Training plan awaiting approval', createdAt: '2026-01-01T14:00:00Z', isRead: false },
  { id: 'a5', type: 'proof_uploaded', athleteId: '2', athleteName: 'Diethelm, Caroline', message: 'Uploaded putting drill video', createdAt: '2026-01-01T11:00:00Z', isRead: true },
  { id: 'a6', type: 'note_request', athleteId: '1', athleteName: 'Kristiansen, Anders', message: 'Requests feedback on last session', createdAt: '2025-12-31T16:00:00Z', isRead: false },
  { id: 'a7', type: 'test_completed', athleteId: '4', athleteName: 'Lilja, Nils Jonas', message: 'Completed PEI test', createdAt: '2025-12-31T09:00:00Z', isRead: true },
];

// Sort alerts by athlete name (alphabetically)
export const alertsFeed: Alert[] = [...rawAlerts].sort((a, b) =>
  a.athleteName.localeCompare(b.athleteName, 'en-US')
);

// ============================================================
// PENDING ITEMS
// ============================================================

export const pendingItems: PendingItem[] = [
  { id: 'p1', type: 'proof', athleteId: '1', athleteName: 'Kristiansen, Anders', description: 'New video to review', createdAt: '2026-01-03T08:30:00Z' },
  { id: 'p2', type: 'plan', athleteId: '5', athleteName: 'Andersen, Emma', description: 'Training plan awaiting approval', createdAt: '2026-01-02T15:00:00Z' },
  { id: 'p3', type: 'note', athleteId: '7', athleteName: 'Nilsen, Guro', description: 'Requests feedback', createdAt: '2025-12-31T16:00:00Z' },
  { id: 'p4', type: 'booking', athleteId: '4', athleteName: 'Berg, Daniel', description: 'Booking request for Monday', createdAt: '2026-01-02T09:00:00Z' },
];

// ============================================================
// WEEKLY TOURNAMENTS
// ============================================================

export const weeklyTournaments: Tournament[] = [
  {
    id: 't1',
    name: 'TIER Golf Vinterserie Runde 1',
    location: 'Oslo Golfklubb',
    startDate: '2026-01-05',
    endDate: '2026-01-05',
    participants: ['1', '3', '6', '10'],
    participantCount: 4,
  },
  {
    id: 't2',
    name: 'NGF Junior Tour',
    location: 'Bærum Golfklubb',
    startDate: '2026-01-07',
    endDate: '2026-01-08',
    participants: ['5', '8', '12'],
    participantCount: 3,
  },
];

// ============================================================
// BOOKING SLOTS
// ============================================================

export const bookingSlots: BookingSlot[] = [
  { id: 'b1', date: '2026-01-06', time: '09:00', status: 'booked', athleteId: '1', athleteName: 'Kristiansen, Anders', sessionType: 'Putting' },
  { id: 'b2', date: '2026-01-06', time: '10:00', status: 'available' },
  { id: 'b3', date: '2026-01-06', time: '11:00', status: 'booked', athleteId: '3', athleteName: 'Olsen, Christina', sessionType: 'Driving' },
  { id: 'b4', date: '2026-01-06', time: '14:00', status: 'pending', athleteId: '4', athleteName: 'Berg, Daniel' },
  { id: 'b5', date: '2026-01-06', time: '15:00', status: 'blocked', notes: 'Meeting' },
  { id: 'b6', date: '2026-01-07', time: '09:00', status: 'available' },
  { id: 'b7', date: '2026-01-07', time: '10:00', status: 'booked', athleteId: '6', athleteName: 'Johansen, Fredrik', sessionType: 'Video analysis' },
];

// ============================================================
// MESSAGES (sent and scheduled)
// ============================================================

export const messages: Message[] = [
  { id: 'm1', subject: 'This week\'s training focus', preview: 'Hi everyone, this week we focus on...', category: 'training', recipientType: 'all', recipientName: 'All players', status: 'delivered', sentAt: '2026-01-02T08:00:00Z', hasAttachment: false },
  { id: 'm2', subject: 'Tournament on Sunday', preview: 'Remember to register for TIER Golf Winter Series...', category: 'tournament', recipientType: 'group', recipientName: 'A-category', status: 'read', sentAt: '2026-01-01T10:00:00Z', hasAttachment: true },
  { id: 'm3', subject: 'Important: Change in training times', preview: 'Due to maintenance, times are changed...', category: 'important', recipientType: 'all', recipientName: 'All players', status: 'pending', sentAt: '2026-01-03T06:00:00Z', hasAttachment: false },
  { id: 'm4', subject: 'Your weekly report', preview: 'Here is your weekly training report...', category: 'general', recipientType: 'player', recipientName: 'Kristiansen, Anders', status: 'delivered', sentAt: '2025-12-30T15:00:00Z', hasAttachment: true },
];

export const scheduledMessages: Message[] = [
  { id: 'sm1', subject: 'Tournament reminder', preview: 'Don\'t forget the tournament tomorrow...', category: 'tournament', recipientType: 'group', recipientName: 'Tournament participants', status: 'pending', sentAt: '', scheduledFor: '2026-01-04T18:00:00Z', hasAttachment: false },
  { id: 'sm2', subject: 'Weekly summary', preview: 'Great work this week! Here is...', category: 'general', recipientType: 'all', recipientName: 'All players', status: 'pending', sentAt: '', scheduledFor: '2026-01-05T12:00:00Z', hasAttachment: false },
];

// ============================================================
// INBOX MESSAGES (received by coach from players)
// ============================================================

export const inboxMessages: Message[] = [
  { id: 'inbox1', subject: 'Question about putting exercise', preview: 'Hi! I\'m wondering if you could explain the gate drill exercise a bit better...', category: 'training', recipientType: 'player', recipientName: 'Coach', senderName: 'Kristiansen, Anders', status: 'delivered', sentAt: '2026-01-03T14:30:00Z', hasAttachment: false, direction: 'received', isRead: false },
  { id: 'inbox2', subject: 'Cannot attend training tomorrow', preview: 'Sorry for the late notice, but I\'ve gotten sick and cannot attend...', category: 'important', recipientType: 'player', recipientName: 'Coach', senderName: 'Olsen, Christina', status: 'delivered', sentAt: '2026-01-02T19:45:00Z', hasAttachment: false, direction: 'received', isRead: false },
  { id: 'inbox3', subject: 'Thanks for the feedback!', preview: 'Thank you so much for the great feedback on my video. I will...', category: 'general', recipientType: 'player', recipientName: 'Coach', senderName: 'Andersen, Emma', status: 'delivered', sentAt: '2026-01-02T16:20:00Z', hasAttachment: false, direction: 'received', isRead: true },
  { id: 'inbox4', subject: 'Request for extra session', preview: 'Hi! I would like to book an extra session with you this week...', category: 'general', recipientType: 'player', recipientName: 'Coach', senderName: 'Johansen, Fredrik', status: 'delivered', sentAt: '2026-01-01T11:15:00Z', hasAttachment: false, direction: 'received', isRead: true },
  { id: 'inbox5', subject: 'Tournament registration', preview: 'I would like to register for TIER Golf Winter Series. What is the deadline?...', category: 'tournament', recipientType: 'player', recipientName: 'Coach', senderName: 'Kristiansen, Jonas', status: 'delivered', sentAt: '2025-12-31T10:00:00Z', hasAttachment: false, direction: 'received', isRead: true },
  { id: 'inbox6', subject: 'Elbow pain', preview: 'The last few days I\'ve had pain in my elbow after training...', category: 'important', recipientType: 'player', recipientName: 'Coach', senderName: 'Pedersen, Ida', status: 'delivered', sentAt: '2025-12-30T15:30:00Z', hasAttachment: true, direction: 'received', isRead: true },
  { id: 'inbox7', subject: 'Video analysis request', preview: 'Can you look at my swing? I\'ve uploaded a video...', category: 'training', recipientType: 'player', recipientName: 'Coach', senderName: 'Berg, Daniel', status: 'delivered', sentAt: '2025-12-29T13:45:00Z', hasAttachment: true, direction: 'received', isRead: true },
];

// ============================================================
// EXERCISES
// ============================================================

export const exercises: Exercise[] = [
  { id: 'e1', name: '3-meter putting drill', description: 'Focus on distance control from 3 meters', category: 'putting', difficulty: 'beginner', duration: 15, equipment: ['Putter', 'Balls'], hasMedia: true, isFavorite: true, usageCount: 45, rating: 4.8 },
  { id: 'e2', name: 'Gate drill', description: 'Putt through the gate for better precision', category: 'putting', difficulty: 'intermediate', duration: 20, equipment: ['Putter', 'Balls', 'Tees'], hasMedia: true, isFavorite: false, usageCount: 32, rating: 4.5 },
  { id: 'e3', name: 'Driver alignment', description: 'Correct alignment for driver shots', category: 'driving', difficulty: 'beginner', duration: 25, equipment: ['Driver', 'Alignment sticks'], hasMedia: true, isFavorite: true, usageCount: 28, rating: 4.6 },
  { id: 'e4', name: 'Power training', description: 'Increase swing speed with resistance training', category: 'driving', difficulty: 'advanced', duration: 30, equipment: ['Driver', 'Resistance band'], hasMedia: false, isFavorite: false, usageCount: 15, rating: 4.2 },
  { id: 'e5', name: '7-iron precision', description: 'Precision training with 7-iron', category: 'iron', difficulty: 'intermediate', duration: 25, equipment: ['7-iron', 'Targets'], hasMedia: true, isFavorite: true, usageCount: 38, rating: 4.7 },
  { id: 'e6', name: 'Wedge distance control', description: 'Controlled distance with wedge', category: 'wedge', difficulty: 'intermediate', duration: 20, equipment: ['Wedge', 'Targets'], hasMedia: true, isFavorite: false, usageCount: 25, rating: 4.4 },
  { id: 'e7', name: 'Bunker basics', description: 'Basic bunker technique', category: 'bunker', difficulty: 'beginner', duration: 20, equipment: ['Sand wedge'], hasMedia: true, isFavorite: false, usageCount: 22, rating: 4.3 },
  { id: 'e8', name: 'Pre-shot routine', description: 'Mental preparation before shots', category: 'mental', difficulty: 'beginner', duration: 10, equipment: [], hasMedia: true, isFavorite: true, usageCount: 50, rating: 4.9 },
  { id: 'e9', name: 'Core stability', description: 'Stability training for better rotation', category: 'fitness', difficulty: 'intermediate', duration: 30, equipment: ['Mat', 'Swiss ball'], hasMedia: true, isFavorite: false, usageCount: 18, rating: 4.1 },
];

// ============================================================
// STATS OVERVIEW
// ============================================================

export const statsOverview: StatsOverview = {
  improvingCount: 8,
  regressingCount: 2,
  stableCount: 2,
  avgHcpChange: -0.8,
  totalSessions: 156,
  totalHours: 234,
  activePlayers: 12,
};

// ============================================================
// MODIFICATION REQUESTS
// ============================================================

export const modificationRequests: ModificationRequest[] = [
  { id: 'mr1', athleteId: '4', athleteName: 'Berg, Daniel', type: 'Plan change', description: 'Wants to change training time on Thursdays', notes: 'Has new school class that conflicts', priority: 'medium', status: 'waiting', createdAt: '2026-01-02T10:00:00Z' },
  { id: 'mr2', athleteId: '7', athleteName: 'Nilsen, Guro', type: 'Exercise swap', description: 'Wants alternative to bunker exercise', notes: 'Has wrist pain during bunker shots', priority: 'high', status: 'in_review', createdAt: '2026-01-01T14:00:00Z' },
  { id: 'mr3', athleteId: '11', athleteName: 'Svendsen, Kari', type: 'Plan pause', description: 'Wants break from training for 2 weeks', notes: 'Exam period', priority: 'low', status: 'resolved', createdAt: '2025-12-28T09:00:00Z', resolvedAt: '2025-12-29T11:00:00Z', responseNote: 'Approved. Plan paused Jan 6-20.' },
];

// ============================================================
// GROUPS
// ============================================================

export const groups: Group[] = [
  { id: 'g1', name: 'A-kategorien', type: 'Custom', memberCount: 4, members: ['1', '3', '6', '10'], hasPlan: true, createdAt: '2025-09-01T00:00:00Z' },
  { id: 'g2', name: 'B-kategorien', type: 'Custom', memberCount: 4, members: ['2', '5', '8', '12'], hasPlan: true, createdAt: '2025-09-01T00:00:00Z' },
  { id: 'g3', name: 'WANG Toppidrett', type: 'WANG', memberCount: 3, members: ['3', '6', '10'], hasPlan: true, createdAt: '2025-08-15T00:00:00Z' },
  { id: 'g4', name: 'Team Norway U18', type: 'Team Norway', memberCount: 2, members: ['3', '10'], hasPlan: false, createdAt: '2025-10-01T00:00:00Z' },
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

export function getAthleteById(id: string): Athlete | undefined {
  return athleteList.find(a => a.id === id);
}

export function getUnreadAlerts(): Alert[] {
  return alertsFeed.filter(a => !a.isRead);
}

export function getAlertsForAthlete(athleteId: string): Alert[] {
  return alertsFeed.filter(a => a.athleteId === athleteId);
}

export function getBookingSlotsForDate(date: string): BookingSlot[] {
  return bookingSlots.filter(b => b.date === date);
}

export function getBookingStats() {
  const booked = bookingSlots.filter(b => b.status === 'booked').length;
  const pending = bookingSlots.filter(b => b.status === 'pending').length;
  const available = bookingSlots.filter(b => b.status === 'available').length;
  const blocked = bookingSlots.filter(b => b.status === 'blocked').length;
  return { booked, pending, available, blocked, total: bookingSlots.length };
}

export function getAthletesWithPlan(): Athlete[] {
  return athleteList.filter(a => a.hasPlan);
}

export function getAthletesWithoutPlan(): Athlete[] {
  return athleteList.filter(a => !a.hasPlan);
}

export function getExercisesByCategory(category: Exercise['category']): Exercise[] {
  return exercises.filter(e => e.category === category);
}

export function getFavoriteExercises(): Exercise[] {
  return exercises.filter(e => e.isFavorite);
}
