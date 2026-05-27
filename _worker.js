const LINK_HEADERS = [
  '</llms.txt>; rel="describedby"; type="text/plain"',
  '</sitemap.xml>; rel="sitemap"',
  '</.well-known/agent-skills/index.json>; rel="service-desc"',
  '</auth.md>; rel="describedby"; type="text/markdown"',
].join(', ');

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const accept = request.headers.get('Accept') || '';

    if (url.pathname === '/_worker.js') {
      return new Response(null, { status: 404 });
    }

    // Markdown negotiation — return llms-full.txt for any request preferring text/markdown
    if (accept.includes('text/markdown')) {
      try {
        const mdResp = await env.ASSETS.fetch(
          new Request(new URL('/llms-full.txt', request.url).toString())
        );
        if (mdResp.ok) {
          return new Response(mdResp.body, {
            status: 200,
            headers: {
              'Content-Type': 'text/markdown; charset=utf-8',
              'Vary': 'Accept',
            },
          });
        }
      } catch (_) {}
    }

    let response;
    try {
      response = await env.ASSETS.fetch(request);
    } catch (_) {
      return new Response(null, { status: 404 });
    }

    // Add Link headers on homepage — use pathname, not content-type, to avoid quirks
    const isHomepage = url.pathname === '/' || url.pathname === '/index.html';
    if (!isHomepage) {
      return response;
    }

    const headers = new Headers(response.headers);
    headers.set('Link', LINK_HEADERS);
    headers.set('Vary', 'Accept');

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  },
};
