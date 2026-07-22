import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://lawmembernetwork.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // /agreements IS public and indexable: these are the terms anyone signing
      // up is agreeing to, and there is no reason to hide them.
      // /founding carries private invitation terms deliberately absent from
      // every public page, so it stays out.
      disallow: ["/admin", "/founding", "/api"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
