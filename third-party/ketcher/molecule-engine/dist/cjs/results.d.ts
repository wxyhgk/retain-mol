import type { ErrorCode, MoleculeError, Result } from 'molecule-contracts';
/** Freeze owned JSON values; no live model objects cross the public boundary. */
export declare function freeze<T>(value: T): T;
export declare function success<T>(value: T): Result<T>;
export declare function failure<T = never>(code: ErrorCode, message: string, details?: Omit<MoleculeError, 'code' | 'message'>): Result<T>;
/** Inputs have already passed the finite, plain-JSON contract validator. */
export declare function canonicalJson(value: unknown): string;
