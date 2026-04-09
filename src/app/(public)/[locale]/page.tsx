import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import ContactForm from "@/components/public/ContactForm";
import GalleryLightbox from "@/components/public/GalleryLightbox";
import ScrollReveal from "@/components/public/ScrollReveal";
import StarsAnimation from "@/components/public/StarsAnimation";
import { DEFAULT_LOCALE, SITE_NAME, SITE_URL, SUPPORTED_LOCALES, type AppLocale } from "@/lib/constants";
import { formatDisplayDate, getLocalizedText, getTextLines } from "@/lib/content-utils";
import { getPublicHomeContent } from "@/lib/public-home-content";
import type { LocalizedText } from "@/types/content";

export const revalidate = 60;

type LocaleHomePageProps = {
  params: Promise<{ locale: string }>;
};

const emptyText: LocalizedText = {
  en: "",
  hi: ""
};

export async function generateMetadata({ params }: LocaleHomePageProps): Promise<Metadata> {
  const { locale } = await params;
  const safeLocale = hasLocale(SUPPORTED_LOCALES, locale) ? locale : DEFAULT_LOCALE;
  const content = await getPublicHomeContent();
  const appLocale = safeLocale as AppLocale;
  const heroTitle = getLocalizedText(content.hero.title, appLocale) || SITE_NAME;
  const description =
    getLocalizedText(content.hero.subtitle1, appLocale) ||
    getLocalizedText(content.about.paragraphs[0]?.text ?? emptyText, appLocale);
  const title = heroTitle === SITE_NAME ? SITE_NAME : `${heroTitle} | ${SITE_NAME}`;

  return {
    title,
    description,
    keywords: [
      "Prabhawati Vidyapeeth", "school", "Ballia", "Uttar Pradesh", "education",
      "CBSE", "10th class", "12th class", "Sahatwar", "best school in Ballia"
    ],
    robots: { index: true, follow: true },
    alternates: {
      canonical: `${SITE_URL}/${safeLocale}`,
      languages: {
        en: `${SITE_URL}/en`,
        hi: `${SITE_URL}/hi`,
        "x-default": `${SITE_URL}/en`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/${safeLocale}`,
      siteName: SITE_NAME,
      type: "website",
      locale: safeLocale === "en" ? "en_US" : "hi_IN",
      images: [{ url: "/images/preview.jpg", width: 1200, height: 630, alt: SITE_NAME }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/images/preview.jpg"],
    },
    other: {
      "geo.region": "IN-UP",
      "geo.placename": "Sahatwar, Ballia, Uttar Pradesh",
      "geo.position": "25.7617;84.1458",
      "ICBM": "25.7617, 84.1458",
    },
  };
}

export default async function LocaleHomePage({ params }: LocaleHomePageProps) {
  const { locale } = await params;

  if (!hasLocale(SUPPORTED_LOCALES, locale)) {
    notFound();
  }

  const appLocale = locale as AppLocale;
  const t = await getTranslations({ locale: appLocale });
  const content = await getPublicHomeContent();
  const heroStyle = {
    ["--hero-background-image" as string]: `url('${content.hero.backgroundImage || "/images/banners/PV-banner-1.jpg"}')`
  } as CSSProperties;
  const hoursLines = getTextLines(getLocalizedText(content.contact.info.hours, appLocale));
  const addressLines = getTextLines(getLocalizedText(content.contact.info.address, appLocale));

  return (
    <>
      <section className="hero section" id="home" style={heroStyle}>
        <StarsAnimation />
        <div className="container">
          <div className="hero-content fade-in">
            <h1 className="hero-title">{getLocalizedText(content.hero.title, appLocale)}</h1>
            <p className="hero-subtitle">{getLocalizedText(content.hero.subtitle1, appLocale)}</p>
            <p className="hero-subtitle">{getLocalizedText(content.hero.subtitle2, appLocale)}</p>
            <div className="hero-cta">
              {content.hero.ctaButtons.map((button, index) => (
                <a
                  key={`${button.link}-${index}`}
                  href={button.link}
                  className={`btn btn-lg ${index === 0 ? "btn-secondary" : "btn-outline"}`.trim()}
                >
                  {getLocalizedText(button.text, appLocale)}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {content.announcements.length > 0 ? (
        <section className="section section-alt" style={{ paddingTop: "3rem", paddingBottom: "3rem" }}>
          <div className="container">
            <ScrollReveal className="section-header">
              <h2 className="section-title">{t("updates_title")}</h2>
              <p className="section-subtitle">{t("updates_subtitle")}</p>
            </ScrollReveal>

            <div className="grid grid-2" style={{ gap: "1.5rem" }}>
              {content.announcements.map((announcement, index) => (
                <ScrollReveal key={`${announcement.date}-${index}`}>
                  <article className="card" style={{ padding: "1.5rem" }}>
                    <p style={{ color: "var(--color-secondary)", fontWeight: 700, marginBottom: "0.5rem" }}>
                      {formatDisplayDate(announcement.date, appLocale)}
                    </p>
                    <h3 style={{ marginBottom: "0.75rem" }}>
                      {getLocalizedText(announcement.title, appLocale)}
                    </h3>
                    <p style={{ marginBottom: 0 }}>{getLocalizedText(announcement.content, appLocale)}</p>
                  </article>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="section" id="about">
        <div className="container">
          <ScrollReveal className="section-header">
            <h2 className="section-title">{t("about_title")}</h2>
            <p className="section-subtitle">{t("about_subtitle")}</p>
          </ScrollReveal>

          <div className="grid grid-2" style={{ alignItems: "center", gap: "3rem" }}>
            <ScrollReveal>
              <Image
                src={content.about.campusImage}
                alt="Prabhawati Vidyapeeth School Campus"
                width={720}
                height={520}
                style={{ borderRadius: "1rem", boxShadow: "var(--shadow-xl)" }}
              />
            </ScrollReveal>

            <ScrollReveal>
              <h3 style={{ marginBottom: "1.5rem" }}>{t("about_vision_title")}</h3>
              {content.about.paragraphs.map((paragraph, index) => (
                <p key={`about-paragraph-${index}`} style={{ marginBottom: index === content.about.paragraphs.length - 1 ? "1.5rem" : "1rem" }}>
                  {getLocalizedText(paragraph.text, appLocale)}
                </p>
              ))}
              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                <a href="#contact" className="btn btn-primary">
                  {t("about_btn")}
                </a>
                <a
                  href={content.about.upBoardLink}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-secondary"
                >
                  {t("visit_board")}
                </a>
              </div>
            </ScrollReveal>
          </div>

          <div className="grid grid-2" style={{ gap: "2rem", marginTop: "3rem", alignItems: "center" }}>
            <ScrollReveal className="card" style={{ padding: "2rem" }}>
              <h3>{t("principal_title")}</h3>
              <p style={{ fontWeight: 700, color: "var(--color-primary)", marginBottom: "1rem" }}>
                {getLocalizedText(content.about.principalMessage.name, appLocale)}
              </p>
              <p style={{ marginBottom: 0 }}>
                {getLocalizedText(content.about.principalMessage.message, appLocale)}
              </p>
            </ScrollReveal>

            <ScrollReveal>
              <Image
                src={content.about.principalMessage.image}
                alt={getLocalizedText(content.about.principalMessage.name, appLocale)}
                width={620}
                height={460}
                style={{ borderRadius: "1rem", boxShadow: "var(--shadow-xl)", objectFit: "cover" }}
              />
            </ScrollReveal>
          </div>
        </div>
      </section>

      <section className="section section-alt" id="academics">
        <div className="container">
          <ScrollReveal className="section-header">
            <h2 className="section-title">{t("academics_title")}</h2>
            <p className="section-subtitle">{t("academics_subtitle")}</p>
          </ScrollReveal>

          <div className="grid grid-3">
            {content.academics.levels.map((level, index) => (
              <ScrollReveal key={`level-${index}`}>
                <article className="card feature-card">
                  <Image src={level.icon} alt={getLocalizedText(level.name, appLocale)} width={72} height={72} />
                  <h3>{getLocalizedText(level.name, appLocale)}</h3>
                  <p style={{ fontWeight: 600, marginBottom: "0.75rem" }}>
                    {getLocalizedText(level.grades, appLocale)}
                  </p>
                  <p>{getLocalizedText(level.description, appLocale)}</p>
                </article>
              </ScrollReveal>
            ))}
          </div>

          <div className="grid grid-2" style={{ marginTop: "3rem", gap: "2rem" }}>
            <ScrollReveal className="card" style={{ padding: "1.75rem" }}>
              <h3>{t("core_subjects_title")}</h3>
              <ul style={{ display: "grid", gap: "0.75rem", listStyle: "disc", paddingLeft: "1.25rem" }}>
                {content.academics.subjects.map((subject, index) => (
                  <li key={`subject-${index}`}>{getLocalizedText(subject.name, appLocale)}</li>
                ))}
              </ul>
            </ScrollReveal>

            <ScrollReveal className="card" style={{ padding: "1.75rem" }}>
              <h3>{t("language_options_title")}</h3>
              <ul style={{ display: "grid", gap: "0.75rem", listStyle: "disc", paddingLeft: "1.25rem" }}>
                {content.academics.languages.map((language, index) => (
                  <li key={`language-${index}`}>{getLocalizedText(language.name, appLocale)}</li>
                ))}
              </ul>
              <p style={{ marginTop: "1rem", color: "var(--color-text-light)" }}>{t("language_note")}</p>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <section className="section" id="why-us">
        <div className="container">
          <ScrollReveal className="section-header">
            <h2 className="section-title">{t("why_title")}</h2>
            <p className="section-subtitle">{t("why_subtitle")}</p>
          </ScrollReveal>
          <div className="grid grid-4">
            {content.whyUs.features.map((feature, index) => (
              <ScrollReveal key={`feature-${index}`}>
                <article className="card feature-card">
                  <i className={feature.icon} style={{ fontSize: "2rem", color: "var(--color-secondary)" }} />
                  <h3>{getLocalizedText(feature.title, appLocale)}</h3>
                  <p>{getLocalizedText(feature.description, appLocale)}</p>
                </article>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-alt" id="hall-of-fame">
        <div className="container">
          <ScrollReveal className="section-header">
            <h2 className="section-title">{t("hall_title")}</h2>
            <p className="section-subtitle">{t("hall_subtitle")}</p>
          </ScrollReveal>

          <div className="grid grid-2" style={{ gap: "2rem" }}>
            <ScrollReveal className="card" style={{ padding: "1.75rem" }}>
              <h3>{t("toppers_2024")}</h3>
              <div className="grid grid-2" style={{ gap: "1rem" }}>
                {content.hallOfFame.toppers.map((topper, index) => (
                  <article key={`topper-${index}`} className="topper-card">
                    <Image
                      src={topper.image}
                      alt={topper.name}
                      width={120}
                      height={120}
                      className="topper-image"
                    />
                    <h4 className="topper-name">{topper.name}</h4>
                    <p className="topper-percentage">{topper.score}</p>
                    <p className="topper-rank">{`${topper.class} | ${topper.year}`}</p>
                  </article>
                ))}
              </div>
            </ScrollReveal>

            <ScrollReveal className="card" style={{ padding: "1.75rem" }}>
              <h3>{t("achievements_title")}</h3>
              <div style={{ display: "grid", gap: "1rem" }}>
                {content.hallOfFame.achievements.map((achievement, index) => (
                  <article key={`achievement-${index}`} className="achievement-card">
                    <i className={`${achievement.icon} achievement-icon`} />
                    <h4 className="achievement-title">{getLocalizedText(achievement.title, appLocale)}</h4>
                    <p style={{ color: "rgba(255, 255, 255, 0.88)", marginTop: "0.75rem", marginBottom: 0 }}>
                      {getLocalizedText(achievement.description, appLocale)}
                    </p>
                  </article>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {content.gallery.length > 0 ? (
        <section className="section" id="gallery">
          <div className="container">
            <ScrollReveal className="section-header">
              <h2 className="section-title">{t("gallery_title")}</h2>
              <p className="section-subtitle">{t("gallery_subtitle")}</p>
            </ScrollReveal>

            <GalleryLightbox images={content.gallery} locale={appLocale} />
          </div>
        </section>
      ) : null}

      {content.events.length > 0 ? (
        <section className="section section-alt" id="events">
          <div className="container">
            <ScrollReveal className="section-header">
              <h2 className="section-title">{t("events_title")}</h2>
              <p className="section-subtitle">{t("events_subtitle")}</p>
            </ScrollReveal>

            <div className="grid grid-3">
              {content.events.map((event, index) => (
                <ScrollReveal key={`event-${index}`}>
                  <article className="card">
                    <Image src={event.image} alt={getLocalizedText(event.title, appLocale)} width={480} height={320} />
                    <div style={{ padding: "1.5rem" }}>
                      <p style={{ color: "var(--color-secondary)", fontWeight: 700, marginBottom: "0.5rem" }}>
                        {formatDisplayDate(event.date, appLocale)}
                      </p>
                      <h3 style={{ marginBottom: "0.75rem" }}>{getLocalizedText(event.title, appLocale)}</h3>
                      <p style={{ marginBottom: 0 }}>{getLocalizedText(event.description, appLocale)}</p>
                    </div>
                  </article>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="section" id="admissions">
        <div className="container">
          <ScrollReveal className="section-header">
            <h2 className="section-title">{t("admissions_title")}</h2>
            <p className="section-subtitle">{t("admissions_subtitle")}</p>
          </ScrollReveal>

          <div className="grid grid-2" style={{ gap: "2rem" }}>
            <ScrollReveal className="card" style={{ padding: "1.75rem" }}>
              <h3>{t("admission_process")}</h3>
              <ol style={{ display: "grid", gap: "0.9rem", paddingLeft: "1.25rem" }}>
                {content.admissions.steps.map((step) => (
                  <li key={`step-${step.number}`}>
                    <strong>{getLocalizedText(step.title, appLocale)}:</strong> {getLocalizedText(step.description, appLocale)}
                  </li>
                ))}
              </ol>
            </ScrollReveal>

            <ScrollReveal className="card" style={{ padding: "1.75rem" }}>
              <h3>{t("required_docs_title")}</h3>
              <ul style={{ display: "grid", gap: "0.75rem", listStyle: "disc", paddingLeft: "1.25rem" }}>
                {content.admissions.documents.map((document, index) => (
                  <li key={`document-${index}`}>{getLocalizedText(document.text, appLocale)}</li>
                ))}
              </ul>
            </ScrollReveal>
          </div>

          <div className="grid grid-2" style={{ gap: "2rem", marginTop: "2rem" }}>
            <ScrollReveal className="card" style={{ padding: "1.75rem" }}>
              <h3>{t("inquiry_title")}</h3>
              <p>{getLocalizedText(content.admissions.inquiryInfo.text, appLocale)}</p>
              <p style={{ marginBottom: "0.5rem" }}>
                <strong>{t("phone_label")}:</strong> {content.admissions.inquiryInfo.phone}
              </p>
              <p style={{ marginBottom: 0 }}>
                <strong>{t("email_label")}:</strong> {content.admissions.inquiryInfo.email}
              </p>
            </ScrollReveal>

            <ScrollReveal className="card" style={{ padding: "1.75rem" }}>
              <h3>{t("inquiry_help")}</h3>
              <p>{t("inquiry_help_text")}</p>
              <a href="#contact" className="btn btn-primary">
                {t("inquiry_form")}
              </a>
            </ScrollReveal>
          </div>

          <ScrollReveal style={{ textAlign: "center", marginTop: "2.5rem" }}>
            <Link
              href={`/${appLocale}/registration`}
              className="btn btn-primary"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: "1.1rem",
                padding: "0.85rem 2.2rem",
              }}
            >
              <i className="fa-solid fa-file-pen"></i>
              {t("apply_online")}
            </Link>
          </ScrollReveal>
        </div>
      </section>

      <section className="section section-alt" id="contact">
        <div className="container">
          <ScrollReveal className="section-header">
            <h2 className="section-title">{t("contact_title")}</h2>
            <p className="section-subtitle">{t("contact_subtitle")}</p>
          </ScrollReveal>

          <div className="grid grid-2" style={{ gap: "2rem" }}>
            <ScrollReveal className="card" style={{ padding: "1.75rem" }}>
              <h3>{t("contact_form_title")}</h3>
              <ContactForm />
            </ScrollReveal>

            <ScrollReveal className="card" style={{ padding: "1.75rem" }}>
              <h3>{t("contact_info_title")}</h3>
              <div style={{ display: "grid", gap: "0.75rem" }}>
                <div>
                  <strong>{t("address_label")}:</strong>
                  {addressLines.map((line) => (
                    <p key={line} style={{ marginBottom: 0 }}>{line}</p>
                  ))}
                </div>
                <p style={{ marginBottom: 0 }}>
                  <strong>{t("phone_label")}:</strong> {content.contact.info.phone}
                </p>
                <p style={{ marginBottom: 0 }}>
                  <strong>{t("email_label")}:</strong> {content.contact.info.email}
                </p>
                <div>
                  <strong>{t("hours_label")}:</strong>
                  {hoursLines.map((line) => (
                    <p key={line} style={{ marginBottom: 0 }}>{line}</p>
                  ))}
                </div>
              </div>
              <div style={{ marginTop: "1.5rem" }}>
                <Image src={content.contact.tourImage} alt="Campus tour" width={640} height={400} />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </>
  );
}

