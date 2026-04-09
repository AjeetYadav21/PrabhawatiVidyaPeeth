"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { SUPPORTED_LOCALES } from "@/lib/constants";

export default function LanguageToggle() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const nextLocale = locale === "en" ? "hi" : "en";

  const handleToggle = () => {
    const segments = pathname.split("/");

    if (SUPPORTED_LOCALES.includes(segments[1] as (typeof SUPPORTED_LOCALES)[number])) {
      segments[1] = nextLocale;
    } else {
      segments.splice(1, 0, nextLocale);
    }

    const nextPath = segments.join("/") || `/${nextLocale}`;
    document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=31536000`;
    router.replace(nextPath);
  };

  return (
    <button
      className="lang-toggle"
      id="langToggle"
      aria-label={locale === "en" ? "Switch to Hindi" : "Switch to English"}
      onClick={handleToggle}
      type="button"
    >
      {locale === "en" ? "HI" : "EN"}
    </button>
  );
}
