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
import _slicedToArray from '@babel/runtime/helpers/slicedToArray';
import { monomerEntityFactory } from '../../../domain/helpers/monomerEntityFactory.modern.js';
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
import '../../../domain/entities/AmbiguousMonomer.modern.js';
import '../../../domain/entities/MonomerToAtomBond.modern.js';
import '../../../domain/entities/HydrogenBond.modern.js';
import '../../../domain/entities/SGroupDrawingEntity.modern.js';
import '../../../domain/entities/BackBoneSequenceNode.modern.js';
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
import '../../../domain/constants/monomers.modern.js';
import { ChemRenderer } from './ChemRenderer.modern.js';
import { PeptideRenderer } from './PeptideRenderer.modern.js';
import { PhosphateRenderer } from './PhosphateRenderer.modern.js';
import { RNABaseRenderer } from './RNABaseRenderer.modern.js';
import { SugarRenderer } from './SugarRenderer.modern.js';
import { UnresolvedMonomerRenderer } from './UnresolvedMonomerRenderer.modern.js';
import { UnsplitNucleotideRenderer } from './UnsplitNucleotideRenderer.modern.js';

var entityToRenderer = new Map([
[Chem, ChemRenderer], [Peptide, PeptideRenderer], [Phosphate, PhosphateRenderer], [RNABase, RNABaseRenderer], [Sugar, SugarRenderer], [UnresolvedMonomer, UnresolvedMonomerRenderer], [UnsplitNucleotide, UnsplitNucleotideRenderer]]);
var monomerRendererFactory = function monomerRendererFactory(monomer) {
  var _monomerEntityFactory = monomerEntityFactory(monomer),
    _monomerEntityFactory2 = _slicedToArray(_monomerEntityFactory, 2),
    EntityClass = _monomerEntityFactory2[0],
    ketMonomerClass = _monomerEntityFactory2[1];
  var RendererClass = entityToRenderer.get(EntityClass);
  return [EntityClass, RendererClass, ketMonomerClass];
};

export { monomerRendererFactory };
//# sourceMappingURL=monomerRendererFactory.modern.js.map
