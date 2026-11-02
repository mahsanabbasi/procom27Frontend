// Serves the built site from the static assets configured in wrangler.toml.
//
// Why this is not just a 404: when a Worker script is present, requests that
// do not match a built file are forwarded here *instead of* being handled by
// `not_found_handling`. Returning 404 therefore broke every client-side route
// — /teams, /teams/:slug — even though wrangler.toml asked for SPA handling.
//
// So: try the asset first, and if there is no such file, hand back the app
// shell with a 200 so the router in App.jsx can take over. Any path without a
// file extension gets the shell, whatever its Accept header says, so link
// preview crawlers (facebookexternalhit sends Accept: */*) still see the page.
// A missing image or script (a path with an extension) still 404s honestly.
//
// That 404 is built here rather than passed through, because public/_headers
// marks /assets/* as cacheable for a year and would otherwise stamp that on a
// missing file too. A browser that cached a 404 for an old hash would stay
// broken if a rollback brought the file back.
const HAS_EXTENSION = /\.[a-z0-9]+$/i;

export default {
  async fetch(request, env) {
    const response = await env.ASSETS.fetch(request);
    if (response.status !== 404) return response;

    const { pathname } = new URL(request.url);
    if (HAS_EXTENSION.test(pathname)) return new Response('Not found', { status: 404, headers: { 'cache-control': 'no-store' } });

    const shellUrl = new URL(request.url);
    shellUrl.pathname = '/';
    shellUrl.search = '';
    // Drop the browser's revalidation headers: they belong to the URL it asked
    // for, and a 304 for the shell would turn into an empty 200 page below.
    const headers = new Headers(request.headers);
    headers.delete('if-none-match');
    headers.delete('if-modified-since');
    const shell = await env.ASSETS.fetch(new Request(shellUrl, { headers }));
    return new Response(shell.body, { status: 200, headers: shell.headers });
  },
};
