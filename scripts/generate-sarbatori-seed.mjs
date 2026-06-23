import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const INPUT = resolve("data/calendar/patriarhia-calendar-flat.json");
const OUTPUT = resolve("supabase/migrations/20260623212100_seed_sarbatori_globale.sql");

function escapeSql(value) {
  return String(value).replaceAll("'", "''");
}

function inferTip(titlu) {
  const lower = titlu.toLowerCase();
  if (lower.includes("(†)") || lower.includes("†")) return "cruce_rosie";
  if (lower.includes("post")) return "post_incepe";
  return "sfant_obisnuit";
}

function toIsoDate(yyyymmdd) {
  const y = yyyymmdd.slice(0, 4);
  const m = yyyymmdd.slice(4, 6);
  const d = yyyymmdd.slice(6, 8);
  return `${y}-${m}-${d}`;
}

async function main() {
  const raw = await readFile(INPUT, "utf8");
  const days = JSON.parse(raw);

  const values = days.map((entry) => {
    const dataNou = toIsoDate(entry.data_zilei);
    const year = Number(entry.data_zilei.slice(0, 4));
    const tip = inferTip(entry.titlu_text ?? "");
    const title = escapeSql((entry.titlu_text ?? "").slice(0, 1000));

    return `('${dataNou}'::date, '${dataNou}'::date, '${title}', '${tip}', ${year})`;
  });

  const sql = [
    "-- Auto-generated from Patriarhia calendar feed",
    "insert into public.sarbatori_globale (data_stil_nou, data_stil_vechi, nume_sarbatoare, tip, an)",
    "values",
    values.join(",\n"),
    "on conflict do nothing;"
  ].join("\n");

  await writeFile(OUTPUT, `${sql}\n`, "utf8");
  console.log(`Seed SQL generat: ${OUTPUT}`);
  console.log(`Înregistrări: ${values.length}`);
}

main().catch((error) => {
  console.error("Eroare la generare seed SQL:", error);
  process.exitCode = 1;
});
