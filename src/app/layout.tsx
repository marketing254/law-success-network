import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import MotionLayer from "@/components/site/MotionLayer";
import "./lmn.css";

/**
 * Fonts are loaded through next/font rather than a Google Fonts <link>. Same
 * two faces as the static build (Fraunces display, Inter body), but self-hosted
 * at build time, which removes the site's only third-party request.
 *
 * The CSS variables below are the ones lmn.css already consumes.
 */
const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://lawmembernetwork.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title:
    "Law Member Network — The membership network for law firm owners | Powered by Dominate Law",
  description:
    "The Law Member Network connects law firm owners with vetted experts, practical resource kits, member-only partner deals, live AMAs and a community of fellow owners. Powered by Dominate Law. Founding membership $49/mo for the first 100 members — locked for life.",
  icons: { icon: "/assets/favicon.png" },
  openGraph: {
    type: "website",
    siteName: "Law Member Network",
    title: "Law Member Network — The membership network for law firm owners",
    description:
      "Expert Hotline, practical resource kits, member-only partner deals, live AMAs and a community of fellow firm owners. Powered by Dominate Law.",
    url: "/",
  },
  twitter: { card: "summary" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    /*
      suppressHydrationWarning is required, not incidental: the script below
      adds `js` to this element before React hydrates, so the server HTML and
      the client DOM legitimately differ by that one class. The warning is
      suppressed for this element's attributes only, one level deep, so it
      cannot mask a real mismatch anywhere in the tree below.
    */
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/*
          The hero's entrance animation hides its lines until the motion layer
          runs. That hiding is gated on `html.js` so the page stays fully
          readable without JavaScript — which is why the class cannot simply be
          rendered server-side. It has to be set synchronously before first
          paint, otherwise the hero paints, then hides, then animates.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: "document.documentElement.classList.add('js')",
          }}
        />
      </head>
      <body>
        {/*
          Mounted once, globally. It must cover EVERY public page: `.reveal`
          starts at opacity:0 and only becomes visible when the observer adds
          `.in`, so a page rendered without this component is a blank page.
        */}
        <MotionLayer />
        {children}
      </body>
    </html>
  );
}
