import type { Metadata } from "next";
import DocumentLink from "@/components/DocumentLink";
import { notFound } from "next/navigation";
import { retiredServiceSlugs } from "@/lib/services";

// GitHub Pages cannot issue server redirects. Keep these published URLs usable
// as noindex archives with explicit navigation and no service or contact pitch.
export const dynamicParams = false;

export function generateStaticParams() {
  return retiredServiceSlugs.map((slug) => ({ slug }));
}

export const metadata: Metadata = {
  title: "Page retired",
  description: "This page has been retired. Visit Stephen Abbott's personal background, projects, and résumé.",
  alternates: { canonical: "/" },
  robots: { index: false, follow: true },
};

export default async function RetiredPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!retiredServiceSlugs.some((retired) => retired === slug)) notFound();

  return (
    <main className="not-found-page">
      <h1>This page has been retired.</h1>
      <p>stevo.ai is Stephen Abbott&apos;s personal site: background, projects, and résumé.</p>
      <nav aria-label="Continue exploring">
        <DocumentLink className="button button-primary" href="/">Visit the homepage</DocumentLink>{" "}
        <DocumentLink className="button button-secondary" href="/resume/">Read the résumé</DocumentLink>
      </nav>
    </main>
  );
}
