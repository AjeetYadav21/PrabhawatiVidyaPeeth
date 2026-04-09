import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${SITE_URL}/en`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
      alternates: {
        languages: {
          en: `${SITE_URL}/en`,
          hi: `${SITE_URL}/hi`,
        },
      },
    },
    {
      url: `${SITE_URL}/en/registration`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
      alternates: {
        languages: {
          en: `${SITE_URL}/en/registration`,
          hi: `${SITE_URL}/hi/registration`,
        },
      },
    },
    {
      url: `${SITE_URL}/hi`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
      alternates: {
        languages: {
          en: `${SITE_URL}/en`,
          hi: `${SITE_URL}/hi`,
        },
      },
    },
    {
      url: `${SITE_URL}/hi/registration`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
      alternates: {
        languages: {
          en: `${SITE_URL}/en/registration`,
          hi: `${SITE_URL}/hi/registration`,
        },
      },
    },
  ];
}
