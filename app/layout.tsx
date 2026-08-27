import type { Metadata, Viewport } from "next";
import {
  decodeProtectedEmail,
  socialProfileUrls,
  voiceLine,
} from "@/lib/contact";
import { credentials } from "@/lib/credentials";
import { faqItems } from "@/lib/faq";
import { practice } from "@/lib/practice";
import { projects } from "@/lib/project-data";
import { servicePackages, serviceTracks } from "@/lib/services";
import "./globals.css";

const siteUrl = "https://stevo.ai";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: practice.socialTitle,
    template: "%s · stevo.ai",
  },
  description: practice.socialDescription,
  applicationName: "stevo.ai",
  category: "technology",
  authors: [{ name: practice.name, url: siteUrl }],
  creator: practice.name,
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    shortcut: [{ url: "/favicon.ico" }],
    apple: [
      {
        url: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Abbott",
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    "apple-mobile-web-app-capable": "yes",
  },
  keywords: [...practice.keywords],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "stevo.ai",
    title: practice.socialTitle,
    description: practice.socialDescription,
    images: [
      {
        url: `${siteUrl}/og-executive.png`,
        width: 1734,
        height: 907,
        type: "image/png",
        alt: practice.socialImageAlt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: practice.socialTitle,
    description: practice.socialDescription,
    images: [
      {
        url: `${siteUrl}/og-executive.png`,
        alt: practice.socialImageAlt,
        width: 1734,
        height: 907,
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#0f1014",
  colorScheme: "dark",
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["Organization", "ProfessionalService"],
      "@id": `${siteUrl}/#organization`,
      name: practice.name,
      url: siteUrl,
      logo: `${siteUrl}/icon-512.png`,
      description: practice.description,
      telephone: voiceLine.e164,
      employee: { "@id": `${siteUrl}/#stephen-abbott` },
      founder: { "@id": `${siteUrl}/#stephen-abbott` },
      sameAs: socialProfileUrls,
      areaServed: "Worldwide",
      knowsAbout: [...practice.knowsAbout],
      contactPoint: {
        "@type": "ContactPoint",
        telephone: voiceLine.e164,
        // Decoded at build time so the source stays masked; the rendered
        // contact section already prints this address in the clear.
        email: decodeProtectedEmail(),
        contactType: "customer service",
        name: voiceLine.label,
        availableLanguage: "English",
      },
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Consulting packages",
        itemListElement: servicePackages.map((servicePackage) => ({
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: servicePackage.title,
            description: servicePackage.description,
            serviceType: servicePackage.label,
            // Each offer points at its track's landing page.
            url: `${siteUrl}/services/${
              serviceTracks.find((track) => track.id === servicePackage.trackId)
                ?.page.slug
            }/`,
            provider: { "@id": `${siteUrl}/#organization` },
          },
        })),
      },
    },
    {
      "@type": "Person",
      "@id": `${siteUrl}/#stephen-abbott`,
      name: practice.name,
      url: `${siteUrl}/resume/`,
      image: `${siteUrl}/stephen-abbott-profile.png`,
      jobTitle: practice.jobTitle,
      telephone: voiceLine.e164,
      worksFor: { "@id": `${siteUrl}/#organization` },
      sameAs: socialProfileUrls,
      alumniOf: {
        "@type": "CollegeOrUniversity",
        name: "Arizona State University",
      },
      hasCredential: credentials
        .flatMap((credential) => credential.certifications ?? [])
        .map((certification) => ({
          "@type": "EducationalOccupationalCredential",
          credentialCategory: "certification",
          name: certification.name,
          recognizedBy: {
            "@type": "Organization",
            name: certification.issuer,
          },
        })),
      knowsAbout: [...practice.knowsAbout],
    },
    {
      // Mirrors the visible FAQ section; both read lib/faq.ts so the marked-up
      // answers can never disagree with what a visitor reads.
      "@type": "FAQPage",
      "@id": `${siteUrl}/#faq`,
      mainEntity: faqItems.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    },
    {
      "@type": "ItemList",
      "@id": `${siteUrl}/#founder-portfolio`,
      name: "Founder-built companies and products",
      url: `${siteUrl}/#work`,
      numberOfItems: projects.length,
      itemListElement: projects.map((project, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "CreativeWork",
          name: project.name,
          url: project.siteUrl,
          description: project.tagline,
          ...(project.sourceUrl ? { sameAs: project.sourceUrl } : {}),
        },
      })),
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </body>
    </html>
  );
}
