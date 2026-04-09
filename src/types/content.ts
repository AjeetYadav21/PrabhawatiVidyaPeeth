export interface LocalizedText {
  en: string;
  hi: string;
}

export interface CallToAction {
  text: LocalizedText;
  link: string;
}

export interface HeroContent {
  title: LocalizedText;
  subtitle1: LocalizedText;
  subtitle2: LocalizedText;
  ctaButtons: CallToAction[];
  backgroundImage: string;
}

export interface AboutParagraph {
  text: LocalizedText;
}

export interface PrincipalMessage {
  name: LocalizedText;
  image: string;
  message: LocalizedText;
}

export interface AboutContent {
  campusImage: string;
  paragraphs: AboutParagraph[];
  upBoardLink: string;
  principalMessage: PrincipalMessage;
}

export interface AcademicLevel {
  name: LocalizedText;
  icon: string;
  grades: LocalizedText;
  description: LocalizedText;
}

export interface AcademicSubject {
  name: LocalizedText;
  icon: string;
}

export interface AcademicLanguage {
  name: LocalizedText;
}

export interface AcademicsContent {
  levels: AcademicLevel[];
  subjects: AcademicSubject[];
  languages: AcademicLanguage[];
}

export interface WhyUsFeature {
  title: LocalizedText;
  description: LocalizedText;
  icon: string;
}

export interface WhyUsContent {
  features: WhyUsFeature[];
}

export interface Topper {
  name: string;
  class: string;
  year: string;
  image: string;
  score: string;
}

export interface Achievement {
  title: LocalizedText;
  description: LocalizedText;
  icon: string;
}

export interface HallOfFameContent {
  toppers: Topper[];
  achievements: Achievement[];
}

export interface GalleryItem {
  image: string;
  caption: LocalizedText;
  category: string;
}

export interface GalleryContent {
  items: GalleryItem[];
}

export interface EventItem {
  title: LocalizedText;
  description: LocalizedText;
  date: string;
  image: string;
}

export interface EventsContent {
  events: EventItem[];
}

export interface AdmissionStep {
  number: number;
  title: LocalizedText;
  description: LocalizedText;
}

export interface AdmissionDocument {
  text: LocalizedText;
}

export interface InquiryInfo {
  phone: string;
  email: string;
  text: LocalizedText;
}

export interface AdmissionsContent {
  steps: AdmissionStep[];
  documents: AdmissionDocument[];
  inquiryInfo: InquiryInfo;
}

export interface ContactInfo {
  address: LocalizedText;
  phone: string;
  email: string;
  hours: LocalizedText;
}

export interface ContactContent {
  info: ContactInfo;
  tourImage: string;
}

export interface Announcement {
  title: LocalizedText;
  content: LocalizedText;
  date: string;
  isActive: boolean;
}

export interface AnnouncementsContent {
  announcements: Announcement[];
}

export interface FooterLink {
  text: LocalizedText;
  href: string;
}

export interface FooterContent {
  aboutText: LocalizedText;
  quickLinks: FooterLink[];
  academicLinks: FooterLink[];
}
