"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getParishSession } from "../../../../lib/parish-session";
import { getSupabaseBrowserClient } from "../../../../lib/supabase-browser";

export default function DashboardEvenimentNouPage() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    titlu: "",
    descriere: "",
    data: "",
    ora: "",
    tip: "liturgic" as "liturgic" | "social" | "anunt",
    trimiteNotificare: true
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!supabase) {
      setError("Configurează NEXT_PUBLIC_SUPABASE_URL și NEXT_PUBLIC_SUPABASE_ANON_KEY.");
      return;
    }

    setSubmitting(true);
    try {
      const session = await getParishSession(supabase);
      const { data: inserted, error: insertError } = await supabase
        .from("evenimente_locale")
        .insert({
          parohie_id: session.parishId,
          titlu: form.titlu,
          descriere: form.descriere || null,
          data: form.data,
          ora: form.ora || null,
          tip: form.tip,
          notificare_trimisa: form.trimiteNotificare ? false : true
        })
        .select("id")
        .single();

      if (insertError) {
        throw new Error(insertError.message);
      }

      if (form.trimiteNotificare && inserted) {
        await supabase.functions.invoke("send-event-notifications", {
          body: { eventId: inserted.id }
        });
      }

      router.push("/dashboard/evenimente");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Eroare la salvare eveniment.");
      setSubmitting(false);
    }
  }

  return (
    <div className="card">
      <h1>Adaugă eveniment</h1>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 10 }}>
        <input
          className="input"
          placeholder="Titlu"
          required
          value={form.titlu}
          onChange={(event) => setForm((prev) => ({ ...prev, titlu: event.target.value }))}
        />
        <textarea
          className="input"
          placeholder="Descriere"
          rows={4}
          value={form.descriere}
          onChange={(event) => setForm((prev) => ({ ...prev, descriere: event.target.value }))}
        />
        <input
          className="input"
          type="date"
          required
          value={form.data}
          onChange={(event) => setForm((prev) => ({ ...prev, data: event.target.value }))}
        />
        <input
          className="input"
          type="time"
          value={form.ora}
          onChange={(event) => setForm((prev) => ({ ...prev, ora: event.target.value }))}
        />
        <select
          className="input"
          value={form.tip}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, tip: event.target.value as "liturgic" | "social" | "anunt" }))
          }
        >
          <option value="liturgic">Liturgic</option>
          <option value="social">Social</option>
          <option value="anunt">Anunț</option>
        </select>
        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            type="checkbox"
            checked={form.trimiteNotificare}
            onChange={(event) => setForm((prev) => ({ ...prev, trimiteNotificare: event.target.checked }))}
          />
          Trimite notificare push urmăritorilor la salvare
        </label>

        {error ? (
          <p style={{ color: "#b42318", background: "#fef3f2", padding: 10, borderRadius: 8 }}>{error}</p>
        ) : null}

        <button className="btn btn-primary" style={{ marginTop: 14 }} type="submit" disabled={submitting}>
          {submitting ? "Salvez..." : "Salvează"}
        </button>
      </form>
    </div>
  );
}
