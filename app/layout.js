import "./globals.css";

export const metadata = {
  title: "Portfolio Backtester",
  description: "Build a stock portfolio and chart its historical value."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
