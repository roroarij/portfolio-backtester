import { gzipSync } from "node:zlib";

import { canonicalStaticRoutes, getFeaturedPortfolios, stockHubViews } from "./site-data.js";

export const SITE_URL = "https://stocksscreener.com";
export const SITEMAP_CHUNK_SIZE = 10000;
export const STOCK_TICKER_PATTERN = /^[A-Z0-9.-]+$/;

export function normalizeTickerUniverse(records) {
  return records
    .map((record) => ({
      cik: Number(record.cik),
      ticker: String(record.ticker || "").trim().toUpperCase(),
      title: String(record.title || "").trim()
    }))
    .filter((record) => record.ticker && STOCK_TICKER_PATTERN.test(record.ticker))
    .filter((record, index, array) => array.findIndex((entry) => entry.ticker === record.ticker) === index)
    .sort((left, right) => left.ticker.localeCompare(right.ticker));
}

export function buildStaticRouteEntries(now = new Date()) {
  return canonicalStaticRoutes.map(({ path, changeFrequency, priority }) => ({
    url: new URL(path, SITE_URL).toString(),
    lastModified: now.toISOString(),
    changeFrequency,
    priority
  }));
}

export function buildPortfolioRouteEntries(now = new Date()) {
  return getFeaturedPortfolios().map((portfolio) => ({
    url: new URL(`/portfolio/${portfolio.slug}`, SITE_URL).toString(),
    lastModified: now.toISOString(),
    changeFrequency: "weekly",
    priority: 0.7
  }));
}

export function buildStockRouteEntries(tickers, now = new Date()) {
  return tickers.flatMap((record) => [
    {
      url: new URL(`/stocks/${record.ticker}`, SITE_URL).toString(),
      lastModified: now.toISOString(),
      changeFrequency: "daily",
      priority: 0.8
    },
    ...stockHubViews.map((view) => ({
      url: new URL(`/stocks/${record.ticker}/${view}`, SITE_URL).toString(),
      lastModified: now.toISOString(),
      changeFrequency: "daily",
      priority: 0.7
    }))
  ]);
}

export function chunkEntries(entries, chunkSize = SITEMAP_CHUNK_SIZE) {
  const chunks = [];

  for (let index = 0; index < entries.length; index += chunkSize) {
    chunks.push(entries.slice(index, index + chunkSize));
  }

  return chunks;
}

export function buildSitemapXml(entries) {
  const urls = entries
    .map((entry) => {
      const tags = [
        `<loc>${entry.url}</loc>`,
        entry.lastModified ? `<lastmod>${entry.lastModified}</lastmod>` : "",
        entry.changeFrequency ? `<changefreq>${entry.changeFrequency}</changefreq>` : "",
        Number.isFinite(entry.priority) ? `<priority>${entry.priority.toFixed(1)}</priority>` : ""
      ]
        .filter(Boolean)
        .join("");

      return `<url>${tags}</url>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;
}

export function buildSitemapIndexXml(paths, now = new Date()) {
  const items = paths
    .map((path) => `<sitemap><loc>${new URL(path, SITE_URL).toString()}</loc><lastmod>${now.toISOString()}</lastmod></sitemap>`)
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>` +
    `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${items}</sitemapindex>`;
}

export function gzipXml(xml) {
  return gzipSync(Buffer.from(xml, "utf8"));
}

export function buildRobotsTxt() {
  return [
    "User-agent: *",
    "Allow: /",
    "Disallow: /api/",
    "Disallow: /_next/",
    `Sitemap: ${SITE_URL}/sitemap.xml`
  ].join("\n");
}
