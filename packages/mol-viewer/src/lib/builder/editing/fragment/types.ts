import type { Molecule } from '../../../molecule'

export type AttachResult = { ok: true; molecule: Molecule } | { ok: false; reason: string }
