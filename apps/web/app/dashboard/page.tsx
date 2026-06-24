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
      className: "banner banner-success"
    };
  }

  if (status === "suspendat") {
    return {
      text: "Contul tău e suspendat. Contactează-ne la suport.",
      className: "banner banner-error"
    };
  }

  return {
    text: `Parohia ta e în verificare. Te vom contacta la ${phone}. Poți completa profilul în acest timp.`,
    className: "banner banner-warning"
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

      const { data: userData } = await client.auth.getUser();
      const user = userData.user;
      const email = user?.email ?? "";

      const { data: parohie } = email
        ? await client
            .from("parohii")
            .select("id, nume, email, preot_telefon, status, auth_user_id")
            .eq("email", email)
            .maybeSingle()
        : { data: null };

      if (user && parohie && !parohie.auth_user_id) {
        await client.from("parohii").update({ auth_user_id: user.id }).eq("id", parohie.id);
      }

      const activeParish = parohie ?? {
        id: "00000000-0000-0000-0000-000000000000",
        nume: "Parohia Demo",
        email: "demo@ortodoxia.ro",
        preot_telefon: "-",
        status: "activ" as ParishStatus
      };

      setParish({
        id: activeParish.id,
        nume: activeParish.nume,
        email: activeParish.email,
        preot_telefon: activeParish.preot_telefon,
        status: activeParish.status
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
          .eq("parohie_id", activeParish.id)
          .gte("data", monthStartIso)
          .lt("data", nextMonthStartIso),
        client
          .from("evenimente_locale")
          .select("titlu, data")
          .eq("parohie_id", activeParish.id)
          .gte("data", now.toISOString().slice(0, 10))
          .order("data", { ascending: true })
          .limit(1)
          .maybeSingle(),
        client
          .from("urmariri")
          .select("*", { count: "exact", head: true })
          .eq("parohie_id", activeParish.id)
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
    return <div className="banner banner-error">{error}</div>;
  }

  if (!parish) {
    return <div className="card">Nu există date de parohie pentru acest cont.</div>;
  }

  const banner = statusBanner(parish.status, parish.preot_telefon);

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div className={banner.className}>
        {banner.text}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 16 }}>
        <div className="card">
          <p style={{ margin: 0, color: "var(--ink-faint)" }}>Număr urmăritori</p>
          <h2>{stats.followers}</h2>
        </div>
        <div className="card">
          <p style={{ margin: 0, color: "var(--ink-faint)" }}>Evenimente luna curentă</p>
          <h2>{stats.currentMonthEvents}</h2>
        </div>
        <div className="card">
          <p style={{ margin: 0, color: "var(--ink-faint)" }}>Următorul eveniment</p>
          <h2>{stats.nextEvent}</h2>
        </div>
      </div>
    </div>
  );
}
