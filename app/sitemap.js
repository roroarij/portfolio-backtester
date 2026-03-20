import { getFeaturedPortfolios, getFeaturedStockTickers, stockHubViews } from "@/lib/site-data";

const siteUrl = "https://stocksscreener.com";

function buildUrl(path) {
  return new URL(path, siteUrl).toString();
}

export default function sitemap() {
  const now = new Date();
  const staticRoutes = [
    { path: "/", changeFrequency: "daily", priority: 1 },
    { path: "/discover", changeFrequency: "daily", priority: 0.8 },
    { path: "/discover/portfolios", changeFrequency: "daily", priority: 0.8 },
    { path: "/markets", changeFrequency: "daily", priority: 0.8 },
    { path: "/portfolio", changeFrequency: "weekly", priority: 0.8 },
    { path: "/tools", changeFrequency: "weekly", priority: 0.8 },
    { path: "/tools/portfolio-backtester", changeFrequency: "daily", priority: 0.9 }
  ];

  const portfolioRoutes = getFeaturedPortfolios().map((portfolio) => ({
    url: buildUrl(`/portfolio/${portfolio.slug}`),
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7
  }));

  const stockRoutes = getFeaturedStockTickers().flatMap((ticker) => [
    {
      url: buildUrl(`/stocks/${ticker}`),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8
    },
    ...stockHubViews.map((view) => ({
      url: buildUrl(`/stocks/${ticker}/${view}`),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.7
    }))
  ]);

  return [
    ...staticRoutes.map((route) => ({
      url: buildUrl(route.path),
      lastModified: now,
      changeFrequency: route.changeFrequency,
      priority: route.priority
    })),
    ...portfolioRoutes,
    ...stockRoutes
  ];
}
