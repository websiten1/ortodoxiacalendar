"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/dashboard", label: "Acasă" },
  { href: "/dashboard/program", label: "Programul parohiei" },
  { href: "/dashboard/evenimente", label: "Evenimente" },
  { href: "/dashboard/profil", label: "Profilul parohiei" },
  { href: "/dashboard/urmaritori", label: "Urmăritori" },
  { href: "/dashboard/setari", label: "Setări cont" }
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <h2 style={{ marginTop: 0, marginBottom: 20, color: "var(--crimson)" }}>Ortodoxia</h2>
        <nav className="dashboard-nav">
          {items.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="dashboard-nav-link"
                style={{
                  color: isActive ? "var(--crimson)" : "var(--ink-muted)"
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="container">{children}</main>
    </div>
  );
}
