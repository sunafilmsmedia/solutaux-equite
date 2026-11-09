import { createHash } from "crypto";

// Meta Conversions API — envoi serveur de l'événement Lead.
// Dédupliqué avec le pixel navigateur grâce au même event_id.
// Env : META_CAPI_TOKEN (optionnel : META_PIXEL_ID, META_TEST_EVENT_CODE).
// Pixel par défaut : 1962067708511488 (SoluTaux).

const GRAPH_VERSION = "v21.0";
const DEFAULT_PIXEL_ID = "1962067708511488";

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  // Numéros nord-américains à 10 chiffres → préfixe pays 1.
  return digits.length === 10 ? `1${digits}` : digits;
}

export interface CapiLeadInput {
  eventId?: string;
  email: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  fbc?: string;
  fbp?: string;
  clientIp?: string;
  userAgent?: string;
  sourceUrl?: string;
  customData?: Record<string, unknown>;
}

export async function sendCapiLead(input: CapiLeadInput): Promise<void> {
  const pixelId = process.env.META_PIXEL_ID || DEFAULT_PIXEL_ID;
  const token = process.env.META_CAPI_TOKEN;
  if (!token) {
    console.warn("[capi] META_CAPI_TOKEN absent — Lead serveur non envoyé.");
    return;
  }

  const userData: Record<string, unknown> = {
    em: [sha256(input.email.trim().toLowerCase())],
    country: [sha256("ca")],
  };
  if (input.phone) {
    const ph = normalizePhone(input.phone);
    if (ph) userData.ph = [sha256(ph)];
  }
  if (input.firstName) userData.fn = [sha256(input.firstName.trim().toLowerCase())];
  if (input.lastName) userData.ln = [sha256(input.lastName.trim().toLowerCase())];
  if (input.fbc) userData.fbc = input.fbc;
  if (input.fbp) userData.fbp = input.fbp;
  if (input.clientIp) userData.client_ip_address = input.clientIp;
  if (input.userAgent) userData.client_user_agent = input.userAgent;

  const event: Record<string, unknown> = {
    event_name: "Lead",
    event_time: Math.floor(Date.now() / 1000),
    action_source: "website",
    user_data: userData,
    custom_data: input.customData ?? {},
  };
  if (input.eventId) event.event_id = input.eventId;
  if (input.sourceUrl) event.event_source_url = input.sourceUrl;

  const body: Record<string, unknown> = { data: [event] };
  if (process.env.META_TEST_EVENT_CODE) body.test_event_code = process.env.META_TEST_EVENT_CODE;

  try {
    const res = await fetch(
      `https://graph.facebook.com/${GRAPH_VERSION}/${pixelId}/events?access_token=${encodeURIComponent(token)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(5000),
      }
    );
    if (!res.ok) {
      console.error("[capi] Meta a répondu", res.status, await res.text());
    }
  } catch (err) {
    console.error("[capi] Échec de l'envoi", err);
  }
}
