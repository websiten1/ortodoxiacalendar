"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { getParishSession } from "../../../lib/parish-session";
import { getSupabaseBrowserClient } from "../../../lib/supabase-browser";

type ProgramItem = {
  id: string;
  titlu: string;
  zi_saptamana: string;
  ora: string;
  activ: boolean;
};

const weekdays = ["luni", "marti", "miercuri", "joi", "vineri", "sambata", "duminica"];
const weekdayLabels: Record<string, string> = {
  luni: "Luni",
  marti: "Marți",
  miercuri: "Miercuri",
  joi: "Joi",
  vineri: "Vineri",
  sambata: "Sâmbătă",
  duminica: "Duminică"
};

export default function DashboardProgramPage() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [parishId, setParishId] = useState("");
  const [entries, setEntries] = useState<ProgramItem[]>([]);
  const [form, setForm] = useState({
    titlu: "",
    zi_saptamana: "duminica",
    ora: ""
  });

  async function loadEntries() {
    if (!supabase) return;
    setLoading(true);
    setError("");

    try {
      const session = await getParishSession(supabase);
      setParishId(session.parishId);

      const { data, error: fetchError } = await supabase
        .from("program_recurent")
        .select("id, titlu, zi_saptamana, ora, activ")
        .eq("parohie_id", session.parishId);

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      const ordered = (data ?? []).sort((a, b) => {
        const dayDiff = weekdays.indexOf(a.zi_saptamana) - weekdays.indexOf(b.zi_saptamana);
        if (dayDiff !== 0) return dayDiff;
        return String(a.ora).localeCompare(String(b.ora));
      });

      setEntries(ordered);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Eroare la încărcare program.");
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

    void loadEntries();
  }, [supabase]);

  async function handleAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase || !parishId) return;
    setSaving(true);
    setError("");

    const { error: insertError } = await supabase.from("program_recurent").insert({
      parohie_id: parishId,
      titlu: form.titlu,
      zi_saptamana: form.zi_saptamana,
      ora: form.ora,
      activ: true
    });

    setSaving(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setForm({ titlu: "", zi_saptamana: "duminica", ora: "" });
    await loadEntries();
  }

  async function toggleActive(item: ProgramItem) {
    if (!supabase) return;
    const { error: updateError } = await supabase
      .from("program_recurent")
      .update({ activ: !item.activ })
      .eq("id", item.id);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    await loadEntries();
  }

  async function removeEntry(id: string) {
    if (!supabase) return;
    const shouldDelete = window.confirm("Sigur vrei să ștergi această intrare din program?");
    if (!shouldDelete) return;

    const { error: deleteError } = await supabase.from("program_recurent").delete().eq("id", id);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    await loadEntries();
  }

  return (
    <div className="card">
      <h1>Programul parohiei</h1>
      <p>Listă recurentă pe zile + toggle activ/inactiv.</p>

      {error ? (
        <p className="banner banner-error">{error}</p>
      ) : null}

      <form onSubmit={handleAdd} style={{ display: "grid", gap: 10, marginBottom: 18 }}>
        <input
          className="input"
          placeholder="Titlu (ex. Sfânta Liturghie)"
          required
          value={form.titlu}
          onChange={(event) => setForm((prev) => ({ ...prev, titlu: event.target.value }))}
        />
        <div className="program-add-row">
          <select
            className="input"
            value={form.zi_saptamana}
            onChange={(event) => setForm((prev) => ({ ...prev, zi_saptamana: event.target.value }))}
          >
            {weekdays.map((day) => (
              <option key={day} value={day}>
                {weekdayLabels[day]}
              </option>
            ))}
          </select>
          <input
            className="input"
            type="time"
            required
            value={form.ora}
            onChange={(event) => setForm((prev) => ({ ...prev, ora: event.target.value }))}
          />
          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? "Salvez..." : "+ Adaugă"}
          </button>
        </div>
      </form>

      {loading ? <p>Se încarcă programul...</p> : null}

      {!loading && entries.length === 0 ? <p>Nu există încă intrări în programul recurent.</p> : null}

      <div style={{ display: "grid", gap: 10 }}>
        {entries.map((item) => (
          <div key={item.id} className="program-entry-row">
            <div>
              <strong>{item.titlu}</strong>
              <p style={{ margin: "4px 0 0", color: "var(--ink-muted)" }}>
                {weekdayLabels[item.zi_saptamana]} la {String(item.ora).slice(0, 5)}
              </p>
            </div>
            <span style={{ color: item.activ ? "#067647" : "#b54708", fontWeight: 600 }}>
              {item.activ ? "Activ" : "Inactiv"}
            </span>
            <button className="btn btn-secondary" onClick={() => toggleActive(item)}>
              Toggle
            </button>
            <button className="btn btn-secondary" onClick={() => removeEntry(item.id)}>
              Șterge
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
