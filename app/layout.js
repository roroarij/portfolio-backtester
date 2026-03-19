import Script from "next/script";

import "./globals.css";

const measurementId = "G-0FSHK07S04";

export const metadata = {
  title: "Portfolio Backtester",
  description: "Build a stock portfolio and chart its historical value."
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
        {children}
      </body>
    </html>
  );
}
