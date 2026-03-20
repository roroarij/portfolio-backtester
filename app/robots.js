export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/_next/"]
      }
    ],
    sitemap: "https://stocksscreener.com/sitemap.xml",
    host: "https://stocksscreener.com"
  };
}
