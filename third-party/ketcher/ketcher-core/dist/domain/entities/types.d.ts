import type { BaseMonomer } from '../entities/BaseMonomer';
import type { KetAmbiguousMonomerTemplateSubType, KetMonomerClass } from '../../application/formatters/types/ket';
export interface IVariantMonomer {
    monomers: BaseMonomer[];
    monomerClass: KetMonomerClass;
    subtype: KetAmbiguousMonomerTemplateSubType;
}
export declare enum AtomCIP {
    S = "S",
    R = "R",
    s = "s",
    r = "r"
}
export declare enum BondCIP {
    E = "E",
    Z = "Z",
    M = "M",
    P = "P"
}
