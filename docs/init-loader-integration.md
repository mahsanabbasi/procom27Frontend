# Dino initialization loader

The shared `AppShell` wraps the existing app and AuthProvider once, outside page routing. It preserves the requested URL and restores fragment scrolling after the reveal. No page or routing changes are required.

## Font coordination

The existing Press Start 2P 400 and Space Grotesk 400/500 faces are critical. Exact existing font families are self-hosted with their licenses and original language subsets. Only the two Latin files (34,800 bytes total) are preloaded. The variable Space Grotesk file also supplies the existing 600/700 weights.

Initialization verifies registered font families before `document.fonts.check()` and loads only critical faces concurrently. A 1600 ms deadline reveals a stable system-font fallback on failure. It does not wait for unrelated fonts or assets and uses no storage flags to infer readiness.

A cold font preload can finish before React starts. Same-origin Resource Timing preserves evidence of an actual font-body transfer so that this race does not skip the Dino. Cached delivery and headers-only revalidation do not trigger an intro when fonts are ready. Readiness is evaluated again at mount to avoid stale pending intent from a cache-backed load.

When Resource Timing is unavailable, current-document font readiness is the fallback. An HTTP-cache hit alone cannot guarantee the face is already usable in a new document; a still-pending face can require initialization. Font URLs used by the timing filter must be updated if the two critical preload paths change.

## Animation and development preview

The original two-frame Chromium Dino sprite, existing PROCOM pixel mark, starfield/grid, measured collision and stepped pixel-glitch reveal are retained. The approved sprite's Chromium license is included. Reduced motion bypasses running/collision/glitch; font and sprite failures fail open. Timers, listeners and animation handles are released after completion.

Development-only `?debugLoader=cold` and the Replay Loader button play the complete approximately 1.75-second animation on the requested route. Both controls are absent or ignored in production. Replay remounts the current page and restores its previous scroll position.

Start development with `npm run dev -- --host 127.0.0.1 --port 3003 --strictPort`; open `http://localhost:3003/?debugLoader=cold`. Stop the server with Ctrl+C.

## Validation

Run `node --test tests/*.test.mjs`, `npm run lint` and `npm run build`. No separate type-check script is configured.

Verified in real Chromium with cache disabled: actual cold-font body downloads play the Dino run, collision and glitch in development and production preview, including fonts that finish before React. Warm cached/revalidated ready fonts skip without overlay flash. Also verified direct homepage/team/missing-team routes, existing unknown-route behavior, internal navigation, font failure and bounded timeout, reduced motion, fragment scrolling and seven desktop/mobile/landscape viewports with zero collision gap and no horizontal overflow or lingering inert overlay. A mobile screenshot was inspected while actual delayed font requests were pending and `document.fonts.check()` was false. Viewport checks emulate Chromium; they do not establish physical-device frame rates.
