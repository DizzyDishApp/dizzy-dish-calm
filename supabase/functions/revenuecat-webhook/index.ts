import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const WEBHOOK_SECRET = Deno.env.get("REVENUECAT_WEBHOOK_SECRET") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const PRO_EVENTS = new Set(["INITIAL_PURCHASE", "RENEWAL"]);
const REVOKE_EVENTS = new Set(["CANCELLATION", "EXPIRATION"]);

Deno.serve(async (req: Request) => {
  // Validate shared secret
  const authHeader = req.headers.get("Authorization") ?? "";
  if (WEBHOOK_SECRET && authHeader !== `Bearer ${WEBHOOK_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await req.json();
  const event = body?.event;
  if (!event) return new Response("No event", { status: 400 });

  const eventType: string = event.type;
  const userId: string | undefined = event.app_user_id;

  // Ignore events we don't care about or where we can't identify the user
  if (!userId || (!PRO_EVENTS.has(eventType) && !REVOKE_EVENTS.has(eventType))) {
    return new Response("OK", { status: 200 });
  }

  // Ignore RC's anonymous IDs (user hasn't linked a Supabase account yet)
  if (userId.startsWith("$RCAnonymousID:")) {
    return new Response("OK", { status: 200 });
  }

  const isPro = PRO_EVENTS.has(eventType);

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const { error } = await supabase
    .from("profiles")
    .update({ is_pro: isPro })
    .eq("id", userId);

  if (error) {
    console.error("[revenuecat-webhook] DB update failed:", error);
    return new Response("Internal error", { status: 500 });
  }

  console.log(`[revenuecat-webhook] ${eventType} → user ${userId} isPro=${isPro}`);
  return new Response("OK", { status: 200 });
});
