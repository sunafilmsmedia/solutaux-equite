// Déclenche un événement Meta (Facebook) Pixel côté client, en toute sécurité.
// Ne fait rien si le pixel n'est pas encore chargé ou côté serveur.
type Fbq = (
  action: "track" | "trackCustom",
  event: string,
  params?: Record<string, unknown>,
  options?: { eventID?: string }
) => void;

export function trackPixel(
  event: string,
  params?: Record<string, unknown>,
  eventId?: string
): void {
  if (typeof window === "undefined") return;
  const fbq = (window as unknown as { fbq?: Fbq }).fbq;
  if (typeof fbq === "function") {
    if (eventId) fbq("track", event, params ?? {}, { eventID: eventId });
    else fbq("track", event, params);
  }
}

// Lit un cookie navigateur (ex. _fbp / _fbc posés par le pixel Meta).
export function readCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}
