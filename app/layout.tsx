import type { Metadata, Viewport } from "next";
import "./globals.css";

const siteUrl = "https://stevo.ai";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Stephen M Abbott — Applied AI & Cybersecurity",
    template: "%s · stevo.ai",
  },
  description:
    "AI systems, cybersecurity, product engineering, and advisory services from Stephen M Abbott.",
  applicationName: "stevo.ai",
  authors: [{ name: "Stephen M Abbott", url: siteUrl }],
  creator: "Stephen M Abbott",
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
    title: "Stephen M Abbott — Applied AI & Cybersecurity",
    description: "Build what's next. Secure what matters.",
    images: [
      {
        url: "/og.png",
        width: 1731,
        height: 909,
        alt: "Stephen M Abbott — Build what's next. Secure what matters.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Stephen M Abbott — Applied AI & Cybersecurity",
    description: "Build what's next. Secure what matters.",
    images: ["/og.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0f0d",
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
