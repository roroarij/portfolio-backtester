export function buildChart(series) {
  if (!Array.isArray(series) || !series.length) {
    throw new Error("Chart series must contain at least one point.");
  }

  const width = 960;
  const height = 420;
  const padding = 20;
  const values = series.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;

  const coords = series.map((point, index) => {
    const x = padding + (index / Math.max(series.length - 1, 1)) * (width - padding * 2);
    const y = height - padding - ((point.value - min) / span) * (height - padding * 2);
    return {
      x,
      y,
      date: point.date,
      value: point.value
    };
  });

  const linePath = coords
    .map(({ x, y }, index) => `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`)
    .join(" ");
  const areaPath = `${linePath} L ${coords.at(-1).x.toFixed(2)} ${(height - padding).toFixed(2)} L ${coords[0].x.toFixed(2)} ${(height - padding).toFixed(2)} Z`;

  return { linePath, areaPath, min, max, width, height, padding, coords };
}
