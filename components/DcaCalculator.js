"use client";

import { useMemo, useState } from "react";

import { calculateDcaPlan } from "@/lib/tools";

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}

export default function DcaCalculator() {
  const [initialContribution, setInitialContribution] = useState(5000);
  const [recurringContribution, setRecurringContribution] = useState(500);
  const [years, setYears] = useState(10);
  const [annualReturn, setAnnualReturn] = useState(8);
  const [contributionsPerYear, setContributionsPerYear] = useState(12);

  const result = useMemo(
    () =>
      calculateDcaPlan({
        initialContribution,
        recurringContribution,
        years,
        annualReturn,
        contributionsPerYear
      }),
    [annualReturn, contributionsPerYear, initialContribution, recurringContribution, years]
  );

  return (
    <section className="panel tool-panel">
      <div className="tool-layout">
        <div className="tool-controls">
          <label>
            <span>Initial contribution</span>
            <input type="number" min="0" value={initialContribution} onChange={(event) => setInitialContribution(Number(event.target.value))} />
          </label>
          <label>
            <span>Recurring contribution</span>
            <input type="number" min="0" value={recurringContribution} onChange={(event) => setRecurringContribution(Number(event.target.value))} />
          </label>
          <label>
            <span>Years invested</span>
            <input type="number" min="1" max="50" value={years} onChange={(event) => setYears(Number(event.target.value))} />
          </label>
          <label>
            <span>Expected annual return (%)</span>
            <input type="number" step="0.1" min="0" max="30" value={annualReturn} onChange={(event) => setAnnualReturn(Number(event.target.value))} />
          </label>
          <label>
            <span>Contributions per year</span>
            <select value={contributionsPerYear} onChange={(event) => setContributionsPerYear(Number(event.target.value))}>
              <option value="12">Monthly</option>
              <option value="26">Biweekly</option>
              <option value="52">Weekly</option>
              <option value="4">Quarterly</option>
            </select>
          </label>
        </div>
        <div className="tool-results">
          <div className="feature-grid">
            <article className="feature-card">
              <h3>Total contributed</h3>
              <p>{formatCurrency(result.totalContributions)}</p>
            </article>
            <article className="feature-card">
              <h3>DCA ending value</h3>
              <p>{formatCurrency(result.dcaEndingValue)}</p>
            </article>
            <article className="feature-card">
              <h3>Lump-sum ending value</h3>
              <p>{formatCurrency(result.lumpSumEndingValue)}</p>
            </article>
            <article className="feature-card">
              <h3>Difference</h3>
              <p>{formatCurrency(result.difference)}</p>
            </article>
          </div>
          <article className="feature-card feature-card-wide">
            <h3>How to use it</h3>
            <p>
              Use the same total capital for both approaches: recurring contributions for dollar-cost averaging and an immediate lump-sum deployment for the comparison baseline.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
