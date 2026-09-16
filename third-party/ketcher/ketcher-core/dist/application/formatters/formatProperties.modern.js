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
import { ChemicalMimeType } from '../../domain/services/struct/structService.types.modern.js';
import { SupportedFormatProperties } from './supportedFormatProperties.modern.js';

var formatProperties = {
  molAuto: new SupportedFormatProperties(
  'MDL Molfile Auto Format detect', ChemicalMimeType.Mol, ['.mol'], true, {
    'molfile-saving-mode': 'auto'
  }),
  mol: new SupportedFormatProperties('MDL Molfile V2000', ChemicalMimeType.Mol, ['.mol'], true),
  molV3000: new SupportedFormatProperties('MDL Molfile V3000', ChemicalMimeType.Mol, ['.mol'], true, {
    'molfile-saving-mode': '3000'
  }),
  mol2: new SupportedFormatProperties('Tripos MOL2', ChemicalMimeType.Mol2, ['.mol2', '.ml2', '.sy2'], true),
  xyz: new SupportedFormatProperties('XYZ', ChemicalMimeType.XYZ, ['.xyz'], true),
  extendedXYZ: new SupportedFormatProperties('Extended XYZ', ChemicalMimeType.ExtendedXYZ, ['.extxyz'], true),
  qcSchema: new SupportedFormatProperties('MolSSI QCSchema Molecule', ChemicalMimeType.QCSchema, ['.json'], true),
  rxn: new SupportedFormatProperties('MDL Rxnfile V2000', ChemicalMimeType.Rxn, ['.rxn'], true),
  rxnV3000: new SupportedFormatProperties('MDL Rxnfile V3000', ChemicalMimeType.Rxn, ['.rxn'], true, {
    'molfile-saving-mode': '3000'
  }),
  smiles: new SupportedFormatProperties('Daylight SMILES', ChemicalMimeType.DaylightSmiles, ['.smi', '.smiles'], true),
  smilesExt: new SupportedFormatProperties('Extended SMILES', ChemicalMimeType.ExtendedSmiles, ['.cxsmi', '.cxsmiles']),
  smarts: new SupportedFormatProperties('Daylight SMARTS', ChemicalMimeType.DaylightSmarts, ['.smarts']),
  inChI: new SupportedFormatProperties('InChI', ChemicalMimeType.InChI, ['.inchi']),
  inChIAuxInfo: new SupportedFormatProperties('InChI AuxInfo', ChemicalMimeType.InChIAuxInfo, ['.inchi']),
  inChIKey: new SupportedFormatProperties('InChIKey', ChemicalMimeType.InChIKey, ['.inchikey']),
  cml: new SupportedFormatProperties('CML', ChemicalMimeType.CML, ['.cml', '.mrv'], true),
  ket: new SupportedFormatProperties('Ket Format', ChemicalMimeType.KET, ['.ket']),
  cdxml: new SupportedFormatProperties('CDXML', ChemicalMimeType.CDXML, ['.cdxml'], true),
  cdx: new SupportedFormatProperties('Base64 CDX', ChemicalMimeType.CDX, ['.b64cdx'], true),
  binaryCdx: new SupportedFormatProperties('CDX', ChemicalMimeType.CDX, ['.cdx'], true),
  sdf: new SupportedFormatProperties('SDF V2000', ChemicalMimeType.SDF, ['.sdf'], true, {
    'molfile-saving-mode': '2000'
  }),
  sdfV3000: new SupportedFormatProperties('SDF V3000', ChemicalMimeType.SDF, ['.sdf'], true, {
    'molfile-saving-mode': '3000'
  }),
  fasta: new SupportedFormatProperties('FASTA', ChemicalMimeType.FASTA, ['.fasta'], true),
  idt: new SupportedFormatProperties('IDT', ChemicalMimeType.IDT, ['.idt'], false),
  axoLabs: new SupportedFormatProperties('AxoLabs', ChemicalMimeType.AXOLABS, ['.axolabs'], true),
  helm: new SupportedFormatProperties('HELM', ChemicalMimeType.HELM, ['.helm'], true),
  biln: new SupportedFormatProperties('BILN', ChemicalMimeType.BILN, ['.biln'], true),
  sequence: new SupportedFormatProperties('SEQUENCE', ChemicalMimeType.SEQUENCE, ['.seq'], false, {}),
  'sequence-3-letter': new SupportedFormatProperties('SEQUENCE (3-letter code)', ChemicalMimeType.SEQUENCE, ['.seq'], false, {}),
  unknown: new SupportedFormatProperties('Unknown', ChemicalMimeType.UNKNOWN, ['.'], true),
  rdf: new SupportedFormatProperties('RDF V2000', ChemicalMimeType.RDF, ['.rdf'], true),
  rdfV3000: new SupportedFormatProperties('RDF V3000', ChemicalMimeType.RDF, ['.rdf'], true, {
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

export { formatProperties, getFormatMimeTypeByFileName, getPropertiesByFormat, getPropertiesByImgFormat };
//# sourceMappingURL=formatProperties.modern.js.map
