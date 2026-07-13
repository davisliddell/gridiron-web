"use client";

import { Suspense, useEffect, useState } from "react";

import { PageHeader } from "@/components/PageHeader";
import { PlotlyChart } from "@/components/PlotlyChart";
import { Select } from "@/components/Selectors";
import { Shell } from "@/components/Shell";
import { usePosition, useSeason, useSimilarity } from "@/lib/hooks";
import { CATEGORICAL, INK, INK_2, MUTED, SURFACE, layout } from "@/lib/theme";

function Inner() {
  const [season, setSeason, seasonOpts] = useSeason();
  const [position, setPosition, posOpts] = usePosition("WR");
  const [playerId, setPlayerId] = useState<string | undefined>(undefined);
  const sim = useSimilarity(season ?? 0, position, playerId);
  const data = sim.data;

  useEffect(() => {
    setPlayerId(undefined);
  }, [season, position]);

  const playerOptions = (data?.style_map ?? []).map((s) => ({
    value: s.player_id,
    label: s.name,
  }));

  const controls = (
    <>
      <Select label="Season" value={season ? String(season) : ""} options={seasonOpts} onChange={setSeason} />
      <Select label="Position" value={position} options={posOpts} onChange={setPosition} />
      {data?.target && (
        <Select
          label="Find comps for"
          value={data.target.player_id}
          options={playerOptions}
          onChange={setPlayerId}
        />
      )}
    </>
  );

  let body = null;
  if (data && data.pool_size < 5) {
    body = <div className="warning">Not enough qualified players to compute comps.</div>;
  } else if (data && data.target) {
    // --- Comps bar (closest at top) ---
    const names = data.comps.map((c) => c.name);
    const rel = data.comps.map((c) => c.rel_similarity);
    const barTrace = {
      type: "bar",
      orientation: "h",
      x: [...rel].reverse(),
      y: [...names].reverse(),
      marker: { color: CATEGORICAL[0], line: { width: 0 } },
      text: [...rel].reverse().map((s) => s.toFixed(0)),
      textposition: "outside",
      textfont: { color: INK_2, size: 12 },
      hovertemplate: "<b>%{y}</b><br>similarity %{x:.0f}<extra></extra>",
    };
    const barLayout = layout({
      height: 380,
      showlegend: false,
      xaxis: { title: { text: "Similarity (relative to closest)" }, range: [0, 108] },
      // Auto-expand the left margin so long player names aren't clipped.
      yaxis: { automargin: true },
    });

    // --- Style map (PCA) ---
    const groups = { league: [], comp: [], target: [] } as Record<string, typeof data.style_map>;
    data.style_map.forEach((p) => groups[p.group].push(p));
    const scatter = (
      pts: typeof data.style_map,
      name: string,
      marker: Record<string, unknown>,
      withText = false,
    ) => ({
      type: "scatter",
      mode: withText ? "markers+text" : "markers",
      name,
      x: pts.map((p) => p.pc1),
      y: pts.map((p) => p.pc2),
      text: pts.map((p) => p.name),
      textposition: "top center",
      textfont: { color: INK, size: 13 },
      marker,
      hovertemplate: "%{text}<extra></extra>",
    });
    const mapTraces = [
      scatter(groups.league, "League", { size: 8, color: MUTED, opacity: 0.4, line: { width: 1, color: SURFACE } }),
      scatter(groups.comp, "Comps", { size: 11, color: CATEGORICAL[0], line: { width: 1, color: SURFACE } }),
      scatter(groups.target, "Selected", { size: 16, color: CATEGORICAL[2], line: { width: 1.5, color: INK } }, true),
    ];
    const mapLayout = layout({
      height: 380,
      xaxis: { title: { text: "PC1" }, showticklabels: false },
      yaxis: { title: { text: "PC2" }, showticklabels: false },
    });

    body = (
      <>
        <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
          <div style={{ flex: "5 1 380px" }}>
            <h2 style={{ fontSize: "1.1rem" }}>Closest comps</h2>
            <PlotlyChart data={[barTrace]} layout={barLayout} height={380} />
          </div>
          <div style={{ flex: "6 1 420px" }}>
            <h2 style={{ fontSize: "1.1rem" }}>Style map (PCA)</h2>
            <PlotlyChart data={mapTraces} layout={mapLayout} height={380} />
          </div>
        </div>
        <p className="caption">
          Feature space: {data.feature_labels.join(", ")} — z-scored across{" "}
          {data.pool_size} qualified {position}s in {season}.
        </p>
      </>
    );
  }

  return (
    <Shell controls={controls}>
      <PageHeader
        title="Similarity Engine"
        subtitle="Who plays like whom? Nearest statistical neighbors across the league, plus a 2-D 'style map' from PCA."
      />
      {sim.isLoading && <p className="caption">Loading…</p>}
      {body}
    </Shell>
  );
}

export default function SimilarityPage() {
  return (
    <Suspense fallback={null}>
      <Inner />
    </Suspense>
  );
}
