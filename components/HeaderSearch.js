"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

function trackEvent(name, params = {}) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") {
    return;
  }

  window.gtag("event", name, params);
}

export default function HeaderSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const trimmed = query.trim();

    if (trimmed.length < 1) {
      setResults([]);
      setIsOpen(false);
      setIsLoading(false);
      return undefined;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal
        });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error || "Search failed");
        }

        setResults(payload.results || []);
        setIsOpen(true);
      } catch (error) {
        if (error.name !== "AbortError") {
          setResults([]);
          setIsOpen(false);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }, 180);

    return () => {
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [query]);

  function goToTicker(symbol) {
    setQuery("");
    setResults([]);
    setIsOpen(false);
    trackEvent("header_search_used", {
      ticker_symbol: symbol
    });
    router.push(`/stocks/${symbol}`);
  }

  function handleSubmit(event) {
    event.preventDefault();
    const raw = query.trim().toUpperCase();

    if (!raw) {
      return;
    }

    goToTicker(raw);
  }

  return (
    <form className="site-search" onSubmit={handleSubmit} role="search">
      <label className="site-search-label">
        <span className="sr-only">Search by ticker</span>
        <input
          className="site-search-input"
          type="search"
          value={query}
          placeholder="Search ticker"
          autoComplete="off"
          onChange={(event) => setQuery(event.target.value.toUpperCase())}
          onFocus={() => {
            if (results.length) {
              setIsOpen(true);
            }
          }}
          onBlur={() => {
            setTimeout(() => setIsOpen(false), 120);
          }}
        />
      </label>
      {isOpen && (results.length || isLoading) ? (
        <div className="site-search-results" role="listbox" aria-label="Ticker search results">
          {isLoading ? <p className="site-search-status">Searching...</p> : null}
          {results.map((result) => (
            <button
              className="site-search-item"
              key={result.symbol}
              type="button"
              onClick={() => goToTicker(result.symbol)}
            >
              <strong>{result.symbol}</strong>
              <span>{result.name}</span>
              <small>{[result.exchange, result.type].filter(Boolean).join(" • ")}</small>
            </button>
          ))}
        </div>
      ) : null}
    </form>
  );
}
