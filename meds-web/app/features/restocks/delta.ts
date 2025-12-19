/* eslint-disable @typescript-eslint/no-explicit-any */

function toNum(v: any) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function deltaText(before: any, after: any) {
  const b = toNum(before);
  const a = toNum(after);
  if (b === null || a === null) return null;

  const d = a - b;
  if (d === 0) return '0';
  return d > 0 ? `+${d}` : `${d}`;
}
