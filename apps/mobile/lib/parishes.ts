import { supabase } from "./supabase";

export type Parish = {
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
};

export async function searchParishes(query: string, judet?: string) {
  let builder = supabase
    .from("parohii")
    .select(
      "id, nume, hram, data_hram, stil, adresa, localitate, judet, tara, descriere, contact_telefon_public, contact_email_public, logo_url"
    )
    .eq("status", "activ")
    .order("nume", { ascending: true });

  if (query.trim()) {
    const term = query.trim();
    builder = builder.or(
      `nume.ilike.%${term}%,localitate.ilike.%${term}%,judet.ilike.%${term}%`
    );
  }

  if (judet) {
    builder = builder.eq("judet", judet);
  }

  const { data, error } = await builder;
  if (error) throw new Error(error.message);
  return (data ?? []) as Parish[];
}

export async function getParish(id: string) {
  const { data, error } = await supabase
    .from("parohii")
    .select(
      "id, nume, hram, data_hram, stil, adresa, localitate, judet, tara, descriere, contact_telefon_public, contact_email_public, logo_url"
    )
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as Parish | null;
}

export async function getProgramRecurent(parishId: string) {
  const { data, error } = await supabase
    .from("program_recurent")
    .select("id, titlu, zi_saptamana, ora")
    .eq("parohie_id", parishId)
    .eq("activ", true);

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getUpcomingEvents(parishId: string, limit = 5) {
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("evenimente_locale")
    .select("id, titlu, descriere, data, ora, tip")
    .eq("parohie_id", parishId)
    .gte("data", today)
    .order("data", { ascending: true })
    .limit(limit);

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function isFollowing(userId: string, parishId: string) {
  const { data, error } = await supabase
    .from("urmariri")
    .select("parohie_id")
    .eq("utilizator_id", userId)
    .eq("parohie_id", parishId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return Boolean(data);
}

export async function follow(userId: string, parishId: string) {
  const { error } = await supabase
    .from("urmariri")
    .upsert({ utilizator_id: userId, parohie_id: parishId, notificari_activate: true });

  if (error) throw new Error(error.message);
}

export async function unfollow(userId: string, parishId: string) {
  const { error } = await supabase
    .from("urmariri")
    .delete()
    .eq("utilizator_id", userId)
    .eq("parohie_id", parishId);

  if (error) throw new Error(error.message);
}

export async function getFollowedParishes(userId: string) {
  const { data, error } = await supabase
    .from("urmariri")
    .select("parohie_id, notificari_activate, parohii(id, nume, localitate, judet)")
    .eq("utilizator_id", userId);

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function setFollowNotifications(userId: string, parishId: string, enabled: boolean) {
  const { error } = await supabase
    .from("urmariri")
    .update({ notificari_activate: enabled })
    .eq("utilizator_id", userId)
    .eq("parohie_id", parishId);

  if (error) throw new Error(error.message);
}
