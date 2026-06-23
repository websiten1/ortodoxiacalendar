import Link from "next/link";

const items = [
  { href: "/dashboard", label: "Acasă" },
  { href: "/dashboard/program", label: "Programul parohiei" },
  { href: "/dashboard/evenimente", label: "Evenimente" },
  { href: "/dashboard/profil", label: "Profilul parohiei" },
  { href: "/dashboard/urmaritori", label: "Urmăritori" },
  { href: "/dashboard/setari", label: "Setări cont" }
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", minHeight: "100vh" }}>
      <aside style={{ borderRight: "1px solid #e3e7ee", padding: "24px 16px", background: "#fff" }}>
        <h2 style={{ marginTop: 0, marginBottom: 16 }}>Parohia Mea</h2>
        <nav style={{ display: "grid", gap: 8 }}>
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="btn btn-secondary"
              style={{ textAlign: "left" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="container">{children}</main>
    </div>
  );
}
