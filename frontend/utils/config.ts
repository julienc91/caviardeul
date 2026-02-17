export const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "https://caviardeul.fr";
export const VERSION = process.env.NEXT_PUBLIC_VERSION || "dev";

const apiBase =
  typeof window === "undefined"
    ? process.env.INTERNAL_BASE_URL || BASE_URL
    : BASE_URL;
export const API_URL = `${apiBase}/api`;
