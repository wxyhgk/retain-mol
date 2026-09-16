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

require('../../../domain/constants/elements.js');
require('../../../domain/constants/element.types.js');
require('../../../domain/constants/generics.js');
var image = require('../../../domain/constants/image.js');
var multitailArrow = require('../../../domain/constants/multitailArrow.js');
require('../../../domain/constants/chains.js');
require('../../../domain/constants/monomers.js');

var SgContexts = {
  Fragment: 'Fragment',
  Multifragment: 'Multifragment',
  Bond: 'Bond',
  Atom: 'Atom',
  Group: 'Group'
};
var selectionKeys = ['atoms', 'bonds', 'frags', 'sgroups', 'rgroups', 'rgroupAttachmentPoints', 'rxnArrows', 'rxnPluses', 'simpleObjects', 'texts', image.IMAGE_KEY, multitailArrow.MULTITAIL_ARROW_KEY];
var defaultBondThickness = 2;
exports.MonomerGroups = void 0;
(function (MonomerGroups) {
  MonomerGroups["SUGARS"] = "Sugars";
  MonomerGroups["BASES"] = "Bases";
  MonomerGroups["PHOSPHATES"] = "Phosphates";
  MonomerGroups["PEPTIDES"] = "Amino Acids";
  MonomerGroups["NUCLEOTIDES"] = "Nucleotides";
})(exports.MonomerGroups || (exports.MonomerGroups = {}));
exports.MonomerGroupCodes = void 0;
(function (MonomerGroupCodes) {
  MonomerGroupCodes["R"] = "R";
  MonomerGroupCodes["A"] = "A";
  MonomerGroupCodes["C"] = "C";
  MonomerGroupCodes["G"] = "G";
  MonomerGroupCodes["T"] = "T";
  MonomerGroupCodes["U"] = "U";
  MonomerGroupCodes["X"] = "X";
  MonomerGroupCodes["P"] = "P";
})(exports.MonomerGroupCodes || (exports.MonomerGroupCodes = {}));
var MonomerCodeToGroup = {
  R: exports.MonomerGroups.SUGARS,
  A: exports.MonomerGroups.BASES,
  C: exports.MonomerGroups.BASES,
  G: exports.MonomerGroups.BASES,
  T: exports.MonomerGroups.BASES,
  U: exports.MonomerGroups.BASES,
  X: exports.MonomerGroups.BASES,
  P: exports.MonomerGroups.PHOSPHATES
};
var EditorClassName = 'Ketcher-polymer-editor-root';
var KETCHER_MACROMOLECULES_ROOT_NODE_SELECTOR = ".".concat(EditorClassName);
var KETCHER_ROOT_NODE_CLASS_NAME = 'Ketcher-root';

exports.EditorClassName = EditorClassName;
exports.KETCHER_MACROMOLECULES_ROOT_NODE_SELECTOR = KETCHER_MACROMOLECULES_ROOT_NODE_SELECTOR;
exports.KETCHER_ROOT_NODE_CLASS_NAME = KETCHER_ROOT_NODE_CLASS_NAME;
exports.MonomerCodeToGroup = MonomerCodeToGroup;
exports.SgContexts = SgContexts;
exports.defaultBondThickness = defaultBondThickness;
exports.selectionKeys = selectionKeys;
//# sourceMappingURL=constants.js.map
