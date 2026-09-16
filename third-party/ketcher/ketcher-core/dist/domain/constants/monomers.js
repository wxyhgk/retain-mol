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

exports.RNA_DNA_NON_MODIFIED_PART = void 0;
(function (RNA_DNA_NON_MODIFIED_PART) {
  RNA_DNA_NON_MODIFIED_PART["SUGAR_RNA"] = "R";
  RNA_DNA_NON_MODIFIED_PART["SUGAR_DNA"] = "dR";
  RNA_DNA_NON_MODIFIED_PART["PHOSPHATE"] = "P";
})(exports.RNA_DNA_NON_MODIFIED_PART || (exports.RNA_DNA_NON_MODIFIED_PART = {}));
exports.RnaDnaNaturalAnaloguesEnum = void 0;
(function (RnaDnaNaturalAnaloguesEnum) {
  RnaDnaNaturalAnaloguesEnum["ADENINE"] = "A";
  RnaDnaNaturalAnaloguesEnum["THYMINE"] = "T";
  RnaDnaNaturalAnaloguesEnum["GUANINE"] = "G";
  RnaDnaNaturalAnaloguesEnum["CYTOSINE"] = "C";
  RnaDnaNaturalAnaloguesEnum["URACIL"] = "U";
})(exports.RnaDnaNaturalAnaloguesEnum || (exports.RnaDnaNaturalAnaloguesEnum = {}));
exports.RnaDnaBaseNames = void 0;
(function (RnaDnaBaseNames) {
  RnaDnaBaseNames["URACIL"] = "Uracil";
  RnaDnaBaseNames["THYMINE"] = "Thymine";
})(exports.RnaDnaBaseNames || (exports.RnaDnaBaseNames = {}));
exports.StandardAmbiguousRnaBase = void 0;
(function (StandardAmbiguousRnaBase) {
  StandardAmbiguousRnaBase["N"] = "N";
  StandardAmbiguousRnaBase["B"] = "B";
  StandardAmbiguousRnaBase["V"] = "V";
  StandardAmbiguousRnaBase["D"] = "D";
  StandardAmbiguousRnaBase["H"] = "H";
  StandardAmbiguousRnaBase["K"] = "K";
  StandardAmbiguousRnaBase["M"] = "M";
  StandardAmbiguousRnaBase["W"] = "W";
  StandardAmbiguousRnaBase["Y"] = "Y";
  StandardAmbiguousRnaBase["R"] = "R";
  StandardAmbiguousRnaBase["S"] = "S";
})(exports.StandardAmbiguousRnaBase || (exports.StandardAmbiguousRnaBase = {}));
exports.StandardAmbiguousPeptide = void 0;
(function (StandardAmbiguousPeptide) {
  StandardAmbiguousPeptide["B"] = "B";
  StandardAmbiguousPeptide["J"] = "J";
  StandardAmbiguousPeptide["Z"] = "Z";
  StandardAmbiguousPeptide["X"] = "X";
})(exports.StandardAmbiguousPeptide || (exports.StandardAmbiguousPeptide = {}));
var rnaDnaNaturalAnalogues = [exports.RnaDnaNaturalAnaloguesEnum.ADENINE, exports.RnaDnaNaturalAnaloguesEnum.THYMINE, exports.RnaDnaNaturalAnaloguesEnum.GUANINE, exports.RnaDnaNaturalAnaloguesEnum.CYTOSINE, exports.RnaDnaNaturalAnaloguesEnum.URACIL];
var rnaDnaAmbiguousSymbols = [exports.StandardAmbiguousRnaBase.N, exports.StandardAmbiguousRnaBase.B, exports.StandardAmbiguousRnaBase.V, exports.StandardAmbiguousRnaBase.D, exports.StandardAmbiguousRnaBase.H, exports.StandardAmbiguousRnaBase.K, exports.StandardAmbiguousRnaBase.M, exports.StandardAmbiguousRnaBase.W, exports.StandardAmbiguousRnaBase.Y, exports.StandardAmbiguousRnaBase.R, exports.StandardAmbiguousRnaBase.S];
var peptideAmbiguousSymbols = [exports.StandardAmbiguousPeptide.B, exports.StandardAmbiguousPeptide.J, exports.StandardAmbiguousPeptide.Z, exports.StandardAmbiguousPeptide.X];
var unknownNaturalAnalogues = ['.', 'X'];
var peptideNaturalAnalogues = ['A', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'V', 'U', 'W', 'Y'];
var NO_NATURAL_ANALOGUE = 'X';
var MONOMER_CONST = {
  AMINO_ACID: 'AminoAcid',
  PEPTIDE: 'PEPTIDE',
  CHEM: 'CHEM',
  RNA: 'RNA',
  DNA: 'DNA',
  MODDNA: 'MODDNA',
  R: 'R',
  P: 'P',
  SUGAR: 'SUGAR',
  BASE: 'BASE',
  PHOSPHATE: 'PHOSPHATE'
};
var CREATE_MONOMER_TOOL_NAME = 'create-monomer';
var MonomerSize = 0.75;
var HalfMonomerSize = MonomerSize / 2;
var StandardBondLength = MonomerSize * 2;
exports.KetMonomerClass = void 0;
(function (KetMonomerClass) {
  KetMonomerClass["AminoAcid"] = "AminoAcid";
  KetMonomerClass["Sugar"] = "Sugar";
  KetMonomerClass["Phosphate"] = "Phosphate";
  KetMonomerClass["Base"] = "Base";
  KetMonomerClass["Terminator"] = "Terminator";
  KetMonomerClass["Linker"] = "Linker";
  KetMonomerClass["Unknown"] = "Unknown";
  KetMonomerClass["CHEM"] = "CHEM";
  KetMonomerClass["RNA"] = "RNA";
  KetMonomerClass["DNA"] = "DNA";
})(exports.KetMonomerClass || (exports.KetMonomerClass = {}));

exports.CREATE_MONOMER_TOOL_NAME = CREATE_MONOMER_TOOL_NAME;
exports.HalfMonomerSize = HalfMonomerSize;
exports.MONOMER_CONST = MONOMER_CONST;
exports.MonomerSize = MonomerSize;
exports.NO_NATURAL_ANALOGUE = NO_NATURAL_ANALOGUE;
exports.StandardBondLength = StandardBondLength;
exports.peptideAmbiguousSymbols = peptideAmbiguousSymbols;
exports.peptideNaturalAnalogues = peptideNaturalAnalogues;
exports.rnaDnaAmbiguousSymbols = rnaDnaAmbiguousSymbols;
exports.rnaDnaNaturalAnalogues = rnaDnaNaturalAnalogues;
exports.unknownNaturalAnalogues = unknownNaturalAnalogues;
//# sourceMappingURL=monomers.js.map
