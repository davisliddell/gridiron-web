# Gridiron Viz — Web (Next.js)

Next.js front-end for [Gridiron Viz](https://github.com/davisliddell/gridiron-api),
talking to the FastAPI backend. Rebuilds the five Streamlit pages (Home, Player Cards, Efficiency vs.
Volume, Field Heatmaps, Similarity) with `react-plotly.js`, keeping feature
parity with the original app.

## Stack
- Next.js (App Router) + TypeScript
- TanStack Query (data fetching/caching)
- react-plotly.js + plotly.js-dist-min (charts)
- Tailwind v4 + ported design system (`lib/theme.ts`, `app/globals.css`)

## Run

The backend API must be running first (see the
[`gridiron-api`](https://github.com/davisliddell/gridiron-api) repo):

```bash
# in gridiron-api/
uvicorn api.main:app --port 8000
```

Then:

```bash
npm install
npm run dev        # http://localhost:3000
```

Configure the API origin via `.env.local`:

```
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

## Layout
- `app/` — one route per page; each renders `<Shell>` (nav + per-page sidebar
  controls) + its charts.
- `components/` — `PlotlyChart` (client-only), `Sidebar`, `PageHeader`,
  selectors.
- `lib/theme.ts` — palette + Plotly layout template (ported from the Python
  `gridiron/theme.py`).
- `lib/hooks.ts` — TanStack Query hooks + URL-backed season/position state.
- `lib/api.ts`, `lib/types.ts` — fetch client and response types mirroring
  `api/schemas.py`.
