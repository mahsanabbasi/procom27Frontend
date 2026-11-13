# PROCOM ’27 frontend

The app serves the homepage at `/`, the About Us page at `/about`, and the team directory and team pages at `/teams` and `/teams/:slug`.

Confirmed team names and designations live in `src/data/teamMembers.js`, mapped to the team slugs in `src/data/teams.js`. Homepage and directory cards show leadership previews; each team page shows its full confirmed roster.

The Teams page (`/teams`, with a team's detail view at `/teams/:slug`) is the arcade "character select" design. It lives in `src/components/teams/`, uses its own nav and footer from `src/components/arcade/`, and reads the same registry through `src/data/teamDirectory.js` (departments, panel codes and search aliases). Its stylesheet in `src/styles/arcade/` is scoped under `.pd`, with keyframes prefixed `pd-`, so it never touches the other pages. Route links for that nav and footer are set in `src/utils/arcade/routes.js`. Both organiser sheets are recorded in the data file. Existing assignments are preserved, and the final ED Computing section is excluded. Content Creation has no supplied roster and retains pending leadership details.

About Us uses the shared navigation, footer, contact dialog, and starfield from the homepage. Its content lives in `src/components/AboutPage.jsx`, with the history timeline in `src/components/AboutHistory.jsx` and milestone copy in `src/data/procomMilestones.js`. The homepage’s About link and “Our story” button open `/about`; the About page’s “Join competitions” button returns to `/#competitions`.

Run `npm install` followed by `npm run dev` for a local preview. Run `npm run build` and `npm run lint` before pushing. Cloudflare’s existing SPA fallback in `worker.js` and `wrangler.toml` also serves direct `/about` and `/teams` links.

## React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
