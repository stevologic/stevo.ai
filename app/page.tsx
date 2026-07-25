import type { Metadata } from "next";
import { PortfolioExperience } from "@/components/PortfolioExperience";
import { githubSyncedAt, projects } from "@/lib/project-data";

export const metadata: Metadata = {
  title: "Stephen M Abbott — Cybersecurity & AI Enablement",
  description:
    "Cybersecurity and AI enablement consulting from Stephen M Abbott: security leadership, AI governance, secure delivery, application security, and supply-chain assurance.",
  alternates: {
    canonical: "/",
  },
};

export default function Home() {
  return <PortfolioExperience projects={projects} syncedAt={githubSyncedAt} />;
}
