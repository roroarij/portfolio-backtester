import test from "node:test";
import assert from "node:assert/strict";

import { calculateTechnicalAnalysis } from "./stocks.js";

test("calculateTechnicalAnalysis derives moving averages and trend state", () => {
  const history = Array.from({ length: 220 }, (_, index) => ({
    date: `2024-01-${String((index % 28) + 1).padStart(2, "0")}`,
    close: 100 + index
  }));

  const result = calculateTechnicalAnalysis(history);

  assert.equal(result.latestClose, 319);
  assert.ok(result.sma20 > result.sma50);
  assert.ok(result.sma50 > result.sma200);
  assert.equal(result.trend, "bullish");
  assert.equal(result.momentum, "overbought");
});
