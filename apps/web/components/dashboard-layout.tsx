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
    <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", minHeight: "100vh" }}>
      <aside style={{ borderRight: "1px solid var(--border-alt)", padding: "24px 16px", background: "var(--surface)" }}>
        <h2 style={{ marginTop: 0, marginBottom: 20, color: "var(--crimson)" }}>Ortodoxia</h2>
        <nav style={{ display: "grid", gap: 4 }}>
          {items.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  textAlign: "left",
                  padding: "10px 12px",
                  borderRadius: 8,
                  fontWeight: 600,
                  fontSize: 14,
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
