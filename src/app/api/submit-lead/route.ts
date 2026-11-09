import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { calculatorInputSchema } from "@/lib/validation";
import { processLead } from "@/lib/engine";
import { buildCrmPayload, sendToCrm } from "@/lib/crm";
import { sendCapiLead } from "@/lib/metaCapi";
import type { CalculatorInput } from "@/types/calculator";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Corps de requête invalide." },
      { status: 400 }
    );
  }

  const parsed = calculatorInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: "Il manque quelques informations avant de pouvoir générer ton résultat.",
        issues: parsed.error.flatten().fieldErrors,
      },
      { status: 422 }
    );
  }

  const input = parsed.data as CalculatorInput;
  const leadId = randomUUID();

  try {
    const result = processLead(input);

    // Tous les niveaux (A à D) sont envoyés au CRM — même un dossier non
    // qualifié (D) entre dans une séquence de nurture plutôt qu'un appel.
    const crmPayload = buildCrmPayload(input, result);
    const meta = ((body as { meta?: Record<string, unknown> }).meta ?? {}) as {
      fbp?: string;
      fbc?: string;
      sourceUrl?: string;
    };
    const str = (v: unknown) => (typeof v === "string" && v ? v : undefined);

    // CRM et Meta CAPI en parallèle. event_id = leadId, le même que le
    // pixel navigateur utilise sur la page résultat → pas de doublon.
    const [crm] = await Promise.all([
      sendToCrm(crmPayload),
      sendCapiLead({
        eventId: leadId,
        email: input.email,
        phone: input.phone,
        firstName: input.firstName,
        fbp: str(meta.fbp),
        fbc: str(meta.fbc),
        clientIp: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || undefined,
        userAgent: request.headers.get("user-agent") || undefined,
        sourceUrl: str(meta.sourceUrl),
        customData: {
          content_name: "Combien puis-je aller chercher",
          lead_tier: result.tier,
        },
      }),
    ]);
    if (!crm.ok) {
      console.error(crm.error);
    }

    return NextResponse.json({
      success: true,
      leadId,
      resultUrl: `/results/${leadId}`,
      result,
      firstName: input.firstName,
    });
  } catch (e) {
    console.error("LEAD_PROCESSING_FAILED", e);
    return NextResponse.json(
      { success: false, error: "Une erreur est survenue. Réessaie dans un instant." },
      { status: 500 }
    );
  }
}
