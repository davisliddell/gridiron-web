"use client";

import { Sidebar } from "./Sidebar";

/** App frame: nav sidebar (with page-specific controls) + content column. */
export function Shell({
  controls,
  children,
}: {
  controls?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="app">
      <Sidebar>{controls}</Sidebar>
      <main className="content">{children}</main>
    </div>
  );
}
