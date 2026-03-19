"use client";

import { useMemo, useRef, useState } from "react";

import { buildChart } from "@/lib/chart";

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2
  }).format(value);
}

export default function StockPriceChart({ ticker, history }) {
  const chartRef = useRef(null);
  const [activePointIndex, setActivePointIndex] = useState(null);
  const chart = useMemo(
    () =>
      buildChart(
        history.map((point) => ({
          date: point.date,
          value: point.close
        }))
      ),
    [history]
  );
  const activePoint = activePointIndex !== null ? chart.coords[activePointIndex] : null;

  function updateActivePoint(clientX) {
    if (!chartRef.current) {
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

  function handleTouchMove(event) {
    const touch = event.touches[0];

    if (!touch) {
      return;
    }

    updateActivePoint(touch.clientX);
  }

  return (
    <div className="chart-card stock-chart-card">
      <div className="chart-scale">
        <div className="chart-scale-values">
          <span>H: {formatCurrency(chart.max)}</span>
          <span>L: {formatCurrency(chart.min)}</span>
          {activePoint ? <span>{formatCurrency(activePoint.value)}</span> : null}
        </div>
      </div>
      <div className="chart-viewport">
        {activePoint ? (
          <div
            className="chart-tooltip chart-tooltip-inline"
            style={{
              left: `${(activePoint.x / chart.width) * 100}%`,
              top: `${Math.max(chart.padding + 8, activePoint.y - 18)}px`
            }}
          >
            <strong>{formatCurrency(activePoint.value)}</strong>
            <span>{activePoint.date}</span>
          </div>
        ) : null}
        <svg
          ref={chartRef}
          viewBox="0 0 960 420"
          preserveAspectRatio="none"
          aria-label={`${ticker} price chart`}
          onPointerMove={(event) => updateActivePoint(event.clientX)}
          onPointerEnter={(event) => updateActivePoint(event.clientX)}
          onPointerLeave={() => setActivePointIndex(null)}
          onTouchStart={handleTouchMove}
          onTouchMove={handleTouchMove}
        >
          <defs>
            <linearGradient id="stock-chart-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(184, 92, 56, 0.36)" />
              <stop offset="100%" stopColor="rgba(184, 92, 56, 0.03)" />
            </linearGradient>
          </defs>
          <path className="chart-area" d={chart.areaPath} fill="url(#stock-chart-fill)" />
          <path className="chart-line" d={chart.linePath} />
          {activePoint ? (
            <>
              <line className="chart-guide" x1={activePoint.x} x2={activePoint.x} y1={chart.padding} y2={chart.height - chart.padding} />
              <circle className="chart-marker" cx={activePoint.x} cy={activePoint.y} r="7" />
            </>
          ) : null}
        </svg>
      </div>
      <div className="chart-footer">
        <span>{history[0]?.date}</span>
        <span>{history.at(-1)?.date}</span>
      </div>
    </div>
  );
}
