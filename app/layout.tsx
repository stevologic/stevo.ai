import type { Metadata, Viewport } from "next";
import { socialProfileUrls, voiceLine } from "@/lib/contact";
import { credentials } from "@/lib/credentials";
import { practice } from "@/lib/practice";
import { projects } from "@/lib/project-data";
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
        url: `${siteUrl}/stephen-abbott-resume.png`,
        width: 680,
        height: 680,
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
        url: `${siteUrl}/stephen-abbott-resume.png`,
        alt: practice.socialImageAlt,
        width: 680,
        height: 680,
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
  referrer: "strict-origin-when-cross-origin",
};

/**
 * GitHub Pages cannot send response headers, so the content security policy
 * ships as a meta tag — the only delivery a static host allows. It exists as
 * defense in depth: the site is fully self-contained, so anything reaching
 * for another origin (an injected script, pixel, or exfiltration call) is a
 * compromise and gets blocked. script-src needs 'unsafe-inline' because the
 * framework inlines its bootstrap payload; frame-ancestors is omitted because
 * browsers ignore it in meta delivery. Production-only: the dev server's hot
 * reload needs eval, which this policy deliberately refuses.
 */
const contentSecurityPolicy = [
  "default-src 'none'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "manifest-src 'self'",
  "form-action 'none'",
  "base-uri 'none'",
  "upgrade-insecure-requests",
].join("; ");

export const viewport: Viewport = {
  themeColor: "#0f1014",
  colorScheme: "dark",
};

/**
 * Wire Hold lives on its own domain. stevo.ai only names the employer so
 * Person is the primary entity here and the two brands stay separate.
 * founder belongs on Organization, not Person.
 */
const personId = `${siteUrl}/#stephen-abbott`;
const wireHoldId = "https://www.wirehold.com/#organization";

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": personId,
      name: practice.name,
      url: `${siteUrl}/resume/`,
      image: `${siteUrl}/stephen-abbott-field-notes.webp`,
      jobTitle: practice.jobTitle,
      telephone: voiceLine.e164,
      worksFor: { "@id": wireHoldId },
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
      "@type": "Organization",
      "@id": wireHoldId,
      name: "Wire Hold",
      legalName: "Wirehold LLC",
      url: "https://www.wirehold.com",
      founder: { "@id": personId },
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
        {/* React hoists meta tags into <head>. */}
        {process.env.NODE_ENV === "production" ? (
          <meta
            httpEquiv="Content-Security-Policy"
            content={contentSecurityPolicy}
          />
        ) : null}
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </body>
    </html>
  );
}
