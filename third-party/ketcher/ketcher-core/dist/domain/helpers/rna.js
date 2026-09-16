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

var AmbiguousMonomer = require('../entities/AmbiguousMonomer.js');
var monomers$1 = require('../constants/monomers.js');
var monomers = require('./monomers.js');
var types = require('../entities/monomer-chains/types.js');

function getRnaPartLibraryItem(editor, libraryItemLabel, monomerClass) {
  var isDna = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
  return editor.monomersLibrary.find(function (libraryItem) {
    if (monomers.isAmbiguousMonomerLibraryItem(libraryItem)) {
      if (monomerClass && AmbiguousMonomer.AmbiguousMonomer.getMonomerClass(libraryItem.monomers) !== monomerClass) {
        return false;
      }
      if (libraryItem.label !== libraryItemLabel) {
        return false;
      }
      return libraryItem.options.every(function (option) {
        return isDna ? option.templateId.includes(monomers$1.RnaDnaBaseNames.THYMINE) || !option.templateId.includes(monomers$1.RnaDnaBaseNames.URACIL) : option.templateId.includes(monomers$1.RnaDnaBaseNames.URACIL) || !option.templateId.includes(monomers$1.RnaDnaBaseNames.THYMINE);
      });
    }
    return (!monomerClass || libraryItem.props.MonomerClass === monomerClass) && libraryItem.props.MonomerName === libraryItemLabel;
  });
}
function getPeptideLibraryItem(editor, peptideName) {
  return editor.monomersLibrary.find(function (libraryItem) {
    if (monomers.isAmbiguousMonomerLibraryItem(libraryItem)) {
      if (AmbiguousMonomer.AmbiguousMonomer.getMonomerClass(libraryItem.monomers) !== monomers$1.KetMonomerClass.AminoAcid) {
        return false;
      }
      return libraryItem.label === peptideName;
    }
    return libraryItem.props.MonomerType === monomers$1.MONOMER_CONST.PEPTIDE && libraryItem.props.MonomerName === peptideName;
  });
}
function getSugarBySequenceType(sequenceType) {
  switch (sequenceType) {
    case types.SequenceType.DNA:
      return monomers$1.RNA_DNA_NON_MODIFIED_PART.SUGAR_DNA;
    case types.SequenceType.RNA:
      return monomers$1.RNA_DNA_NON_MODIFIED_PART.SUGAR_RNA;
    default:
      return undefined;
  }
}

exports.getPeptideLibraryItem = getPeptideLibraryItem;
exports.getRnaPartLibraryItem = getRnaPartLibraryItem;
exports.getSugarBySequenceType = getSugarBySequenceType;
//# sourceMappingURL=rna.js.map
