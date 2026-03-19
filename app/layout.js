import Script from "next/script";
import Link from "next/link";

import HeaderSearch from "@/components/HeaderSearch";
import "./globals.css";

const measurementId = "G-0FSHK07S04";

export const metadata = {
  title: {
    default: "Stocksscreener",
    template: "%s"
  },
  description: "Portfolio backtesting, market tools, stock discovery, and shareable finance utility pages."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            window.gtag = function gtag(){window.dataLayer.push(arguments);};
            window.gtag('js', new Date());
            window.gtag('config', '${measurementId}');
          `}
        </Script>
        <header className="site-header">
          <div className="site-shell">
            <Link className="site-brand" href="/">
              Stocksscreener
            </Link>
            <div className="site-header-actions">
              <HeaderSearch />
              <nav className="site-nav" aria-label="Primary">
                <Link href="/">Home</Link>
                <Link href="/portfolio">Portfolios</Link>
                <Link href="/markets">Markets</Link>
                <Link href="/tools">Tools</Link>
                <Link href="/discover">Discover</Link>
              </nav>
            </div>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
