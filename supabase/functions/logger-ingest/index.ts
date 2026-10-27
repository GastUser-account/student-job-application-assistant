import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, x-logger-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return Response.json({ ok: false, error: "Use POST" }, { status: 405, headers: corsHeaders });
  }

  const expectedSecret = Deno.env.get("LOGGER_INGEST_SECRET") ?? "";
  const providedSecret = req.headers.get("x-logger-secret") ?? "";
  if (!expectedSecret || !providedSecret || providedSecret !== expectedSecret) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401, headers: corsHeaders });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, error: "Body must be valid JSON" }, { status: 400, headers: corsHeaders });
  }

  const deviceId = typeof body.device_id === "string" ? body.device_id.trim() : "";
  const payloadText = typeof body.payload_text === "string" ? body.payload_text : "";
  const payloadBase64 = typeof body.payload_base64 === "string" ? body.payload_base64 : "";
  if (!deviceId || (!payloadText && !payloadBase64)) {
    return Response.json({ ok: false, error: "device_id and payload_text or payload_base64 are required" }, { status: 400, headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    return Response.json({ ok: false, error: "Server configuration error" }, { status: 500, headers: corsHeaders });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await supabase.from("logger_readings").insert({
    device_id: deviceId,
    received_at_receiver: typeof body.received_at_receiver === "string" ? body.received_at_receiver : new Date().toISOString(),
    remote_peer: typeof body.remote_peer === "string" ? body.remote_peer : null,
    payload_text: payloadText,
    payload_base64: payloadBase64 || null,
  }).select("id, device_id, received_at_receiver").single();

  if (error) {
    console.error("logger_readings insert failed:", error.message);
    return Response.json({ ok: false, error: "Database insert failed" }, { status: 500, headers: corsHeaders });
  }

  return Response.json({ ok: true, reading: data }, { status: 201, headers: corsHeaders });
});
