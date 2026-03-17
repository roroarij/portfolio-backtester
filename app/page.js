"use client";

import { useEffect, useRef, useState } from "react";

import { buildChart } from "@/lib/chart";

const defaultHoldings = [
  { id: "holding-1", symbol: "AAPL", quantity: "10" },
  { id: "holding-2", symbol: "MSFT", quantity: "6" }
];

const ranges = [
  { value: "1y", label: "1 year" },
  { value: "2y", label: "2 years" },
  { value: "5y", label: "5 years" },
  { value: "10y", label: "10 years" },
  { value: "max", label: "Max" }
];

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2
  }).format(value);
}

function formatPercent(value) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

function formatDayLabel(value) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(`${value}T00:00:00Z`));
}

function HoldingRow({ holding, onUpdate, onRemove }) {
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const query = holding.symbol.trim();

    if (query.length < 1) {
      setSuggestions([]);
      setIsSearching(false);
      setIsOpen(false);
      return undefined;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(async () => {
      try {
        setIsSearching(true);
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
          signal: controller.signal
        });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error || "Search failed");
        }

        setSuggestions(payload.results || []);
        setIsOpen(true);
      } catch (error) {
        if (error.name !== "AbortError") {
          setSuggestions([]);
          setIsOpen(false);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsSearching(false);
        }
      }
    }, 250);

    return () => {
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [holding.symbol]);

  function handleSelectSuggestion(suggestion) {
    onUpdate("symbol", suggestion.symbol);
    onUpdate("name", suggestion.name);
    setSuggestions([]);
    setIsOpen(false);
  }

  return (
    <div className="holding-row">
      <div className="ticker-field">
        <label>
          <span>Ticker</span>
          <input
            name={`symbol-${holding.id}`}
            type="text"
            maxLength={24}
            placeholder="AAPL or Apple"
            autoComplete="off"
            value={holding.symbol}
            onChange={(event) => {
              onUpdate("symbol", event.target.value.toUpperCase());
              onUpdate("name", "");
            }}
            onFocus={() => {
              if (suggestions.length) {
                setIsOpen(true);
              }
            }}
            required
          />
        </label>
        {holding.name ? <p className="selected-company">{holding.name}</p> : null}
        {isSearching ? <p className="suggestion-status">Searching symbols...</p> : null}
        {isOpen && suggestions.length ? (
          <div className="suggestions" role="listbox" aria-label={`Suggestions for ${holding.symbol}`}>
            {suggestions.map((suggestion) => (
              <button
                className="suggestion-item"
                key={`${holding.id}-${suggestion.symbol}`}
                type="button"
                onClick={() => handleSelectSuggestion(suggestion)}
              >
                <strong>{suggestion.symbol}</strong>
                <span>{suggestion.name}</span>
                <small>{[suggestion.exchange, suggestion.type].filter(Boolean).join(" • ")}</small>
              </button>
            ))}
          </div>
        ) : null}
      </div>
      <label>
        <span>Shares</span>
        <input
          name={`quantity-${holding.id}`}
          type="number"
          min="0.0001"
          step="0.0001"
          placeholder="10"
          value={holding.quantity}
          onChange={(event) => onUpdate("quantity", event.target.value)}
          required
        />
      </label>
      <button className="remove-button" type="button" onClick={onRemove}>
        Remove
      </button>
    </div>
  );
}

export default function Home() {
  const [holdings, setHoldings] = useState(defaultHoldings);
  const [range, setRange] = useState("5y");
  const [status, setStatus] = useState("Run a backtest to populate the chart.");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [activePointIndex, setActivePointIndex] = useState(null);
  const nextHoldingId = useRef(3);
  const chartRef = useRef(null);

  const chart = result ? buildChart(result.series) : null;
  const activePoint = chart && activePointIndex !== null ? chart.coords[activePointIndex] : null;
  const tablePoints = result
    ? result.series.filter((_, index) => index % Math.max(1, Math.floor(result.series.length / 18)) === 0 || index === result.series.length - 1)
    : [];

  function updateHolding(id, field, value) {
    setHoldings((current) => current.map((holding) => (holding.id === id ? { ...holding, [field]: value } : holding)));
  }

  function addHolding() {
    const id = `holding-${nextHoldingId.current}`;
    nextHoldingId.current += 1;
    setHoldings((current) => [...current, { id, symbol: "", name: "", quantity: "" }]);
  }

  function removeHolding(id) {
    setHoldings((current) => {
      if (current.length === 1) {
        return [{ ...current[0], symbol: "", name: "", quantity: "" }];
      }

      return current.filter((holding) => holding.id !== id);
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsLoading(true);
    setStatus("Loading portfolio history...");

    try {
      const response = await fetch("/api/history", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          holdings: holdings.map(({ id, ...holding }) => holding),
          range
        })
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Backtest failed");
      }

      setResult(payload);
      setActivePointIndex(null);
      setStatus(`Backtest complete for ${payload.holdings.length} holding${payload.holdings.length === 1 ? "" : "s"}.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Backtest failed");
    } finally {
      setIsLoading(false);
    }
  }

  function updateActivePoint(clientX) {
    if (!chart || !chartRef.current) {
      return;
    }

    const bounds = chartRef.current.getBoundingClientRect();
    const relativeX = ((clientX - bounds.left) / bounds.width) * chart.width;
    const clampedX = Math.min(chart.width - chart.padding, Math.max(chart.padding, relativeX));
    const nearestIndex = chart.coords.reduce((closestIndex, point, index, points) => {
      if (index === 0) {
        return 0;
      }

      return Math.abs(point.x - clampedX) < Math.abs(points[closestIndex].x - clampedX) ? index : closestIndex;
    }, 0);

    setActivePointIndex(nearestIndex);
  }

  function handleChartPointerMove(event) {
    updateActivePoint(event.clientX);
  }

  function handleChartTouchMove(event) {
    const touch = event.touches[0];
    if (!touch) {
      return;
    }

    updateActivePoint(touch.clientX);
  }

  return (
    <main className="app-shell">
      <section className="hero">
        <p className="eyebrow">Historical Portfolio Backtesting</p>
        <h1>Track what your share mix would have done over time.</h1>
        <p className="hero-copy">
          Enter ticker symbols and share counts, pick a lookback window, and chart the combined portfolio value based on historical adjusted closes.
        </p>
      </section>

      <section className="panel controls-panel">
        <div className="section-header">
          <div>
            <h2>Portfolio Inputs</h2>
            <p>Search by ticker or company name, choose a suggestion, then add as many holdings as you want.</p>
          </div>
          <button className="ghost-button" type="button" onClick={addHolding}>
            Add Holding
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="holdings">
            {holdings.map((holding) => (
              <HoldingRow
                holding={holding}
                key={holding.id}
                onUpdate={(field, value) => updateHolding(holding.id, field, value)}
                onRemove={() => removeHolding(holding.id)}
              />
            ))}
          </div>

          <div className="form-footer">
            <label className="range-control">
              <span>Lookback</span>
              <select value={range} onChange={(event) => setRange(event.target.value)}>
                {ranges.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <button className="primary-button" type="submit" disabled={isLoading}>
              {isLoading ? "Running..." : "Run Backtest"}
            </button>
          </div>
        </form>

        <p className="status">{status}</p>
      </section>

      <section className="panel results-panel">
        <div className="section-header">
          <div>
            <h2>Portfolio Chart</h2>
            <p>
              {result
                ? `${result.startDate} to ${result.endDate} • ${result.range} lookback • ${result.holdings
                    .map((holding) => `${holding.symbol} x ${holding.quantity}`)
                    .join(", ")}`
                : "Run a backtest to populate the chart."}
            </p>
          </div>
        </div>

        <div className="summary-grid">
          <article className="summary-card">
            <span>{activePoint ? "Selected date" : "Starting value"}</span>
            <strong>{activePoint ? formatDayLabel(activePoint.date) : result ? formatCurrency(result.summary.startValue) : "$0.00"}</strong>
          </article>
          <article className="summary-card">
            <span>{activePoint ? "Selected value" : "Ending value"}</span>
            <strong>{activePoint ? formatCurrency(activePoint.value) : result ? formatCurrency(result.summary.endValue) : "$0.00"}</strong>
          </article>
          <article className="summary-card">
            <span>Net change</span>
            <strong className={result && result.summary.change >= 0 ? "positive" : "negative"}>
              {result ? formatCurrency(result.summary.change) : "$0.00"}
            </strong>
          </article>
          <article className="summary-card">
            <span>Return</span>
            <strong className={result && result.summary.change >= 0 ? "positive" : "negative"}>
              {result ? formatPercent(result.summary.changePct) : "0.00%"}
            </strong>
          </article>
        </div>

        <div className="chart-card">
          <div className="chart-scale">
            <span>{chart ? formatCurrency(chart.max) : "$0.00"}</span>
            <span>{chart ? formatCurrency(chart.min) : "$0.00"}</span>
          </div>
          <div className="chart-viewport">
            {activePoint ? (
              <div className="chart-tooltip">
                <strong>{formatCurrency(activePoint.value)}</strong>
                <span>{formatDayLabel(activePoint.date)}</span>
              </div>
            ) : null}
            <svg
              ref={chartRef}
              viewBox="0 0 960 420"
              preserveAspectRatio="none"
              aria-label="Portfolio history chart"
              onPointerMove={handleChartPointerMove}
              onPointerEnter={handleChartPointerMove}
              onPointerLeave={() => setActivePointIndex(null)}
              onTouchStart={handleChartTouchMove}
              onTouchMove={handleChartTouchMove}
              onTouchEnd={() => setActivePointIndex(null)}
            >
              <defs>
                <linearGradient id="chart-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(246, 183, 60, 0.45)" />
                  <stop offset="100%" stopColor="rgba(246, 183, 60, 0.02)" />
                </linearGradient>
              </defs>
              {chart ? <path className="chart-area" d={chart.areaPath} /> : null}
              {chart ? <path className="chart-line" d={chart.linePath} /> : null}
              {activePoint ? (
                <>
                  <line className="chart-guide" x1={activePoint.x} x2={activePoint.x} y1={chart.padding} y2={chart.height - chart.padding} />
                  <circle className="chart-marker" cx={activePoint.x} cy={activePoint.y} r="7" />
                </>
              ) : null}
            </svg>
          </div>
          <div className="chart-footer">
            <span>{activePoint ? formatDayLabel(activePoint.date) : result ? result.startDate : "Start"}</span>
            <span>{result ? result.endDate : "End"}</span>
          </div>
        </div>

        <div className="table-card">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Portfolio Value</th>
              </tr>
            </thead>
            <tbody>
              {tablePoints.length ? (
                tablePoints.map((point) => (
                  <tr key={`${point.date}-${point.value}`}>
                    <td>{point.date}</td>
                    <td>{formatCurrency(point.value)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td>Not available</td>
                  <td>Run a backtest</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
