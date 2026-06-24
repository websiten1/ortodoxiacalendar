import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="container" style={{ paddingTop: 72 }}>
      <div className="card">
        <h1>Ortodoxia</h1>
        <p>Calendarul și anunțurile parohiei tale, într-un singur loc.</p>
        <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
          <Link href="/login" className="btn btn-primary">
            Intră în cont
          </Link>
          <Link href="/inregistrare" className="btn btn-secondary">
            Înregistrează parohia
          </Link>
        </div>
      </div>
    </div>
  );
}
