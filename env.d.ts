namespace NodeJS {
  interface ProcessEnv {
    ENCRYPTION_KEY: string;
    ADMIN_TOKEN: string;

    NEXT_PUBLIC_BASE_URL?: string;
    NEXT_PUBLIC_VERCEL_URL?: string;
    NEXT_PUBLIC_VERCEL_ENV?: string;

    EMAIL_FROM: string;
    EMAIL_ADMIN_TO: string;
    SMTP_HOSTNAME: string;
    SMTP_PORT?: string;
    SMTP_LOGIN: string;
    SMTP_PASSWORD: string;
  }
}
