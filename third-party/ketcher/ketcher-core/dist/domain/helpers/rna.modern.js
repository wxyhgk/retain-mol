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
import { AmbiguousMonomer } from '../entities/AmbiguousMonomer.modern.js';
import { RnaDnaBaseNames, KetMonomerClass, MONOMER_CONST, RNA_DNA_NON_MODIFIED_PART } from '../constants/monomers.modern.js';
import { isAmbiguousMonomerLibraryItem } from './monomers.modern.js';
import { SequenceType } from '../entities/monomer-chains/types.modern.js';

function getRnaPartLibraryItem(editor, libraryItemLabel, monomerClass) {
  var isDna = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
  return editor.monomersLibrary.find(function (libraryItem) {
    if (isAmbiguousMonomerLibraryItem(libraryItem)) {
      if (monomerClass && AmbiguousMonomer.getMonomerClass(libraryItem.monomers) !== monomerClass) {
        return false;
      }
      if (libraryItem.label !== libraryItemLabel) {
        return false;
      }
      return libraryItem.options.every(function (option) {
        return isDna ? option.templateId.includes(RnaDnaBaseNames.THYMINE) || !option.templateId.includes(RnaDnaBaseNames.URACIL) : option.templateId.includes(RnaDnaBaseNames.URACIL) || !option.templateId.includes(RnaDnaBaseNames.THYMINE);
      });
    }
    return (!monomerClass || libraryItem.props.MonomerClass === monomerClass) && libraryItem.props.MonomerName === libraryItemLabel;
  });
}
function getPeptideLibraryItem(editor, peptideName) {
  return editor.monomersLibrary.find(function (libraryItem) {
    if (isAmbiguousMonomerLibraryItem(libraryItem)) {
      if (AmbiguousMonomer.getMonomerClass(libraryItem.monomers) !== KetMonomerClass.AminoAcid) {
        return false;
      }
      return libraryItem.label === peptideName;
    }
    return libraryItem.props.MonomerType === MONOMER_CONST.PEPTIDE && libraryItem.props.MonomerName === peptideName;
  });
}
function getSugarBySequenceType(sequenceType) {
  switch (sequenceType) {
    case SequenceType.DNA:
      return RNA_DNA_NON_MODIFIED_PART.SUGAR_DNA;
    case SequenceType.RNA:
      return RNA_DNA_NON_MODIFIED_PART.SUGAR_RNA;
    default:
      return undefined;
  }
}

export { getPeptideLibraryItem, getRnaPartLibraryItem, getSugarBySequenceType };
//# sourceMappingURL=rna.modern.js.map
