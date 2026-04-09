import fs from "node:fs";
import path from "node:path";
import { connectDB } from "../lib/db";
import { hashPassword } from "../lib/auth";
import {
  AboutModel,
  AcademicsModel,
  AdminUserModel,
  AdmissionsModel,
  AnnouncementsModel,
  ContactModel,
  EventsModel,
  FooterModel,
  GalleryModel,
  HallOfFameModel,
  HeroModel,
  WhyUsModel
} from "../lib/models";
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
} from "./seed-data";

function loadLocalEnv() {
  const envPath = path.join(process.cwd(), ".env.local");

  if (!fs.existsSync(envPath)) {
    return;
  }

  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function seedSingleton(model: import("mongoose").Model<any>, data: any) {
  await model.findOneAndUpdate(
    { slug: "default" },
    { ...data, slug: "default" },
    {
      upsert: true,
      new: true,
      runValidators: true,
      setDefaultsOnInsert: true
    }
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function reseedCollection(model: import("mongoose").Model<any>, data: any[]) {
  await model.deleteMany({});

  if (data.length > 0) {
    await model.insertMany(data);
  }
}

async function seed() {
  loadLocalEnv();

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error("Missing ADMIN_EMAIL or ADMIN_PASSWORD environment variable");
  }

  await connectDB();

  const passwordHash = await hashPassword(adminPassword);

  await AdminUserModel.findOneAndUpdate(
    { email: adminEmail },
    { email: adminEmail, passwordHash },
    {
      upsert: true,
      new: true,
      runValidators: true,
      setDefaultsOnInsert: true
    }
  );

  await seedSingleton(HeroModel, heroSeed);
  await seedSingleton(AboutModel, aboutSeed);
  await seedSingleton(AcademicsModel, academicsSeed);
  await seedSingleton(WhyUsModel, whyUsSeed);
  await seedSingleton(HallOfFameModel, hallOfFameSeed);
  await seedSingleton(AdmissionsModel, admissionsSeed);
  await seedSingleton(ContactModel, contactSeed);
  await seedSingleton(FooterModel, footerSeed);

  await reseedCollection(GalleryModel, gallerySeed);
  await reseedCollection(EventsModel, eventsSeed);
  await reseedCollection(AnnouncementsModel, announcementsSeed);

  const counts = {
    hero: await HeroModel.countDocuments({ slug: "default" }),
    about: await AboutModel.countDocuments({ slug: "default" }),
    academics: await AcademicsModel.countDocuments({ slug: "default" }),
    whyUs: await WhyUsModel.countDocuments({ slug: "default" }),
    hallOfFame: await HallOfFameModel.countDocuments({ slug: "default" }),
    gallery: await GalleryModel.countDocuments(),
    events: await EventsModel.countDocuments(),
    admissions: await AdmissionsModel.countDocuments({ slug: "default" }),
    contact: await ContactModel.countDocuments({ slug: "default" }),
    announcements: await AnnouncementsModel.countDocuments(),
    footer: await FooterModel.countDocuments({ slug: "default" }),
    adminUsers: await AdminUserModel.countDocuments({ email: adminEmail })
  };

  console.log("Seed completed", counts);
}

seed()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("Seed failed", error);
    process.exit(1);
  });

