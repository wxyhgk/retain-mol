import { Bond } from '../../../domain/entities/bond';
import type { Struct } from '../../../domain/entities/struct';
export declare function getStereoAtomsMap(struct: Struct, bonds: Array<Bond>, bond?: Bond): Map<any, any>;
