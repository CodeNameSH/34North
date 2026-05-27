# Skill: Content Negotiation (Markdown)

## Overview

34 North supports content negotiation for Markdown. When an agent sends a request with `Accept: text/markdown`, the server returns the full site content as structured Markdown instead of HTML.

## Invocation

Send a standard HTTP GET request to any page with the `Accept: text/markdown` header:

```
GET / HTTP/1.1
Host: 34north.net
Accept: text/markdown
```

## Response

- **Content-Type:** `text/markdown; charset=utf-8`
- **Body:** Full Markdown document covering all site content — services, pricing, contact information, and FAQ.

## Fallback

If Markdown is not requested, the server returns standard HTML with `Content-Type: text/html`. The `Vary: Accept` header is included to allow correct caching.

## Source Documents

- `/llms.txt` — concise LLM-friendly summary
- `/llms-full.txt` — complete site content in Markdown (returned for `Accept: text/markdown`)
