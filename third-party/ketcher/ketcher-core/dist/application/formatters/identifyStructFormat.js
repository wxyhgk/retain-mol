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

require('../../utilities/runAsyncAction.js');
var KetcherLogger = require('../../utilities/KetcherLogger.js');
require('../../utilities/SettingsManager.js');
require('../../utilities/keynorm.js');
require('react-device-detect');
require('../../utilities/clipboardUtils.js');
var structFormatter_types = require('./structFormatter.types.js');
var qcSchemaFormatter = require('./qcSchemaFormatter.js');
var xyzFormatter = require('./xyzFormatter.js');

function isIdtString(s) {
  var idtBaseSeq = /^[ACGTUacgtu](\*[ACGTUacgtu])+$/;
  var idtModToken = /\/[35ir][A-Za-z0-9][A-Za-z0-9-]*\/?/;
  return idtBaseSeq.test(s) || idtModToken.test(s);
}
function identifyStructFormat(stringifiedStruct) {
  var isMacromolecules = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  var sanitizedString = stringifiedStruct.trim();
  if (/^@<TRIPOS>MOLECULE\b/i.test(sanitizedString)) {
    return structFormatter_types.SupportedFormat.mol2;
  }
  try {
    var parsedJSON = JSON.parse(sanitizedString);
    if (qcSchemaFormatter.isQCSchemaMolecule(parsedJSON)) {
      return structFormatter_types.SupportedFormat.qcSchema;
    }
    if (parsedJSON) {
      return structFormatter_types.SupportedFormat.ket;
    }
  } catch (e) {
    KetcherLogger.KetcherLogger.error('identifyStructFormat.ts::identifyStructFromat', e);
  }
  if (xyzFormatter.isExtendedXYZString(sanitizedString)) {
    return structFormatter_types.SupportedFormat.extendedXYZ;
  }
  if (xyzFormatter.isXYZString(sanitizedString)) return structFormatter_types.SupportedFormat.xyz;
  var isRXN = sanitizedString.includes('$RXN');
  var isSDF = sanitizedString.includes('\n$$$$');
  var isV2000 = sanitizedString.includes('V2000');
  var isV3000 = sanitizedString.includes('V3000');
  if (isRXN) {
    return structFormatter_types.SupportedFormat.rxn;
  }
  if (isSDF) {
    if (isV2000) {
      return structFormatter_types.SupportedFormat.sdf;
    } else {
      return structFormatter_types.SupportedFormat.sdfV3000;
    }
  }
  if (isV2000) {
    return structFormatter_types.SupportedFormat.mol;
  }
  if (isV3000) {
    return structFormatter_types.SupportedFormat.molV3000;
  }
  var match = /^(M {2}END|\$END MOL)$/m.exec(sanitizedString);
  if (match) {
    var _match$index;
    var end = ((_match$index = match.index) !== null && _match$index !== void 0 ? _match$index : 0) + match[0].length;
    if (end === sanitizedString.length || sanitizedString.slice(end, end + 20).search(/^\$(MOL|END CTAB)$/m) !== -1) {
      return structFormatter_types.SupportedFormat.mol;
    }
  }
  if (sanitizedString.startsWith('<') && sanitizedString.indexOf('<molecule') !== -1) {
    return structFormatter_types.SupportedFormat.cml;
  }
  var clearStr = sanitizedString.replace(/\s/g, '').replace(/(\\r)|(\\n)/g, '');
  var isBase64String = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
  var cdxHeader = 'VjCD0100';
  if (clearStr.length % 4 === 0 && isBase64String.test(clearStr) && window.atob(clearStr).startsWith(cdxHeader)) {
    return structFormatter_types.SupportedFormat.cdx;
  }
  if (sanitizedString.startsWith('InChI')) {
    return structFormatter_types.SupportedFormat.inChI;
  }
  if (sanitizedString.indexOf('<CDXML') !== -1) {
    return structFormatter_types.SupportedFormat.cdxml;
  }
  if (sanitizedString.startsWith('>')) {
    return structFormatter_types.SupportedFormat.fasta;
  }
  if (isIdtString(sanitizedString)) {
    return structFormatter_types.SupportedFormat.idt;
  }
  if (sanitizedString.indexOf('\n') === -1 && !isMacromolecules) {
    return structFormatter_types.SupportedFormat.smiles;
  }
  var isSequence = /^[a-zA-Z\s]*$/.test(sanitizedString);
  var isThreeLetter = /^(?:(?:[A-Z][a-z]{2})\s?)+$/.test(sanitizedString);
  if (!isThreeLetter && isSequence) {
    return structFormatter_types.SupportedFormat.sequence;
  }
  return structFormatter_types.SupportedFormat.unknown;
}

exports.identifyStructFormat = identifyStructFormat;
//# sourceMappingURL=identifyStructFormat.js.map
