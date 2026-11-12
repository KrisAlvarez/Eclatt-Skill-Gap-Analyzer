# SkillGap frontend

React/Vite application. Run `npm.cmd ci` then `npm.cmd run dev` from this directory. Use `npm.cmd run build` for production compilation.

`src/App.jsx` owns tab navigation and session state. `src/pages/` contains the five active screens; `src/components/Navbar.jsx` is shared navigation. `src/api/client.js` handles requests and host failover, and `src/utils/skillDescriptions.js` supplies explanatory copy. Styles are in `src/index.css`.

The website serves the original recommendation cascade. The two-hidden-skill experimental model and assessment tables are offline; see [the current architecture/run guide](../README.md) and [assessment results](../docs/final-evaluation.md). No benchmark tab is mounted. Old unused UI components have been removed.
