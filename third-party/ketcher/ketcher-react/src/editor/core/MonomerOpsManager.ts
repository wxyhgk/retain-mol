import {
  type BaseMonomer,
  type IKetAttachmentPoint,
  type IKetMonomerTemplate,
  type MonomerCreationState,
  AttachmentPointName,
  Bond,
  type KetMonomerClass,
  KetTemplateType,
  type Struct,
  Vec2,
  assert,
  fillNaturalAnalogueForPhosphateAndSugar,
  genericsList,
  getHELMClassByKetMonomerClass,
  KetSerializer,
  monomerFactory,
  normalizeMonomerAtomsPositions,
  setMonomerTemplatePrefix,
} from 'ketcher-core';

export type SaveNewMonomerData = {
  type: KetMonomerClass;
  symbol: string;
  name: string;
  naturalAnalogue: string;
  modificationTypes: string[];
  aliasHELM: string;
  aliasBILN: string;
  hidden?: boolean;
  structure: Struct;
  attachmentPoints: Map<AttachmentPointName, [number, number]>;
};

export interface IMonomerOpsManager {
  saveNewMonomer(data: SaveNewMonomerData): {
    monomer: BaseMonomer;
    monomerTemplate: IKetMonomerTemplate;
    monomerRef: string;
  };
  isMinimalViableStructure(
    structure: Struct,
    monomerCreationState: MonomerCreationState | null,
  ): boolean;
  isStructureImpure(struct: Struct): boolean;
}

type Deps = {
  getMonomerCreationState: () => MonomerCreationState | null;
};

export class MonomerOpsManager implements IMonomerOpsManager {
  constructor(private deps: Deps) {}

  saveNewMonomer(data: SaveNewMonomerData) {
    if (!this.deps.getMonomerCreationState()) {
      throw new Error(
        'Monomer creation wizard is not active, cannot save new monomer',
      );
    }
    const ketSerializer = new KetSerializer();
    const ketMicromolecule = JSON.parse(
      ketSerializer.serialize(data.structure),
    );

    const {
      symbol,
      name,
      type,
      naturalAnalogue,
      modificationTypes,
      aliasHELM,
      aliasBILN,
      hidden,
    } = data;

    const attachmentPoints: IKetAttachmentPoint[] = [];
    const sortedAttachmentPointsData = new Map<string, [number, number]>(
      [...data.attachmentPoints].sort(([leftName], [rightName]) =>
        leftName.localeCompare(rightName),
      ),
    );

    sortedAttachmentPointsData.forEach(
      ([attachmentAtomId, leavingAtomId], attachmentPointName) => {
        let attachmentPointType: 'left' | 'right' | 'side' = 'side';
        if (attachmentPointName === AttachmentPointName.R1) {
          attachmentPointType = 'left';
        } else if (attachmentPointName === AttachmentPointName.R2) {
          attachmentPointType = 'right';
        }

        const attachmentPoint: IKetAttachmentPoint = {
          attachmentAtom: attachmentAtomId,
          leavingGroup: {
            atoms: [leavingAtomId],
          },
          type: attachmentPointType,
        };
        attachmentPoints.push(attachmentPoint);
      },
    );

    const monomerId = `${symbol}___${name}${hidden ? '___hidden' : ''}`;
    const monomerRef = setMonomerTemplatePrefix(monomerId);
    const monomerHELMClass = getHELMClassByKetMonomerClass(type);
    const naturalAnalogueToUse = fillNaturalAnalogueForPhosphateAndSugar(
      naturalAnalogue,
      type,
    );

    const monomerTemplate: IKetMonomerTemplate = {
      type: KetTemplateType.MONOMER_TEMPLATE,
      id: monomerId,
      class: type,
      classHELM: monomerHELMClass,
      alias: symbol,
      fullName: name,
      naturalAnalogShort: naturalAnalogueToUse,
      modificationTypes,
      aliasHELM,
      aliasBILN,
      atoms: normalizeMonomerAtomsPositions(ketMicromolecule.mol0.atoms),
      bonds: ketMicromolecule.mol0.bonds,
      attachmentPoints,
      ...(hidden ? { hidden: true } : {}),
      root: {
        nodes: [],
        connections: [],
        templates: [
          {
            $ref: monomerRef,
          },
        ],
      },
    };

    const monomerItem =
      ketSerializer.convertMonomerTemplateToLibraryItem(monomerTemplate);
    const [Monomer] = monomerFactory(monomerItem);
    const monomerBBox = data.structure.getCoordBoundingBoxObj();
    const monomerPosition = new Vec2(
      (monomerBBox.min.x + monomerBBox.max.x) / 2,
      (monomerBBox.min.y + monomerBBox.max.y) / 2,
    );
    const monomer = new Monomer(monomerItem, monomerPosition);

    return {
      monomer,
      monomerTemplate,
      monomerRef,
    };
  }

  isMinimalViableStructure(
    structure: Struct,
    monomerCreationState: MonomerCreationState | null,
  ): boolean {
    return MonomerOpsManager.isMinimalViableStructure(
      structure,
      monomerCreationState,
    );
  }

  isStructureImpure(struct: Struct): boolean {
    return MonomerOpsManager.isStructureImpure(struct);
  }

  static isMinimalViableStructure(
    structure: Struct,
    monomerCreationState: MonomerCreationState | null,
  ): boolean {
    const nonLeavingAtoms = structure.atoms.filter((atomId) => {
      assert(monomerCreationState);

      return Array.from(
        monomerCreationState.assignedAttachmentPoints.values(),
      ).every((atomPair) => atomPair[1] !== atomId);
    });

    if (nonLeavingAtoms.size < 2) {
      return false;
    }

    const nonLeavingAtomBonds = structure.bonds.filter(
      (_, bond) =>
        nonLeavingAtoms.has(bond.begin) && nonLeavingAtoms.has(bond.end),
    );

    if (nonLeavingAtomBonds.size < 1) {
      return false;
    }

    const suitableBonds = nonLeavingAtomBonds.filter(
      (_, bond) =>
        bond.type === Bond.PATTERN.TYPE.SINGLE &&
        (bond.stereo === Bond.PATTERN.STEREO.NONE ||
          bond.stereo === Bond.PATTERN.STEREO.UP ||
          bond.stereo === Bond.PATTERN.STEREO.DOWN),
    );

    return suitableBonds.size >= 1;
  }

  static isStructureImpure(struct: Struct): boolean {
    const { atoms, sgroups, rgroups, functionalGroups } = struct;

    return (
      sgroups.size > 0 ||
      rgroups.size > 0 ||
      functionalGroups.size > 0 ||
      Array.from(atoms.values()).some((atom) =>
        genericsList.includes(atom.label),
      )
    );
  }
}
