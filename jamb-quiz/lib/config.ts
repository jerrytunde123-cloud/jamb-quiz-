/**
 * Single source of truth for all app configuration.
 *
 * Edit here; every consumer imports from this file.
 */

// ──────────────────────────────────────────────────────────────
// App identity
// ──────────────────────────────────────────────────────────────
export const APP = {
  name: "SUCCESS ACADEMY · UTME LAB",
  tagline: "JAMB/WAEC Practice",
  shortName: "SUCCESS ACADEMY",
  description:
    "Practice 1000+ JAMB & WAEC questions. 15 questions · 5 minutes · randomised every attempt.",
  url: "https://utmelab.com",
  logo: "/logo.png",
} as const

// ──────────────────────────────────────────────────────────────
// WhatsApp channels — the gate depends on these
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
// Community links (header / footer / assistance panel)
// ──────────────────────────────────────────────────────────────
export const COMMUNITY = {
  whatsapp: "https://wa.me/2349114187843?text=Hi%2C%20I%20need%20JAMB%20assistance",
  telegram: "https://t.me/Officialkingjay1",
  telegramGroup: "https://t.me/freewassceditto",
  contact: "https://t.me/Officialkingjay1",
  vercel: "https://jamb-lab.vercel.app",
} as const

// ──────────────────────────────────────────────────────────────
// Quiz behaviour
// ──────────────────────────────────────────────────────────────
export const QUIZ = {
  questionsPerAttempt: 15,
  durationSeconds: 5 * 60,
  sessionTtlMinutes: 30,
  maxOptions: 6,
  nickname: {
    maxLength: 20,
    storageKey: "jamb-quiz:nickname:v1",
  },
  gate: {
    storageKey: "jamb-quiz:whatsapp-gate:v1",
    durationDays: 30, // kept for any legacy reads; new flow uses sessionStorage only
  },
  recents: {
    maxItems: 4,
    storageKey: "jamb_recent_subjects",
  },
  streak: {
    storageKey: "jamb_daily_streak",
    lastDateKey: "jamb_last_practice_date",
  },
  bestScore: {
    storageKeyPrefix: "best_",
  },
} as const

// ──────────────────────────────────────────────────────────────
// UTME Lab API
// ──────────────────────────────────────────────────────────────
export const UTME_LAB = {
  baseUrl: "https://utmelab.com/api",
  examCode: "JAMB",
  cache: {
    subjectsEtagKey: "subjects_catalog_etag",
    questionsPrefix: "questions_",
    passagesPrefix: "passages_",
  },
} as const

// ──────────────────────────────────────────────────────────────
// Database (Turso / libSQL)
// ──────────────────────────────────────────────────────────────
export const DB = {
  tables: {
    sessions: "sessions",
    attempts: "attempts",
    likes: "likes",
    comments: "comments",
    appCache: "app_cache",
  },
} as const

// ──────────────────────────────────────────────────────────────
// Admin
// ──────────────────────────────────────────────────────────────
export const ADMIN = {
  cookieName: "jamb_admin",
  cookieMaxAge: 60 * 60 * 24 * 7, // 7 days
} as const

// ──────────────────────────────────────────────────────────────
// Colours (mirror the CSS variables for programmatic use)
// ──────────────────────────────────────────────────────────────
export const COLORS = {
  brand: "#f5a623",
  brand2: "#ff6b35",
  brandGradient: "linear-gradient(135deg, #f5a623 0%, #ff6b35 100%)",
  whatsapp: "#25d366",
  whatsappDark: "#128c7e",
  whatsappText: "#052e16",
  telegram: "#229ed9",
  success: "#22c55e",
  destructive: "#ef4444",
  background: "#0d1117",
  card: "#161b22",
  border: "#30363d",
  muted: "#8b949e",
  foreground: "#e6edf3",
} as const

// ──────────────────────────────────────────────────────────────
// WhatsApp channel type with optional followers
// ──────────────────────────────────────────────────────────────
export type WhatsAppChannel = {
  id: "main" | "utme"
  name: string
  description: string
  code: string
  required: boolean
  followers?: string
}

// ──────────────────────────────────────────────────────────────
// Derived helpers
// ──────────────────────────────────────────────────────────────
export function whatsappChannelWebUrl(code: string): string {
  return `https://whatsapp.com/channel/${code}`
}

/**
 * Backward-compatible helper.
 * Old signature: whatsappChannelHref(code)
 * New signature: whatsappChannelHref(code, useAppScheme)
 * Defaults to web URL for backward compatibility.
 */
export function whatsappChannelHref(
  code: string,
  useAppScheme?: boolean
): string {
  return useAppScheme ? whatsappChannelAppUrl(code) : whatsappChannelWebUrl(code)
}

/** @deprecated Use whatsappChannelHref(code, true) instead */
export function whatsappChannelAppUrl(code: string): string {
  return `whatsapp://channel/${code}`
}