"use client";

import { useEffect, useMemo, useState } from "react";
import { getParishSession } from "../../../lib/parish-session";
import { getSupabaseBrowserClient } from "../../../lib/supabase-browser";

export default function DashboardUrmaritoriPage() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);
  const [lastMonth, setLastMonth] = useState(0);

  useEffect(() => {
    if (!supabase) {
      setError("Configurează NEXT_PUBLIC_SUPABASE_URL și NEXT_PUBLIC_SUPABASE_ANON_KEY.");
      setLoading(false);
      return;
    }

    async function load() {
      setLoading(true);
      setError("");

      try {
        const session = await getParishSession(supabase!);
        const since = new Date();
        since.setDate(since.getDate() - 30);

        const [{ count: totalCount }, { count: recentCount }] = await Promise.all([
          supabase!
            .from("urmariri")
            .select("*", { count: "exact", head: true })
            .eq("parohie_id", session.parishId),
          supabase!
            .from("urmariri")
            .select("*", { count: "exact", head: true })
            .eq("parohie_id", session.parishId)
            .gte("created_at", since.toISOString())
        ]);

        setTotal(totalCount ?? 0);
        setLastMonth(recentCount ?? 0);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Eroare la încărcare urmăritori.");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [supabase]);

  return (
    <div className="card">
      <h1>Urmăritori</h1>

      {error ? (
        <p style={{ color: "#b42318", background: "#fef3f2", padding: 10, borderRadius: 8 }}>{error}</p>
      ) : null}

      {loading ? (
        <p>Se încarcă...</p>
      ) : (
        <div style={{ display: "grid", gap: 16 }}>
          <div>
            <p style={{ margin: 0, color: "#667" }}>Total urmăritori</p>
            <h2 style={{ fontSize: 48, margin: "4px 0 0" }}>{total}</h2>
          </div>
          <div>
            <p style={{ margin: 0, color: "#667" }}>Urmăritori noi în ultimele 30 de zile</p>
            <h3 style={{ margin: "4px 0 0" }}>{lastMonth}</h3>
          </div>
          <p style={{ color: "#8a93a6", margin: 0 }}>
            Nu sunt afișate detalii individuale despre urmăritori, pentru a proteja intimitatea utilizatorilor.
          </p>
        </div>
      )}
    </div>
  );
}
