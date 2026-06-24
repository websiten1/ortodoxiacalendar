import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./auth-context";
import { supabase } from "./supabase";

export type PriestParish = {
  id: string;
  nume: string;
  hram: string;
  data_hram: string | null;
  stil: "nou" | "vechi";
  adresa: string;
  localitate: string;
  judet: string;
  tara: string;
  descriere: string | null;
  contact_telefon_public: string | null;
  contact_email_public: string | null;
  logo_url: string | null;
  preot_nume: string;
  preot_telefon: string;
  status: "in_asteptare_verificare" | "activ" | "suspendat";
};

export async function getPriestParish(userId: string, email: string): Promise<PriestParish | null> {
  const { data: parish, error } = await supabase
    .from("parohii")
    .select(
      "id, nume, hram, data_hram, stil, adresa, localitate, judet, tara, descriere, contact_telefon_public, contact_email_public, logo_url, preot_nume, preot_telefon, status, auth_user_id"
    )
    .eq("email", email)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!parish) return null;

  if (!parish.auth_user_id) {
    await supabase.from("parohii").update({ auth_user_id: userId }).eq("id", parish.id);
  }

  return parish;
}

export async function getPriestStats(parishId: string) {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString().slice(0, 10);
  const todayIso = now.toISOString().slice(0, 10);
  const weekEnd = new Date(now);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const [followersRes, monthEventsRes, weekEventsRes] = await Promise.all([
    supabase.from("urmariri").select("*", { count: "exact", head: true }).eq("parohie_id", parishId),
    supabase
      .from("evenimente_locale")
      .select("*", { count: "exact", head: true })
      .eq("parohie_id", parishId)
      .gte("data", monthStart)
      .lt("data", nextMonthStart),
    supabase
      .from("evenimente_locale")
      .select("*", { count: "exact", head: true })
      .eq("parohie_id", parishId)
      .gte("data", todayIso)
      .lte("data", weekEnd.toISOString().slice(0, 10))
  ]);

  return {
    followers: followersRes.count ?? 0,
    eventsThisMonth: monthEventsRes.count ?? 0,
    eventsThisWeek: weekEventsRes.count ?? 0
  };
}

export async function getPriestEvents(parishId: string) {
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("evenimente_locale")
    .select("id, titlu, data, ora, tip, notificare_trimisa")
    .eq("parohie_id", parishId)
    .gte("data", today)
    .order("data", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createPriestEvent(params: {
  parishId: string;
  titlu: string;
  descriere?: string;
  data: string;
  ora?: string;
  tip: "liturgic" | "social" | "anunt";
  trimiteNotificare: boolean;
}) {
  const { data: inserted, error } = await supabase
    .from("evenimente_locale")
    .insert({
      parohie_id: params.parishId,
      titlu: params.titlu,
      descriere: params.descriere || null,
      data: params.data,
      ora: params.ora || null,
      tip: params.tip,
      notificare_trimisa: !params.trimiteNotificare
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  if (params.trimiteNotificare && inserted) {
    await supabase.functions.invoke("send-event-notifications", { body: { eventId: inserted.id } });
  }

  return inserted;
}

export async function sendEventNotification(eventId: string) {
  const { error } = await supabase.functions.invoke("send-event-notifications", { body: { eventId } });
  if (error) throw new Error(error.message);
}

export async function updatePriestParish(parishId: string, fields: Partial<PriestParish>) {
  const { error } = await supabase.from("parohii").update(fields).eq("id", parishId);
  if (error) throw new Error(error.message);
}

export async function getPriestProgram(parishId: string) {
  const { data, error } = await supabase
    .from("program_recurent")
    .select("id, titlu, zi_saptamana, ora, activ")
    .eq("parohie_id", parishId);

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function addPriestProgramEntry(params: { parishId: string; titlu: string; zi_saptamana: string; ora: string }) {
  const { error } = await supabase.from("program_recurent").insert({
    parohie_id: params.parishId,
    titlu: params.titlu,
    zi_saptamana: params.zi_saptamana,
    ora: params.ora,
    activ: true
  });
  if (error) throw new Error(error.message);
}

export async function toggleProgramEntry(id: string, activ: boolean) {
  const { error } = await supabase.from("program_recurent").update({ activ }).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteProgramEntry(id: string) {
  const { error } = await supabase.from("program_recurent").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export function usePriestParish() {
  const { session } = useAuth();
  const [parish, setParish] = useState<PriestParish | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!session?.user.email) {
      setLoading(false);
      setParish(null);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const result = await getPriestParish(session.user.id, session.user.email);
      setParish(result);
      if (!result) {
        setError("Nu am găsit o parohie asociată acestui cont. Înregistrează parohia din admin-ul web mai întâi.");
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Eroare la încărcare parohie.");
    } finally {
      setLoading(false);
    }
  }, [session?.user.id, session?.user.email]);

  useEffect(() => {
    void load();
  }, [load]);

  return { parish, loading, error, reload: load };
}
