/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/
import '../../../domain/entities/atom.modern.js';
import '../../../domain/entities/atomList.modern.js';
import '../../../domain/entities/bond.modern.js';
import '../../../domain/entities/fixedPrecision.modern.js';
import '../../../domain/entities/fragment.modern.js';
import '../../../domain/entities/functionalGroup.modern.js';
import '../../../domain/entities/halfBond.modern.js';
import '../../../domain/entities/loop.modern.js';
import '../../../domain/entities/rgroup.modern.js';
import '../../../domain/entities/rgroupAttachmentPoint.modern.js';
import '../../../domain/entities/rxnArrow.modern.js';
import '../../../domain/entities/rxnPlus.modern.js';
import '../../../domain/entities/sgroup.modern.js';
import '../../../domain/entities/sgroupForest.modern.js';
import '../../../domain/entities/simpleObject.modern.js';
import '../../../domain/entities/struct.modern.js';
import '../../../domain/entities/text.modern.js';
import '../../../domain/entities/pile.modern.js';
import '../../../domain/entities/vec2.modern.js';
import '../../../domain/entities/box2Abs.modern.js';
import '../../../domain/entities/pool.modern.js';
import '../../../domain/entities/image.modern.js';
import '../../../domain/entities/multitailArrow.modern.js';
import '../../../domain/entities/highlight.modern.js';
import '../../../domain/entities/sGroupAttachmentPoint.modern.js';
import '../../../domain/entities/monomerMicromolecule.modern.js';
import { Peptide } from '../../../domain/entities/Peptide.modern.js';
import '../../../domain/entities/BaseMonomer.modern.js';
import { Chem } from '../../../domain/entities/Chem.modern.js';
import { Sugar } from '../../../domain/entities/Sugar.modern.js';
import { RNABase } from '../../../domain/entities/RNABase.modern.js';
import { Phosphate } from '../../../domain/entities/Phosphate.modern.js';
import '../../../domain/entities/Axis.modern.js';
import '../../../domain/entities/Nucleoside.modern.js';
import '../../../domain/entities/Nucleotide.modern.js';
import '../../../domain/entities/monomer-chains/types.modern.js';
import '../../../domain/entities/monomer-chains/Chain.modern.js';
import '../../../domain/entities/monomer-chains/ChainsCollection.modern.js';
import '../../../domain/entities/MonomerSequenceNode.modern.js';
import '../../../domain/entities/EmptySequenceNode.modern.js';
import '../../../domain/entities/LinkerSequenceNode.modern.js';
import { UnresolvedMonomer } from '../../../domain/entities/UnresolvedMonomer.modern.js';
import { UnsplitNucleotide } from '../../../domain/entities/UnsplitNucleotide.modern.js';
import '../../../domain/entities/PolymerBond.modern.js';
import { AmbiguousMonomer } from '../../../domain/entities/AmbiguousMonomer.modern.js';
import '../../../domain/entities/MonomerToAtomBond.modern.js';
import '../../../domain/entities/HydrogenBond.modern.js';
import '../../../domain/entities/SGroupDrawingEntity.modern.js';
import '../../../domain/entities/BackBoneSequenceNode.modern.js';
import '@babel/runtime/helpers/slicedToArray';
import '../../../domain/entities/Command.modern.js';
import '../../../utilities/runAsyncAction.modern.js';
import '../../../utilities/KetcherLogger.modern.js';
import '../../../utilities/SettingsManager.modern.js';
import '../../../utilities/keynorm.modern.js';
import 'react-device-detect';
import '../../../utilities/clipboardUtils.modern.js';
import '../../../domain/entities/CoreAtom.modern.js';
import '../../../domain/entities/CoreStereoFlag.modern.js';
import '@babel/runtime/helpers/defineProperty';
import '@babel/runtime/helpers/typeof';
import '../../../domain/constants/elements.modern.js';
import '../../../domain/constants/element.types.modern.js';
import '../../../domain/constants/generics.modern.js';
import '../../../domain/constants/chains.modern.js';
import { KetMonomerClass } from '../../../domain/constants/monomers.modern.js';
import { AttachmentPointName } from '../../../domain/types/monomers.modern.js';
import '../../../domain/types/entities.modern.js';
import '../../formatters/supportedFormatProperties.modern.js';
import '../../formatters/formatProperties.modern.js';
import '../../formatters/structFormatter.types.modern.js';
import '../../formatters/formatterFactory.modern.js';
import '../../formatters/mol2Formatter.modern.js';
import '../../formatters/xyzFormatter.modern.js';
import '../../formatters/qcSchemaFormatter.modern.js';
import '../../formatters/types/ket.modern.js';

function shouldInvokeConnectionModal(firstMonomer, secondMonomer) {
  var checkForPotentialBonds = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
  var isHydrogenBond = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
  if (isHydrogenBond) {
    return undefined;
  }
  if (!secondMonomer.hasFreeAttachmentPoint) {
    return false;
  }
  if (firstMonomer.chosenFirstAttachmentPointForBond !== null && secondMonomer.chosenSecondAttachmentPointForBond !== null) {
    return false;
  }
  if (checkForPotentialBonds && (!firstMonomer.hasPotentialBonds() || !secondMonomer.hasPotentialBonds())) {
    return true;
  }
  if (firstMonomer.unUsedAttachmentPointsNamesList.length === 1 && secondMonomer.unUsedAttachmentPointsNamesList.length === 1) {
    return false;
  }
  if (firstMonomer instanceof Chem || secondMonomer instanceof Chem || firstMonomer instanceof AmbiguousMonomer && firstMonomer.monomerClass === KetMonomerClass.CHEM || secondMonomer instanceof AmbiguousMonomer && secondMonomer.monomerClass === KetMonomerClass.CHEM) {
    return true;
  }
  if (firstMonomer instanceof UnresolvedMonomer || secondMonomer instanceof UnresolvedMonomer) {
    return true;
  }
  var rnaMonomerClasses = [Sugar, RNABase, Phosphate];
  var firstMonomerIsRNA = rnaMonomerClasses.find(function (RNAClass) {
    return firstMonomer instanceof RNAClass;
  });
  var secondMonomerIsRNA = rnaMonomerClasses.find(function (RNAClass) {
    return secondMonomer instanceof RNAClass;
  });
  if (firstMonomerIsRNA && secondMonomer instanceof Peptide || secondMonomerIsRNA && firstMonomer instanceof Peptide || firstMonomerIsRNA && secondMonomer instanceof UnsplitNucleotide || secondMonomerIsRNA && firstMonomer instanceof UnsplitNucleotide || firstMonomerIsRNA && secondMonomer instanceof AmbiguousMonomer && secondMonomer.monomerClass === KetMonomerClass.AminoAcid || secondMonomerIsRNA && firstMonomer instanceof AmbiguousMonomer && firstMonomer.monomerClass === KetMonomerClass.AminoAcid) {
    return true;
  }
  if (secondMonomer instanceof Peptide && firstMonomer instanceof Peptide) {
    var hasPlentyAttachmentPoints = firstMonomer.listOfAttachmentPoints.length > 2 || secondMonomer.listOfAttachmentPoints.length > 2;
    var hasPlentyFreeAttachmentPoints = firstMonomer.unUsedAttachmentPointsNamesList.length > 1 || secondMonomer.unUsedAttachmentPointsNamesList.length > 1;
    var BothR1AttachmentPointUsed = firstMonomer.isAttachmentPointUsed(AttachmentPointName.R1) && secondMonomer.isAttachmentPointUsed(AttachmentPointName.R1);
    var BothR2AttachmentPointUsed = firstMonomer.isAttachmentPointUsed(AttachmentPointName.R2) && secondMonomer.isAttachmentPointUsed(AttachmentPointName.R2);
    var R1AndR2AttachmentPointUsed = firstMonomer.isAttachmentPointUsed(AttachmentPointName.R2) && firstMonomer.isAttachmentPointUsed(AttachmentPointName.R1) || secondMonomer.isAttachmentPointUsed(AttachmentPointName.R2) && secondMonomer.isAttachmentPointUsed(AttachmentPointName.R1);
    if (hasPlentyAttachmentPoints && hasPlentyFreeAttachmentPoints && (BothR1AttachmentPointUsed || BothR2AttachmentPointUsed || R1AndR2AttachmentPointUsed)) {
      return true;
    }
  }
  return false;
}
function findPresetMonomerForBonding(addedMonomers, targetAP) {
  var oppositeAP = targetAP === AttachmentPointName.R1 ? AttachmentPointName.R2 : targetAP === AttachmentPointName.R2 ? AttachmentPointName.R1 : null;
  if (oppositeAP) {
    var match = addedMonomers.find(function (m) {
      return m.isAttachmentPointExistAndFree(oppositeAP);
    });
    if (match) return match;
  }
  var sugar = addedMonomers.find(function (m) {
    return m instanceof Sugar && m.hasFreeAttachmentPoint;
  });
  if (sugar) return sugar;
  var phosphate = addedMonomers.find(function (m) {
    return m instanceof Phosphate && m.hasFreeAttachmentPoint;
  });
  if (phosphate) return phosphate;
  var base = addedMonomers.find(function (m) {
    return m instanceof RNABase && m.hasFreeAttachmentPoint;
  });
  return base;
}

export { findPresetMonomerForBonding, shouldInvokeConnectionModal };
//# sourceMappingURL=bondConnectionHelpers.modern.js.map
