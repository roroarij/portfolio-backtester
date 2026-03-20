import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  SITE_URL,
  SITEMAP_CHUNK_SIZE,
  buildPortfolioRouteEntries,
  buildRobotsTxt,
  buildSitemapIndexXml,
  buildSitemapXml,
  buildStaticRouteEntries,
  buildStockRouteEntries,
  chunkEntries,
  gzipXml,
  normalizeTickerUniverse
} from "../lib/sitemap.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const dataDir = path.join(projectRoot, "data");
const publicDir = path.join(projectRoot, "public");
const sitemapsDir = path.join(publicDir, "sitemaps");
const tickerUniversePath = path.join(dataDir, "ticker-universe.json");

async function ensureDir(dir) {
  await mkdir(dir, { recursive: true });
}

async function fetchSecTickerUniverse() {
  const response = await fetch("https://www.sec.gov/files/company_tickers.json", {
    headers: {
      "user-agent": "Stocks Screener sitemap bot rosenzweigss4@gmail.com",
      "accept": "application/json"
    },
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`SEC ticker universe request failed (${response.status})`);
  }

  const payload = await response.json();
  const records = Object.values(payload).map((entry) => ({
    cik: entry.cik_str,
    ticker: entry.ticker,
    title: entry.title
  }));

  return normalizeTickerUniverse(records);
}

async function loadTickerUniverse() {
  try {
    const records = await fetchSecTickerUniverse();
    await ensureDir(dataDir);
    await writeFile(tickerUniversePath, JSON.stringify(records, null, 2) + "\n", "utf8");
    return records;
  } catch (error) {
    try {
      const cached = await readFile(tickerUniversePath, "utf8");
      return JSON.parse(cached);
    } catch {
      throw error;
    }
  }
}

function buildChildSitemaps(tickerUniverse, now = new Date()) {
  const staticEntries = buildStaticRouteEntries(now);
  const portfolioEntries = buildPortfolioRouteEntries(now);
  const stockEntries = buildStockRouteEntries(tickerUniverse, now);

  const childSitemaps = [
    {
      path: "/sitemaps/static.xml.gz",
      xml: buildSitemapXml(staticEntries)
    },
    {
      path: "/sitemaps/portfolios-1.xml.gz",
      xml: buildSitemapXml(portfolioEntries)
    },
    ...chunkEntries(stockEntries, SITEMAP_CHUNK_SIZE).map((entries, index) => ({
      path: `/sitemaps/stocks-${index + 1}.xml.gz`,
      xml: buildSitemapXml(entries)
    }))
  ];

  return childSitemaps;
}

async function writeArtifacts() {
  const now = new Date();
  const tickerUniverse = await loadTickerUniverse();

  await ensureDir(publicDir);
  await rm(sitemapsDir, { recursive: true, force: true });
  await ensureDir(sitemapsDir);

  const childSitemaps = buildChildSitemaps(tickerUniverse, now);

  await Promise.all(
    childSitemaps.map((sitemap) =>
      writeFile(path.join(publicDir, sitemap.path.replace(/^\//, "")), gzipXml(sitemap.xml))
    )
  );

  const sitemapIndexXml = buildSitemapIndexXml(childSitemaps.map((entry) => entry.path), now);

  await writeFile(path.join(publicDir, "sitemap.xml"), sitemapIndexXml, "utf8");
  await writeFile(path.join(publicDir, "robots.txt"), buildRobotsTxt() + "\n", "utf8");

  console.log(
    JSON.stringify(
      {
        siteUrl: SITE_URL,
        tickerCount: tickerUniverse.length,
        stockUrlCount: tickerUniverse.length * 6,
        sitemapCount: childSitemaps.length,
        chunkSize: SITEMAP_CHUNK_SIZE,
        index: "/sitemap.xml",
        children: childSitemaps.map((entry) => entry.path)
      },
      null,
      2
    )
  );
}

await writeArtifacts();
