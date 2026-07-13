/** TS mirrors of api/schemas.py response models. */

export interface Meta {
  first_season: number;
  latest_season: number;
  seasons: number[];
  positions: string[];
}

export interface Spec {
  key: string;
  label: string;
  better: "high" | "low";
  fmt: string;
}

export interface Volume {
  col: string;
  label: string;
  value: number | null;
}

export interface PoolPlayer {
  player_id: string;
  display_name: string;
  team: string;
  label: string;
  metrics: Record<string, number | null>;
  metrics_fmt: Record<string, string>;
  ranks: Record<string, number | null>;
  volume: Volume;
}

export interface Pool {
  season: number;
  position: string;
  pool_size: number;
  specs: Spec[];
  players: PoolPlayer[];
}

export interface Comp {
  player_id: string;
  name: string;
  similarity: number;
  rel_similarity: number;
}

export interface StyleMapPoint {
  player_id: string;
  name: string;
  pc1: number;
  pc2: number;
  group: "target" | "comp" | "league";
}

export interface Similarity {
  season: number;
  position: string;
  pool_size: number;
  feature_labels: string[];
  target: { player_id: string; name: string } | null;
  comps: Comp[];
  style_map: StyleMapPoint[];
}

export interface HeatmapPick {
  player_id: string;
  name: string;
  n: number;
  label: string;
}

export interface HeatmapPlayer {
  player_id: string;
  name: string;
  grid?: (number | null)[][] | null;
  text?: string[][] | null;
}

export interface Heatmap {
  mode: "rec" | "rush";
  metric_label: string;
  depth_order?: string[] | null;
  dirs?: string[] | null;
  zmin?: number | null;
  zmax?: number | null;
  players: HeatmapPlayer[];
  gap_order?: string[] | null;
  grid?: (number | null)[][] | null;
  text?: string[][] | null;
}
