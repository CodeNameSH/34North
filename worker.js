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

    if (url.pathname === '/worker.js') {
      return new Response(null, { status: 404 });
    }

    // Markdown negotiation: serve llms-full.txt when agent requests text/markdown
    if (accept.includes('text/markdown')) {
      try {
        const mdRequest = new Request(new URL('/llms-full.txt', request.url).toString());
        const mdResponse = await env.ASSETS.fetch(mdRequest);
        if (mdResponse.ok) {
          return new Response(mdResponse.body, {
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

    // Pass through non-HTML responses unchanged
    const contentType = response.headers.get('Content-Type') || '';
    if (!contentType.includes('text/html')) {
      return response;
    }

    // Inject Link headers on HTML responses
    const headers = new Headers(response.headers);
    headers.set('Link', LINK_HEADERS);
    headers.append('Vary', 'Accept');

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  },
};
