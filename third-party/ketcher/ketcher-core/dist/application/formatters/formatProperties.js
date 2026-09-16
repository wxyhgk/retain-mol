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

var structService_types = require('../../domain/services/struct/structService.types.js');
var supportedFormatProperties = require('./supportedFormatProperties.js');

var formatProperties = {
  molAuto: new supportedFormatProperties.SupportedFormatProperties(
  'MDL Molfile Auto Format detect', structService_types.ChemicalMimeType.Mol, ['.mol'], true, {
    'molfile-saving-mode': 'auto'
  }),
  mol: new supportedFormatProperties.SupportedFormatProperties('MDL Molfile V2000', structService_types.ChemicalMimeType.Mol, ['.mol'], true),
  molV3000: new supportedFormatProperties.SupportedFormatProperties('MDL Molfile V3000', structService_types.ChemicalMimeType.Mol, ['.mol'], true, {
    'molfile-saving-mode': '3000'
  }),
  mol2: new supportedFormatProperties.SupportedFormatProperties('Tripos MOL2', structService_types.ChemicalMimeType.Mol2, ['.mol2', '.ml2', '.sy2'], true),
  xyz: new supportedFormatProperties.SupportedFormatProperties('XYZ', structService_types.ChemicalMimeType.XYZ, ['.xyz'], true),
  extendedXYZ: new supportedFormatProperties.SupportedFormatProperties('Extended XYZ', structService_types.ChemicalMimeType.ExtendedXYZ, ['.extxyz'], true),
  qcSchema: new supportedFormatProperties.SupportedFormatProperties('MolSSI QCSchema Molecule', structService_types.ChemicalMimeType.QCSchema, ['.json'], true),
  rxn: new supportedFormatProperties.SupportedFormatProperties('MDL Rxnfile V2000', structService_types.ChemicalMimeType.Rxn, ['.rxn'], true),
  rxnV3000: new supportedFormatProperties.SupportedFormatProperties('MDL Rxnfile V3000', structService_types.ChemicalMimeType.Rxn, ['.rxn'], true, {
    'molfile-saving-mode': '3000'
  }),
  smiles: new supportedFormatProperties.SupportedFormatProperties('Daylight SMILES', structService_types.ChemicalMimeType.DaylightSmiles, ['.smi', '.smiles'], true),
  smilesExt: new supportedFormatProperties.SupportedFormatProperties('Extended SMILES', structService_types.ChemicalMimeType.ExtendedSmiles, ['.cxsmi', '.cxsmiles']),
  smarts: new supportedFormatProperties.SupportedFormatProperties('Daylight SMARTS', structService_types.ChemicalMimeType.DaylightSmarts, ['.smarts']),
  inChI: new supportedFormatProperties.SupportedFormatProperties('InChI', structService_types.ChemicalMimeType.InChI, ['.inchi']),
  inChIAuxInfo: new supportedFormatProperties.SupportedFormatProperties('InChI AuxInfo', structService_types.ChemicalMimeType.InChIAuxInfo, ['.inchi']),
  inChIKey: new supportedFormatProperties.SupportedFormatProperties('InChIKey', structService_types.ChemicalMimeType.InChIKey, ['.inchikey']),
  cml: new supportedFormatProperties.SupportedFormatProperties('CML', structService_types.ChemicalMimeType.CML, ['.cml', '.mrv'], true),
  ket: new supportedFormatProperties.SupportedFormatProperties('Ket Format', structService_types.ChemicalMimeType.KET, ['.ket']),
  cdxml: new supportedFormatProperties.SupportedFormatProperties('CDXML', structService_types.ChemicalMimeType.CDXML, ['.cdxml'], true),
  cdx: new supportedFormatProperties.SupportedFormatProperties('Base64 CDX', structService_types.ChemicalMimeType.CDX, ['.b64cdx'], true),
  binaryCdx: new supportedFormatProperties.SupportedFormatProperties('CDX', structService_types.ChemicalMimeType.CDX, ['.cdx'], true),
  sdf: new supportedFormatProperties.SupportedFormatProperties('SDF V2000', structService_types.ChemicalMimeType.SDF, ['.sdf'], true, {
    'molfile-saving-mode': '2000'
  }),
  sdfV3000: new supportedFormatProperties.SupportedFormatProperties('SDF V3000', structService_types.ChemicalMimeType.SDF, ['.sdf'], true, {
    'molfile-saving-mode': '3000'
  }),
  fasta: new supportedFormatProperties.SupportedFormatProperties('FASTA', structService_types.ChemicalMimeType.FASTA, ['.fasta'], true),
  idt: new supportedFormatProperties.SupportedFormatProperties('IDT', structService_types.ChemicalMimeType.IDT, ['.idt'], false),
  axoLabs: new supportedFormatProperties.SupportedFormatProperties('AxoLabs', structService_types.ChemicalMimeType.AXOLABS, ['.axolabs'], true),
  helm: new supportedFormatProperties.SupportedFormatProperties('HELM', structService_types.ChemicalMimeType.HELM, ['.helm'], true),
  biln: new supportedFormatProperties.SupportedFormatProperties('BILN', structService_types.ChemicalMimeType.BILN, ['.biln'], true),
  sequence: new supportedFormatProperties.SupportedFormatProperties('SEQUENCE', structService_types.ChemicalMimeType.SEQUENCE, ['.seq'], false, {}),
  'sequence-3-letter': new supportedFormatProperties.SupportedFormatProperties('SEQUENCE (3-letter code)', structService_types.ChemicalMimeType.SEQUENCE, ['.seq'], false, {}),
  unknown: new supportedFormatProperties.SupportedFormatProperties('Unknown', structService_types.ChemicalMimeType.UNKNOWN, ['.'], true),
  rdf: new supportedFormatProperties.SupportedFormatProperties('RDF V2000', structService_types.ChemicalMimeType.RDF, ['.rdf'], true),
  rdfV3000: new supportedFormatProperties.SupportedFormatProperties('RDF V3000', structService_types.ChemicalMimeType.RDF, ['.rdf'], true, {
    'molfile-saving-mode': '3000'
  })
};
var imgFormatProperties = {
  svg: {
    extension: '.svg',
    name: 'SVG Document'
  },
  png: {
    extension: '.png',
    name: 'PNG Image'
  }
};
function getPropertiesByImgFormat(format) {
  return imgFormatProperties[format];
}
function getPropertiesByFormat(format) {
  return formatProperties[format];
}
function getFormatMimeTypeByFileName(fileName) {
  var _fileName$split$pop;
  var fileExtension = '.' + ((_fileName$split$pop = fileName.split('.').pop()) === null || _fileName$split$pop === void 0 ? void 0 : _fileName$split$pop.toLowerCase());
  var format = Object.values(formatProperties).find(function (properties) {
    return properties.extensions.includes(fileExtension);
  });
  return format === null || format === void 0 ? void 0 : format.mime;
}

exports.formatProperties = formatProperties;
exports.getFormatMimeTypeByFileName = getFormatMimeTypeByFileName;
exports.getPropertiesByFormat = getPropertiesByFormat;
exports.getPropertiesByImgFormat = getPropertiesByImgFormat;
//# sourceMappingURL=formatProperties.js.map
