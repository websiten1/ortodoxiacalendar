import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const SOURCE_URL = "https://calendar.patriarhia.ro/";
const OUTPUT_RAW = resolve("data/calendar/patriarhia-calendar-data.json");
const OUTPUT_FLAT = resolve("data/calendar/patriarhia-calendar-flat.json");

function decodeHtml(input) {
  return input
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'");
}

function htmlToText(input) {
  const decoded = decodeHtml(input ?? "");

  return decoded
    .replaceAll(/<br\s*\/?>/gi, "\n")
    .replaceAll(/<\/h[1-6]>/gi, "\n")
    .replaceAll(/<\/p>/gi, "\n")
    .replaceAll(/<[^>]*>/g, "")
    .replaceAll(/\u00a0/g, " ")
    .replaceAll(/[ \t]+\n/g, "\n")
    .replaceAll(/\n{3,}/g, "\n\n")
    .trim();
}

function extractCopData(html) {
  const marker = "var copData = ";
  const start = html.indexOf(marker);

  if (start === -1) {
    throw new Error("Nu am găsit `var copData = ...` în HTML.");
  }

  const fromStart = html.slice(start + marker.length);
  const firstBrace = fromStart.indexOf("{");

  if (firstBrace === -1) {
    throw new Error("Nu am găsit începutul obiectului copData.");
  }

  let depth = 0;
  let inString = false;
  let escaped = false;
  let endIndex = -1;

  for (let i = firstBrace; i < fromStart.length; i += 1) {
    const char = fromStart[i];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (char === "\\") {
      escaped = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (inString) {
      continue;
    }

    if (char === "{") {
      depth += 1;
    } else if (char === "}") {
      depth -= 1;

      if (depth === 0) {
        endIndex = i;
        break;
      }
    }
  }

  if (endIndex === -1) {
    throw new Error("Nu am găsit finalul obiectului copData.");
  }

  const jsonString = fromStart.slice(firstBrace, endIndex + 1);
  return JSON.parse(jsonString);
}

function buildFlat(calendarData) {
  const monthKeys = Object.keys(calendarData).sort();
  const flat = [];

  for (const month of monthKeys) {
    const days = calendarData[month] ?? [];

    for (const day of days) {
      flat.push({
        id: day.id,
        data_zilei: day.data_zilei,
        day: day.day,
        month: day.month,
        zi_libera: Boolean(day.zi_libera_acf),
        titlu_html: day.titlu_acf ?? "",
        titlu_text: htmlToText(day.titlu_acf ?? ""),
        subtitlu: day.subtitlu_acf ?? "",
        text_suplimentar_html: day.text_suplimentar_acf ?? "",
        text_suplimentar_text: htmlToText(day.text_suplimentar_acf ?? ""),
        sinaxar_html: day.sinaxar_text_acf ?? "",
        sinaxar_text: htmlToText(day.sinaxar_text_acf ?? "")
      });
    }
  }

  return flat.sort((a, b) => a.data_zilei.localeCompare(b.data_zilei));
}

async function main() {
  const response = await fetch(SOURCE_URL, {
    headers: {
      "user-agent": "parohia-mea-importer/0.1"
    }
  });

  if (!response.ok) {
    throw new Error(`Request eșuat: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();
  const copData = extractCopData(html);
  const calendarData = copData?.calendarData;

  if (!calendarData || typeof calendarData !== "object") {
    throw new Error("`copData.calendarData` lipsește sau nu e obiect.");
  }

  const flat = buildFlat(calendarData);

  await writeFile(OUTPUT_RAW, `${JSON.stringify(calendarData, null, 2)}\n`, "utf8");
  await writeFile(OUTPUT_FLAT, `${JSON.stringify(flat, null, 2)}\n`, "utf8");

  console.log(`Calendar importat cu succes din ${SOURCE_URL}`);
  console.log(`Luni găsite: ${Object.keys(calendarData).length}`);
  console.log(`Zile totale: ${flat.length}`);
  console.log(`Scris: ${OUTPUT_RAW}`);
  console.log(`Scris: ${OUTPUT_FLAT}`);
}

main().catch((error) => {
  console.error("Eroare la import calendar:", error);
  process.exitCode = 1;
});
