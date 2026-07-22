import type { MetadataRoute } from "next";
import { allAgreementSlugs } from "@/lib/agreements";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://lawmembernetwork.com";

/** Public pages only. /admin and /founding are deliberately absent. */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    { url: `${SITE_URL}/`, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/experts`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/partners`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/agreements`, lastModified, changeFrequency: "yearly", priority: 0.4 },
    ...allAgreementSlugs().map((slug) => ({
      url: `${SITE_URL}/agreements/${slug}`,
      lastModified,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    })),
  ];
}
