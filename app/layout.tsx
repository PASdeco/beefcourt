import type { Metadata, Viewport } from "next";
import { Fraunces, Manrope } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { NetworkBanner } from "@/components/NetworkBanner";
import { SITE_URL } from "@/lib/constants";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const description =
  "You tell your side. They tell theirs. A bench of independent AI validators on GenLayer reads both, rules, and splits the stake. No favourites, no mods, no more dishes drama.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Beef Court | Settle it. For good.",
    template: "%s | Beef Court",
  },
  description,
  applicationName: "Beef Court",
  keywords: [
    "Beef Court",
    "GenLayer",
    "AI dispute resolution",
    "on-chain court",
    "AI judge",
    "StudioNet",
  ],
  authors: [{ name: "Beef Court" }],
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Beef Court",
    title: "Beef Court | Settle it. For good.",
    description,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Beef Court — settle it for good",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Beef Court | Settle it. For good.",
    description,
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F7F4F1" },
    { media: "(prefers-color-scheme: dark)", color: "#150A0E" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const themeScript = `
(function(){
  try {
    var stored = localStorage.getItem('bc-theme');
    if (stored === 'light' || stored === 'dark') {
      document.documentElement.dataset.theme = stored;
    }
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${manrope.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <Providers>
          <Header />
          <NetworkBanner />
          <main id="main">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
