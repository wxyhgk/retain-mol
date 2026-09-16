import type { ErrorCode, MoleculeError, Result } from 'molecule-contracts';

/** Freeze owned JSON values; no live model objects cross the public boundary. */
export function freeze<T>(value: T): T {
  if (value !== null && typeof value === 'object' && !Object.isFrozen(value)) {
    for (const child of Object.values(value)) freeze(child);
    Object.freeze(value);
  }
  return value;
}

export function success<T>(value: T): Result<T> {
  return freeze({ ok: true, value });
}

export function failure<T = never>(
  code: ErrorCode,
  message: string,
  details: Omit<MoleculeError, 'code' | 'message'> = {},
): Result<T> {
  return freeze({ ok: false, error: { code, message, ...details } });
}

/** Inputs have already passed the finite, plain-JSON contract validator. */
export function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  if (value !== null && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    return `{${Object.keys(record)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonicalJson(record[key])}`)
      .join(',')}}`;
  }
  return JSON.stringify(value);
}
