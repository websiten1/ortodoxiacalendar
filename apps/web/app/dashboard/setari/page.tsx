"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "../../../lib/supabase-browser";

export default function DashboardSetariPage() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [savingContact, setSavingContact] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);
  const [parishId, setParishId] = useState("");
  const [email, setEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [preotNume, setPreotNume] = useState("");
  const [preotTelefon, setPreotTelefon] = useState("");

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

      const currentEmail = userData.user.email ?? "";
      const { data: parohie, error: parishError } = await supabase!
        .from("parohii")
        .select("id, email, preot_nume, preot_telefon")
        .eq("email", currentEmail)
        .maybeSingle();

      if (parishError || !parohie) {
        setError("Nu am găsit parohia pentru email-ul autentificat.");
        setLoading(false);
        return;
      }

      setParishId(parohie.id);
      setEmail(parohie.email);
      setNewEmail(parohie.email);
      setPreotNume(parohie.preot_nume ?? "");
      setPreotTelefon(parohie.preot_telefon ?? "");
      setLoading(false);
    }

    void load();
  }, [supabase]);

  async function handleChangeEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return;
    setError("");
    setMessage("");
    setSavingEmail(true);

    const { error: authError } = await supabase.auth.updateUser({ email: newEmail });
    setSavingEmail(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    setMessage("Am trimis un link de confirmare pe noul email. Schimbarea se aplică după confirmare.");
  }

  async function handleChangeContact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase || !parishId) return;
    setError("");
    setMessage("");
    setSavingContact(true);

    const { error: updateError } = await supabase
      .from("parohii")
      .update({ preot_nume: preotNume, preot_telefon: preotTelefon })
      .eq("id", parishId);

    setSavingContact(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setMessage("Datele de contact intern au fost actualizate.");
  }

  async function handleLogout() {
    if (!supabase) return;
    await supabase.auth.signOut();
    router.push("/login");
  }

  if (loading) {
    return <div className="card">Se încarcă setările...</div>;
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      {error ? (
        <p className="banner banner-error">{error}</p>
      ) : null}
      {message ? (
        <p className="banner banner-success">{message}</p>
      ) : null}

      <div className="card">
        <h1>Setări cont</h1>
        <p>Email curent de login: {email}</p>

        <form onSubmit={handleChangeEmail} style={{ display: "grid", gap: 10, maxWidth: 420 }}>
          <label htmlFor="newEmail">Email nou de login</label>
          <input
            id="newEmail"
            className="input"
            type="email"
            required
            value={newEmail}
            onChange={(event) => setNewEmail(event.target.value)}
          />
          <button className="btn btn-primary" type="submit" disabled={savingEmail || newEmail === email}>
            {savingEmail ? "Se trimite..." : "Schimbă email-ul de login"}
          </button>
        </form>
      </div>

      <div className="card">
        <h2>Date de contact intern</h2>
        <p>Folosite pentru verificare, diferite de contactul public din profilul parohiei.</p>

        <form onSubmit={handleChangeContact} style={{ display: "grid", gap: 10, maxWidth: 420 }}>
          <label htmlFor="preotNume">Nume preot</label>
          <input
            id="preotNume"
            className="input"
            required
            value={preotNume}
            onChange={(event) => setPreotNume(event.target.value)}
          />
          <label htmlFor="preotTelefon">Telefon de contact</label>
          <input
            id="preotTelefon"
            className="input"
            required
            value={preotTelefon}
            onChange={(event) => setPreotTelefon(event.target.value)}
          />
          <button className="btn btn-primary" type="submit" disabled={savingContact}>
            {savingContact ? "Se salvează..." : "Salvează"}
          </button>
        </form>
      </div>

      <div className="card">
        <button className="btn btn-secondary" onClick={handleLogout}>
          Delogare
        </button>
      </div>
    </div>
  );
}
