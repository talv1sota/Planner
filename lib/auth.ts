import { createHmac } from "crypto";

const secret = () => {
  const s = process.env.APP_SECRET;
  if (!s) throw new Error("APP_SECRET env var is required");
  return s;
};

export function signValue(value: string): string {
  const sig = createHmac("sha256", secret()).update(value).digest("hex");
  return `${value}.${sig}`;
}

export function verifyValue(signed: string): string | null {
  const dot = signed.lastIndexOf(".");
  if (dot < 1) return null;
  const value = signed.slice(0, dot);
  const sig = signed.slice(dot + 1);
  const expected = createHmac("sha256", secret()).update(value).digest("hex");
  if (sig.length !== expected.length) return null;
  let match = true;
  for (let i = 0; i < sig.length; i++) {
    if (sig[i] !== expected[i]) match = false;
  }
  return match ? value : null;
}
