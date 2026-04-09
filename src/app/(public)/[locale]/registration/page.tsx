import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { SUPPORTED_LOCALES, type AppLocale } from "@/lib/constants";
import RegistrationForm from "@/components/public/RegistrationForm";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function RegistrationPage({ params }: Props) {
  const { locale } = await params;
  if (!hasLocale(SUPPORTED_LOCALES, locale)) notFound();

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem 1rem" }}>
      <RegistrationForm locale={locale as AppLocale} />
    </div>
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isHindi = locale === "hi";

  return {
    title: isHindi
      ? "छात्र पंजीकरण | Prabhawati Vidyapeeth"
      : "Student Registration | Prabhawati Vidyapeeth",
    description: isHindi
      ? "प्रभवती विद्यापीठ, सहतवार, बलिया में कक्षा 10वीं और 12वीं प्रवेश के लिए ऑनलाइन पंजीकरण करें।"
      : "Register online for Class 10th and 12th admission at Prabhawati Vidyapeeth, Sahatwar, Ballia."
  };
}
