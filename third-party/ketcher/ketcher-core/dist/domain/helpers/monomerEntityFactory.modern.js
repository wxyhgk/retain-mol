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
import _toConsumableArray from '@babel/runtime/helpers/toConsumableArray';
import '../entities/atom.modern.js';
import '../entities/atomList.modern.js';
import '../entities/bond.modern.js';
import '../entities/fixedPrecision.modern.js';
import '../entities/fragment.modern.js';
import '../entities/functionalGroup.modern.js';
import '../entities/halfBond.modern.js';
import '../entities/loop.modern.js';
import '../entities/rgroup.modern.js';
import '../entities/rgroupAttachmentPoint.modern.js';
import '../entities/rxnArrow.modern.js';
import '../entities/rxnPlus.modern.js';
import '../entities/sgroup.modern.js';
import '../entities/sgroupForest.modern.js';
import '../entities/simpleObject.modern.js';
import '../entities/struct.modern.js';
import '../entities/text.modern.js';
import '../entities/pile.modern.js';
import '../entities/vec2.modern.js';
import '../entities/box2Abs.modern.js';
import '../entities/pool.modern.js';
import '../entities/image.modern.js';
import '../entities/multitailArrow.modern.js';
import '../entities/highlight.modern.js';
import '../entities/sGroupAttachmentPoint.modern.js';
import '../entities/monomerMicromolecule.modern.js';
import { Peptide } from '../entities/Peptide.modern.js';
import '../entities/BaseMonomer.modern.js';
import { Chem } from '../entities/Chem.modern.js';
import { Sugar } from '../entities/Sugar.modern.js';
import { RNABase } from '../entities/RNABase.modern.js';
import { Phosphate } from '../entities/Phosphate.modern.js';
import '../entities/Axis.modern.js';
import '../entities/Nucleoside.modern.js';
import '../entities/Nucleotide.modern.js';
import '../entities/monomer-chains/types.modern.js';
import '../entities/monomer-chains/Chain.modern.js';
import '../entities/monomer-chains/ChainsCollection.modern.js';
import '../entities/MonomerSequenceNode.modern.js';
import '../entities/EmptySequenceNode.modern.js';
import '../entities/LinkerSequenceNode.modern.js';
import { UnresolvedMonomer } from '../entities/UnresolvedMonomer.modern.js';
import { UnsplitNucleotide } from '../entities/UnsplitNucleotide.modern.js';
import '../entities/PolymerBond.modern.js';
import { AmbiguousMonomer } from '../entities/AmbiguousMonomer.modern.js';
import '../entities/MonomerToAtomBond.modern.js';
import '../entities/HydrogenBond.modern.js';
import '../entities/SGroupDrawingEntity.modern.js';
import '../entities/BackBoneSequenceNode.modern.js';
import '@babel/runtime/helpers/slicedToArray';
import '../entities/Command.modern.js';
import '../../utilities/runAsyncAction.modern.js';
import '../../utilities/KetcherLogger.modern.js';
import '../../utilities/SettingsManager.modern.js';
import '../../utilities/keynorm.modern.js';
import 'react-device-detect';
import '../../utilities/clipboardUtils.modern.js';
import '../entities/CoreAtom.modern.js';
import '../entities/CoreStereoFlag.modern.js';
import '@babel/runtime/helpers/defineProperty';
import '@babel/runtime/helpers/typeof';
import '../constants/elements.modern.js';
import '../constants/element.types.modern.js';
import '../constants/generics.modern.js';
import '../constants/chains.modern.js';
import { KetMonomerClass, MONOMER_CONST, rnaDnaNaturalAnalogues, unknownNaturalAnalogues } from '../constants/monomers.modern.js';
import { isAmbiguousMonomerLibraryItem } from './monomers.modern.js';
import { isMonomerItemSugar, isMonomerItemPhosphate } from './monomerItem.modern.js';

function monomerEntityFactory(monomer) {
  if (isAmbiguousMonomerLibraryItem(monomer)) {
    return [AmbiguousMonomer, AmbiguousMonomer.getMonomerClass(monomer.monomers)];
  }
  if (monomer.props.MonomerClass === KetMonomerClass.RNA || monomer.props.MonomerClass === KetMonomerClass.DNA) {
    return [UnsplitNucleotide, KetMonomerClass.RNA];
  }
  if (monomer.props.MonomerClass === KetMonomerClass.AminoAcid || monomer.props.MonomerType === MONOMER_CONST.PEPTIDE) {
    return [Peptide, KetMonomerClass.AminoAcid];
  }
  if (isMonomerItemSugar(monomer)) {
    return [Sugar, KetMonomerClass.Sugar];
  }
  if (isMonomerItemPhosphate(monomer)) {
    return [Phosphate, KetMonomerClass.Phosphate];
  }
  if (monomer.props.MonomerClass === KetMonomerClass.Base || monomer.props.MonomerType === MONOMER_CONST.RNA && [].concat(_toConsumableArray(rnaDnaNaturalAnalogues), _toConsumableArray(unknownNaturalAnalogues)).includes(monomer.props.MonomerNaturalAnalogCode)) {
    return [RNABase, KetMonomerClass.Base];
  }
  if (monomer.props.unresolved) {
    return [UnresolvedMonomer, KetMonomerClass.CHEM];
  }
  return [Chem, KetMonomerClass.CHEM];
}

export { monomerEntityFactory };
//# sourceMappingURL=monomerEntityFactory.modern.js.map
