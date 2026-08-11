import type { Metadata } from "next";
import { PortfolioExperience } from "@/components/PortfolioExperience";
import { githubSyncedAt, projects } from "@/lib/project-data";

export const metadata: Metadata = {
  title: "Stephen M Abbott — Cybersecurity & AI Executive",
  description:
    "Open to full-time CISO, VP Cybersecurity, and VP AI Enablement opportunities; providing vCISO and AI-native cybersecurity and IT consulting; building founder-led products.",
  alternates: {
    canonical: "/",
  },
};

export default function Home() {
  return <PortfolioExperience projects={projects} syncedAt={githubSyncedAt} />;
}
