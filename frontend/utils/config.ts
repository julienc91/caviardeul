export const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ||
  (process.env.NEXT_PUBLIC_VERCEL_ENV === "production"
    ? "https://caviardeul.fr"
    : `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`);

export const COOKIE_MAX_AGE = 60 * 60 * 24 * 366; // 1 year in seconds

export const LAST_SEEN_AT_UPDATE_THRESHOLD = 60 * 60; // 1h in seconds
export const ADMIN_CLEANUP_LAST_SEEN_AT_THRESHOLD = 60 * 60 * 24 * 180; // 6 months in seconds
