"use client";

import { useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "../../lib/supabase-browser";

type ParishStatus = "in_asteptare_verificare" | "activ" | "suspendat";

type Parish = {
  id: string;
  nume: string;
  email: string;
  preot_telefon: string;
  status: ParishStatus;
};

type Stats = {
  followers: number;
  currentMonthEvents: number;
  nextEvent: string;
};

function statusBanner(status: ParishStatus, phone: string) {
  if (status === "activ") {
    return {
      text: "Parohia ta e activă și vizibilă în aplicație.",
      style: { background: "#ecfdf3", borderColor: "#8ad2a5" }
    };
  }

  if (status === "suspendat") {
    return {
      text: "Contul tău e suspendat. Contactează-ne la suport.",
      style: { background: "#fef3f2", borderColor: "#f3b5b1" }
    };
  }

  return {
    text: `Parohia ta e în verificare. Te vom contacta la ${phone}. Poți completa profilul în acest timp.`,
    style: { background: "#fffde8", borderColor: "#f4dc8a" }
  };
}

export default function DashboardPage() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [parish, setParish] = useState<Parish | null>(null);
  const [stats, setStats] = useState<Stats>({
    followers: 0,
    currentMonthEvents: 0,
    nextEvent: "-"
  });

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      setError("Configurează NEXT_PUBLIC_SUPABASE_URL și NEXT_PUBLIC_SUPABASE_ANON_KEY.");
      return;
    }
    const client = supabase;

    async function load() {
      setLoading(true);
      setError("");

      const { data: userData, error: userError } = await client.auth.getUser();

      if (userError || !userData.user) {
        setLoading(false);
        setError("Nu ești autentificat. Intră în cont din pagina de login.");
        return;
      }

      const user = userData.user;
      const email = user.email ?? "";
      const { data: parohie, error: parishError } = await client
        .from("parohii")
        .select("id, nume, email, preot_telefon, status, auth_user_id")
        .eq("email", email)
        .maybeSingle();

      if (parishError || !parohie) {
        setLoading(false);
        setError("Nu am găsit parohia pentru email-ul autentificat.");
        return;
      }

      if (!parohie.auth_user_id) {
        await client.from("parohii").update({ auth_user_id: user.id }).eq("id", parohie.id);
      }

      setParish({
        id: parohie.id,
        nume: parohie.nume,
        email: parohie.email,
        preot_telefon: parohie.preot_telefon,
        status: parohie.status
      });

      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      const monthStartIso = monthStart.toISOString().slice(0, 10);
      const nextMonthStartIso = nextMonthStart.toISOString().slice(0, 10);

      const [{ count: eventsCount }, nextEventRes, followersRes] = await Promise.all([
        client
          .from("evenimente_locale")
          .select("*", { count: "exact", head: true })
          .eq("parohie_id", parohie.id)
          .gte("data", monthStartIso)
          .lt("data", nextMonthStartIso),
        client
          .from("evenimente_locale")
          .select("titlu, data")
          .eq("parohie_id", parohie.id)
          .gte("data", now.toISOString().slice(0, 10))
          .order("data", { ascending: true })
          .limit(1)
          .maybeSingle(),
        client
          .from("urmariri")
          .select("*", { count: "exact", head: true })
          .eq("parohie_id", parohie.id)
      ]);

      setStats({
        followers: followersRes.count ?? 0,
        currentMonthEvents: eventsCount ?? 0,
        nextEvent: nextEventRes.data ? `${nextEventRes.data.titlu} (${nextEventRes.data.data})` : "-"
      });
      setLoading(false);
    }

    void load();
  }, [supabase]);

  if (loading) {
    return <div className="card">Se încarcă dashboard-ul...</div>;
  }

  if (error) {
    return <div className="card" style={{ color: "#b42318" }}>{error}</div>;
  }

  if (!parish) {
    return <div className="card">Nu există date de parohie pentru acest cont.</div>;
  }

  const banner = statusBanner(parish.status, parish.preot_telefon);

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div className="card" style={banner.style}>
        {banner.text}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 16 }}>
        <div className="card">
          <p style={{ margin: 0, color: "#667" }}>Număr urmăritori</p>
          <h2>{stats.followers}</h2>
        </div>
        <div className="card">
          <p style={{ margin: 0, color: "#667" }}>Evenimente luna curentă</p>
          <h2>{stats.currentMonthEvents}</h2>
        </div>
        <div className="card">
          <p style={{ margin: 0, color: "#667" }}>Următorul eveniment</p>
          <h2>{stats.nextEvent}</h2>
        </div>
      </div>
    </div>
  );
}
