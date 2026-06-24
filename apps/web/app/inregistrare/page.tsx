"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "../../lib/supabase-browser";

type RegistrationForm = {
  email: string;
  password: string;
  preot_nume: string;
  preot_telefon: string;
  nume: string;
  hram: string;
  data_hram: string;
  stil: "nou" | "vechi";
  adresa: string;
  localitate: string;
  judet: string;
  tara: string;
  descriere: string;
};

export default function InregistrarePage() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<RegistrationForm>({
    email: "",
    password: "",
    preot_nume: "",
    preot_telefon: "",
    nume: "",
    hram: "",
    data_hram: "",
    stil: "nou",
    adresa: "",
    localitate: "",
    judet: "",
    tara: "România",
    descriere: ""
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!supabase) {
      setError("Configurează NEXT_PUBLIC_SUPABASE_URL și NEXT_PUBLIC_SUPABASE_ANON_KEY.");
      return;
    }

    setSubmitting(true);

    const { email, password, ...rest } = form;
    const payload = {
      ...rest,
      email,
      data_hram: form.data_hram || null,
      descriere: form.descriere || null,
      status: "in_asteptare_verificare"
    };

    await supabase.auth.signUp({ email, password });
    await supabase.from("parohii").insert(payload);
    setSubmitting(false);
    router.push("/dashboard");
  }

  return (
    <div className="container" style={{ maxWidth: 900, paddingTop: 40 }}>
      <div className="card">
        <h1>Înregistrare parohie</h1>
        <p>Formular MVP conform specificației funcționale.</p>

        <form onSubmit={handleSubmit}>
          <h3>Pasul 1 — Date de identificare</h3>
          <div style={{ display: "grid", gap: 10, marginBottom: 20 }}>
            <input
              className="input"
              type="email"
              placeholder="Email"
              required
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            />
            <input
              className="input"
              type="password"
              placeholder="Parolă"
              required
              minLength={6}
              value={form.password}
              onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
            />
            <input
              className="input"
              type="text"
              placeholder="Nume preot"
              required
              value={form.preot_nume}
              onChange={(event) => setForm((prev) => ({ ...prev, preot_nume: event.target.value }))}
            />
            <input
              className="input"
              type="text"
              placeholder="Telefon de contact"
              required
              value={form.preot_telefon}
              onChange={(event) => setForm((prev) => ({ ...prev, preot_telefon: event.target.value }))}
            />
          </div>

          <h3>Pasul 2 — Date parohie</h3>
          <div style={{ display: "grid", gap: 10 }}>
            <input
              className="input"
              type="text"
              placeholder="Nume parohie"
              required
              value={form.nume}
              onChange={(event) => setForm((prev) => ({ ...prev, nume: event.target.value }))}
            />
            <input
              className="input"
              type="text"
              placeholder="Hram"
              required
              value={form.hram}
              onChange={(event) => setForm((prev) => ({ ...prev, hram: event.target.value }))}
            />
            <input
              className="input"
              type="date"
              value={form.data_hram}
              onChange={(event) => setForm((prev) => ({ ...prev, data_hram: event.target.value }))}
            />
            <select
              className="input"
              value={form.stil}
              onChange={(event) => setForm((prev) => ({ ...prev, stil: event.target.value as "nou" | "vechi" }))}
            >
              <option value="nou">Stil nou</option>
              <option value="vechi">Stil vechi</option>
            </select>
            <input
              className="input"
              type="text"
              placeholder="Adresă completă"
              required
              value={form.adresa}
              onChange={(event) => setForm((prev) => ({ ...prev, adresa: event.target.value }))}
            />
            <input
              className="input"
              type="text"
              placeholder="Localitate"
              required
              value={form.localitate}
              onChange={(event) => setForm((prev) => ({ ...prev, localitate: event.target.value }))}
            />
            <input
              className="input"
              type="text"
              placeholder="Județ / Regiune"
              required
              value={form.judet}
              onChange={(event) => setForm((prev) => ({ ...prev, judet: event.target.value }))}
            />
            <input
              className="input"
              type="text"
              placeholder="Țară"
              required
              value={form.tara}
              onChange={(event) => setForm((prev) => ({ ...prev, tara: event.target.value }))}
            />
            <textarea
              className="input"
              placeholder="Descriere scurtă"
              rows={4}
              maxLength={300}
              value={form.descriere}
              onChange={(event) => setForm((prev) => ({ ...prev, descriere: event.target.value }))}
            />
          </div>

          <button className="btn btn-primary" style={{ marginTop: 16 }} type="submit" disabled={submitting}>
            {submitting ? "Se înregistrează..." : "Înregistrează parohia"}
          </button>
        </form>

        {error ? (
          <p className="banner banner-error" style={{ marginTop: 14 }}>
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}
