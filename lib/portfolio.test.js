import test from "node:test";
import assert from "node:assert/strict";

import { buildPortfolioHistory } from "./portfolio.js";

test("buildPortfolioHistory preserves the full selected range when a holding starts later", async () => {
  const originalFetch = global.fetch;
  const timestamps = {
    "2020-01-02": Date.parse("2020-01-02T00:00:00Z") / 1000,
    "2020-01-03": Date.parse("2020-01-03T00:00:00Z") / 1000,
    "2022-01-03": Date.parse("2022-01-03T00:00:00Z") / 1000,
    "2022-01-04": Date.parse("2022-01-04T00:00:00Z") / 1000
  };

  global.fetch = async (url) => {
    const symbol = String(url).split("/").at(-1).split("?")[0];

    if (symbol === "OLD") {
      return {
        ok: true,
        json: async () => ({
          chart: {
            result: [
              {
                timestamp: [timestamps["2020-01-02"], timestamps["2020-01-03"], timestamps["2022-01-03"], timestamps["2022-01-04"]],
                indicators: {
                  adjclose: [
                    {
                      adjclose: [10, 11, 20, 21]
                    }
                  ]
                }
              }
            ]
          }
        })
      };
    }

    if (symbol === "NEW") {
      return {
        ok: true,
        json: async () => ({
          chart: {
            result: [
              {
                timestamp: [timestamps["2022-01-03"], timestamps["2022-01-04"]],
                indicators: {
                  adjclose: [
                    {
                      adjclose: [5, 6]
                    }
                  ]
                }
              }
            ]
          }
        })
      };
    }

    throw new Error(`Unexpected symbol ${symbol}`);
  };

  try {
    const result = await buildPortfolioHistory(
      [
        { symbol: "OLD", quantity: 1 },
        { symbol: "NEW", quantity: 2 }
      ],
      "5y"
    );

    assert.equal(result.startDate, "2020-01-02");
    assert.equal(result.endDate, "2022-01-04");
    assert.deepEqual(result.series, [
      { date: "2020-01-02", value: 10 },
      { date: "2020-01-03", value: 11 },
      { date: "2022-01-03", value: 30 },
      { date: "2022-01-04", value: 33 }
    ]);
  } finally {
    global.fetch = originalFetch;
  }
});
