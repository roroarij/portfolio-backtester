# Portfolio Backtester

A Next.js app for building a stock portfolio from ticker symbols and share quantities, then charting the portfolio's historical value using Yahoo Finance adjusted close data.

## Local development

```bash
npm install
npm run dev
```

## Production

```bash
npm run build
npm start
```

## Notes

- The API route lives at `/api/history`.
- Historical series are built from daily adjusted closes.
- Portfolio valuation begins on the latest common starting date across the selected holdings.
