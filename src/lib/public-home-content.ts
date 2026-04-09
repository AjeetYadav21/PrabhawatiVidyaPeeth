import { cache } from "react";
import { connectDB } from "@/lib/db";
import {
  AboutModel,
  AcademicsModel,
  AdmissionsModel,
  AnnouncementsModel,
  ContactModel,
  EventsModel,
  FooterModel,
  GalleryModel,
  HallOfFameModel,
  HeroModel,
  WhyUsModel
} from "@/lib/models";
import { sanitizeDocument } from "@/lib/section-registry";
import {
  aboutSeed,
  academicsSeed,
  admissionsSeed,
  announcementsSeed,
  contactSeed,
  eventsSeed,
  footerSeed,
  gallerySeed,
  hallOfFameSeed,
  heroSeed,
  whyUsSeed
} from "@/scripts/seed-data";
import type {
  AboutContent,
  AcademicsContent,
  AdmissionsContent,
  Announcement,
  ContactContent,
  EventItem,
  FooterContent,
  GalleryItem,
  HallOfFameContent,
  HeroContent,
  WhyUsContent
} from "@/types/content";

export type PublicHomeContent = {
  hero: HeroContent;
  about: AboutContent;
  academics: AcademicsContent;
  whyUs: WhyUsContent;
  hallOfFame: HallOfFameContent;
  gallery: GalleryItem[];
  events: EventItem[];
  admissions: AdmissionsContent;
  contact: ContactContent;
  announcements: Announcement[];
  footer: FooterContent;
};

const fallbackContent: PublicHomeContent = {
  hero: heroSeed,
  about: aboutSeed,
  academics: academicsSeed,
  whyUs: whyUsSeed,
  hallOfFame: hallOfFameSeed,
  gallery: gallerySeed,
  events: eventsSeed,
  admissions: admissionsSeed,
  contact: contactSeed,
  announcements: announcementsSeed.filter((item) => item.isActive),
  footer: footerSeed
};

function toPlain<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function readSingleton<T>(document: unknown, fallback: T) {
  return document ? (sanitizeDocument(document) as T) : toPlain(fallback);
}

function readCollection<T>(documents: unknown[]) {
  return documents.map((document) => sanitizeDocument(document) as T);
}

export const getPublicHomeContent = cache(async (): Promise<PublicHomeContent> => {
  try {
    await connectDB();

    const [hero, about, academics, whyUs, hallOfFame, gallery, events, admissions, contact, announcements, footer] = await Promise.all([
      HeroModel.findOne({ slug: "default" }).lean(),
      AboutModel.findOne({ slug: "default" }).lean(),
      AcademicsModel.findOne({ slug: "default" }).lean(),
      WhyUsModel.findOne({ slug: "default" }).lean(),
      HallOfFameModel.findOne({ slug: "default" }).lean(),
      GalleryModel.find({}).sort({ createdAt: 1 }).lean(),
      EventsModel.find({}).sort({ date: -1, createdAt: 1 }).lean(),
      AdmissionsModel.findOne({ slug: "default" }).lean(),
      ContactModel.findOne({ slug: "default" }).lean(),
      AnnouncementsModel.find({ isActive: true }).sort({ date: -1, createdAt: -1 }).lean(),
      FooterModel.findOne({ slug: "default" }).lean()
    ]);

    return {
      hero: readSingleton<HeroContent>(hero, heroSeed),
      about: readSingleton<AboutContent>(about, aboutSeed),
      academics: readSingleton<AcademicsContent>(academics, academicsSeed),
      whyUs: readSingleton<WhyUsContent>(whyUs, whyUsSeed),
      hallOfFame: readSingleton<HallOfFameContent>(hallOfFame, hallOfFameSeed),
      gallery: readCollection<GalleryItem>(gallery),
      events: readCollection<EventItem>(events),
      admissions: readSingleton<AdmissionsContent>(admissions, admissionsSeed),
      contact: readSingleton<ContactContent>(contact, contactSeed),
      announcements: readCollection<Announcement>(announcements),
      footer: readSingleton<FooterContent>(footer, footerSeed)
    };
  } catch {
    return toPlain(fallbackContent);
  }
});
