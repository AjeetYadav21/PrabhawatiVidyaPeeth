export const SITE_NAME = "Prabhawati Vidyapeeth";
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://prabhawatividyapeeth.in";
export const DEFAULT_LOCALE = "en";
export const SUPPORTED_LOCALES = ["en", "hi"] as const;
export const ADMIN_COOKIE_NAME = "admin-token";
export const JWT_EXPIRATION = "24h";

export type AppLocale = (typeof SUPPORTED_LOCALES)[number];
