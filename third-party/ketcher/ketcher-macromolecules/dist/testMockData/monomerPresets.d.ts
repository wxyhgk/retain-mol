import { KetMonomerGroupTemplateClass, KetTemplateType, MonomerItemType } from 'ketcher-core';
export declare const monomers: MonomerItemType[];
export declare const preset: {
    base: {
        struct: {
            atoms: {
                nextId: number;
            };
            bonds: {
                nextId: number;
            };
            sgroups: {
                nextId: number;
            };
            halfBonds: {
                nextId: number;
            };
            loops: {
                nextId: number;
            };
            isReaction: boolean;
            rxnArrows: {
                nextId: number;
            };
            rxnPluses: {
                nextId: number;
            };
            frags: {
                nextId: number;
            };
            rgroups: {
                nextId: number;
            };
            rgroupAttachmentPoints: {
                nextId: number;
            };
            name: string;
            abbreviation: string;
            sGroupForest: {
                parent: {};
                children: {};
                atomSets: {};
            };
            simpleObjects: {
                nextId: number;
            };
            texts: {
                nextId: number;
            };
            functionalGroups: {
                nextId: number;
            };
            highlights: {
                nextId: number;
            };
        };
        props: {
            Name: string;
            MonomerType: string;
            MonomerName: string;
            MonomerCode: string;
            MonomerNaturalAnalogCode: string;
            BranchMonomer: string;
            MonomerCaps: {
                R1: string;
            };
        };
        favorite: boolean;
        label: string;
    };
    sugar: {
        struct: {
            atoms: {
                nextId: number;
            };
            bonds: {
                nextId: number;
            };
            sgroups: {
                nextId: number;
            };
            halfBonds: {
                nextId: number;
            };
            loops: {
                nextId: number;
            };
            isReaction: boolean;
            rxnArrows: {
                nextId: number;
            };
            rxnPluses: {
                nextId: number;
            };
            frags: {
                nextId: number;
            };
            rgroups: {
                nextId: number;
            };
            rgroupAttachmentPoints: {
                nextId: number;
            };
            name: string;
            abbreviation: string;
            sGroupForest: {
                parent: {};
                children: {};
                atomSets: {};
            };
            simpleObjects: {
                nextId: number;
            };
            texts: {
                nextId: number;
            };
            functionalGroups: {
                nextId: number;
            };
            highlights: {
                nextId: number;
            };
        };
        props: {
            Name: string;
            MonomerType: string;
            MonomerName: string;
            MonomerCode: string;
            MonomerNaturalAnalogCode: string;
            BranchMonomer: string;
            MonomerCaps: {
                R1: string;
                R2: string;
                R3: string;
            };
        };
        favorite: boolean;
        label: string;
    };
    phosphate: {
        struct: {
            atoms: {
                nextId: number;
            };
            bonds: {
                nextId: number;
            };
            sgroups: {
                nextId: number;
            };
            halfBonds: {
                nextId: number;
            };
            loops: {
                nextId: number;
            };
            isReaction: boolean;
            rxnArrows: {
                nextId: number;
            };
            rxnPluses: {
                nextId: number;
            };
            frags: {
                nextId: number;
            };
            rgroups: {
                nextId: number;
            };
            rgroupAttachmentPoints: {
                nextId: number;
            };
            name: string;
            abbreviation: string;
            sGroupForest: {
                parent: {};
                children: {};
                atomSets: {};
            };
            simpleObjects: {
                nextId: number;
            };
            texts: {
                nextId: number;
            };
            functionalGroups: {
                nextId: number;
            };
            highlights: {
                nextId: number;
            };
        };
        props: {
            Name: string;
            MonomerType: string;
            MonomerName: string;
            MonomerCode: string;
            MonomerNaturalAnalogCode: string;
            BranchMonomer: string;
            MonomerCaps: {
                R1: string;
                R2: string;
            };
        };
        favorite: boolean;
        label: string;
    };
    name: string;
    default: boolean;
};
declare const phosphate: MonomerItemType;
declare const ribose: MonomerItemType;
declare const thymine: MonomerItemType;
declare const cytosine: MonomerItemType;
declare const uracil: MonomerItemType;
declare const adenine: MonomerItemType;
declare const guanine: MonomerItemType;
declare const rnaPresetsTemplates: ({
    type: KetTemplateType;
    id: string;
    name: string;
    class: KetMonomerGroupTemplateClass;
    aliasAxoLabs: string;
    templates: {
        $ref: string;
    }[];
} | {
    type: KetTemplateType;
    id: string;
    name: string;
    class: KetMonomerGroupTemplateClass;
    templates: {
        $ref: string;
    }[];
    aliasAxoLabs?: undefined;
})[];
export { phosphate, ribose, cytosine, guanine, thymine, uracil, adenine, rnaPresetsTemplates, };
