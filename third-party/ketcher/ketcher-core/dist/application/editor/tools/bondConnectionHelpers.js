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
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

require('../../../domain/entities/atom.js');
require('../../../domain/entities/atomList.js');
require('../../../domain/entities/bond.js');
require('../../../domain/entities/fixedPrecision.js');
require('../../../domain/entities/fragment.js');
require('../../../domain/entities/functionalGroup.js');
require('../../../domain/entities/halfBond.js');
require('../../../domain/entities/loop.js');
require('../../../domain/entities/rgroup.js');
require('../../../domain/entities/rgroupAttachmentPoint.js');
require('../../../domain/entities/rxnArrow.js');
require('../../../domain/entities/rxnPlus.js');
require('../../../domain/entities/sgroup.js');
require('../../../domain/entities/sgroupForest.js');
require('../../../domain/entities/simpleObject.js');
require('../../../domain/entities/struct.js');
require('../../../domain/entities/text.js');
require('../../../domain/entities/pile.js');
require('../../../domain/entities/vec2.js');
require('../../../domain/entities/box2Abs.js');
require('../../../domain/entities/pool.js');
require('../../../domain/entities/image.js');
require('../../../domain/entities/multitailArrow.js');
require('../../../domain/entities/highlight.js');
require('../../../domain/entities/sGroupAttachmentPoint.js');
require('../../../domain/entities/monomerMicromolecule.js');
var Peptide = require('../../../domain/entities/Peptide.js');
require('../../../domain/entities/BaseMonomer.js');
var Chem = require('../../../domain/entities/Chem.js');
var Sugar = require('../../../domain/entities/Sugar.js');
var RNABase = require('../../../domain/entities/RNABase.js');
var Phosphate = require('../../../domain/entities/Phosphate.js');
require('../../../domain/entities/Axis.js');
require('../../../domain/entities/Nucleoside.js');
require('../../../domain/entities/Nucleotide.js');
require('../../../domain/entities/monomer-chains/types.js');
require('../../../domain/entities/monomer-chains/Chain.js');
require('../../../domain/entities/monomer-chains/ChainsCollection.js');
require('../../../domain/entities/MonomerSequenceNode.js');
require('../../../domain/entities/EmptySequenceNode.js');
require('../../../domain/entities/LinkerSequenceNode.js');
var UnresolvedMonomer = require('../../../domain/entities/UnresolvedMonomer.js');
var UnsplitNucleotide = require('../../../domain/entities/UnsplitNucleotide.js');
require('../../../domain/entities/PolymerBond.js');
var AmbiguousMonomer = require('../../../domain/entities/AmbiguousMonomer.js');
require('../../../domain/entities/MonomerToAtomBond.js');
require('../../../domain/entities/HydrogenBond.js');
require('../../../domain/entities/SGroupDrawingEntity.js');
require('../../../domain/entities/BackBoneSequenceNode.js');
require('@babel/runtime/helpers/slicedToArray');
require('../../../domain/entities/Command.js');
require('../../../utilities/runAsyncAction.js');
require('../../../utilities/KetcherLogger.js');
require('../../../utilities/SettingsManager.js');
require('../../../utilities/keynorm.js');
require('react-device-detect');
require('../../../utilities/clipboardUtils.js');
require('../../../domain/entities/CoreAtom.js');
require('../../../domain/entities/CoreStereoFlag.js');
require('@babel/runtime/helpers/defineProperty');
require('@babel/runtime/helpers/typeof');
require('../../../domain/constants/elements.js');
require('../../../domain/constants/element.types.js');
require('../../../domain/constants/generics.js');
require('../../../domain/constants/chains.js');
var monomers = require('../../../domain/constants/monomers.js');
var monomers$1 = require('../../../domain/types/monomers.js');
require('../../../domain/types/entities.js');
require('../../formatters/supportedFormatProperties.js');
require('../../formatters/formatProperties.js');
require('../../formatters/structFormatter.types.js');
require('../../formatters/formatterFactory.js');
require('../../formatters/mol2Formatter.js');
require('../../formatters/xyzFormatter.js');
require('../../formatters/qcSchemaFormatter.js');
require('../../formatters/types/ket.js');

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
  if (firstMonomer instanceof Chem.Chem || secondMonomer instanceof Chem.Chem || firstMonomer instanceof AmbiguousMonomer.AmbiguousMonomer && firstMonomer.monomerClass === monomers.KetMonomerClass.CHEM || secondMonomer instanceof AmbiguousMonomer.AmbiguousMonomer && secondMonomer.monomerClass === monomers.KetMonomerClass.CHEM) {
    return true;
  }
  if (firstMonomer instanceof UnresolvedMonomer.UnresolvedMonomer || secondMonomer instanceof UnresolvedMonomer.UnresolvedMonomer) {
    return true;
  }
  var rnaMonomerClasses = [Sugar.Sugar, RNABase.RNABase, Phosphate.Phosphate];
  var firstMonomerIsRNA = rnaMonomerClasses.find(function (RNAClass) {
    return firstMonomer instanceof RNAClass;
  });
  var secondMonomerIsRNA = rnaMonomerClasses.find(function (RNAClass) {
    return secondMonomer instanceof RNAClass;
  });
  if (firstMonomerIsRNA && secondMonomer instanceof Peptide.Peptide || secondMonomerIsRNA && firstMonomer instanceof Peptide.Peptide || firstMonomerIsRNA && secondMonomer instanceof UnsplitNucleotide.UnsplitNucleotide || secondMonomerIsRNA && firstMonomer instanceof UnsplitNucleotide.UnsplitNucleotide || firstMonomerIsRNA && secondMonomer instanceof AmbiguousMonomer.AmbiguousMonomer && secondMonomer.monomerClass === monomers.KetMonomerClass.AminoAcid || secondMonomerIsRNA && firstMonomer instanceof AmbiguousMonomer.AmbiguousMonomer && firstMonomer.monomerClass === monomers.KetMonomerClass.AminoAcid) {
    return true;
  }
  if (secondMonomer instanceof Peptide.Peptide && firstMonomer instanceof Peptide.Peptide) {
    var hasPlentyAttachmentPoints = firstMonomer.listOfAttachmentPoints.length > 2 || secondMonomer.listOfAttachmentPoints.length > 2;
    var hasPlentyFreeAttachmentPoints = firstMonomer.unUsedAttachmentPointsNamesList.length > 1 || secondMonomer.unUsedAttachmentPointsNamesList.length > 1;
    var BothR1AttachmentPointUsed = firstMonomer.isAttachmentPointUsed(monomers$1.AttachmentPointName.R1) && secondMonomer.isAttachmentPointUsed(monomers$1.AttachmentPointName.R1);
    var BothR2AttachmentPointUsed = firstMonomer.isAttachmentPointUsed(monomers$1.AttachmentPointName.R2) && secondMonomer.isAttachmentPointUsed(monomers$1.AttachmentPointName.R2);
    var R1AndR2AttachmentPointUsed = firstMonomer.isAttachmentPointUsed(monomers$1.AttachmentPointName.R2) && firstMonomer.isAttachmentPointUsed(monomers$1.AttachmentPointName.R1) || secondMonomer.isAttachmentPointUsed(monomers$1.AttachmentPointName.R2) && secondMonomer.isAttachmentPointUsed(monomers$1.AttachmentPointName.R1);
    if (hasPlentyAttachmentPoints && hasPlentyFreeAttachmentPoints && (BothR1AttachmentPointUsed || BothR2AttachmentPointUsed || R1AndR2AttachmentPointUsed)) {
      return true;
    }
  }
  return false;
}
function findPresetMonomerForBonding(addedMonomers, targetAP) {
  var oppositeAP = targetAP === monomers$1.AttachmentPointName.R1 ? monomers$1.AttachmentPointName.R2 : targetAP === monomers$1.AttachmentPointName.R2 ? monomers$1.AttachmentPointName.R1 : null;
  if (oppositeAP) {
    var match = addedMonomers.find(function (m) {
      return m.isAttachmentPointExistAndFree(oppositeAP);
    });
    if (match) return match;
  }
  var sugar = addedMonomers.find(function (m) {
    return m instanceof Sugar.Sugar && m.hasFreeAttachmentPoint;
  });
  if (sugar) return sugar;
  var phosphate = addedMonomers.find(function (m) {
    return m instanceof Phosphate.Phosphate && m.hasFreeAttachmentPoint;
  });
  if (phosphate) return phosphate;
  var base = addedMonomers.find(function (m) {
    return m instanceof RNABase.RNABase && m.hasFreeAttachmentPoint;
  });
  return base;
}

exports.findPresetMonomerForBonding = findPresetMonomerForBonding;
exports.shouldInvokeConnectionModal = shouldInvokeConnectionModal;
//# sourceMappingURL=bondConnectionHelpers.js.map
