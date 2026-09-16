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

var HELM_ALIAS_FORMAT_ERROR_MESSAGE = 'The HELM alias must consist only of uppercase and lowercase letters, numbers, underscores (_), asterisks (*), square brackets ([]), parentheses (()), dots (.), and hyphens (-), spaces prohibited.';
var BILN_ALIAS_FORMAT_ERROR_MESSAGE = 'The BILN alias must consist only of uppercase and lowercase letters, numbers, hyphens (`-`), underscores (`_`), and asterisks (`*`).';
var HELM_ALIAS_MAX_LENGTH = 23;
var HELM_ALIAS_LENGTH_ERROR_MESSAGE = "The HELM alias must be no more than ".concat(HELM_ALIAS_MAX_LENGTH, " symbols long.");
var IDT_ALIAS_SLASH_ERROR_MESSAGE = 'The slashes (`/`) can only be the first and last character of an IDT alias.';
var IDT_ALIAS_LENGTH_MAX = 10;
var IDT_ALIAS_LENGTH_ERROR_MESSAGE = "The maximum number of characters of an IDT alias without slashes (/) is ".concat(IDT_ALIAS_LENGTH_MAX, ".");
var MONOMER_GROUP_TEMPLATE_NAME_MAX_LENGTH = 200;
var MONOMER_GROUP_TEMPLATE_NAME_MAX_LENGTH_ERROR_MESSAGE = "The monomer group template name must not exceed ".concat(MONOMER_GROUP_TEMPLATE_NAME_MAX_LENGTH, " characters.");
var DISALLOWED_MONOMER_MODIFICATION_TYPES = ['Ambiguous mixed peptide', 'Unknown peptide', 'Ambiguous alternative sugar', 'Ambiguous mixed sugar', 'Unknown sugar', 'Ambiguous mixed DNA base', 'Ambiguous mixed RNA base', 'Ambiguous mixed base', 'Unknown base', 'Ambiguous alternative phosphate', 'Ambiguous mixed phosphate', 'Unknown phosphate', 'Unknown unsplit nucleotide', 'Ambiguous alternative CHEM', 'Ambiguous mixed CHEM', 'Unknown CHEM', 'Unknown monomer', 'Molecule', 'Micromolecule'];
var DISALLOWED_MODIFICATION_TYPE_ERROR_MESSAGE = 'Monomers with an unknown, ambiguous, or molecule modification type cannot be added to the library.';
var disallowedModificationTypesSet = new Set(DISALLOWED_MONOMER_MODIFICATION_TYPES);
function getDisallowedModificationTypes(modificationTypes) {
  if (!Array.isArray(modificationTypes)) {
    return [];
  }
  return modificationTypes.filter(function (type) {
    return disallowedModificationTypesSet.has(type);
  });
}
var HELM_ALIAS_REGEX = /^(?!.*\s)[A-Za-z0-9_*.[\]()-]+$/;
var BILN_ALIAS_REGEX = /^[A-Za-z0-9_*-]+$/;
function isValidIdtAlias(alias) {
  if (!alias) return true;
  var inner = alias.slice(1, -1);
  return !inner.includes('/');
}
function isValidIdtAliasLength(alias) {
  if (!alias) return true;
  var withoutSlashes = alias.replace(/^\//, '').replace(/\/$/, '');
  return withoutSlashes.length <= IDT_ALIAS_LENGTH_MAX;
}
function getTooLongIdtAliasEntries(idtAliases) {
  var base = idtAliases.base,
    modifications = idtAliases.modifications;
  return [{
    alias: 'base',
    value: base
  }, {
    alias: 'endpoint3',
    value: modifications === null || modifications === void 0 ? void 0 : modifications.endpoint3
  }, {
    alias: 'endpoint5',
    value: modifications === null || modifications === void 0 ? void 0 : modifications.endpoint5
  }, {
    alias: 'internal',
    value: modifications === null || modifications === void 0 ? void 0 : modifications.internal
  }].filter(function (entry) {
    return Boolean(entry.value);
  }).filter(function (_ref) {
    var value = _ref.value;
    return !isValidIdtAliasLength(value);
  });
}
function isValidHelmAlias(alias) {
  return HELM_ALIAS_REGEX.test(alias);
}
function isValidBilnAlias(alias) {
  return BILN_ALIAS_REGEX.test(alias);
}
function isValidHelmAliasLength(alias) {
  return alias.length <= HELM_ALIAS_MAX_LENGTH;
}
function isMonomerSgroupWithAttachmentPoints(monomer) {
  var sgroups = monomer.monomerItem.struct.sgroups;
  return monomer.monomerItem.props.isMicromoleculeFragment && sgroups.some(function (sgroup) {
    return sgroup.isSuperatomWithoutLabel;
  });
}

exports.BILN_ALIAS_FORMAT_ERROR_MESSAGE = BILN_ALIAS_FORMAT_ERROR_MESSAGE;
exports.DISALLOWED_MODIFICATION_TYPE_ERROR_MESSAGE = DISALLOWED_MODIFICATION_TYPE_ERROR_MESSAGE;
exports.DISALLOWED_MONOMER_MODIFICATION_TYPES = DISALLOWED_MONOMER_MODIFICATION_TYPES;
exports.HELM_ALIAS_FORMAT_ERROR_MESSAGE = HELM_ALIAS_FORMAT_ERROR_MESSAGE;
exports.HELM_ALIAS_LENGTH_ERROR_MESSAGE = HELM_ALIAS_LENGTH_ERROR_MESSAGE;
exports.HELM_ALIAS_MAX_LENGTH = HELM_ALIAS_MAX_LENGTH;
exports.IDT_ALIAS_LENGTH_ERROR_MESSAGE = IDT_ALIAS_LENGTH_ERROR_MESSAGE;
exports.IDT_ALIAS_LENGTH_MAX = IDT_ALIAS_LENGTH_MAX;
exports.IDT_ALIAS_SLASH_ERROR_MESSAGE = IDT_ALIAS_SLASH_ERROR_MESSAGE;
exports.MONOMER_GROUP_TEMPLATE_NAME_MAX_LENGTH = MONOMER_GROUP_TEMPLATE_NAME_MAX_LENGTH;
exports.MONOMER_GROUP_TEMPLATE_NAME_MAX_LENGTH_ERROR_MESSAGE = MONOMER_GROUP_TEMPLATE_NAME_MAX_LENGTH_ERROR_MESSAGE;
exports.getDisallowedModificationTypes = getDisallowedModificationTypes;
exports.getTooLongIdtAliasEntries = getTooLongIdtAliasEntries;
exports.isMonomerSgroupWithAttachmentPoints = isMonomerSgroupWithAttachmentPoints;
exports.isValidBilnAlias = isValidBilnAlias;
exports.isValidHelmAlias = isValidHelmAlias;
exports.isValidHelmAliasLength = isValidHelmAliasLength;
exports.isValidIdtAlias = isValidIdtAlias;
exports.isValidIdtAliasLength = isValidIdtAliasLength;
//# sourceMappingURL=monomers.js.map
