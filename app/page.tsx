import type { Metadata } from "next";
import { PortfolioExperience } from "@/components/PortfolioExperience";
import { practice } from "@/lib/practice";
import { githubSyncedAt, projects } from "@/lib/project-data";

export const metadata: Metadata = {
  title: practice.socialTitle,
  description: practice.socialDescription,
  alternates: {
    canonical: "/",
  },
};

export default function Home() {
  return <PortfolioExperience projects={projects} syncedAt={githubSyncedAt} />;
}
