"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const PAGES = [
  { href: "/", label: "🏈 Home" },
  { href: "/player-cards", label: "🧬 Player Cards" },
  { href: "/efficiency", label: "📈 Efficiency vs. Volume" },
  { href: "/heatmaps", label: "🗺️ Field Heatmaps" },
  { href: "/similarity", label: "🧭 Similarity" },
];

export function Sidebar({ children }: { children?: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <nav className="sidebar">
      <div className="nav-brand">Gridiron Viz</div>
      {PAGES.map((p) => (
        <Link
          key={p.href}
          href={p.href}
          className={`nav-link${pathname === p.href ? " active" : ""}`}
        >
          {p.label}
        </Link>
      ))}
      {children ? <div className="sidebar-section">{children}</div> : null}
    </nav>
  );
}
