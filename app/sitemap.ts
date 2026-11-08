import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";
import { getCases } from "@/lib/contract";

const ROUTES = ["", "/file", "/verdicts", "/leaderboard", "/how-it-works", "/faq", "/terms", "/privacy"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = ROUTES.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: now,
    changeFrequency: route === "" || route === "/verdicts" ? "daily" : "weekly",
    priority: route === "" ? 1 : route === "/file" || route === "/verdicts" ? 0.9 : 0.6,
  }));

  try {
    const data = await getCases(0, 50);
    const caseRoutes: MetadataRoute.Sitemap = data.cases.map((item) => ({
      url: `${SITE_URL}/case/${item.id}`,
      lastModified: new Date((item.settled_at || item.created_at) * 1000),
      changeFrequency: "weekly",
      priority: 0.7,
    }));
    return [...staticRoutes, ...caseRoutes];
  } catch {
    return staticRoutes;
  }
}
