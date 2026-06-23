"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "../../../lib/supabase-browser";

type ProfileForm = {
  nume: string;
  hram: string;
  data_hram: string;
  stil: "nou" | "vechi";
  adresa: string;
  localitate: string;
  judet: string;
  tara: string;
  descriere: string;
  contact_telefon_public: string;
  contact_email_public: string;
  logo_url: string;
};

const emptyForm: ProfileForm = {
  nume: "",
  hram: "",
  data_hram: "",
  stil: "nou",
  adresa: "",
  localitate: "",
  judet: "",
  tara: "România",
  descriere: "",
  contact_telefon_public: "",
  contact_email_public: "",
  logo_url: ""
};

export default function DashboardProfilPage() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [parishId, setParishId] = useState("");
  const [userId, setUserId] = useState("");
  const [originalStil, setOriginalStil] = useState<"nou" | "vechi">("nou");
  const [form, setForm] = useState<ProfileForm>(emptyForm);

  useEffect(() => {
    if (!supabase) {
      setError("Configurează NEXT_PUBLIC_SUPABASE_URL și NEXT_PUBLIC_SUPABASE_ANON_KEY.");
      setLoading(false);
      return;
    }

    async function load() {
      setLoading(true);
      setError("");

      const { data: userData, error: userError } = await supabase!.auth.getUser();
      if (userError || !userData.user) {
        setError("Nu ești autentificat. Intră în cont din pagina de login.");
        setLoading(false);
        return;
      }

      const email = userData.user.email ?? "";
      const { data: parohie, error: parishError } = await supabase!
        .from("parohii")
        .select(
          "id, nume, hram, data_hram, stil, adresa, localitate, judet, tara, descriere, contact_telefon_public, contact_email_public, logo_url"
        )
        .eq("email", email)
        .maybeSingle();

      if (parishError || !parohie) {
        setError("Nu am găsit parohia pentru email-ul autentificat.");
        setLoading(false);
        return;
      }

      setUserId(userData.user.id);
      setParishId(parohie.id);
      setOriginalStil(parohie.stil);
      setForm({
        nume: parohie.nume ?? "",
        hram: parohie.hram ?? "",
        data_hram: parohie.data_hram ?? "",
        stil: parohie.stil ?? "nou",
        adresa: parohie.adresa ?? "",
        localitate: parohie.localitate ?? "",
        judet: parohie.judet ?? "",
        tara: parohie.tara ?? "România",
        descriere: parohie.descriere ?? "",
        contact_telefon_public: parohie.contact_telefon_public ?? "",
        contact_email_public: parohie.contact_email_public ?? "",
        logo_url: parohie.logo_url ?? ""
      });
      setLoading(false);
    }

    void load();
  }, [supabase]);

  async function handleLogoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !supabase || !userId) return;

    setUploading(true);
    setError("");

    const extension = file.name.split(".").pop() ?? "jpg";
    const path = `${userId}/logo.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("logo-parohii")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      setUploading(false);
      setError(uploadError.message);
      return;
    }

    const { data: publicUrlData } = supabase.storage.from("logo-parohii").getPublicUrl(path);
    setForm((prev) => ({ ...prev, logo_url: `${publicUrlData.publicUrl}?t=${Date.now()}` }));
    setUploading(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase || !parishId) return;

    if (form.stil !== originalStil) {
      const confirmed = window.confirm(
        "Ești sigur? Asta schimbă toate datele sărbătorilor afișate."
      );
      if (!confirmed) return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    const { error: updateError } = await supabase
      .from("parohii")
      .update({
        nume: form.nume,
        hram: form.hram,
        data_hram: form.data_hram || null,
        stil: form.stil,
        adresa: form.adresa,
        localitate: form.localitate,
        judet: form.judet,
        tara: form.tara,
        descriere: form.descriere || null,
        contact_telefon_public: form.contact_telefon_public || null,
        contact_email_public: form.contact_email_public || null,
        logo_url: form.logo_url || null
      })
      .eq("id", parishId);

    setSaving(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setOriginalStil(form.stil);
    setMessage("Modificările au fost salvate.");
  }

  if (loading) {
    return <div className="card">Se încarcă profilul...</div>;
  }

  return (
    <div className="card">
      <h1>Profilul parohiei</h1>
      <p>Editează datele publice și datele de contact.</p>

      {error ? (
        <p className="banner banner-error">{error}</p>
      ) : null}
      {message ? (
        <p className="banner banner-success">{message}</p>
      ) : null}

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 10, maxWidth: 640 }}>
        <label>
          Fotografie/logo parohie
          <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 6 }}>
            {form.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.logo_url} alt="Logo parohie" style={{ width: 64, height: 64, borderRadius: 10, objectFit: "cover" }} />
            ) : null}
            <input type="file" accept="image/*" onChange={handleLogoChange} disabled={uploading} />
          </div>
          {uploading ? <p style={{ margin: "4px 0 0", color: "var(--ink-muted)" }}>Se încarcă...</p> : null}
        </label>

        <input
          className="input"
          placeholder="Nume parohie"
          required
          value={form.nume}
          onChange={(event) => setForm((prev) => ({ ...prev, nume: event.target.value }))}
        />
        <input
          className="input"
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
          placeholder="Adresă completă"
          required
          value={form.adresa}
          onChange={(event) => setForm((prev) => ({ ...prev, adresa: event.target.value }))}
        />
        <input
          className="input"
          placeholder="Localitate"
          required
          value={form.localitate}
          onChange={(event) => setForm((prev) => ({ ...prev, localitate: event.target.value }))}
        />
        <input
          className="input"
          placeholder="Județ / Regiune"
          required
          value={form.judet}
          onChange={(event) => setForm((prev) => ({ ...prev, judet: event.target.value }))}
        />
        <input
          className="input"
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
        <input
          className="input"
          placeholder="Telefon contact public"
          value={form.contact_telefon_public}
          onChange={(event) => setForm((prev) => ({ ...prev, contact_telefon_public: event.target.value }))}
        />
        <input
          className="input"
          placeholder="Email contact public"
          type="email"
          value={form.contact_email_public}
          onChange={(event) => setForm((prev) => ({ ...prev, contact_email_public: event.target.value }))}
        />

        <button className="btn btn-primary" type="submit" disabled={saving || uploading}>
          {saving ? "Se salvează..." : "Salvează modificările"}
        </button>
      </form>
    </div>
  );
}
