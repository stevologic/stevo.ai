import type { Metadata, Viewport } from "next";
import { socialProfileUrls } from "@/lib/contact";
import { credentials } from "@/lib/credentials";
import { serviceTracks } from "@/lib/services";
import "./globals.css";

const siteUrl = "https://stevo.ai";
const socialTitle = "Stevo.AI — vCISO, Cybersecurity & AI Enablement";
const socialDescription =
  "Principal-led cybersecurity and AI enablement consulting: vCISO services, AI governance, secure agent delivery, application security, and software supply-chain assurance.";
const socialImageAlt =
  "Stevo.AI: security leadership, AI enablement, vCISO services, cybersecurity consulting, and professional engagements led by Stephen M Abbott.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Stevo.AI — vCISO, Cybersecurity & AI Enablement",
    template: "%s · stevo.ai",
  },
  description:
    "Principal-led cybersecurity and AI enablement consulting, including vCISO services, AI governance, secure delivery, application security, and supply-chain assurance.",
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
    title: "Stevo.AI",
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    "apple-mobile-web-app-capable": "yes",
  },
  keywords: [
    "vCISO",
    "virtual CISO",
    "cybersecurity consultant",
    "AI enablement consultant",
    "fractional security leadership",
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
        url: `${siteUrl}/og-services.png`,
        width: 1731,
        height: 909,
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
        url: `${siteUrl}/og-services.png`,
        alt: socialImageAlt,
        width: 1731,
        height: 909,
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#15161c",
  colorScheme: "dark",
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "Stevo.AI",
      url: siteUrl,
      logo: `${siteUrl}/icon-512.png`,
      description: socialDescription,
      employee: { "@id": `${siteUrl}/#stephen-abbott` },
      founder: { "@id": `${siteUrl}/#stephen-abbott` },
      sameAs: socialProfileUrls,
      areaServed: "Worldwide",
      knowsAbout: [
        "vCISO services",
        "Cybersecurity leadership",
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
      jobTitle: "Cybersecurity and AI advisor",
      worksFor: { "@id": `${siteUrl}/#organization` },
      sameAs: socialProfileUrls,
      alumniOf: {
        "@type": "CollegeOrUniversity",
        name: "Arizona State University",
      },
      hasCredential: credentials
        .filter((credential) => credential.certification)
        .map((credential) => ({
          "@type": "EducationalOccupationalCredential",
          credentialCategory: "certification",
          name: credential.certification?.name,
          recognizedBy: {
            "@type": "Organization",
            name: credential.certification?.issuer,
          },
        })),
      knowsAbout: [
        "Artificial intelligence",
        "Cybersecurity",
        "AI agents",
        "Software supply chain security",
        "Product engineering",
      ],
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
