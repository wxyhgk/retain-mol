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

require('../constants/elements.js');
require('../constants/element.types.js');
require('../constants/generics.js');
var chains = require('../constants/chains.js');
require('../constants/monomers.js');
var PolymerBond = require('../entities/PolymerBond.js');

var getNodeFromTwoStrandedNode = function getNodeFromTwoStrandedNode(twoStrandedNode, strandType) {
  return strandType === chains.STRAND_TYPE.SENSE ? twoStrandedNode.senseNode : twoStrandedNode.antisenseNode;
};
var getNextConnectedNode = function getNextConnectedNode(node, monomerToNode) {
  var r2PolymerBondBetweenNodes = node.lastMonomerInNode.attachmentPointsToBonds.R2;
  var anotherMonomerConnectedToAntisenseNode = r2PolymerBondBetweenNodes instanceof PolymerBond.PolymerBond && (r2PolymerBondBetweenNodes === null || r2PolymerBondBetweenNodes === void 0 ? void 0 : r2PolymerBondBetweenNodes.getAnotherMonomer(node.lastMonomerInNode));
  var nextConnectedNode = anotherMonomerConnectedToAntisenseNode && monomerToNode.get(anotherMonomerConnectedToAntisenseNode) || undefined;
  return nextConnectedNode;
};
var getPreviousConnectedNode = function getPreviousConnectedNode(node, monomerToNode) {
  var r1PolymerBondBetweenNodes = node.firstMonomerInNode.attachmentPointsToBonds.R1;
  var anotherMonomerConnectedToAntisenseNode = r1PolymerBondBetweenNodes instanceof PolymerBond.PolymerBond && (r1PolymerBondBetweenNodes === null || r1PolymerBondBetweenNodes === void 0 ? void 0 : r1PolymerBondBetweenNodes.getAnotherMonomer(node.firstMonomerInNode));
  var previousConnectedNode = anotherMonomerConnectedToAntisenseNode && monomerToNode.get(anotherMonomerConnectedToAntisenseNode) || undefined;
  return previousConnectedNode;
};

exports.getNextConnectedNode = getNextConnectedNode;
exports.getNodeFromTwoStrandedNode = getNodeFromTwoStrandedNode;
exports.getPreviousConnectedNode = getPreviousConnectedNode;
//# sourceMappingURL=chains.js.map
