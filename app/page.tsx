import type { Metadata } from "next";
import { PortfolioExperience } from "@/components/PortfolioExperience";
import { githubSyncedAt, projects } from "@/lib/project-data";

export const metadata: Metadata = {
  title: "Stephen M Abbott — Applied AI & Cybersecurity",
  description:
    "Portfolio, professional profile, and advisory services from Stephen M Abbott: AI agents, cybersecurity, open-source infrastructure, and product engineering.",
  alternates: {
    canonical: "/",
  },
};

export default function Home() {
  return <PortfolioExperience projects={projects} syncedAt={githubSyncedAt} />;
}
