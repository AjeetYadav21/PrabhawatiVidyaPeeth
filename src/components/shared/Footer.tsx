import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { SITE_NAME, type AppLocale } from "@/lib/constants";
import { getLocalizedText, getTextLines } from "@/lib/content-utils";
import type { ContactContent, FooterContent } from "@/types/content";

type FooterProps = {
  locale: AppLocale;
  footer: FooterContent;
  contact: ContactContent;
};

function getLocalizedHref(href: string, locale: AppLocale) {
  if (!href) {
    return `/${locale}`;
  }

  if (
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:")
  ) {
    return href;
  }

  if (href.startsWith("#")) {
    return `/${locale}${href}`;
  }

  if (href.startsWith("/admin") || href.startsWith("/api/") || href.startsWith(`/${locale}`)) {
    return href;
  }

  if (href.startsWith("/")) {
    return `/${locale}${href}`;
  }

  return `/${locale}/${href.replace(/^\/+/, "")}`;
}

function isExternalHref(href: string) {
  return (
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:")
  );
}

export default async function Footer({ locale, footer, contact }: FooterProps) {
  const t = await getTranslations({ locale });
  const currentYear = new Date().getFullYear();
  const addressLines = getTextLines(getLocalizedText(contact.info.address, locale));

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <div className="logo" style={{ marginBottom: "1rem" }}>
              <Image
                src="/images/logo.png"
                alt={`${SITE_NAME} Logo`}
                className="logo-img"
                width={56}
                height={56}
              />
              <span className="logo-text">{SITE_NAME}</span>
            </div>
            <p style={{ marginBottom: "1rem" }}>{getLocalizedText(footer.aboutText, locale)}</p>
          </div>

          <div className="footer-section">
            <h3>{t("footer_quick")}</h3>
            {footer.quickLinks.map((link, index) => {
              const href = getLocalizedHref(link.href, locale);
              const label = getLocalizedText(link.text, locale);

              if (isExternalHref(href)) {
                return (
                  <a key={`footer-quick-${index}`} href={href} className="footer-link" target="_blank" rel="noreferrer">
                    {label}
                  </a>
                );
              }

              return (
                <Link key={`footer-quick-${index}`} href={href} className="footer-link">
                  {label}
                </Link>
              );
            })}
          </div>

          <div className="footer-section">
            <h3>{t("footer_academics_section")}</h3>
            {footer.academicLinks.map((link, index) => {
              const href = getLocalizedHref(link.href, locale);
              const label = getLocalizedText(link.text, locale);

              if (isExternalHref(href)) {
                return (
                  <a key={`footer-academic-${index}`} href={href} className="footer-link" target="_blank" rel="noreferrer">
                    {label}
                  </a>
                );
              }

              return (
                <Link key={`footer-academic-${index}`} href={href} className="footer-link">
                  {label}
                </Link>
              );
            })}
          </div>

          <div className="footer-section">
            <h3>{t("footer_contact_section")}</h3>
            {addressLines.map((line) => (
              <p key={line}>{line}</p>
            ))}
            <p>{contact.info.phone}</p>
            <p>{contact.info.email}</p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>{t("footer_copyright").replace("2024", String(currentYear))}</p>
        </div>
      </div>
    </footer>
  );
}
