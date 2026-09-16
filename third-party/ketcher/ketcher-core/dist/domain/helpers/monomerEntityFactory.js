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

var _toConsumableArray = require('@babel/runtime/helpers/toConsumableArray');
require('../entities/atom.js');
require('../entities/atomList.js');
require('../entities/bond.js');
require('../entities/fixedPrecision.js');
require('../entities/fragment.js');
require('../entities/functionalGroup.js');
require('../entities/halfBond.js');
require('../entities/loop.js');
require('../entities/rgroup.js');
require('../entities/rgroupAttachmentPoint.js');
require('../entities/rxnArrow.js');
require('../entities/rxnPlus.js');
require('../entities/sgroup.js');
require('../entities/sgroupForest.js');
require('../entities/simpleObject.js');
require('../entities/struct.js');
require('../entities/text.js');
require('../entities/pile.js');
require('../entities/vec2.js');
require('../entities/box2Abs.js');
require('../entities/pool.js');
require('../entities/image.js');
require('../entities/multitailArrow.js');
require('../entities/highlight.js');
require('../entities/sGroupAttachmentPoint.js');
require('../entities/monomerMicromolecule.js');
var Peptide = require('../entities/Peptide.js');
require('../entities/BaseMonomer.js');
var Chem = require('../entities/Chem.js');
var Sugar = require('../entities/Sugar.js');
var RNABase = require('../entities/RNABase.js');
var Phosphate = require('../entities/Phosphate.js');
require('../entities/Axis.js');
require('../entities/Nucleoside.js');
require('../entities/Nucleotide.js');
require('../entities/monomer-chains/types.js');
require('../entities/monomer-chains/Chain.js');
require('../entities/monomer-chains/ChainsCollection.js');
require('../entities/MonomerSequenceNode.js');
require('../entities/EmptySequenceNode.js');
require('../entities/LinkerSequenceNode.js');
var UnresolvedMonomer = require('../entities/UnresolvedMonomer.js');
var UnsplitNucleotide = require('../entities/UnsplitNucleotide.js');
require('../entities/PolymerBond.js');
var AmbiguousMonomer = require('../entities/AmbiguousMonomer.js');
require('../entities/MonomerToAtomBond.js');
require('../entities/HydrogenBond.js');
require('../entities/SGroupDrawingEntity.js');
require('../entities/BackBoneSequenceNode.js');
require('@babel/runtime/helpers/slicedToArray');
require('../entities/Command.js');
require('../../utilities/runAsyncAction.js');
require('../../utilities/KetcherLogger.js');
require('../../utilities/SettingsManager.js');
require('../../utilities/keynorm.js');
require('react-device-detect');
require('../../utilities/clipboardUtils.js');
require('../entities/CoreAtom.js');
require('../entities/CoreStereoFlag.js');
require('@babel/runtime/helpers/defineProperty');
require('@babel/runtime/helpers/typeof');
require('../constants/elements.js');
require('../constants/element.types.js');
require('../constants/generics.js');
require('../constants/chains.js');
var monomers$1 = require('../constants/monomers.js');
var monomers = require('./monomers.js');
var monomerItem = require('./monomerItem.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _toConsumableArray__default = /*#__PURE__*/_interopDefaultLegacy(_toConsumableArray);

function monomerEntityFactory(monomer) {
  if (monomers.isAmbiguousMonomerLibraryItem(monomer)) {
    return [AmbiguousMonomer.AmbiguousMonomer, AmbiguousMonomer.AmbiguousMonomer.getMonomerClass(monomer.monomers)];
  }
  if (monomer.props.MonomerClass === monomers$1.KetMonomerClass.RNA || monomer.props.MonomerClass === monomers$1.KetMonomerClass.DNA) {
    return [UnsplitNucleotide.UnsplitNucleotide, monomers$1.KetMonomerClass.RNA];
  }
  if (monomer.props.MonomerClass === monomers$1.KetMonomerClass.AminoAcid || monomer.props.MonomerType === monomers$1.MONOMER_CONST.PEPTIDE) {
    return [Peptide.Peptide, monomers$1.KetMonomerClass.AminoAcid];
  }
  if (monomerItem.isMonomerItemSugar(monomer)) {
    return [Sugar.Sugar, monomers$1.KetMonomerClass.Sugar];
  }
  if (monomerItem.isMonomerItemPhosphate(monomer)) {
    return [Phosphate.Phosphate, monomers$1.KetMonomerClass.Phosphate];
  }
  if (monomer.props.MonomerClass === monomers$1.KetMonomerClass.Base || monomer.props.MonomerType === monomers$1.MONOMER_CONST.RNA && [].concat(_toConsumableArray__default["default"](monomers$1.rnaDnaNaturalAnalogues), _toConsumableArray__default["default"](monomers$1.unknownNaturalAnalogues)).includes(monomer.props.MonomerNaturalAnalogCode)) {
    return [RNABase.RNABase, monomers$1.KetMonomerClass.Base];
  }
  if (monomer.props.unresolved) {
    return [UnresolvedMonomer.UnresolvedMonomer, monomers$1.KetMonomerClass.CHEM];
  }
  return [Chem.Chem, monomers$1.KetMonomerClass.CHEM];
}

exports.monomerEntityFactory = monomerEntityFactory;
//# sourceMappingURL=monomerEntityFactory.js.map
