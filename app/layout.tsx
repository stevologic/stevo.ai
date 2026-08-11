import type { Metadata, Viewport } from "next";
import { socialProfileUrls } from "@/lib/contact";
import { credentials } from "@/lib/credentials";
import { projects } from "@/lib/project-data";
import { serviceTracks } from "@/lib/services";
import "./globals.css";

const siteUrl = "https://stevo.ai";
const socialTitle = "Stephen M Abbott — Cybersecurity & AI Executive";
const socialDescription =
  "Open to full-time CISO, VP Cybersecurity, and VP AI Enablement opportunities; providing vCISO and AI-native cybersecurity and IT consulting; building founder-led products.";
const socialImageAlt =
  "Stephen M Abbott: cybersecurity and AI executive, vCISO and consultant, and founder.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Stephen M Abbott — Cybersecurity & AI Executive",
    template: "%s · stevo.ai",
  },
  description:
    "Open to full-time CISO, VP Cybersecurity, and VP AI Enablement opportunities; providing vCISO and AI-native cybersecurity and IT consulting; building founder-led products.",
  applicationName: "stevo.ai",
  category: "technology",
  authors: [{ name: "Stephen M Abbott", url: siteUrl }],
  creator: "Stephen M Abbott",
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
  keywords: [
    "cybersecurity consultant",
    "AI enablement consultant",
    "full-time security leadership",
    "Chief Information Security Officer",
    "CISO",
    "VP Cybersecurity",
    "VP AI Enablement",
    "vCISO services",
    "cybersecurity and IT consulting",
    "AI-native enterprise",
    "technology founder",
    "AI governance",
    "AI security",
    "cybersecurity",
    "AI agents",
    "MCP",
    "application security",
    "supply chain security",
    "product engineering",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "stevo.ai",
    title: socialTitle,
    description: socialDescription,
    images: [
      {
        url: `${siteUrl}/og-executive.png`,
        width: 1734,
        height: 907,
        type: "image/png",
        alt: socialImageAlt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: socialTitle,
    description: socialDescription,
    images: [
      {
        url: `${siteUrl}/og-executive.png`,
        alt: socialImageAlt,
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
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "Stephen M Abbott",
      url: siteUrl,
      logo: `${siteUrl}/icon-512.png`,
      description: socialDescription,
      employee: { "@id": `${siteUrl}/#stephen-abbott` },
      founder: { "@id": `${siteUrl}/#stephen-abbott` },
      sameAs: socialProfileUrls,
      areaServed: "Worldwide",
      knowsAbout: [
        "Security program leadership",
        "Cybersecurity leadership",
        "Virtual CISO services",
        "Cybersecurity and IT consulting",
        "AI enablement",
        "AI governance",
        "Application security",
        "Software supply chain security",
      ],
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Professional services",
        itemListElement: serviceTracks.map((service) => ({
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: service.title,
            description: service.description,
            serviceType: service.label,
            provider: { "@id": `${siteUrl}/#organization` },
          },
        })),
      },
    },
    {
      "@type": "Person",
      "@id": `${siteUrl}/#stephen-abbott`,
      name: "Stephen M Abbott",
      url: `${siteUrl}/resume/`,
      image: `${siteUrl}/stephen-abbott-profile.png`,
      jobTitle: "Cybersecurity Executive and AI Enablement Leader",
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
      knowsAbout: [
        "Artificial intelligence",
        "Cybersecurity",
        "Executive cybersecurity leadership",
        "AI enablement strategy",
        "AI-native IT operations",
        "AI agents",
        "Software supply chain security",
        "Product engineering",
      ],
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
