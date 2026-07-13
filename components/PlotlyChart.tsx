"use client";

import dynamic from "next/dynamic";

// Plotly needs `window`, so load it client-side only, built from the dist bundle
// via react-plotly.js's factory.
const Plot = dynamic(
  async () => {
    const [{ default: createPlotlyComponent }, Plotly] = await Promise.all([
      import("react-plotly.js/factory"),
      import("plotly.js-dist-min"),
    ]);
    return createPlotlyComponent((Plotly as { default?: unknown }).default ?? Plotly);
  },
  {
    ssr: false,
    loading: () => <div className="caption">Loading chart…</div>,
  },
) as React.ComponentType<{
  data: unknown[];
  layout: Record<string, unknown>;
  config?: Record<string, unknown>;
  style?: React.CSSProperties;
  useResizeHandler?: boolean;
}>;

export function PlotlyChart({
  data,
  layout,
  height = 480,
}: {
  data: unknown[];
  layout: Record<string, unknown>;
  height?: number;
}) {
  return (
    <Plot
      data={data}
      layout={{ autosize: true, height, ...layout }}
      config={{ displaylogo: false, responsive: true }}
      useResizeHandler
      style={{ width: "100%", height }}
    />
  );
}
