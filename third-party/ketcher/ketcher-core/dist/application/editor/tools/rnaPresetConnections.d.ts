import { type IKetTemplateConnection } from '../../formatters/types/ket';
import type { IRnaPreset, RnaPhosphatePosition } from '../../editor/tools/Tool';
export type RnaPresetWithOptionalFields = Pick<IRnaPreset, 'sugar' | 'phosphate' | 'connections'>;
export declare const getRnaPresetPhosphatePosition: (preset: Partial<RnaPresetWithOptionalFields>) => RnaPhosphatePosition | undefined;
export declare const buildRnaPresetConnections: (preset: Partial<Pick<IRnaPreset, "base" | "sugar" | "phosphate">>, phosphatePosition?: RnaPhosphatePosition) => IKetTemplateConnection[];
