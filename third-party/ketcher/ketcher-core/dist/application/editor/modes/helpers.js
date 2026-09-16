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

var BackBoneSequenceNode = require('../../../domain/entities/BackBoneSequenceNode.js');
var EmptySequenceNode = require('../../../domain/entities/EmptySequenceNode.js');
var LinkerSequenceNode = require('../../../domain/entities/LinkerSequenceNode.js');

function isNodeRestrictedForHydrogenBondCreation(node) {
  return !node || node instanceof LinkerSequenceNode.LinkerSequenceNode && node.monomers.length > 1 || node instanceof BackBoneSequenceNode.BackBoneSequenceNode || node instanceof EmptySequenceNode.EmptySequenceNode;
}
function isTwoStrandedNodeRestrictedForHydrogenBondCreation(twoStrandedNode) {
  var _twoStrandedNode$sens, _twoStrandedNode$anti;
  var senseNodeHydrogenBonds = (twoStrandedNode === null || twoStrandedNode === void 0 || (_twoStrandedNode$sens = twoStrandedNode.senseNode) === null || _twoStrandedNode$sens === void 0 ? void 0 : _twoStrandedNode$sens.monomers.reduce(function (acc, monomer) {
    return acc.concat(monomer.hydrogenBonds);
  }, [])) || [];
  return Boolean(isNodeRestrictedForHydrogenBondCreation(twoStrandedNode === null || twoStrandedNode === void 0 ? void 0 : twoStrandedNode.senseNode) || isNodeRestrictedForHydrogenBondCreation(twoStrandedNode === null || twoStrandedNode === void 0 ? void 0 : twoStrandedNode.antisenseNode) || (twoStrandedNode === null || twoStrandedNode === void 0 || (_twoStrandedNode$anti = twoStrandedNode.antisenseNode) === null || _twoStrandedNode$anti === void 0 ? void 0 : _twoStrandedNode$anti.monomers.some(function (monomer) {
    return monomer.hydrogenBonds.some(function (hydrogenBond) {
      return senseNodeHydrogenBonds.includes(hydrogenBond);
    });
  })));
}

exports.isNodeRestrictedForHydrogenBondCreation = isNodeRestrictedForHydrogenBondCreation;
exports.isTwoStrandedNodeRestrictedForHydrogenBondCreation = isTwoStrandedNodeRestrictedForHydrogenBondCreation;
//# sourceMappingURL=helpers.js.map
