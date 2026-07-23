import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://stevo.ai",
      lastModified: new Date("2026-07-23"),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: "https://stevo.ai/resume/",
      lastModified: new Date("2026-07-23"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];
}
