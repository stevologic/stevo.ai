import type { Metadata } from "next";
import { PortfolioExperience } from "@/components/PortfolioExperience";
import { faqItems } from "@/lib/faq";
import { practice } from "@/lib/practice";
import { githubSyncedAt, projects } from "@/lib/project-data";

export const metadata: Metadata = {
  title: practice.socialTitle,
  description: practice.socialDescription,
  alternates: {
    canonical: "/",
  },
};

/**
 * FAQPage markup belongs only on the page that renders the FAQ. Site-wide
 * nodes (organization, person, portfolio) live in app/layout.tsx; this one
 * mirrors the visible FAQ section, both reading lib/faq.ts so the marked-up
 * answers can never disagree with what a visitor reads.
 */
const faqStructuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "@id": "https://stevo.ai/#faq",
  mainEntity: faqItems.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

export default function Home() {
  return (
    <>
      <PortfolioExperience projects={projects} syncedAt={githubSyncedAt} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />
    </>
  );
}
