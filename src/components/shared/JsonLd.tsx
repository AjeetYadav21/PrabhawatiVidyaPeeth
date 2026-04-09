import { SITE_NAME, SITE_URL, type AppLocale } from "@/lib/constants";
import { getLocalizedText } from "@/lib/content-utils";
import type { AboutContent, ContactContent, HeroContent, LocalizedText } from "@/types/content";

type JsonLdProps = {
  locale: AppLocale;
  hero: HeroContent;
  about: AboutContent;
  contact: ContactContent;
};

const emptyText: LocalizedText = {
  en: "",
  hi: ""
};

export default function JsonLd({ locale, hero, about, contact }: JsonLdProps) {
  const description =
    getLocalizedText(hero.subtitle1, locale) ||
    getLocalizedText(about.paragraphs[0]?.text ?? emptyText, locale);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: SITE_NAME,
    url: `${SITE_URL}/${locale}`,
    logo: `${SITE_URL}/images/logo.png`,
    description,
    address: {
      "@type": "PostalAddress",
      streetAddress: getLocalizedText(contact.info.address, locale),
      addressLocality: "Ballia",
      addressRegion: "Uttar Pradesh",
      addressCountry: "IN"
    },
    telephone: contact.info.phone
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
    email: contact.info.email,
    availableLanguage: ["en", "hi"],
    educationalCredentialAwarded: ["High School Diploma (10th)", "Intermediate (12th)"],
    audience: {
      "@type": "EducationalAudience",
      educationalRole: "student"
    },
    image: `${SITE_URL}${about.campusImage}`
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
