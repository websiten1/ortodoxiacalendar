"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getParishSession } from "../../../lib/parish-session";
import { getSupabaseBrowserClient } from "../../../lib/supabase-browser";

type EventItem = {
  id: string;
  titlu: string;
  data: string;
  ora: string | null;
  tip: "liturgic" | "social" | "anunt";
  notificare_trimisa: boolean;
};

export default function DashboardEvenimentePage() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [events, setEvents] = useState<EventItem[]>([]);

  async function loadEvents() {
    if (!supabase) return;
    setLoading(true);
    setError("");

    try {
      const session = await getParishSession(supabase);
      const { data, error: fetchError } = await supabase
        .from("evenimente_locale")
        .select("id, titlu, data, ora, tip, notificare_trimisa")
        .eq("parohie_id", session.parishId)
        .order("data", { ascending: true });

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      setEvents(data ?? []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Eroare la încărcare evenimente.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!supabase) {
      setError("Configurează NEXT_PUBLIC_SUPABASE_URL și NEXT_PUBLIC_SUPABASE_ANON_KEY.");
      setLoading(false);
      return;
    }

    void loadEvents();
  }, [supabase]);

  async function markNotificationSent(eventId: string) {
    if (!supabase) return;
    const { error: updateError } = await supabase
      .from("evenimente_locale")
      .update({ notificare_trimisa: true })
      .eq("id", eventId);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    await loadEvents();
  }

  async function removeEvent(eventId: string) {
    if (!supabase) return;
    const shouldDelete = window.confirm("Sigur vrei să ștergi acest eveniment?");
    if (!shouldDelete) return;

    const { error: deleteError } = await supabase.from("evenimente_locale").delete().eq("id", eventId);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    await loadEvents();
  }

  const today = new Date().toISOString().slice(0, 10);
  const viitoare = events.filter((item) => item.data >= today);
  const trecute = events.filter((item) => item.data < today).reverse();

  function renderEvent(item: EventItem) {
    return (
      <div
        key={item.id}
        style={{
          border: "1px solid #e5e9f2",
          borderRadius: 10,
          padding: 12,
          display: "grid",
          gap: 8
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
          <strong>{item.titlu}</strong>
          <span style={{ textTransform: "capitalize", color: "#505a70" }}>{item.tip}</span>
        </div>
        <p style={{ margin: 0, color: "#59637a" }}>
          {item.data}
          {item.ora ? ` • ${String(item.ora).slice(0, 5)}` : ""}
        </p>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {item.notificare_trimisa ? (
            <span style={{ color: "#067647", fontWeight: 600 }}>📨 Notificare trimisă</span>
          ) : (
            <button className="btn btn-secondary" onClick={() => markNotificationSent(item.id)}>
              Trimite notificare
            </button>
          )}
          <button className="btn btn-secondary" onClick={() => removeEvent(item.id)}>
            Șterge
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h1>Evenimente</h1>
      <p>Viitoare primele, cu stare notificare.</p>
      <Link href="/dashboard/evenimente/nou" className="btn btn-primary">
        + Adaugă eveniment
      </Link>

      {error ? (
        <p style={{ color: "#b42318", background: "#fef3f2", padding: 10, borderRadius: 8, marginTop: 12 }}>
          {error}
        </p>
      ) : null}
      {loading ? <p style={{ marginTop: 12 }}>Se încarcă evenimentele...</p> : null}

      {!loading ? (
        <div style={{ display: "grid", gap: 16, marginTop: 14 }}>
          <section style={{ display: "grid", gap: 10 }}>
            <h3 style={{ margin: 0 }}>Viitoare</h3>
            {viitoare.length === 0 ? <p>Nu ai evenimente viitoare.</p> : viitoare.map(renderEvent)}
          </section>

          <section style={{ display: "grid", gap: 10 }}>
            <h3 style={{ margin: 0 }}>Trecute</h3>
            {trecute.length === 0 ? <p>Nu există evenimente trecute.</p> : trecute.map(renderEvent)}
          </section>
        </div>
      ) : null}
    </div>
  );
}
