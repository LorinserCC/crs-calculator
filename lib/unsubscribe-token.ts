import crypto from "node:crypto";

type Payload = { email: string; iat: number };

function b64urlEncode(input: string | Buffer): string {
  return Buffer.from(input).toString("base64url");
}

function b64urlDecode(input: string): Buffer {
  return Buffer.from(input, "base64url");
}

export function signUnsubscribeToken(email: string, secret: string): string {
  const header = { alg: "HS256", typ: "JWT" };
  const payload: Payload = { email, iat: Math.floor(Date.now() / 1000) };
  const encoded = `${b64urlEncode(JSON.stringify(header))}.${b64urlEncode(JSON.stringify(payload))}`;
  const signature = crypto.createHmac("sha256", secret).update(encoded).digest("base64url");
  return `${encoded}.${signature}`;
}

export function verifyUnsubscribeToken(token: string, secret: string): Payload | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [encodedHeader, encodedPayload, signature] = parts;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest("base64url");

  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length) return null;
  if (!crypto.timingSafeEqual(sigBuf, expBuf)) return null;

  try {
    const payload = JSON.parse(b64urlDecode(encodedPayload).toString()) as Payload;
    if (typeof payload.email !== "string" || typeof payload.iat !== "number") return null;
    return payload;
  } catch {
    return null;
  }
}
