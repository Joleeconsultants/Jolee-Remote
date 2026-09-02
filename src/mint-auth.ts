import { timingSafeEqual } from "./tokens";

/** True when a production mint secret is configured (non-empty). */
export function configuredMintSecret(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

/**
 * Shared mint secret from `Authorization: Bearer` or `X-Mint-Secret`.
 * Query-string secrets are not accepted.
 */
export function mintSecretFromRequest(request: Request): string | null {
  const header = request.headers.get("X-Mint-Secret");
  if (header) return header;
  const auth = request.headers.get("Authorization");
  if (auth) {
    const match = /^Bearer\s+(\S+)/i.exec(auth);
    if (match) return match[1];
  }
  return null;
}

/**
 * When `MINT_SECRET` is unset/empty (wrangler dev default), mint stays open.
 * When configured, Bearer or X-Mint-Secret must match.
 */
export function authorizeMint(
  request: Request,
  configured: string | undefined,
): boolean {
  const secret = configuredMintSecret(configured);
  if (!secret) return true;
  const provided = mintSecretFromRequest(request);
  if (!provided) return false;
  return timingSafeEqual(provided, secret);
}
