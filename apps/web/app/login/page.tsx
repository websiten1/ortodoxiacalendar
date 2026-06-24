"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "../../lib/supabase-browser";

export default function LoginPage() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!supabase) {
      setError("Configurează NEXT_PUBLIC_SUPABASE_URL și NEXT_PUBLIC_SUPABASE_ANON_KEY.");
      return;
    }

    setSubmitting(true);

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    setSubmitting(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className="container" style={{ maxWidth: 560, paddingTop: 64 }}>
      <div className="card">
        <h1>Autentificare</h1>
        <p>Introdu email-ul și parola contului parohiei.</p>

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

          <label htmlFor="password" style={{ marginTop: 12, display: "block" }}>
            Parolă
          </label>
          <input
            id="password"
            className="input"
            type="password"
            placeholder="••••••••"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />

          <button className="btn btn-primary" style={{ marginTop: 16 }} type="submit" disabled={submitting}>
            {submitting ? "Se autentifică..." : "Intră în cont"}
          </button>
        </form>

        {error ? (
          <p className="banner banner-error" style={{ marginTop: 14 }}>
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
