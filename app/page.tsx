"use client";

import { PageHeader } from "@/components/PageHeader";
import { Shell } from "@/components/Shell";
import { useMeta } from "@/lib/hooks";

const ROWS = [
  ["Player Cards", "Where does each player rank? Percentile profiles vs. everyone else at the position."],
  ["Efficiency vs. Volume", "Is that production real or empty? Per-play value against usage."],
  ["Field Heatmaps", "Where on the field do they produce? Target-depth & run-gap maps."],
  ["Similarity Engine", "Who plays like whom? Nearest statistical comps across the league."],
];

export default function HomePage() {
  const { data: meta } = useMeta();
  const range = meta ? `${meta.first_season}–${meta.latest_season}` : "…";

  return (
    <Shell>
      <PageHeader
        title="Gridiron Viz"
        subtitle="Interactive visualizations comparing how NFL players actually play. Built on free nflverse play-by-play data (1999–present)."
      />

      <p style={{ marginTop: "1.25rem" }}>
        Pick a page from the sidebar. Each one answers a different comparison
        question:
      </p>

      <table className="grid-table">
        <thead>
          <tr>
            <th>Page</th>
            <th>Question it answers</th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map(([page, q]) => (
            <tr key={page}>
              <td>
                <strong>{page}</strong>
              </td>
              <td>{q}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="tiles">
        <div className="tile">
          <div className="tile-label">Seasons of data</div>
          <div className="tile-value">{range}</div>
        </div>
        <div className="tile">
          <div className="tile-label">Data source</div>
          <div className="tile-value">nflverse</div>
        </div>
        <div className="tile">
          <div className="tile-label">Positions</div>
          <div className="tile-value">QB · RB · WR · TE</div>
        </div>
      </div>

      <p className="caption">
        Data via nflreadpy. EPA = Expected Points Added · CPOE = Completion %
        Over Expected · WOPR = Weighted Opportunity Rating · YAC = Yards After
        Catch.
      </p>
    </Shell>
  );
}
