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
import '../../../domain/constants/elements.modern.js';
import '../../../domain/constants/element.types.modern.js';
import '../../../domain/constants/generics.modern.js';
import { IMAGE_KEY } from '../../../domain/constants/image.modern.js';
import { MULTITAIL_ARROW_KEY } from '../../../domain/constants/multitailArrow.modern.js';
import '../../../domain/constants/chains.modern.js';
import '../../../domain/constants/monomers.modern.js';

var SgContexts = {
  Fragment: 'Fragment',
  Multifragment: 'Multifragment',
  Bond: 'Bond',
  Atom: 'Atom',
  Group: 'Group'
};
var selectionKeys = ['atoms', 'bonds', 'frags', 'sgroups', 'rgroups', 'rgroupAttachmentPoints', 'rxnArrows', 'rxnPluses', 'simpleObjects', 'texts', IMAGE_KEY, MULTITAIL_ARROW_KEY];
var defaultBondThickness = 2;
var MonomerGroups;
(function (MonomerGroups) {
  MonomerGroups["SUGARS"] = "Sugars";
  MonomerGroups["BASES"] = "Bases";
  MonomerGroups["PHOSPHATES"] = "Phosphates";
  MonomerGroups["PEPTIDES"] = "Amino Acids";
  MonomerGroups["NUCLEOTIDES"] = "Nucleotides";
})(MonomerGroups || (MonomerGroups = {}));
var MonomerGroupCodes;
(function (MonomerGroupCodes) {
  MonomerGroupCodes["R"] = "R";
  MonomerGroupCodes["A"] = "A";
  MonomerGroupCodes["C"] = "C";
  MonomerGroupCodes["G"] = "G";
  MonomerGroupCodes["T"] = "T";
  MonomerGroupCodes["U"] = "U";
  MonomerGroupCodes["X"] = "X";
  MonomerGroupCodes["P"] = "P";
})(MonomerGroupCodes || (MonomerGroupCodes = {}));
var MonomerCodeToGroup = {
  R: MonomerGroups.SUGARS,
  A: MonomerGroups.BASES,
  C: MonomerGroups.BASES,
  G: MonomerGroups.BASES,
  T: MonomerGroups.BASES,
  U: MonomerGroups.BASES,
  X: MonomerGroups.BASES,
  P: MonomerGroups.PHOSPHATES
};
var EditorClassName = 'Ketcher-polymer-editor-root';
var KETCHER_MACROMOLECULES_ROOT_NODE_SELECTOR = ".".concat(EditorClassName);
var KETCHER_ROOT_NODE_CLASS_NAME = 'Ketcher-root';

export { EditorClassName, KETCHER_MACROMOLECULES_ROOT_NODE_SELECTOR, KETCHER_ROOT_NODE_CLASS_NAME, MonomerCodeToGroup, MonomerGroupCodes, MonomerGroups, SgContexts, defaultBondThickness, selectionKeys };
//# sourceMappingURL=constants.modern.js.map
