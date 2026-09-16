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
import _defineProperty from '@babel/runtime/helpers/defineProperty';
import '../../formatters/types/ket.modern.js';
import { KetMonomerClass } from '../../../domain/constants/monomers.modern.js';

var UNRESOLVED_MONOMER_COLOR = '#585858';
var BAD_VALENCE_WARNING_COLOR = '#F00';
var BAD_VALENCE_LINE_OFFSET = 2;
var SELECTION_COLOR = '#57FF8F';
var SELECTION_HOVERED_COLOR = '#CCFFDD';
var MONOMER_SYMBOLS_IDS = _defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty({}, KetMonomerClass.AminoAcid, {
  hover: '#peptide-hover',
  body: '#peptide',
  autochainPreview: '#peptide-autochain-preview'
}), KetMonomerClass.CHEM, {
  hover: '#chem-selection',
  body: '#chem',
  autochainPreview: '#chem-autochain-preview'
}), KetMonomerClass.Sugar, {
  hover: '#sugar-selection',
  body: '#sugar',
  variant: '#sugar-variant',
  autochainPreview: '#sugar-autochain-preview'
}), KetMonomerClass.Base, {
  hover: '#rna-base-selection',
  body: '#rna-base',
  variant: '#rna-base-variant',
  autochainPreview: '#rna-base-autochain-preview'
}), KetMonomerClass.Phosphate, {
  hover: '#phosphate-selection',
  body: '#phosphate',
  variant: '#phosphate-variant',
  autochainPreview: '#phosphate-autochain-preview'
}), KetMonomerClass.RNA, {
  hover: '#nucleotide-hover',
  body: '#nucleotide',
  autochainPreview: '#nucleotide-autochain-preview'
});

export { BAD_VALENCE_LINE_OFFSET, BAD_VALENCE_WARNING_COLOR, MONOMER_SYMBOLS_IDS, SELECTION_COLOR, SELECTION_HOVERED_COLOR, UNRESOLVED_MONOMER_COLOR };
//# sourceMappingURL=constants.modern.js.map
