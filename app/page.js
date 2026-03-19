"use client";

import { useEffect, useRef, useState } from "react";

import { buildChart } from "@/lib/chart";

const defaultHoldings = [
  { id: "holding-1", symbol: "AAPL", quantity: "10" }
];

const ranges = [
  { value: "1y", label: "1 year" },
  { value: "2y", label: "2 years" },
  { value: "5y", label: "5 years" },
  { value: "10y", label: "10 years" },
  { value: "max", label: "Max" }
];

const allowedRanges = new Set(ranges.map((option) => option.value));
const holdingPalette = [
  "#b85c38",
  "#f6b73c",
  "#2f7d6c",
  "#4763b3",
  "#b84a62",
  "#7e5ab6",
  "#4f8f2f",
  "#b76b2f"
];

function trackEvent(name, params = {}) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") {
    return;
  }

  window.gtag("event", name, params);
}

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

function formatShareCount(value) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 4
  }).format(value);
}

function formatDayLabel(value) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC"
  }).format(new Date(`${value}T00:00:00Z`));
}

function normalizeShareHoldings(rawHoldings) {
  return rawHoldings
    .map((holding) => ({
      symbol: String(holding?.symbol || "").trim().toUpperCase(),
      quantity: String(holding?.quantity || "").trim(),
      name: String(holding?.name || "").trim()
    }))
    .filter((holding) => holding.symbol && holding.quantity);
}

function serializePortfolio(holdings, range) {
  const normalizedHoldings = normalizeShareHoldings(holdings);
  const params = new URLSearchParams();

  if (normalizedHoldings.length) {
    params.set(
      "h",
      normalizedHoldings.map((holding) => `${holding.symbol}:${holding.quantity}`).join(",")
    );
  }

  params.set("r", allowedRanges.has(range) ? range : "5y");
  return params.toString();
}

function parseSharedPortfolio(search) {
  const params = new URLSearchParams(search);
  const rawHoldings = params.get("h");
  const range = params.get("r");

  if (!rawHoldings) {
    return null;
  }

  const holdings = rawHoldings
    .split(",")
    .map((entry) => {
      const [symbol, quantity] = entry.split(":");
      return {
        symbol: String(symbol || "").trim().toUpperCase(),
        quantity: String(quantity || "").trim()
      };
    })
    .filter((holding) => holding.symbol && holding.quantity);

  if (!holdings.length) {
    return null;
  }

  return {
    holdings,
    range: allowedRanges.has(range) ? range : "5y"
  };
}

function HoldingRow({ holding, onUpdate, onRemove, onSelectTicker, onFocusField }) {
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const query = holding.symbol.trim();

    if (!isFocused || query.length < 1) {
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
  }, [holding.symbol, isFocused]);

  function handleSelectSuggestion(suggestion) {
    onUpdate("symbol", suggestion.symbol);
    onUpdate("name", suggestion.name);
    onSelectTicker(suggestion.symbol);
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
              setIsFocused(true);
              onFocusField("ticker");
              if (suggestions.length) {
                setIsOpen(true);
              }
            }}
            onBlur={() => {
              setTimeout(() => {
                setIsFocused(false);
                setIsOpen(false);
              }, 120);
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
          onFocus={() => onFocusField("quantity")}
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
  const [shareLabel, setShareLabel] = useState("Copy Share Link");
  const nextHoldingId = useRef(2);
  const chartRef = useRef(null);
  const hasLoadedSharedPortfolio = useRef(false);
  const hasTrackedChartInteraction = useRef(false);

  const chart = result ? buildChart(result.series) : null;
  const activePoint = chart && activePointIndex !== null ? chart.coords[activePointIndex] : null;
  const activeChange =
    result && activePoint
      ? Number((activePoint.value - result.summary.startValue).toFixed(2))
      : null;
  const activeChangePct =
    result && activePoint
      ? Number((((activePoint.value - result.summary.startValue) / result.summary.startValue) * 100).toFixed(2))
      : null;
  const tablePoints = result
    ? result.series.filter((_, index) => index % Math.max(1, Math.floor(result.series.length / 18)) === 0 || index === result.series.length - 1)
    : [];
  const activePointHoldings = activePoint?.holdings || [];
  const activeTooltipLeft = activePoint ? `${(activePoint.x / chart.width) * 100}%` : "50%";
  const activeTooltipTop = activePoint ? `${Math.max(chart.padding + 8, activePoint.y - 18)}px` : "0px";

  function renderHoldingLegend(className = "holding-snapshot-list") {
    if (!activePointHoldings.length) {
      return null;
    }

    return (
      <div className={className}>
        {activePointHoldings.map((holding, index) => {
          const color = holdingPalette[index % holdingPalette.length];

          return (
            <div className="holding-snapshot-item" key={`${className}-${activePoint?.date || "point"}-${holding.symbol}`}>
              <span className="holding-swatch" style={{ backgroundColor: color }} aria-hidden="true" />
              <div className="holding-snapshot-copy">
                <strong style={{ color }}>{holding.symbol}</strong>
                <span>{formatShareCount(holding.quantity)} sh</span>
                <span>{formatCurrency(holding.value)}</span>
                <span>@ {formatCurrency(holding.close)}</span>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  function updateHolding(id, field, value) {
    setHoldings((current) => current.map((holding) => (holding.id === id ? { ...holding, [field]: value } : holding)));
  }

  function addHolding() {
    const id = `holding-${nextHoldingId.current}`;
    nextHoldingId.current += 1;
    setHoldings((current) => [...current, { id, symbol: "", name: "", quantity: "" }]);
    trackEvent("add_holding_clicked", {
      holdings_after_add: holdings.length + 1
    });
  }

  function removeHolding(id) {
    setHoldings((current) => {
      if (current.length === 1) {
        return [{ ...current[0], symbol: "", name: "", quantity: "" }];
      }

      trackEvent("remove_holding_clicked", {
        holdings_after_remove: current.length - 1
      });
      return current.filter((holding) => holding.id !== id);
    });
  }

  async function submitPortfolio(submissionHoldings = holdings, submissionRange = range) {
    setIsLoading(true);
    setStatus("Loading portfolio history...");

    try {
      const response = await fetch("/api/history", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          holdings: submissionHoldings.map(({ id, ...holding }) => holding),
          range: submissionRange
        })
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Backtest failed");
      }

      setResult(payload);
      setActivePointIndex(null);
      hasTrackedChartInteraction.current = false;
      setStatus(`Backtest complete for ${payload.holdings.length} holding${payload.holdings.length === 1 ? "" : "s"}.`);
      trackEvent("backtest_run", {
        holdings_count: payload.holdings.length,
        lookback_range: submissionRange,
        start_date: payload.startDate,
        end_date: payload.endDate
      });
      if (typeof window !== "undefined") {
        const query = serializePortfolio(submissionHoldings, submissionRange);
        window.history.replaceState(null, "", `${window.location.pathname}?${query}`);
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Backtest failed");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    await submitPortfolio();
  }

  async function handleShare() {
    if (typeof window === "undefined") {
      return;
    }

    const url = `${window.location.origin}${window.location.pathname}?${serializePortfolio(holdings, range)}`;

    try {
      await navigator.clipboard.writeText(url);
      setShareLabel("Link Copied");
      trackEvent("share_link_copied", {
        holdings_count: normalizeShareHoldings(holdings).length,
        lookback_range: range
      });
      setTimeout(() => setShareLabel("Copy Share Link"), 1800);
    } catch {
      setStatus("Unable to copy automatically. Copy the page URL directly.");
    }
  }

  useEffect(() => {
    if (hasLoadedSharedPortfolio.current || typeof window === "undefined") {
      return;
    }

    hasLoadedSharedPortfolio.current = true;
    const sharedPortfolio = parseSharedPortfolio(window.location.search);

    if (!sharedPortfolio) {
      return;
    }

    const sharedHoldings = sharedPortfolio.holdings.map((holding, index) => ({
      id: `holding-${index + 1}`,
      symbol: holding.symbol,
      quantity: holding.quantity,
      name: ""
    }));

    nextHoldingId.current = sharedHoldings.length + 1;
    setHoldings(sharedHoldings);
    setRange(sharedPortfolio.range);
    submitPortfolio(sharedHoldings, sharedPortfolio.range);
  }, []);

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
    if (!hasTrackedChartInteraction.current) {
      hasTrackedChartInteraction.current = true;
      trackEvent("chart_scrub_started", {
        holdings_count: result?.holdings?.length || 0,
        lookback_range: range
      });
    }
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

  function handleTickerSelected(symbol) {
    trackEvent("ticker_selected", {
      ticker_symbol: symbol
    });
  }

  function handleFieldFocus(fieldName) {
    trackEvent("portfolio_field_focused", {
      field_name: fieldName
    });
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
          <div className="header-actions">
            <button className="ghost-button" type="button" onClick={handleShare}>
              {shareLabel}
            </button>
            <button className="ghost-button" type="button" onClick={addHolding}>
              Add Holding
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="holdings">
            {holdings.map((holding) => (
              <HoldingRow
                holding={holding}
                key={holding.id}
                onUpdate={(field, value) => updateHolding(holding.id, field, value)}
                onRemove={() => removeHolding(holding.id)}
                onSelectTicker={handleTickerSelected}
                onFocusField={handleFieldFocus}
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
            <span>{activePoint ? "Change vs start" : "Net change"}</span>
            <strong className={(activePoint ? activeChange : result?.summary.change) >= 0 ? "positive" : "negative"}>
              {activePoint ? formatCurrency(activeChange) : result ? formatCurrency(result.summary.change) : "$0.00"}
            </strong>
          </article>
          <article className="summary-card">
            <span>{activePoint ? "Return vs start" : "Return"}</span>
            <strong className={(activePoint ? activeChangePct : result?.summary.changePct) >= 0 ? "positive" : "negative"}>
              {activePoint ? formatPercent(activeChangePct) : result ? formatPercent(result.summary.changePct) : "0.00%"}
            </strong>
          </article>
        </div>

        <div className="chart-card">
          <div className="chart-scale">
            <div className="chart-scale-values">
              <span>H: {chart ? formatCurrency(chart.max) : "$0.00"}</span>
              <span>L: {chart ? formatCurrency(chart.min) : "$0.00"}</span>
            </div>
            {renderHoldingLegend()}
          </div>
          <div className="chart-viewport">
            {activePoint ? (
              <div
                className="chart-tooltip chart-tooltip-inline"
                style={{
                  left: activeTooltipLeft,
                  top: activeTooltipTop
                }}
              >
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
