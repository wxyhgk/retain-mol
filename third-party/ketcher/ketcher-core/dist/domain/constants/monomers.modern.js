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
var RNA_DNA_NON_MODIFIED_PART;
(function (RNA_DNA_NON_MODIFIED_PART) {
  RNA_DNA_NON_MODIFIED_PART["SUGAR_RNA"] = "R";
  RNA_DNA_NON_MODIFIED_PART["SUGAR_DNA"] = "dR";
  RNA_DNA_NON_MODIFIED_PART["PHOSPHATE"] = "P";
})(RNA_DNA_NON_MODIFIED_PART || (RNA_DNA_NON_MODIFIED_PART = {}));
var RnaDnaNaturalAnaloguesEnum;
(function (RnaDnaNaturalAnaloguesEnum) {
  RnaDnaNaturalAnaloguesEnum["ADENINE"] = "A";
  RnaDnaNaturalAnaloguesEnum["THYMINE"] = "T";
  RnaDnaNaturalAnaloguesEnum["GUANINE"] = "G";
  RnaDnaNaturalAnaloguesEnum["CYTOSINE"] = "C";
  RnaDnaNaturalAnaloguesEnum["URACIL"] = "U";
})(RnaDnaNaturalAnaloguesEnum || (RnaDnaNaturalAnaloguesEnum = {}));
var RnaDnaBaseNames;
(function (RnaDnaBaseNames) {
  RnaDnaBaseNames["URACIL"] = "Uracil";
  RnaDnaBaseNames["THYMINE"] = "Thymine";
})(RnaDnaBaseNames || (RnaDnaBaseNames = {}));
var StandardAmbiguousRnaBase;
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
})(StandardAmbiguousRnaBase || (StandardAmbiguousRnaBase = {}));
var StandardAmbiguousPeptide;
(function (StandardAmbiguousPeptide) {
  StandardAmbiguousPeptide["B"] = "B";
  StandardAmbiguousPeptide["J"] = "J";
  StandardAmbiguousPeptide["Z"] = "Z";
  StandardAmbiguousPeptide["X"] = "X";
})(StandardAmbiguousPeptide || (StandardAmbiguousPeptide = {}));
var rnaDnaNaturalAnalogues = [RnaDnaNaturalAnaloguesEnum.ADENINE, RnaDnaNaturalAnaloguesEnum.THYMINE, RnaDnaNaturalAnaloguesEnum.GUANINE, RnaDnaNaturalAnaloguesEnum.CYTOSINE, RnaDnaNaturalAnaloguesEnum.URACIL];
var rnaDnaAmbiguousSymbols = [StandardAmbiguousRnaBase.N, StandardAmbiguousRnaBase.B, StandardAmbiguousRnaBase.V, StandardAmbiguousRnaBase.D, StandardAmbiguousRnaBase.H, StandardAmbiguousRnaBase.K, StandardAmbiguousRnaBase.M, StandardAmbiguousRnaBase.W, StandardAmbiguousRnaBase.Y, StandardAmbiguousRnaBase.R, StandardAmbiguousRnaBase.S];
var peptideAmbiguousSymbols = [StandardAmbiguousPeptide.B, StandardAmbiguousPeptide.J, StandardAmbiguousPeptide.Z, StandardAmbiguousPeptide.X];
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
var KetMonomerClass;
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
})(KetMonomerClass || (KetMonomerClass = {}));

export { CREATE_MONOMER_TOOL_NAME, HalfMonomerSize, KetMonomerClass, MONOMER_CONST, MonomerSize, NO_NATURAL_ANALOGUE, RNA_DNA_NON_MODIFIED_PART, RnaDnaBaseNames, RnaDnaNaturalAnaloguesEnum, StandardAmbiguousPeptide, StandardAmbiguousRnaBase, StandardBondLength, peptideAmbiguousSymbols, peptideNaturalAnalogues, rnaDnaAmbiguousSymbols, rnaDnaNaturalAnalogues, unknownNaturalAnalogues };
//# sourceMappingURL=monomers.modern.js.map
