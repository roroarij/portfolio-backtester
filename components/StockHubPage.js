import Link from "next/link";
import { notFound } from "next/navigation";

import StockPriceChart from "@/components/StockPriceChart";
import { getTickerFundamentalsData, getTickerNews, getTickerTechnicalAnalysis } from "@/lib/stocks";

const views = ["overview", "chart", "technical-analysis", "fundamentals", "leadership", "news"];
const viewLabels = {
  overview: "Overview",
  chart: "Chart",
  "technical-analysis": "Technical Analysis",
  fundamentals: "Fundamentals",
  leadership: "Leadership",
  news: "News"
};

function formatCurrency(value) {
  if (!Number.isFinite(value)) {
    return "Not available";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
    notation: Math.abs(value) >= 1_000_000_000 ? "compact" : "standard"
  }).format(value);
}

function formatPercent(value) {
  if (!Number.isFinite(value)) {
    return "Not available";
  }

  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

function formatRatio(value) {
  return Number.isFinite(value) ? value.toFixed(2) : "Not available";
}

function formatDate(value) {
  if (!value) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC"
  }).format(new Date(value));
}

function buildTabHref(ticker, view) {
  return view === "overview" ? `/stocks/${ticker}` : `/stocks/${ticker}/${view}`;
}

function getSectionLabel(view) {
  return viewLabels[view] || "Overview";
}

function getSummaryExcerpt(summary, maxSentences = 2) {
  if (!summary) {
    return null;
  }

  const sentences = summary
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean)
    .slice(0, maxSentences);

  if (!sentences.length) {
    return null;
  }

  return sentences.join(" ");
}

function getEntityDescription(stock) {
  return (
    getSummaryExcerpt(stock.businessSummary, 2) ||
    `${stock.name} trades on ${stock.exchange}${stock.sector ? ` in the ${stock.sector} sector` : ""}${stock.industry ? ` and ${stock.industry} industry` : ""}.`
  );
}

function getViewDescription(stock, selectedView) {
  const entityDescription = getEntityDescription(stock);

  if (selectedView === "overview") {
    return `${entityDescription} Use the sections below to move between chart, technical analysis, fundamentals, and news.`;
  }

  if (selectedView === "chart") {
    return `This chart view focuses on recent price action, range context, and interactive scrubbing for ${stock.ticker}.`;
  }

  if (selectedView === "technical-analysis") {
    return `This technical analysis view summarizes moving averages, RSI, momentum, and 52-week positioning for ${stock.ticker}.`;
  }

  if (selectedView === "fundamentals") {
    return `This fundamentals view focuses on valuation, growth, margins, and company profile data for ${stock.ticker}.`;
  }

  if (selectedView === "leadership") {
    return `This leadership view lists the top executives currently surfaced by the company profile source for ${stock.ticker}.`;
  }

  if (selectedView === "news") {
    return `This news view pulls recent coverage and headlines tied to ${stock.ticker}.`;
  }

  return entityDescription;
}

export async function getStockMetadata(rawTicker, selectedView = "overview") {
  const stock = await getTickerFundamentalsData(rawTicker);
  const sectionLabel = getSectionLabel(selectedView);
  const description = getViewDescription(stock, selectedView);

  return {
    title: `${stock.ticker} ${sectionLabel} | ${stock.name} | Stocks Screener`,
    description
  };
}

export async function loadStockHubData(ticker) {
  const [stock, news, technical] = await Promise.all([
    getTickerFundamentalsData(ticker),
    getTickerNews(ticker),
    getTickerTechnicalAnalysis(ticker)
  ]);

  return { stock, news, technical };
}

export default async function StockHubPage({ ticker, selectedView = "overview" }) {
  if (!views.includes(selectedView)) {
    notFound();
  }

  let stock;
  let news;
  let technical;

  try {
    ({ stock, news, technical } = await loadStockHubData(ticker));
  } catch {
    notFound();
  }

  return (
    <main className="app-shell">
      <section className="hero">
        <p className="eyebrow">{selectedView === "overview" ? "Stock Hub" : `${getSectionLabel(selectedView)}`}</p>
        <h1>
          {stock.ticker}
          <br />
          {selectedView === "overview" ? stock.name : `${stock.name} ${getSectionLabel(selectedView)}`}
        </h1>
        <p className="hero-copy">{getViewDescription(stock, selectedView)}</p>
        <div className="hero-actions">
          <Link className="primary-button" href={`/tools/portfolio-backtester?h=${stock.ticker}:10&r=5y`}>
            Backtest {stock.ticker}
          </Link>
          {stock.website ? (
            <a className="ghost-button" href={stock.website} target="_blank" rel="noreferrer">
              Company site
            </a>
          ) : null}
          <Link className="ghost-button" href="/discover">
            Back to discover
          </Link>
        </div>
      </section>

      <section className="panel feature-grid-panel">
        <div className="feature-grid">
          <article className="feature-card">
            <h3>Latest Close</h3>
            <p>{formatCurrency(stock.latestClose)}</p>
          </article>
          <article className="feature-card">
            <h3>{stock.range} Change</h3>
            <p>
              {formatCurrency(stock.change)} ({formatPercent(stock.changePct)})
            </p>
          </article>
          <article className="feature-card">
            <h3>Market Cap</h3>
            <p>{formatCurrency(stock.marketCap)}</p>
          </article>
          <article className="feature-card">
            <h3>Sector</h3>
            <p>{stock.sector || "Not available"}</p>
          </article>
          <article className="feature-card">
            <h3>Industry</h3>
            <p>{stock.industry || "Not available"}</p>
          </article>
          <article className="feature-card">
            <h3>Recommendation</h3>
            <p>{stock.recommendationKey || "Not available"}</p>
          </article>
        </div>
      </section>

      <section className="panel feature-grid-panel">
        <div className="tab-nav" role="tablist" aria-label={`${stock.ticker} sections`}>
          {views.map((view) => (
            <Link
              key={view}
              href={buildTabHref(stock.ticker, view)}
              className={`tab-link${selectedView === view ? " active" : ""}`}
              aria-current={selectedView === view ? "page" : undefined}
            >
              {view}
            </Link>
          ))}
        </div>

        {selectedView === "overview" ? (
          <>
            <div className="feature-grid">
              <article className="feature-card">
                <h3>52W Range</h3>
                <p>{formatCurrency(stock.fiftyTwoWeekLow)} to {formatCurrency(stock.fiftyTwoWeekHigh)}</p>
              </article>
              <article className="feature-card">
                <h3>Target Mean Price</h3>
                <p>{formatCurrency(stock.targetMeanPrice)}</p>
              </article>
              <article className="feature-card">
                <h3>Beta</h3>
                <p>{formatRatio(stock.beta)}</p>
              </article>
              <article className="feature-card">
                <h3>Trailing P/E</h3>
                <p>{formatRatio(stock.trailingPe)}</p>
              </article>
              <article className="feature-card">
                <h3>Forward P/E</h3>
                <p>{formatRatio(stock.forwardPe)}</p>
              </article>
              <article className="feature-card">
                <h3>Price / Book</h3>
                <p>{formatRatio(stock.priceToBook)}</p>
              </article>
            </div>
            {stock.businessSummary ? (
              <article className="feature-card feature-card-wide">
                <h3>Company Overview</h3>
                <p>{stock.businessSummary}</p>
                {stock.website ? (
                  <p className="feature-card-meta">
                    <strong>Website:</strong>{" "}
                    <a href={stock.website} target="_blank" rel="noreferrer">
                      {stock.website}
                    </a>
                  </p>
                ) : null}
              </article>
            ) : null}
          </>
        ) : null}

        {selectedView === "chart" ? <StockPriceChart ticker={stock.ticker} history={stock.history} /> : null}

        {selectedView === "technical-analysis" ? (
          <div className="feature-grid">
            <article className="feature-card">
              <h3>SMA 20</h3>
              <p>{formatCurrency(technical.technicals.sma20)}</p>
            </article>
            <article className="feature-card">
              <h3>SMA 50</h3>
              <p>{formatCurrency(technical.technicals.sma50)}</p>
            </article>
            <article className="feature-card">
              <h3>SMA 200</h3>
              <p>{formatCurrency(technical.technicals.sma200)}</p>
            </article>
            <article className="feature-card">
              <h3>RSI 14</h3>
              <p>{formatRatio(technical.technicals.rsi14)}</p>
            </article>
            <article className="feature-card">
              <h3>Trend</h3>
              <p>{technical.technicals.trend}</p>
            </article>
            <article className="feature-card">
              <h3>Momentum</h3>
              <p>{technical.technicals.momentum}</p>
            </article>
            <article className="feature-card">
              <h3>Distance From 52W High</h3>
              <p>{formatPercent(technical.technicals.distanceFromHigh)}</p>
            </article>
            <article className="feature-card">
              <h3>Distance From 52W Low</h3>
              <p>{formatPercent(technical.technicals.distanceFromLow)}</p>
            </article>
            <article className="feature-card">
              <h3>Current vs Averages</h3>
              <p>
                {formatCurrency(technical.technicals.latestClose)} vs {formatCurrency(technical.technicals.sma20)} / {formatCurrency(technical.technicals.sma50)}
              </p>
            </article>
          </div>
        ) : null}

        {selectedView === "fundamentals" ? (
          <div className="feature-grid">
            <article className="feature-card">
              <h3>Revenue</h3>
              <p>{formatCurrency(stock.totalRevenue)}</p>
            </article>
            <article className="feature-card">
              <h3>Revenue Growth</h3>
              <p>{formatPercent(stock.revenueGrowth)}</p>
            </article>
            <article className="feature-card">
              <h3>Dividend Yield</h3>
              <p>{formatPercent(stock.dividendYield)}</p>
            </article>
            <article className="feature-card">
              <h3>Profit Margin</h3>
              <p>{formatPercent(stock.profitMargins)}</p>
            </article>
            <article className="feature-card">
              <h3>Operating Margin</h3>
              <p>{formatPercent(stock.operatingMargins)}</p>
            </article>
            <article className="feature-card">
              <h3>Return on Equity</h3>
              <p>{formatPercent(stock.returnOnEquity)}</p>
            </article>
          </div>
        ) : null}

        {selectedView === "leadership" ? (
          <div className="feature-grid">
            {stock.leadership.length ? (
              stock.leadership.map((leader) => (
                <article className="feature-card" key={`${leader.name}-${leader.title}`}>
                  <h3>{leader.name || "Unknown executive"}</h3>
                  <p>{leader.title || "Title not available"}</p>
                  <p>
                    {leader.age ? `Age ${leader.age}` : "Age not available"}
                    {leader.yearBorn ? ` • Born ${leader.yearBorn}` : ""}
                  </p>
                  {Number.isFinite(leader.totalPay) ? <p>{formatCurrency(leader.totalPay)} total pay</p> : null}
                </article>
              ))
            ) : (
              <article className="feature-card">
                <h3>No leadership data available</h3>
                <p>This source did not return company officers for this ticker right now.</p>
              </article>
            )}
          </div>
        ) : null}

        {selectedView === "news" ? (
          <div className="news-list">
            {news.length ? (
              news.map((item) => (
                <article className="feature-card" key={`${item.link}-${item.title}`}>
                  <h3>{item.title}</h3>
                  <p>
                    {item.publisher || "Unknown publisher"}
                    {item.publishedAt ? ` • ${formatDate(item.publishedAt)}` : ""}
                  </p>
                  <a href={item.link} target="_blank" rel="noreferrer">
                    Read article
                  </a>
                </article>
              ))
            ) : (
              <article className="feature-card">
                <h3>No recent articles</h3>
                <p>No Yahoo Finance news items were returned for this ticker right now.</p>
              </article>
            )}
          </div>
        ) : null}
      </section>
    </main>
  );
}
