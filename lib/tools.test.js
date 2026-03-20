import test from "node:test";
import assert from "node:assert/strict";

import { calculateDcaPlan, calculateOptionsStrategy, calculatePositionSize } from "./tools.js";

test("calculateDcaPlan returns comparable DCA and lump sum outputs", () => {
  const plan = calculateDcaPlan({
    initialContribution: 1000,
    recurringContribution: 500,
    years: 10,
    annualReturn: 8,
    contributionsPerYear: 12
  });

  assert.equal(plan.totalContributions, 61000);
  assert.ok(plan.dcaEndingValue > 0);
  assert.ok(plan.lumpSumEndingValue > plan.dcaEndingValue);
});

test("calculatePositionSize turns stop distance into shares and position value", () => {
  const sizing = calculatePositionSize({
    accountSize: 25000,
    riskPercent: 1,
    entryPrice: 80,
    stopPrice: 74
  });

  assert.equal(sizing.dollarRisk, 250);
  assert.equal(sizing.riskPerShare, 6);
  assert.equal(sizing.shares, 41);
  assert.equal(sizing.positionValue, 3280);
});

test("calculateOptionsStrategy returns payoff profile and breakeven", () => {
  const strategy = calculateOptionsStrategy({
    strategy: "long-call",
    currentPrice: 100,
    strikePrice: 105,
    premium: 4
  });

  assert.equal(strategy.breakeven, 109);
  assert.equal(strategy.maxLoss, 4);
  assert.equal(strategy.profitAtCurrent, -4);
  assert.ok(strategy.points.length > 10);
});
