import { supabase } from "./supabase";

export type CalendarItem = {
  sursa: "global" | "local_eveniment" | "local_recurent";
  titlu: string;
  ora: string | null;
  parohieNume?: string;
  eventId?: string;
};

export type CalendarDay = {
  data: string;
  items: CalendarItem[];
};

const weekdaysByIndex = ["duminica", "luni", "marti", "miercuri", "joi", "vineri", "sambata"];

function toIso(date: Date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export type DaySarbatoare = {
  nume_sarbatoare: string;
  subtitlu: string | null;
  sinaxar_text: string | null;
  tip: string;
  zi_libera: boolean;
};

export async function getDaySarbatoare(dateIso: string): Promise<DaySarbatoare | null> {
  const { data, error } = await supabase
    .from("sarbatori_globale")
    .select("nume_sarbatoare, subtitlu, sinaxar_text, tip, zi_libera")
    .eq("data_stil_nou", dateIso)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

export async function getFollowedParishesForCalendar(userId: string) {
  const { data, error } = await supabase
    .from("urmariri")
    .select("parohie_id, parohii(id, nume, stil)")
    .eq("utilizator_id", userId);

  if (error) throw new Error(error.message);

  return (data ?? [])
    .map((row: any) => row.parohii)
    .filter(Boolean) as { id: string; nume: string; stil: "nou" | "vechi" }[];
}

export async function getCombinedCalendar(
  userId: string,
  startDate: Date,
  numberOfDays: number,
  filterParishId?: string
): Promise<CalendarDay[]> {
  const parishes = await getFollowedParishesForCalendar(userId);
  const relevantParishes = filterParishId ? parishes.filter((p) => p.id === filterParishId) : parishes;

  const days: CalendarDay[] = [];
  for (let i = 0; i < numberOfDays; i += 1) {
    days.push({ data: toIso(addDays(startDate, i)), items: [] });
  }

  if (relevantParishes.length === 0) {
    return days;
  }

  const rangeStart = toIso(startDate);
  const rangeEnd = toIso(addDays(startDate, numberOfDays - 1));
  const parishIds = relevantParishes.map((p) => p.id);

  const [globalRes, eventsRes, recurentRes] = await Promise.all([
    supabase
      .from("sarbatori_globale")
      .select("data_stil_nou, data_stil_vechi, nume_sarbatoare")
      .or(
        `and(data_stil_nou.gte.${rangeStart},data_stil_nou.lte.${rangeEnd}),and(data_stil_vechi.gte.${rangeStart},data_stil_vechi.lte.${rangeEnd})`
      ),
    supabase
      .from("evenimente_locale")
      .select("id, titlu, data, ora, parohie_id, parohii(nume)")
      .in("parohie_id", parishIds)
      .gte("data", rangeStart)
      .lte("data", rangeEnd),
    supabase
      .from("program_recurent")
      .select("titlu, zi_saptamana, ora, parohie_id, parohii(nume)")
      .in("parohie_id", parishIds)
      .eq("activ", true)
  ]);

  if (globalRes.error) throw new Error(globalRes.error.message);
  if (eventsRes.error) throw new Error(eventsRes.error.message);
  if (recurentRes.error) throw new Error(recurentRes.error.message);

  const dayByDate = new Map(days.map((day) => [day.data, day]));

  for (const parish of relevantParishes) {
    for (const row of globalRes.data ?? []) {
      const matchingDate = parish.stil === "vechi" ? row.data_stil_vechi : row.data_stil_nou;
      const day = dayByDate.get(matchingDate);
      if (day) {
        day.items.push({ sursa: "global", titlu: row.nume_sarbatoare, ora: null });
      }
    }
  }

  for (const event of eventsRes.data ?? []) {
    const day = dayByDate.get(event.data);
    if (day) {
      day.items.push({
        sursa: "local_eveniment",
        titlu: event.titlu,
        ora: event.ora,
        parohieNume: (event as any).parohii?.nume,
        eventId: event.id
      });
    }
  }

  for (const entry of recurentRes.data ?? []) {
    for (const day of days) {
      const weekday = weekdaysByIndex[new Date(`${day.data}T00:00:00`).getDay()];
      if (weekday === entry.zi_saptamana) {
        day.items.push({
          sursa: "local_recurent",
          titlu: entry.titlu,
          ora: entry.ora,
          parohieNume: (entry as any).parohii?.nume
        });
      }
    }
  }

  for (const day of days) {
    day.items.sort((a, b) => {
      if (a.sursa === "global" && b.sursa !== "global") return -1;
      if (a.sursa !== "global" && b.sursa === "global") return 1;
      return (a.ora ?? "").localeCompare(b.ora ?? "");
    });
  }

  return days;
}
