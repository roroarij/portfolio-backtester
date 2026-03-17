import test from "node:test";
import assert from "node:assert/strict";

import { buildChart } from "./chart.js";

test("buildChart returns an SVG path and bounds for a multi-point series", () => {
  const chart = buildChart([
    { date: "2026-01-02", value: 1000 },
    { date: "2026-01-03", value: 1200 },
    { date: "2026-01-04", value: 900 }
  ]);

  assert.equal(chart.min, 900);
  assert.equal(chart.max, 1200);
  assert.match(chart.linePath, /^M 20\.00 273\.33 L 480\.00 20\.00 L 940\.00 400\.00$/);
  assert.match(chart.areaPath, /Z$/);
});

test("buildChart handles a flat series", () => {
  const chart = buildChart([
    { date: "2026-01-02", value: 500 },
    { date: "2026-01-03", value: 500 }
  ]);

  assert.equal(chart.min, 500);
  assert.equal(chart.max, 500);
  assert.equal(chart.linePath, "M 20.00 400.00 L 940.00 400.00");
});
