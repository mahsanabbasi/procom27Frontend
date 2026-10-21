// Serves the built site from the static assets configured in wrangler.toml.
//
// Why this is not just a 404: when a Worker script is present, requests that
// do not match a built file are forwarded here *instead of* being handled by
// `not_found_handling`. Returning 404 therefore broke every client-side route
// — /teams, /teams/:slug — even though wrangler.toml asked for SPA handling.
//
// So: try the asset first, and if there is no such file, hand back the app
// shell with a 200 so the router in App.jsx can take over. Only navigation
// requests get the shell; a missing image or script still 404s honestly.
export default {
  async fetch(request, env) {
    const response = await env.ASSETS.fetch(request);
    if (response.status !== 404) return response;

    const wantsHtml = (request.headers.get('accept') || '').includes('text/html');
    if (!wantsHtml) return response;

    const shellUrl = new URL(request.url);
    shellUrl.pathname = '/';
    shellUrl.search = '';
    const shell = await env.ASSETS.fetch(new Request(shellUrl, { headers: request.headers }));
    return new Response(shell.body, { status: 200, headers: shell.headers });
  },
};
