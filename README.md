# 34 North — Marketing Website

The source for [34north.net](https://34north.net) — a one-page marketing site for a software development consultancy offering consulting, database design, web and API development, and AI integration.

## Stack

Pure HTML, CSS, and JavaScript. No frameworks, no build step, no dependencies.

- **Hosting:** Cloudflare Workers (static assets)
- **Contact form:** [Web3Forms](https://web3forms.com) — serverless form submission, no backend required
- **DNS/CDN:** Cloudflare

## Structure

```
index.html        # Single-page site, all sections
styles.css        # All styles, including responsive breakpoints
main.js           # Nav behavior, mobile menu, scroll animations, form handling
favicon.svg       # SVG favicon
robots.txt        # Search engine crawl rules
sitemap.xml       # Sitemap for Google Search Console
```

## Features

- Fully responsive — mobile, tablet, and desktop
- Hamburger nav on screens 1024px and below
- Scroll-triggered reveal animations via IntersectionObserver
- Nav bar adapts color based on light/dark sections in view
- Contact form with:
  - Honeypot field for bot detection
  - Time-based submission check (blocks bots that submit instantly)
  - Math CAPTCHA (no external service)
  - Client-side rate limiting
- JSON-LD structured data (ProfessionalService + FAQPage schemas)
- Open Graph and Twitter Card meta tags

## Running locally

No build step needed. Serve the directory with any static file server:

```bash
python3 -m http.server 5500
```

Then open [http://localhost:5500](http://localhost:5500).

## Deploying

Deployed via Cloudflare Workers using the configuration in `wrangler.jsonc`.

```bash
npx wrangler deploy
```
