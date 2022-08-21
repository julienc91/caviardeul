export const firstGameDate = new Date(2022, 4, 27);

export const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ||
  (process.env.NEXT_PUBLIC_VERCEL_ENV === "production"
    ? "https://caviardeul.fr"
    : `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`);

export const DEPRECATED_DOMAIN =
  process.env.NEXT_PUBLIC_DEPRECATED_DOMAIN || "caviardeul.julienc.io";
