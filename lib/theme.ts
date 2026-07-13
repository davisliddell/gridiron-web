/**
 * Visual system — ported from the Streamlit app's gridiron/theme.py.
 *
 * Dark-mode-first palette (CVD-checked categorical hues) plus a Plotly.js layout
 * template mirroring theme._register_template so every chart reads as one system.
 */

// --- Surfaces & ink (dark mode) ---
export const SURFACE = "#1a1a19";
export const PLANE = "#0d0d0d";
export const INK = "#ffffff";
export const INK_2 = "#c3c2b7";
export const MUTED = "#898781";
export const GRID = "#2c2c2a";
export const AXIS = "#383835";

// --- Categorical palette (fixed order — assign by slot, never cycle) ---
export const CATEGORICAL = [
  "#3987e5", // blue
  "#199e70", // aqua
  "#c98500", // yellow
  "#008300", // green
  "#9085e9", // violet
  "#e66767", // red
  "#d55181", // magenta
  "#d95926", // orange
];

// --- Sequential ramp (blue, low→high; low recedes into the dark surface) ---
export const SEQUENTIAL_BLUE: [number, string][] = [
  [0.0, "#15223a"],
  [0.2, "#104281"],
  [0.4, "#184f95"],
  [0.6, "#256abf"],
  [0.8, "#3987e5"],
  [1.0, "#86b6ef"],
];

// --- Diverging ramp (red ↔ blue, gray midpoint) ---
export const DIVERGING: [number, string][] = [
  [0.0, "#e66767"],
  [0.5, "#383835"],
  [1.0, "#3987e5"],
];

export const FONT_FAMILY =
  'system-ui, -apple-system, "Segoe UI", sans-serif';

const axis = {
  showgrid: true,
  gridcolor: GRID,
  gridwidth: 1,
  zeroline: false,
  linecolor: AXIS,
  tickcolor: AXIS,
  tickfont: { color: MUTED, size: 12 },
  title: { font: { color: INK_2, size: 13 } },
};

/** Plotly layout template mirroring the Python gridiron_dark template. */
export const gridironTemplate = {
  layout: {
    font: { family: FONT_FAMILY, color: INK_2, size: 13 },
    paper_bgcolor: SURFACE,
    plot_bgcolor: SURFACE,
    colorway: CATEGORICAL,
    title: { font: { color: INK, size: 18 }, x: 0.0, xanchor: "left" },
    xaxis: axis,
    yaxis: axis,
    legend: {
      font: { color: INK_2, size: 12 },
      bgcolor: "rgba(0,0,0,0)",
      orientation: "h",
      yanchor: "bottom",
      y: 1.02,
      xanchor: "left",
      x: 0.0,
    },
    margin: { l: 60, r: 24, t: 56, b: 48 },
    hoverlabel: {
      bgcolor: PLANE,
      bordercolor: AXIS,
      font: { family: FONT_FAMILY, color: INK, size: 12 },
    },
    colorscale: { sequential: SEQUENTIAL_BLUE, diverging: DIVERGING },
  },
};

/** Build a layout with the template applied plus per-chart overrides. */
export function layout(overrides: Record<string, unknown> = {}) {
  return { template: gridironTemplate, ...overrides };
}

// NFL team primary colors, for optional team-based accents.
export const TEAM_COLORS: Record<string, string> = {
  ARI: "#97233F", ATL: "#A71930", BAL: "#241773", BUF: "#00338D",
  CAR: "#0085CA", CHI: "#0B162A", CIN: "#FB4F14", CLE: "#311D00",
  DAL: "#003594", DEN: "#FB4F14", DET: "#0076B6", GB: "#203731",
  HOU: "#03202F", IND: "#002C5F", JAX: "#101820", KC: "#E31837",
  LV: "#000000", LAC: "#0080C6", LA: "#003594", MIA: "#008E97",
  MIN: "#4F2683", NE: "#002244", NO: "#D3BC8D", NYG: "#0B2265",
  NYJ: "#125740", PHI: "#004C54", PIT: "#FFB612", SF: "#AA0000",
  SEA: "#002244", TB: "#D50A0A", TEN: "#0C2340", WAS: "#5A1414",
};
