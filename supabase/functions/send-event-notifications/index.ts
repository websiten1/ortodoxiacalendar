import { createClient } from "jsr:@supabase/supabase-js@2";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const { eventId } = await req.json();

  if (!eventId) {
    return new Response(JSON.stringify({ error: "eventId este obligatoriu" }), { status: 400 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  const { data: event, error: eventError } = await supabase
    .from("evenimente_locale")
    .select("id, titlu, parohie_id, parohii(nume)")
    .eq("id", eventId)
    .maybeSingle();

  if (eventError || !event) {
    return new Response(JSON.stringify({ error: "Evenimentul nu a fost găsit" }), { status: 404 });
  }

  const { data: followers, error: followersError } = await supabase
    .from("urmariri")
    .select("utilizator_id")
    .eq("parohie_id", event.parohie_id)
    .eq("notificari_activate", true);

  if (followersError) {
    return new Response(JSON.stringify({ error: followersError.message }), { status: 500 });
  }

  const userIds = (followers ?? []).map((row) => row.utilizator_id);

  let sent = 0;

  if (userIds.length > 0) {
    const { data: tokens, error: tokensError } = await supabase
      .from("push_tokens")
      .select("expo_push_token")
      .in("utilizator_id", userIds);

    if (tokensError) {
      return new Response(JSON.stringify({ error: tokensError.message }), { status: 500 });
    }

    const parishName = (event as any).parohii?.nume ?? "Parohia ta";
    const messages = (tokens ?? []).map((row) => ({
      to: row.expo_push_token,
      title: parishName,
      body: event.titlu,
      sound: "default"
    }));

    if (messages.length > 0) {
      await fetch(EXPO_PUSH_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify(messages)
      });
      sent = messages.length;
    }
  }

  await supabase.from("evenimente_locale").update({ notificare_trimisa: true }).eq("id", eventId);

  return new Response(JSON.stringify({ ok: true, sent }), {
    headers: { "Content-Type": "application/json" }
  });
});
