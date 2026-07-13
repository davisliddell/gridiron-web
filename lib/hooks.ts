"use client";

import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

import { apiGet } from "./api";
import type { Heatmap, HeatmapPick, Meta, Pool, Similarity } from "./types";

// --- Data hooks (TanStack Query) ---

export function useMeta() {
  return useQuery({
    queryKey: ["meta"],
    queryFn: () => apiGet<Meta>("/api/meta"),
    staleTime: Infinity,
  });
}

export function usePool(season: number, position: string) {
  return useQuery({
    queryKey: ["pool", season, position],
    queryFn: () => apiGet<Pool>("/api/pool", { season, position }),
  });
}

export function useSimilarity(
  season: number,
  position: string,
  playerId?: string,
) {
  return useQuery({
    queryKey: ["similarity", season, position, playerId ?? null],
    queryFn: () =>
      apiGet<Similarity>("/api/similarity", {
        season,
        position,
        player_id: playerId,
      }),
  });
}

export function useHeatmapPlayers(season: number, mode: "rec" | "rush") {
  return useQuery({
    queryKey: ["heatmap-players", season, mode],
    queryFn: () =>
      apiGet<HeatmapPick[]>("/api/heatmap/players", { season, mode }),
  });
}

export function useHeatmap(
  season: number,
  mode: "rec" | "rush",
  metric: string,
  playerIds: string[],
) {
  return useQuery({
    queryKey: ["heatmap", season, mode, metric, playerIds],
    queryFn: () =>
      apiGet<Heatmap>("/api/heatmap", {
        season,
        mode,
        metric,
        player_ids: playerIds.join(","),
      }),
    enabled: playerIds.length > 0,
  });
}

// --- URL-backed selection state (persists across page navigation) ---

type Option = { value: string; label: string };

/** Season bound to ?season, defaulting to the latest available season. */
export function useSeason(): [number | undefined, (v: string) => void, Option[]] {
  const { data: meta } = useMeta();
  const [param, setParam] = useQueryParam("season", "");
  const season = param ? Number(param) : meta?.seasons[0];
  const options = (meta?.seasons ?? []).map((s) => ({
    value: String(s),
    label: String(s),
  }));
  return [season, setParam, options];
}

/** Position bound to ?position, with a per-page default. */
export function usePosition(
  dflt: string,
): [string, (v: string) => void, Option[]] {
  const { data: meta } = useMeta();
  const [param, setParam] = useQueryParam("position", dflt);
  const options = (meta?.positions ?? ["QB", "RB", "WR", "TE"]).map((p) => ({
    value: p,
    label: p,
  }));
  return [param, setParam, options];
}

export function useQueryParam(
  key: string,
  fallback: string,
): [string, (v: string) => void] {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const value = params.get(key) ?? fallback;

  const setValue = useCallback(
    (v: string) => {
      const next = new URLSearchParams(params.toString());
      next.set(key, v);
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    },
    [key, params, pathname, router],
  );

  return [value, setValue];
}
