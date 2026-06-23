"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "../../lib/supabase-browser";

export default function LoginPage() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!supabase) {
      setError("Configurează NEXT_PUBLIC_SUPABASE_URL și NEXT_PUBLIC_SUPABASE_ANON_KEY.");
      return;
    }

    setSubmitting(true);

    const redirectTo =
      typeof window !== "undefined" ? `${window.location.origin}/dashboard` : undefined;

    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo }
    });

    setSubmitting(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    setMessage(`Am trimis un link pe ${email}. Verifică-ți inboxul.`);
  }

  return (
    <div className="container" style={{ maxWidth: 560, paddingTop: 64 }}>
      <div className="card">
        <h1>Autentificare</h1>
        <p>Introdu email-ul și primești link magic de autentificare.</p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            className="input"
            type="email"
            placeholder="preot@parohie.ro"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />

          <button className="btn btn-primary" style={{ marginTop: 16 }} type="submit" disabled={submitting}>
            {submitting ? "Se trimite..." : "Trimite link de autentificare"}
          </button>
        </form>

        {message ? (
          <p style={{ marginTop: 14, color: "#0b7d2a", background: "#eefbf2", padding: 10, borderRadius: 8 }}>
            {message}
          </p>
        ) : null}
        {error ? (
          <p style={{ marginTop: 14, color: "#b42318", background: "#fef3f2", padding: 10, borderRadius: 8 }}>
            {error}
          </p>
        ) : null}

        <p style={{ marginTop: 16, marginBottom: 0 }}>
          Nu ai cont? <Link href="/inregistrare">Înregistrează parohia</Link>
        </p>
      </div>
    </div>
  );
}
