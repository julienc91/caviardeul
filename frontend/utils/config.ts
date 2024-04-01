export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL as string;

export const API_URL = process.env.NEXT_PUBLIC_API_URL as string;

export const COOKIE_MAX_AGE = 60 * 60 * 24 * 366; // 1 year in seconds

export const LAST_SEEN_AT_UPDATE_THRESHOLD = 60 * 60; // 1h in seconds
