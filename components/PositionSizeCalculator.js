"use client";

import { useMemo, useState } from "react";

import { calculatePositionSize } from "@/lib/tools";

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2
  }).format(value);
}

export default function PositionSizeCalculator() {
  const [accountSize, setAccountSize] = useState(25000);
  const [riskPercent, setRiskPercent] = useState(1);
  const [entryPrice, setEntryPrice] = useState(100);
  const [stopPrice, setStopPrice] = useState(94);

  const result = useMemo(
    () =>
      calculatePositionSize({
        accountSize,
        riskPercent,
        entryPrice,
        stopPrice
      }),
    [accountSize, entryPrice, riskPercent, stopPrice]
  );

  return (
    <section className="panel tool-panel">
      <div className="tool-layout">
        <div className="tool-controls">
          <label>
            <span>Account size</span>
            <input type="number" min="0" value={accountSize} onChange={(event) => setAccountSize(Number(event.target.value))} />
          </label>
          <label>
            <span>Risk per trade (%)</span>
            <input type="number" step="0.1" min="0" max="10" value={riskPercent} onChange={(event) => setRiskPercent(Number(event.target.value))} />
          </label>
          <label>
            <span>Entry price</span>
            <input type="number" step="0.01" min="0" value={entryPrice} onChange={(event) => setEntryPrice(Number(event.target.value))} />
          </label>
          <label>
            <span>Stop price</span>
            <input type="number" step="0.01" min="0" value={stopPrice} onChange={(event) => setStopPrice(Number(event.target.value))} />
          </label>
        </div>
        <div className="tool-results">
          <div className="feature-grid">
            <article className="feature-card">
              <h3>Dollar risk</h3>
              <p>{formatCurrency(result.dollarRisk)}</p>
            </article>
            <article className="feature-card">
              <h3>Risk per share</h3>
              <p>{formatCurrency(result.riskPerShare)}</p>
            </article>
            <article className="feature-card">
              <h3>Share size</h3>
              <p>{result.shares}</p>
            </article>
            <article className="feature-card">
              <h3>Position value</h3>
              <p>{formatCurrency(result.positionValue)}</p>
            </article>
            <article className="feature-card">
              <h3>Capital at risk</h3>
              <p>{formatCurrency(result.capitalAtRisk)}</p>
            </article>
            <article className="feature-card">
              <h3>Stop distance</h3>
              <p>{result.stopDistancePercent}%</p>
            </article>
          </div>
          <article className="feature-card feature-card-wide">
            <h3>Read the output</h3>
            <p>
              The calculator sizes your trade from risk first. If the resulting position value is too large for the account or too small to matter, tighten the setup or lower the stop distance.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
