import type { Model } from "mongoose";
import {
  AboutModel,
  AcademicsModel,
  AdminUserModel,
  AdmissionsModel,
  AnnouncementsModel,
  ContactModel,
  ContactSubmissionModel,
  EventsModel,
  FooterModel,
  GalleryModel,
  HallOfFameModel,
  HeroModel,
  WhyUsModel
} from "@/lib/models";

/* eslint-disable @typescript-eslint/no-explicit-any */
type RegistryEntry = {
  type: "singleton" | "collection";
  model: Model<any>;
  sort?: Record<string, 1 | -1>;
};
/* eslint-enable @typescript-eslint/no-explicit-any */

export const sectionNames = [
  "hero",
  "about",
  "academics",
  "whyUs",
  "hallOfFame",
  "gallery",
  "events",
  "admissions",
  "contact",
  "announcements",
  "footer"
] as const;

export type SectionName = (typeof sectionNames)[number];

export const sectionRegistry: Record<SectionName, RegistryEntry> = {
  hero: {
    type: "singleton",
    model: HeroModel
  },
  about: {
    type: "singleton",
    model: AboutModel
  },
  academics: {
    type: "singleton",
    model: AcademicsModel
  },
  whyUs: {
    type: "singleton",
    model: WhyUsModel
  },
  hallOfFame: {
    type: "singleton",
    model: HallOfFameModel
  },
  gallery: {
    type: "collection",
    model: GalleryModel,
    sort: { createdAt: 1 }
  },
  events: {
    type: "collection",
    model: EventsModel,
    sort: { date: -1, createdAt: 1 }
  },
  admissions: {
    type: "singleton",
    model: AdmissionsModel
  },
  contact: {
    type: "singleton",
    model: ContactModel
  },
  announcements: {
    type: "collection",
    model: AnnouncementsModel,
    sort: { date: -1, createdAt: -1 }
  },
  footer: {
    type: "singleton",
    model: FooterModel
  }
};

export const adminCollections = {
  adminUsers: AdminUserModel,
  contactSubmissions: ContactSubmissionModel
} as const;

export function isSectionName(section: string): section is SectionName {
  return sectionNames.includes(section as SectionName);
}

export function getSectionConfig(section: string) {
  if (!isSectionName(section)) {
    return null;
  }

  return sectionRegistry[section];
}

export function sanitizeDocument<T>(document: T) {
  if (!document) {
    return document;
  }

  const value = JSON.parse(JSON.stringify(document)) as Record<string, unknown>;
  delete value.__v;

  if (value.slug === "default") {
    delete value.slug;
  }

  return value;
}
