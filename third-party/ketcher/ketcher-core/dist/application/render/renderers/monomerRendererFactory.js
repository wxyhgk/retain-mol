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

var _slicedToArray = require('@babel/runtime/helpers/slicedToArray');
var monomerEntityFactory = require('../../../domain/helpers/monomerEntityFactory.js');
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
require('../../../domain/entities/AmbiguousMonomer.js');
require('../../../domain/entities/MonomerToAtomBond.js');
require('../../../domain/entities/HydrogenBond.js');
require('../../../domain/entities/SGroupDrawingEntity.js');
require('../../../domain/entities/BackBoneSequenceNode.js');
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
require('../../../domain/constants/monomers.js');
var ChemRenderer = require('./ChemRenderer.js');
var PeptideRenderer = require('./PeptideRenderer.js');
var PhosphateRenderer = require('./PhosphateRenderer.js');
var RNABaseRenderer = require('./RNABaseRenderer.js');
var SugarRenderer = require('./SugarRenderer.js');
var UnresolvedMonomerRenderer = require('./UnresolvedMonomerRenderer.js');
var UnsplitNucleotideRenderer = require('./UnsplitNucleotideRenderer.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _slicedToArray__default = /*#__PURE__*/_interopDefaultLegacy(_slicedToArray);

var entityToRenderer = new Map([
[Chem.Chem, ChemRenderer.ChemRenderer], [Peptide.Peptide, PeptideRenderer.PeptideRenderer], [Phosphate.Phosphate, PhosphateRenderer.PhosphateRenderer], [RNABase.RNABase, RNABaseRenderer.RNABaseRenderer], [Sugar.Sugar, SugarRenderer.SugarRenderer], [UnresolvedMonomer.UnresolvedMonomer, UnresolvedMonomerRenderer.UnresolvedMonomerRenderer], [UnsplitNucleotide.UnsplitNucleotide, UnsplitNucleotideRenderer.UnsplitNucleotideRenderer]]);
var monomerRendererFactory = function monomerRendererFactory(monomer) {
  var _monomerEntityFactory = monomerEntityFactory.monomerEntityFactory(monomer),
    _monomerEntityFactory2 = _slicedToArray__default["default"](_monomerEntityFactory, 2),
    EntityClass = _monomerEntityFactory2[0],
    ketMonomerClass = _monomerEntityFactory2[1];
  var RendererClass = entityToRenderer.get(EntityClass);
  return [EntityClass, RendererClass, ketMonomerClass];
};

exports.monomerRendererFactory = monomerRendererFactory;
//# sourceMappingURL=monomerRendererFactory.js.map
