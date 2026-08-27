import type { MetadataRoute } from "next";
import { serviceTracks } from "@/lib/services";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://stevo.ai",
      lastModified: new Date("2026-08-26"),
      changeFrequency: "weekly",
      priority: 1,
    },
    // Derived from the tracks, so a new service page can never be forgotten.
    ...serviceTracks.map((track) => ({
      url: `https://stevo.ai/services/${track.page.slug}/`,
      lastModified: new Date("2026-08-26"),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    {
      url: "https://stevo.ai/resume/",
      lastModified: new Date("2026-07-23"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];
}
