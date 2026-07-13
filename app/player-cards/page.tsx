"use client";

import { Suspense, useEffect, useState } from "react";

import { PageHeader } from "@/components/PageHeader";
import { PlotlyChart } from "@/components/PlotlyChart";
import { Select, PlayerMultiSelect } from "@/components/Selectors";
import { Shell } from "@/components/Shell";
import { usePool, usePosition, useSeason } from "@/lib/hooks";
import { CATEGORICAL, SURFACE, GRID, AXIS, MUTED, INK_2, layout } from "@/lib/theme";

const MAX = 4;

function Inner() {
  const [season, setSeason, seasonOpts] = useSeason();
  const [position, setPosition, posOpts] = usePosition("QB");
  const pool = usePool(season ?? 0, position);
  const [picked, setPicked] = useState<string[]>([]);

  const data = pool.data;
  const specs = data?.specs ?? [];
  const headline = specs[0]?.key;

  // Default selection: top 3 by the position's headline metric.
  const defaultTop3 =
    data && headline
      ? [...data.players]
          .filter((p) => p.metrics[headline] != null)
          .sort((a, b) => (b.metrics[headline]! - a.metrics[headline]!))
          .slice(0, 3)
          .map((p) => p.player_id)
      : [];

  // Reset selection when the pool changes (season/position switch).
  useEffect(() => {
    setPicked([]);
  }, [season, position]);

  const shown = picked.length ? picked : defaultTop3;

  const controls = (
    <>
      <Select label="Season" value={season ? String(season) : ""} options={seasonOpts} onChange={setSeason} />
      <Select label="Position" value={position} options={posOpts} onChange={setPosition} />
      <PlayerMultiSelect
        label="Compare players"
        options={(data?.players ?? []).map((p) => ({ id: p.player_id, label: p.label }))}
        value={picked}
        onChange={setPicked}
        max={MAX}
      />
    </>
  );

  const axisLabels = specs.map((s) => s.label);
  const traces = shown.map((pid, slot) => {
    const p = data!.players.find((x) => x.player_id === pid)!;
    const r = specs.map((s) => p.ranks[s.key] ?? 0);
    const color = CATEGORICAL[slot % CATEGORICAL.length];
    return {
      type: "scatterpolar",
      r: [...r, r[0]],
      theta: [...axisLabels, axisLabels[0]],
      name: p.display_name,
      line: { color, width: 2 },
      fill: "toself",
      fillcolor: color,
      opacity: 0.55,
      hovertemplate: `<b>%{theta}</b><br>${p.display_name}: %{r:.0f}th pct<extra></extra>`,
    };
  });

  const radarLayout = layout({
    polar: {
      bgcolor: SURFACE,
      radialaxis: {
        range: [0, 100],
        showline: false,
        gridcolor: GRID,
        tickfont: { color: MUTED, size: 10 },
        angle: 90,
        tickangle: 90,
      },
      angularaxis: {
        gridcolor: GRID,
        linecolor: AXIS,
        tickfont: { color: INK_2, size: 12 },
      },
    },
    showlegend: true,
  });

  return (
    <Shell controls={controls}>
      <PageHeader
        title="Player Cards"
        subtitle="Percentile profiles vs. every qualified player at the position. Further from the center is better on every axis."
      />

      {pool.isLoading && <p className="caption">Loading…</p>}
      {data && data.pool_size === 0 && (
        <div className="warning">No qualified players for that position/season.</div>
      )}

      {data && data.pool_size > 0 && (
        <>
          <PlotlyChart data={traces} layout={radarLayout} height={560} />

          <h2 style={{ fontSize: "1.2rem", marginTop: "1.5rem" }}>
            The numbers behind the shape
          </h2>
          <table className="grid-table">
            <thead>
              <tr>
                <th>Metric</th>
                {shown.map((pid) => (
                  <th key={pid}>{data.players.find((p) => p.player_id === pid)!.display_name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {specs.map((s) => (
                <tr key={s.key}>
                  <td>{s.label}</td>
                  {shown.map((pid) => (
                    <td key={pid}>
                      {data.players.find((p) => p.player_id === pid)!.metrics_fmt[s.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          <p className="caption">
            Pool: {data.pool_size} qualified {position}s in {season}. Percentiles
            computed within this pool.
          </p>
        </>
      )}
    </Shell>
  );
}

export default function PlayerCardsPage() {
  return (
    <Suspense fallback={null}>
      <Inner />
    </Suspense>
  );
}
