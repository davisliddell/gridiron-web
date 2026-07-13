"use client";

import { Suspense, useEffect, useMemo, useState } from "react";

import { PageHeader } from "@/components/PageHeader";
import { PlotlyChart } from "@/components/PlotlyChart";
import { PlayerMultiSelect, Select } from "@/components/Selectors";
import { Shell } from "@/components/Shell";
import { useHeatmap, useHeatmapPlayers, useSeason } from "@/lib/hooks";
import { INK, MUTED, SEQUENTIAL_BLUE, layout } from "@/lib/theme";

const MODES = [
  { value: "rec", label: "Receiving (target depth)" },
  { value: "rush", label: "Rushing (run gaps)" },
];
const METRICS = ["Volume (plays)", "Yards", "EPA per play", "Success rate %"];
const MAX_SEL: Record<string, number> = { rec: 2, rush: 4 };

function Inner() {
  const [season, setSeason, seasonOpts] = useSeason();
  const [mode, setMode] = useState<"rec" | "rush">("rec");
  const [metric, setMetric] = useState(METRICS[0]);
  const [chosen, setChosen] = useState<string[]>([]);

  const picks = useHeatmapPlayers(season ?? 0, mode);
  const pickList = picks.data ?? [];

  useEffect(() => {
    setChosen([]);
  }, [season, mode]);

  // Default to the top two by volume when nothing is picked.
  const effective = chosen.length ? chosen : pickList.slice(0, 2).map((p) => p.player_id);
  const hm = useHeatmap(season ?? 0, mode, metric, effective);
  const data = hm.data;

  const controls = (
    <>
      <Select label="Season" value={season ? String(season) : ""} options={seasonOpts} onChange={setSeason} />
      <Select label="Map type" value={mode} options={MODES} onChange={(v) => setMode(v as "rec" | "rush")} />
      <Select label="Cell value" value={metric} options={METRICS.map((m) => ({ value: m, label: m }))} onChange={setMetric} />
      <PlayerMultiSelect
        label="Players to compare"
        options={pickList.map((p) => ({ id: p.player_id, label: p.label }))}
        value={chosen}
        onChange={setChosen}
        max={MAX_SEL[mode]}
      />
    </>
  );

  const figure = useMemo(() => {
    if (!data) return null;

    if (data.mode === "rec") {
      const players = data.players;
      const n = players.length;
      const spacing = 0.12;
      const width = (1 - spacing * (n - 1)) / n;
      const zRange: Record<string, number> = {};
      if (data.zmin != null) zRange.zmin = data.zmin;
      if (data.zmax != null) zRange.zmax = data.zmax;

      const traces = players.map((p, k) => {
        const suffix = k === 0 ? "" : String(k + 1);
        return {
          type: "heatmap",
          z: p.grid,
          x: data.dirs,
          y: data.depth_order,
          ...zRange,
          colorscale: SEQUENTIAL_BLUE,
          showscale: k === n - 1,
          text: p.text,
          texttemplate: "%{text}",
          textfont: { color: INK, size: 13 },
          xgap: 2,
          ygap: 2,
          xaxis: `x${suffix || ""}`,
          yaxis: `y${suffix || ""}`,
          hovertemplate: `%{y} %{x}<br>${data.metric_label}: %{z:.2f}<extra></extra>`,
          colorbar: { title: { text: data.metric_label }, outlinewidth: 0, tickcolor: MUTED },
        };
      });

      const lay: Record<string, unknown> = layout({ height: 480 });
      const annotations = players.map((p, k) => {
        const start = k * (width + spacing);
        return {
          text: p.name,
          x: start + width / 2,
          y: 1.06,
          xref: "paper",
          yref: "paper",
          showarrow: false,
          font: { color: INK, size: 14 },
        };
      });
      lay.annotations = annotations;
      players.forEach((_, k) => {
        const start = k * (width + spacing);
        const axSuffix = k === 0 ? "" : String(k + 1);
        lay[`xaxis${axSuffix}`] = { domain: [start, start + width], showgrid: false, anchor: `y${axSuffix}` };
        // automargin so the leftmost depth labels ("Intermed. (10–19)") aren't clipped.
        lay[`yaxis${axSuffix}`] = { autorange: "reversed", showgrid: false, anchor: `x${axSuffix}`, automargin: true };
      });
      return { data: traces, height: 480, layout: lay };
    }

    // Rushing: single stacked heatmap.
    const ylabels = data.players.map((p) => p.name);
    const trace = {
      type: "heatmap",
      z: data.grid,
      x: data.gap_order,
      y: ylabels,
      colorscale: SEQUENTIAL_BLUE,
      text: data.text,
      texttemplate: "%{text}",
      textfont: { color: INK, size: 13 },
      xgap: 2,
      ygap: 2,
      hovertemplate: `%{y}<br>%{x}: %{z:.2f}<extra></extra>`,
      colorbar: { title: { text: data.metric_label }, outlinewidth: 0, tickcolor: MUTED },
    };
    const height = 120 + 70 * data.players.length;
    const lay = layout({
      height,
      showlegend: false,
      xaxis: { showgrid: false },
      yaxis: { showgrid: false, automargin: true },
    });
    return { data: [trace], height, layout: lay };
  }, [data]);

  return (
    <Shell controls={controls}>
      <PageHeader
        title="Field Heatmaps"
        subtitle="Where on the field does each player produce? Target depth for receivers, run gaps for rushers — straight from play-by-play."
      />
      {picks.isLoading && <p className="caption">Loading play-by-play…</p>}
      {picks.data && pickList.length === 0 && (
        <div className="warning">No players with enough plays this season.</div>
      )}
      {!effective.length && pickList.length > 0 && (
        <p className="caption">Pick at least one player.</p>
      )}
      {figure && <PlotlyChart data={figure.data} layout={figure.layout} height={figure.height} />}
      {data?.mode === "rec" && figure && (
        <p className="caption">
          Rows = target depth (line of scrimmage at bottom). Columns = direction
          from the QB&apos;s view. Shared color scale across players.
        </p>
      )}
      {data?.mode === "rush" && figure && (
        <p className="caption">
          Columns run left-to-right across the offensive line. Gaps come from
          play-by-play run location &amp; gap tags.
        </p>
      )}
    </Shell>
  );
}

export default function HeatmapsPage() {
  return (
    <Suspense fallback={null}>
      <Inner />
    </Suspense>
  );
}
