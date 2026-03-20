function round(value, digits = 2) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

export function calculateDcaPlan({
  initialContribution = 1000,
  recurringContribution = 500,
  years = 10,
  annualReturn = 8,
  contributionsPerYear = 12
} = {}) {
  const principal = Math.max(0, Number(initialContribution) || 0);
  const recurring = Math.max(0, Number(recurringContribution) || 0);
  const periods = Math.max(1, Math.round((Number(years) || 0) * contributionsPerYear));
  const periodicRate = (Number(annualReturn) || 0) / 100 / contributionsPerYear;
  const totalContributions = principal + recurring * periods;

  let dcaValue = principal;

  for (let period = 0; period < periods; period += 1) {
    dcaValue = dcaValue * (1 + periodicRate) + recurring;
  }

  const lumpSumPrincipal = totalContributions;
  const lumpSumValue = lumpSumPrincipal * (1 + periodicRate) ** periods;

  return {
    totalContributions: round(totalContributions),
    dcaEndingValue: round(dcaValue),
    lumpSumEndingValue: round(lumpSumValue),
    difference: round(lumpSumValue - dcaValue),
    years: round(periods / contributionsPerYear, 1),
    contributionsPerYear
  };
}

export function calculatePositionSize({
  accountSize = 10000,
  riskPercent = 1,
  entryPrice = 100,
  stopPrice = 95
} = {}) {
  const equity = Math.max(0, Number(accountSize) || 0);
  const riskPct = Math.max(0, Number(riskPercent) || 0);
  const entry = Math.max(0, Number(entryPrice) || 0);
  const stop = Math.max(0, Number(stopPrice) || 0);
  const riskPerShare = Math.abs(entry - stop);
  const dollarRisk = equity * (riskPct / 100);
  const shares = riskPerShare > 0 ? Math.floor(dollarRisk / riskPerShare) : 0;
  const positionValue = shares * entry;
  const capitalAtRisk = shares * riskPerShare;

  return {
    dollarRisk: round(dollarRisk),
    riskPerShare: round(riskPerShare),
    shares,
    positionValue: round(positionValue),
    capitalAtRisk: round(capitalAtRisk),
    stopDistancePercent: entry > 0 ? round((riskPerShare / entry) * 100) : 0
  };
}

function strategyPayoff(strategy, stockPrice, strike, premium, lowerStrike) {
  switch (strategy) {
    case "long-call":
      return Math.max(stockPrice - strike, 0) - premium;
    case "long-put":
      return Math.max(strike - stockPrice, 0) - premium;
    case "covered-call":
      return (stockPrice - strike) >= 0 ? (strike - stockPrice + premium) : premium;
    case "bull-call-spread":
      return Math.max(stockPrice - strike, 0) - Math.max(stockPrice - lowerStrike, 0) - premium;
    case "protective-put":
      return stockPrice + Math.max(strike - stockPrice, 0) - premium;
    default:
      return 0;
  }
}

export function calculateOptionsStrategy({
  strategy = "long-call",
  currentPrice = 100,
  strikePrice = 100,
  shortStrikePrice = 110,
  premium = 5
} = {}) {
  const current = Math.max(0, Number(currentPrice) || 0);
  const strike = Math.max(0, Number(strikePrice) || 0);
  const shortStrike = Math.max(strike, Number(shortStrikePrice) || strike);
  const debit = Math.max(0, Number(premium) || 0);
  const priceFloor = Math.max(0, Math.floor(current * 0.5));
  const priceCeiling = Math.ceil(current * 1.5);

  const points = [];

  for (let price = priceFloor; price <= priceCeiling; price += Math.max(1, Math.round(current / 20) || 1)) {
    points.push({
      stockPrice: price,
      profit: round(strategyPayoff(strategy, price, strike, debit, shortStrike))
    });
  }

  const profitAtCurrent = round(strategyPayoff(strategy, current, strike, debit, shortStrike));

  let maxGain = "Unlimited";
  let maxLoss = debit;
  let breakeven = strike + debit;

  if (strategy === "long-put") {
    maxGain = round(strike - debit);
    breakeven = strike - debit;
  } else if (strategy === "covered-call") {
    maxGain = round(Math.max(shortStrike - current + debit, debit));
    maxLoss = round(Math.max(current - debit, 0));
    breakeven = round(current - debit);
  } else if (strategy === "bull-call-spread") {
    maxGain = round(shortStrike - strike - debit);
    maxLoss = debit;
    breakeven = round(strike + debit);
  } else if (strategy === "protective-put") {
    maxGain = "Unlimited";
    maxLoss = round(Math.max(current - strike + debit, debit));
    breakeven = round(current + debit);
  }

  return {
    points,
    maxGain,
    maxLoss: round(maxLoss),
    breakeven: round(breakeven),
    profitAtCurrent
  };
}
