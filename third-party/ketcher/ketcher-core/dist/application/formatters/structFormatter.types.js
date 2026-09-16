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

exports.SupportedFormat = void 0;
(function (SupportedFormat) {
  SupportedFormat["mol"] = "mol";
  SupportedFormat["molV3000"] = "molV3000";
  SupportedFormat["molAuto"] = "molAuto";
  SupportedFormat["mol2"] = "mol2";
  SupportedFormat["xyz"] = "xyz";
  SupportedFormat["extendedXYZ"] = "extendedXYZ";
  SupportedFormat["qcSchema"] = "qcSchema";
  SupportedFormat["rxn"] = "rxn";
  SupportedFormat["rxnV3000"] = "rxnV3000";
  SupportedFormat["smiles"] = "smiles";
  SupportedFormat["smilesExt"] = "smilesExt";
  SupportedFormat["smarts"] = "smarts";
  SupportedFormat["inChI"] = "inChI";
  SupportedFormat["inChIAuxInfo"] = "inChIAuxInfo";
  SupportedFormat["inChIKey"] = "inChIKey";
  SupportedFormat["cml"] = "cml";
  SupportedFormat["ket"] = "ket";
  SupportedFormat["cdxml"] = "cdxml";
  SupportedFormat["cdx"] = "cdx";
  SupportedFormat["binaryCdx"] = "binaryCdx";
  SupportedFormat["sdf"] = "sdf";
  SupportedFormat["sdfV3000"] = "sdfV3000";
  SupportedFormat["fasta"] = "fasta";
  SupportedFormat["sequence"] = "sequence";
  SupportedFormat["sequence3Letter"] = "sequence-3-letter";
  SupportedFormat["idt"] = "idt";
  SupportedFormat["axoLabs"] = "axoLabs";
  SupportedFormat["helm"] = "helm";
  SupportedFormat["biln"] = "biln";
  SupportedFormat["unknown"] = "unknown";
  SupportedFormat["rdf"] = "rdf";
  SupportedFormat["rdfV3000"] = "rdfV3000";
})(exports.SupportedFormat || (exports.SupportedFormat = {}));
function isCalculationGeometryFormat(format) {
  return [exports.SupportedFormat.mol2, exports.SupportedFormat.xyz, exports.SupportedFormat.extendedXYZ, exports.SupportedFormat.qcSchema].includes(format);
}

exports.isCalculationGeometryFormat = isCalculationGeometryFormat;
//# sourceMappingURL=structFormatter.types.js.map
