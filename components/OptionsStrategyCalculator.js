"use client";

import { useMemo, useState } from "react";

import { calculateOptionsStrategy } from "@/lib/tools";

const strategies = [
  { value: "long-call", label: "Long Call" },
  { value: "long-put", label: "Long Put" },
  { value: "covered-call", label: "Covered Call" },
  { value: "bull-call-spread", label: "Bull Call Spread" },
  { value: "protective-put", label: "Protective Put" }
];

function formatCurrency(value) {
  if (typeof value === "string") {
    return value;
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2
  }).format(value);
}

function buildPath(points) {
  if (!points.length) {
    return "";
  }

  const width = 720;
  const height = 240;
  const padding = 24;
  const minX = points[0].stockPrice;
  const maxX = points.at(-1).stockPrice;
  const minY = Math.min(...points.map((point) => point.profit));
  const maxY = Math.max(...points.map((point) => point.profit));
  const ySpan = maxY - minY || 1;
  const xSpan = maxX - minX || 1;

  return points
    .map((point, index) => {
      const x = padding + ((point.stockPrice - minX) / xSpan) * (width - padding * 2);
      const y = height - padding - ((point.profit - minY) / ySpan) * (height - padding * 2);
      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

export default function OptionsStrategyCalculator() {
  const [strategy, setStrategy] = useState("long-call");
  const [currentPrice, setCurrentPrice] = useState(100);
  const [strikePrice, setStrikePrice] = useState(100);
  const [shortStrikePrice, setShortStrikePrice] = useState(110);
  const [premium, setPremium] = useState(5);

  const result = useMemo(
    () =>
      calculateOptionsStrategy({
        strategy,
        currentPrice,
        strikePrice,
        shortStrikePrice,
        premium
      }),
    [currentPrice, premium, shortStrikePrice, strategy, strikePrice]
  );

  const path = useMemo(() => buildPath(result.points), [result.points]);

  return (
    <section className="panel tool-panel">
      <div className="tool-layout">
        <div className="tool-controls">
          <label>
            <span>Strategy</span>
            <select value={strategy} onChange={(event) => setStrategy(event.target.value)}>
              {strategies.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Current stock price</span>
            <input type="number" step="0.01" min="0" value={currentPrice} onChange={(event) => setCurrentPrice(Number(event.target.value))} />
          </label>
          <label>
            <span>Strike price</span>
            <input type="number" step="0.01" min="0" value={strikePrice} onChange={(event) => setStrikePrice(Number(event.target.value))} />
          </label>
          <label>
            <span>Short strike</span>
            <input type="number" step="0.01" min="0" value={shortStrikePrice} onChange={(event) => setShortStrikePrice(Number(event.target.value))} />
          </label>
          <label>
            <span>Net premium</span>
            <input type="number" step="0.01" min="0" value={premium} onChange={(event) => setPremium(Number(event.target.value))} />
          </label>
        </div>
        <div className="tool-results">
          <div className="feature-grid">
            <article className="feature-card">
              <h3>Breakeven</h3>
              <p>{formatCurrency(result.breakeven)}</p>
            </article>
            <article className="feature-card">
              <h3>Max gain</h3>
              <p>{formatCurrency(result.maxGain)}</p>
            </article>
            <article className="feature-card">
              <h3>Max loss</h3>
              <p>{formatCurrency(result.maxLoss)}</p>
            </article>
            <article className="feature-card">
              <h3>P/L at current price</h3>
              <p>{formatCurrency(result.profitAtCurrent)}</p>
            </article>
          </div>
          <article className="feature-card feature-card-wide">
            <h3>Payoff at expiration</h3>
            <svg className="options-payoff-chart" viewBox="0 0 720 240" preserveAspectRatio="none" aria-label="Options payoff chart">
              <path d={path} className="options-payoff-line" />
            </svg>
          </article>
        </div>
      </div>
    </section>
  );
}
