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
import '../../utilities/runAsyncAction.modern.js';
import { KetcherLogger } from '../../utilities/KetcherLogger.modern.js';
import '../../utilities/SettingsManager.modern.js';
import '../../utilities/keynorm.modern.js';
import 'react-device-detect';
import '../../utilities/clipboardUtils.modern.js';
import { SupportedFormat } from './structFormatter.types.modern.js';
import { isQCSchemaMolecule } from './qcSchemaFormatter.modern.js';
import { isExtendedXYZString, isXYZString } from './xyzFormatter.modern.js';

function isIdtString(s) {
  var idtBaseSeq = /^[ACGTUacgtu](\*[ACGTUacgtu])+$/;
  var idtModToken = /\/[35ir][A-Za-z0-9][A-Za-z0-9-]*\/?/;
  return idtBaseSeq.test(s) || idtModToken.test(s);
}
function identifyStructFormat(stringifiedStruct) {
  var isMacromolecules = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  var sanitizedString = stringifiedStruct.trim();
  if (/^@<TRIPOS>MOLECULE\b/i.test(sanitizedString)) {
    return SupportedFormat.mol2;
  }
  try {
    var parsedJSON = JSON.parse(sanitizedString);
    if (isQCSchemaMolecule(parsedJSON)) {
      return SupportedFormat.qcSchema;
    }
    if (parsedJSON) {
      return SupportedFormat.ket;
    }
  } catch (e) {
    KetcherLogger.error('identifyStructFormat.ts::identifyStructFromat', e);
  }
  if (isExtendedXYZString(sanitizedString)) {
    return SupportedFormat.extendedXYZ;
  }
  if (isXYZString(sanitizedString)) return SupportedFormat.xyz;
  var isRXN = sanitizedString.includes('$RXN');
  var isSDF = sanitizedString.includes('\n$$$$');
  var isV2000 = sanitizedString.includes('V2000');
  var isV3000 = sanitizedString.includes('V3000');
  if (isRXN) {
    return SupportedFormat.rxn;
  }
  if (isSDF) {
    if (isV2000) {
      return SupportedFormat.sdf;
    } else {
      return SupportedFormat.sdfV3000;
    }
  }
  if (isV2000) {
    return SupportedFormat.mol;
  }
  if (isV3000) {
    return SupportedFormat.molV3000;
  }
  var match = /^(M {2}END|\$END MOL)$/m.exec(sanitizedString);
  if (match) {
    var _match$index;
    var end = ((_match$index = match.index) !== null && _match$index !== void 0 ? _match$index : 0) + match[0].length;
    if (end === sanitizedString.length || sanitizedString.slice(end, end + 20).search(/^\$(MOL|END CTAB)$/m) !== -1) {
      return SupportedFormat.mol;
    }
  }
  if (sanitizedString.startsWith('<') && sanitizedString.indexOf('<molecule') !== -1) {
    return SupportedFormat.cml;
  }
  var clearStr = sanitizedString.replace(/\s/g, '').replace(/(\\r)|(\\n)/g, '');
  var isBase64String = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
  var cdxHeader = 'VjCD0100';
  if (clearStr.length % 4 === 0 && isBase64String.test(clearStr) && window.atob(clearStr).startsWith(cdxHeader)) {
    return SupportedFormat.cdx;
  }
  if (sanitizedString.startsWith('InChI')) {
    return SupportedFormat.inChI;
  }
  if (sanitizedString.indexOf('<CDXML') !== -1) {
    return SupportedFormat.cdxml;
  }
  if (sanitizedString.startsWith('>')) {
    return SupportedFormat.fasta;
  }
  if (isIdtString(sanitizedString)) {
    return SupportedFormat.idt;
  }
  if (sanitizedString.indexOf('\n') === -1 && !isMacromolecules) {
    return SupportedFormat.smiles;
  }
  var isSequence = /^[a-zA-Z\s]*$/.test(sanitizedString);
  var isThreeLetter = /^(?:(?:[A-Z][a-z]{2})\s?)+$/.test(sanitizedString);
  if (!isThreeLetter && isSequence) {
    return SupportedFormat.sequence;
  }
  return SupportedFormat.unknown;
}

export { identifyStructFormat };
//# sourceMappingURL=identifyStructFormat.modern.js.map
