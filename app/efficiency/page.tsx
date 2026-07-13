"use client";

import { Suspense, useEffect, useMemo, useState } from "react";

import { PageHeader } from "@/components/PageHeader";
import { PlotlyChart } from "@/components/PlotlyChart";
import { PlayerMultiSelect, Select } from "@/components/Selectors";
import { Shell } from "@/components/Shell";
import { usePool, usePosition, useSeason } from "@/lib/hooks";
import type { PoolPlayer } from "@/lib/types";
import { AXIS, CATEGORICAL, INK, INK_2, SURFACE, layout } from "@/lib/theme";

function median(xs: number[]): number {
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

function val(p: PoolPlayer, key: string): number | null {
  return key === "volume" ? p.volume.value : p.metrics[key];
}

function Inner() {
  const [season, setSeason, seasonOpts] = useSeason();
  const [position, setPosition, posOpts] = usePosition("RB");
  const pool = usePool(season ?? 0, position);
  const data = pool.data;
  const specs = data?.specs ?? [];

  const volLabel = data?.players[0]?.volume.label ?? "Volume";
  const axisOptions = useMemo(
    () => [{ label: volLabel, key: "volume" }, ...specs.map((s) => ({ label: s.label, key: s.key }))],
    [volLabel, specs],
  );

  const [xKey, setXKey] = useState("volume");
  const [yKey, setYKey] = useState("");
  const [highlight, setHighlight] = useState<string[]>([]);

  // Reset axes/highlight to defaults when the pool changes.
  useEffect(() => {
    setXKey("volume");
    setYKey(specs[0]?.key ?? "");
    setHighlight([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [season, position]);

  const xLabel = axisOptions.find((o) => o.key === xKey)?.label ?? volLabel;
  const yLabel = axisOptions.find((o) => o.key === yKey)?.label ?? "";

  const controls = (
    <>
      <Select label="Season" value={season ? String(season) : ""} options={seasonOpts} onChange={setSeason} />
      <Select label="Position" value={position} options={posOpts} onChange={setPosition} />
      <Select label="X axis (usage)" value={xKey} options={axisOptions.map((o) => ({ value: o.key, label: o.label }))} onChange={setXKey} />
      <Select label="Y axis (efficiency)" value={yKey} options={axisOptions.map((o) => ({ value: o.key, label: o.label }))} onChange={setYKey} />
      <PlayerMultiSelect
        label="Highlight players (optional)"
        options={(data?.players ?? []).map((p) => ({ id: p.player_id, label: p.label }))}
        value={highlight}
        onChange={setHighlight}
      />
    </>
  );

  let content = null;
  if (data && data.pool_size > 0 && yKey) {
    const players = data.players;
    const xs = players.map((p) => val(p, xKey));
    const ys = players.map((p) => val(p, yKey));
    const xMed = median(xs.filter((v): v is number => v != null));
    const yMed = median(ys.filter((v): v is number => v != null));
    const hi = new Set(highlight);

    const bgIdx = players.map((_, i) => i).filter((i) => !hi.has(players[i].player_id));
    const traces: unknown[] = [
      {
        type: "scatter",
        mode: "markers",
        name: "Qualified players",
        x: bgIdx.map((i) => xs[i]),
        y: bgIdx.map((i) => ys[i]),
        text: bgIdx.map((i) => players[i].display_name),
        marker: { size: 9, color: CATEGORICAL[0], opacity: 0.45, line: { width: 1, color: SURFACE } },
        hovertemplate: `<b>%{text}</b><br>${xLabel}: %{x:.2f}<br>${yLabel}: %{y:.2f}<extra></extra>`,
      },
    ];

    if (hi.size) {
      const hiIdx = players.map((_, i) => i).filter((i) => hi.has(players[i].player_id));
      traces.push({
        type: "scatter",
        mode: "markers+text",
        name: "Highlighted",
        x: hiIdx.map((i) => xs[i]),
        y: hiIdx.map((i) => ys[i]),
        text: hiIdx.map((i) => players[i].display_name),
        textposition: "top center",
        textfont: { color: INK, size: 12 },
        marker: { size: 13, color: CATEGORICAL[2], line: { width: 1.5, color: INK } },
        hovertemplate: `<b>%{text}</b><br>${xLabel}: %{x:.2f}<br>${yLabel}: %{y:.2f}<extra></extra>`,
      });
    } else {
      // Auto-label the standouts (top 3 by X and by Y).
      const topBy = (arr: (number | null)[]) =>
        arr
          .map((v, i) => [v, i] as const)
          .filter(([v]) => v != null)
          .sort((a, b) => (b[0] as number) - (a[0] as number))
          .slice(0, 3)
          .map(([, i]) => i);
      const idx = Array.from(new Set([...topBy(xs), ...topBy(ys)]));
      traces.push({
        type: "scatter",
        mode: "text",
        x: idx.map((i) => xs[i]),
        y: idx.map((i) => ys[i]),
        text: idx.map((i) => players[i].display_name),
        textposition: "top center",
        textfont: { color: INK_2, size: 11 },
        showlegend: false,
        hoverinfo: "skip",
      });
    }

    const scatterLayout = layout({
      height: 600,
      showlegend: false,
      xaxis: { title: { text: xLabel } },
      yaxis: { title: { text: yLabel } },
      shapes: [
        { type: "line", x0: xMed, x1: xMed, yref: "paper", y0: 0, y1: 1, line: { color: AXIS, width: 1, dash: "dot" } },
        { type: "line", y0: yMed, y1: yMed, xref: "paper", x0: 0, x1: 1, line: { color: AXIS, width: 1, dash: "dot" } },
      ],
    });

    content = (
      <>
        <PlotlyChart data={traces} layout={scatterLayout} height={600} />
        <p className="caption">
          Dotted lines mark the median {xLabel.toLowerCase()} and {yLabel.toLowerCase()} among{" "}
          {data.pool_size} qualified {position}s in {season}.
        </p>
      </>
    );
  }

  return (
    <Shell controls={controls}>
      <PageHeader
        title="Efficiency vs. Volume"
        subtitle="Per-play value against usage. Upper-right = high volume AND efficient — the real difference-makers. Upper-left = efficient but underused."
      />
      {pool.isLoading && <p className="caption">Loading…</p>}
      {data && data.pool_size === 0 && (
        <div className="warning">No qualified players for that position/season.</div>
      )}
      {content}
    </Shell>
  );
}

export default function EfficiencyPage() {
  return (
    <Suspense fallback={null}>
      <Inner />
    </Suspense>
  );
}
