import type { Metadata, Viewport } from "next";
import "./globals.css";

const siteUrl = "https://stevo.ai";
const socialTitle = "Stephen M Abbott — Applied AI & Cybersecurity";
const socialDescription =
  "Build what's next. Secure what matters. Explore shipped AI products, open security infrastructure, enterprise security leadership, and advisory services.";
const socialImageAlt =
  "Stevo.AI social card for Stephen M Abbott: Build what's next. Secure what matters. Applied AI, cybersecurity, and product engineering.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Stephen M Abbott — Applied AI & Cybersecurity",
    template: "%s · stevo.ai",
  },
  description:
    "AI systems, cybersecurity, product engineering, and advisory services from Stephen M Abbott.",
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
        url: `${siteUrl}/og.png`,
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
        url: `${siteUrl}/og.png`,
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
  "@type": "Person",
  name: "Stephen M Abbott",
  url: siteUrl,
  image: `${siteUrl}/stephen-abbott-profile.png`,
  sameAs: ["https://github.com/stevologic"],
  knowsAbout: [
    "Artificial intelligence",
    "Cybersecurity",
    "AI agents",
    "Software supply chain security",
    "Product engineering",
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
