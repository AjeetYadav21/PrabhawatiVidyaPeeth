import type { ReactNode } from "react";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import BackToTop from "@/components/shared/BackToTop";
import Footer from "@/components/shared/Footer";
import Header from "@/components/shared/Header";
import Preloader from "@/components/public/Preloader";
import ConsoleBranding from "@/components/shared/ConsoleBranding";
import JsonLd from "@/components/shared/JsonLd";
import { SUPPORTED_LOCALES, type AppLocale } from "@/lib/constants";
import { getPublicHomeContent } from "@/lib/public-home-content";

type PublicLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function PublicLayout({ children, params }: PublicLayoutProps) {
  const { locale } = await params;

  if (!hasLocale(SUPPORTED_LOCALES, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();
  const appLocale = locale as AppLocale;
  const content = await getPublicHomeContent();

  return (
    <NextIntlClientProvider messages={messages}>
      <Preloader />
      <ConsoleBranding />
      <Header />
      <main>{children}</main>
      <Footer locale={appLocale} footer={content.footer} contact={content.contact} />
      <BackToTop />
      <JsonLd locale={appLocale} hero={content.hero} about={content.about} contact={content.contact} />
    </NextIntlClientProvider>
  );
}
