/**
 * Only the values that are likely to change.
 * Design tokens, component structure, and fixed strings stay in their components.
 */

// ──────────────────────────────────────────────────────────────
// WhatsApp channels — gate depends on these
// ──────────────────────────────────────────────────────────────
export const WHATSAPP_CHANNELS = [
  {
    id: "main",
    name: "Main Channel",
    description: "Daily JAMB questions, exam tips, and study updates.",
    code: "0029Vb8Whka2P59oetvhwN3B",
    required: true,
    followers: "Join 13K+ students",
  },
  {
    id: "utme",
    name: "JAMB UTME",
    description: "More practice updates and announcements.",
    code: "0029VbDTOmB1t90jcv9gLf0q",
    required: true,
  },
] as const

export const OPTIONAL_CHANNEL = {
  name: "2027 JAMBITES",
  url: "https://wa.me/?text=Join%20me%20for%20free%20JAMB%20practice%20at%20SUCCESS%20ACADEMY%20UTME%20LAB",
} as const

// ──────────────────────────────────────────────────────────────
// Community links used in header, footer, assistance panel
// ──────────────────────────────────────────────────────────────
export const COMMUNITY = {
  whatsapp: "https://wa.me/2349114187843?text=Hi%2C%20I%20need%20JAMB%20assistance",
  telegram: "https://t.me/Officialkingjay1",
  telegramGroup: "https://t.me/freewassceditto",
  vercel: "https://jamb-lab.vercel.app",
} as const

// ──────────────────────────────────────────────────────────────
// UTME Lab API
// ──────────────────────────────────────────────────────────────
export const UTME_LAB = {
  baseUrl: "https://utmelab.com/api",
  examCode: "JAMB",
} as const

// ──────────────────────────────────────────────────────────────
// Storage keys (localStorage / sessionStorage)
// ──────────────────────────────────────────────────────────────
export const STORAGE = {
  nickname: "jamb-quiz:nickname:v1",
  gate: "jamb-quiz:whatsapp-gate:v1",
  recents: "jamb_recent_subjects",
  streak: "jamb_daily_streak",
  streakLastDate: "jamb_last_practice_date",
  bestPrefix: "best_",
} as const

// ──────────────────────────────────────────────────────────────
// Quiz constants
// ──────────────────────────────────────────────────────────────
export const QUIZ = {
  questionsPerAttempt: 15,
  durationSeconds: 5 * 60,
  sessionTtlMinutes: 30,
  maxOptions: 6,
  maxRecents: 4,
  maxNicknameLength: 20,
  maxCommentLength: 400,
} as const

// ──────────────────────────────────────────────────────────────
// Admin
// ──────────────────────────────────────────────────────────────
export const ADMIN = {
  cookieName: "jamb_admin",
  cookieMaxAge: 60 * 60 * 24 * 7,
} as const

// ──────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────
export function whatsappChannelWebUrl(code: string): string {
  return `https://whatsapp.com/channel/${code}`
}

export function whatsappChannelAppUrl(code: string): string {
  return `https://whatsapp.com/channel/${code}` // universal link
}

export function whatsappChannelHref(
  code: string,
  useAppScheme?: boolean
): string {
  return useAppScheme ? whatsappChannelAppUrl(code) : whatsappChannelWebUrl(code)
}

export type WhatsAppChannel = {
  id: "main" | "utme"
  name: string
  description: string
  code: string
  required: boolean
  followers?: string
}