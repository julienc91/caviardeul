export const firstGameDate = new Date(2022, 4, 27);

const SCHEME = process.env.NEXT_PUBLIC_SCHEME || "https";

export const BASE_URL =
  `${SCHEME}://` +
  (process.env.NEXT_PUBLIC_BASE_DOMAIN ||
    process.env.NEXT_PUBLIC_VERCEL_URL ||
    "caviardeul.fr");

export const DEPRECATED_DOMAIN =
  process.env.NEXT_PUBLIC_DEPRECATED_DOMAIN || "caviardeul.julienc.io";
