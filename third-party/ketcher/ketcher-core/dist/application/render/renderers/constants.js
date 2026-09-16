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

var _defineProperty = require('@babel/runtime/helpers/defineProperty');
require('../../formatters/types/ket.js');
var monomers = require('../../../domain/constants/monomers.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);

var UNRESOLVED_MONOMER_COLOR = '#585858';
var BAD_VALENCE_WARNING_COLOR = '#F00';
var BAD_VALENCE_LINE_OFFSET = 2;
var SELECTION_COLOR = '#57FF8F';
var SELECTION_HOVERED_COLOR = '#CCFFDD';
var MONOMER_SYMBOLS_IDS = _defineProperty__default["default"](_defineProperty__default["default"](_defineProperty__default["default"](_defineProperty__default["default"](_defineProperty__default["default"](_defineProperty__default["default"]({}, monomers.KetMonomerClass.AminoAcid, {
  hover: '#peptide-hover',
  body: '#peptide',
  autochainPreview: '#peptide-autochain-preview'
}), monomers.KetMonomerClass.CHEM, {
  hover: '#chem-selection',
  body: '#chem',
  autochainPreview: '#chem-autochain-preview'
}), monomers.KetMonomerClass.Sugar, {
  hover: '#sugar-selection',
  body: '#sugar',
  variant: '#sugar-variant',
  autochainPreview: '#sugar-autochain-preview'
}), monomers.KetMonomerClass.Base, {
  hover: '#rna-base-selection',
  body: '#rna-base',
  variant: '#rna-base-variant',
  autochainPreview: '#rna-base-autochain-preview'
}), monomers.KetMonomerClass.Phosphate, {
  hover: '#phosphate-selection',
  body: '#phosphate',
  variant: '#phosphate-variant',
  autochainPreview: '#phosphate-autochain-preview'
}), monomers.KetMonomerClass.RNA, {
  hover: '#nucleotide-hover',
  body: '#nucleotide',
  autochainPreview: '#nucleotide-autochain-preview'
});

exports.BAD_VALENCE_LINE_OFFSET = BAD_VALENCE_LINE_OFFSET;
exports.BAD_VALENCE_WARNING_COLOR = BAD_VALENCE_WARNING_COLOR;
exports.MONOMER_SYMBOLS_IDS = MONOMER_SYMBOLS_IDS;
exports.SELECTION_COLOR = SELECTION_COLOR;
exports.SELECTION_HOVERED_COLOR = SELECTION_HOVERED_COLOR;
exports.UNRESOLVED_MONOMER_COLOR = UNRESOLVED_MONOMER_COLOR;
//# sourceMappingURL=constants.js.map
