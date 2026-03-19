# Stocksscreener Platform Roadmap

## Product Direction

`stocksscreener.com` should evolve from a single portfolio backtesting tool into a finance utility platform with four core pillars:

1. Portfolio pages
2. Stock/ticker pages
3. Tools
4. Discovery and market surfaces

This creates three strong acquisition wedges:

- Tool-intent traffic
- Ticker/entity traffic
- Portfolio/comparison long-tail traffic

The product should be built as a route and data system, not as a flat pile of pages.

## Canonical Route Model

Prefer explicit namespaces over bare top-level ticker routes. Avoid `/{ticker}` as the main pattern because it will collide with future static pages such as `/tools`, `/discover`, `/markets`, `/about`, and `/pricing`.

Recommended route structure:

- `/`
- `/portfolio`
- `/portfolio/[slug]`
- `/discover`
- `/discover/portfolios`
- `/discover/stocks`
- `/tools`
- `/tools/portfolio-backtester`
- `/tools/dca-calculator`
- `/tools/options-strategy-calculator`
- `/tools/position-size-calculator`
- `/markets`
- `/markets/indexes`
- `/markets/commodities`
- `/markets/sectors`
- `/stocks/[ticker]`
- `/stocks/[ticker]/chart`
- `/stocks/[ticker]/technical-analysis`
- `/stocks/[ticker]/fundamentals`
- `/stocks/[ticker]/options`
- `/stocks/[ticker]/price-targets`
- `/stocks/[ticker]/filings`
- `/stocks/[ticker]/insider-trades`
- `/stocks/[ticker]/news`
- `/stocks/[ticker]/faq/[slug]`

## Navigation Model

Primary nav:

- Home
- Portfolios
- Markets
- Tools
- Discover

Global search:

- ticker search
- company search
- tool search
- eventually portfolio search

## Data Model Direction

## Tool Routes vs Portfolio Routes

These should not be treated as the same thing.

- `/tools/portfolio-backtester`
  - canonical tool route
  - utility intent
  - accepts shareable query-string state
- `/portfolio`
  - portfolio landing and discovery context
- `/portfolio/[slug]`
  - canonical published portfolio entity

Rule:

- tools live under `/tools`
- published portfolio entities live under `/portfolio`
- old raw query-string links should redirect or resolve into the canonical tool route instead of breaking

### 1. Saved Portfolio

The current app already generates a shareable URL. That is enough to support persistence, but not enough to support clean discovery pages.

Use a real portfolio record model:

- `slug`
- `title`
- `description`
- `holdings`
- `range`
- `owner_type`
  - system
  - featured
  - user
- `visibility`
  - private
  - unlisted
  - public
- `published_at`
- `tags`
  - ai
  - semiconductor
  - mag7
  - dividend
  - equal-weight
- derived stats
  - return
  - volatility
  - max drawdown
  - Sharpe later

Important:

- Do not auto-index every generated URL.
- Shared URLs can remain functional.
- Only explicitly published or featured portfolios should live at canonical discovery URLs.

Otherwise the site will accumulate thin, duplicate, low-quality pages.

### 2. Stock Entity

Each ticker route should have a normalized stock entity model:

- `ticker`
- `company_name`
- `exchange`
- `sector`
- `industry`
- `description`
- `logo` later
- fundamentals snapshot
- price snapshot
- derived route metadata

### 3. Tool Entity

Each tool should have:

- `slug`
- `title`
- `description`
- `intent`
- `inputs`
- `outputs`
- SEO title/description
- internal links to related tools and stock/portfolio pages

## Rollout Phases

### Phase 1: Make Portfolio Pages First-Class

Goal:

- turn the current backtester into a real app surface
- create portfolio discovery and retention

Build:

- `/tools/portfolio-backtester`
  - main backtester tool
- `/portfolio`
  - portfolio landing page and publishing context
- `/portfolio/[slug]`
  - saved and shareable portfolio pages
- `/discover/portfolios`
  - featured and public portfolio directory
- homepage modules
  - featured portfolios
  - trending tools
  - major indexes

Implementation notes:

- keep raw query-string share URLs working
- add a canonical save/publish model on top
- start with system-generated slugs for featured/public portfolios

### Phase 2: Ticker Hub Pages

Goal:

- capture ticker-intent traffic
- create internal link graph between tools, stocks, and portfolios

Build:

- `/stocks/[ticker]`
- `/stocks/[ticker]/chart`
- `/stocks/[ticker]/fundamentals`
- `/stocks/[ticker]/news`

The first ticker page should be a hub page with section tabs, not eight thin pages launched at once.

Only expand to more ticker subroutes after the core page is useful.

### Phase 3: Tool Cluster

Goal:

- expand tool-intent coverage
- create more utility traffic surfaces

Build:

- `/tools`
- `/tools/dca-calculator`
- `/tools/options-strategy-calculator`
- `/tools/position-size-calculator`

Later:

- rebalance calculator
- compare portfolio performance
- lump sum vs DCA
- option payoff tools

### Phase 4: Discovery and Markets

Goal:

- create richer browse surfaces
- improve homepage freshness
- support internal linking and topical authority

Build:

- `/discover`
- `/discover/stocks`
- `/markets`
- `/markets/indexes`
- `/markets/commodities`
- `/markets/sectors`

## Homepage Direction

The homepage should stop being only a form.

Recommended homepage modules:

- hero with quick backtest entry
- trending stocks
- major indexes
- commodities snapshot
- featured portfolios
- tool cards
- recent or trending comparisons
- discovery links

The existing tool can still be prominent, but the homepage should become a hub.

## SEO Rules

### Titles and metadata

Every route type needs:

- unique title
- unique meta description
- useful on-page intro copy
- internal links
- canonical behavior

### Avoid index bloat

Do not create:

- empty ticker pages
- thin FAQ pages with no unique value
- public portfolio pages with no editorial or analytical framing

### Use route intent intentionally

- tools capture utility intent
- stocks capture entity intent
- portfolio pages capture comparison and strategy intent
- discovery pages capture browse intent

## Recommended First Implementation Slice

Build this next:

1. Add a site shell with nav and homepage sections
2. Move the existing backtester to `/tools/portfolio-backtester`
3. Keep `/` as the new dynamic homepage
4. Add `/portfolio` as the portfolio entity landing page
5. Add `/discover/portfolios`
6. Add a portfolio page model for featured/public saved portfolios
7. Add global search UI

This gives the project a clean foundation without overcommitting to dozens of thin stock routes too early.

## Practical Near-Term Data Sources

Near term:

- current history API for portfolio results
- current search API for ticker lookup
- static or hand-curated featured portfolios
- static or simple API-fed homepage market cards

Later:

- database for saved portfolios and public discovery
- stock metadata store
- market data store
- analytics-driven discovery ranking

## Decision

The best path is:

- namespace the app cleanly
- treat portfolios as a first-class content type
- build one strong stock hub pattern before many stock subroutes
- use tools as a traffic engine
- use discovery pages as internal-linking and browse surfaces

Do not start with every possible route. Start with the route types that will compound.
