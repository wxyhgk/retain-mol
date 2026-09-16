declare namespace _default {
    export { fmtInfo };
    export { paddedNum };
    export { parseDecimalInt };
    export { partitionLine };
    export { partitionLineFixed };
    export { rxnMerge };
    export { rgMerge };
}
export default _default;
declare namespace fmtInfo {
    let bondTypeMap: {
        1: number;
        2: number;
        3: number;
        4: number;
        5: number;
        6: number;
        7: number;
        8: number;
        9: number;
        10: number;
    };
    let bondStereoMap: {
        0: number;
        1: number;
        4: number;
        6: number;
        3: number;
    };
    let v30bondStereoMap: {
        0: number;
        1: number;
        2: number;
        3: number;
    };
    let bondTopologyMap: {
        0: number;
        1: number;
        2: number;
    };
    let countsLinePartition: number[];
    let atomLinePartition: number[];
    let bondLinePartition: number[];
    let atomListHeaderPartition: number[];
    let atomListHeaderLength: number;
    let atomListHeaderItemLength: number;
    let chargeMap: (number | null)[];
    let valenceMap: (number | undefined)[];
    let implicitHydrogenMap: (number | undefined)[];
    namespace v30atomPropMap {
        let CHG: string;
        let RAD: string;
        let MASS: string;
        let VAL: string;
        let HCOUNT: string;
        let INVRET: string;
        let SUBST: string;
        let UNSAT: string;
        let RBCNT: string;
    }
    let rxnItemsPartition: number[];
}
declare function paddedNum(number: any, width: any, precision: any): string;
/**
 * @param str {string}
 * @returns {number}
 */
declare function parseDecimalInt(str: string): number;
declare function partitionLine(str: any, parts: any, withspace: any): any[];
declare function partitionLineFixed(str: any, itemLength: any, withspace: any): any[];
declare function rxnMerge(mols: any, nReactants: any, nProducts: any, nAgents: any, shouldReactionRelayout: any): Struct;
declare function rgMerge(scaffold: any, rgroups: any): Struct;
import { Struct } from '../../entities/struct';
