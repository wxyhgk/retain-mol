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

var atom = require('../../../domain/entities/atom.js');
var bond = require('../../../domain/entities/bond.js');
var stereoValidator = require('../../../domain/helpers/stereoValidator.js');
require('../../../domain/helpers/functionalGroupsProvider.js');
require('../../../domain/helpers/saltsAndSolventsProvider.js');
require('../../../domain/constants/generics.js');
require('../../../domain/helpers/attachmentPointCalculations.js');

function resetStereoAtomIfNotCorrect(stereoAtomsMap, correctAtomIds, atomId) {
  if (!correctAtomIds.includes(atomId)) {
    stereoAtomsMap.set(atomId, {
      stereoParity: atom.Atom.PATTERN.STEREO_PARITY.NONE,
      stereoLabel: null
    });
  }
}
function getStereoAtomsMap(struct, bonds, bond) {
  var stereoAtomsMap = new Map();
  var correctAtomIds = [];
  bonds.forEach(function (bond) {
    if (bond) {
      var beginNeighs = struct.atomGetNeighbors(bond.begin);
      var endNeighs = struct.atomGetNeighbors(bond.end);
      if (stereoValidator.StereoValidator.isCorrectStereoCenter(bond, beginNeighs, endNeighs, struct)) {
        var _struct$atoms$get, _stereoAtomsMap$get;
        var stereoLabel = (_struct$atoms$get = struct.atoms.get(bond.begin)) === null || _struct$atoms$get === void 0 ? void 0 : _struct$atoms$get.stereoLabel;
        if (stereoLabel == null || ((_stereoAtomsMap$get = stereoAtomsMap.get(bond.begin)) === null || _stereoAtomsMap$get === void 0 ? void 0 : _stereoAtomsMap$get.stereoLabel) == null) {
          stereoAtomsMap.set(bond.begin, {
            stereoParity: getStereoParity(bond.stereo),
            stereoLabel: stereoLabel !== null && stereoLabel !== void 0 ? stereoLabel : "".concat(atom.StereoLabel.Abs)
          });
        }
        correctAtomIds.push(bond.begin);
      } else {
        resetStereoAtomIfNotCorrect(stereoAtomsMap, correctAtomIds, bond.begin);
        resetStereoAtomIfNotCorrect(stereoAtomsMap, correctAtomIds, bond.end);
      }
    }
  });
  if (bond) {
    resetStereoAtomIfNotCorrect(stereoAtomsMap, correctAtomIds, bond.begin);
    resetStereoAtomIfNotCorrect(stereoAtomsMap, correctAtomIds, bond.end);
  }
  return stereoAtomsMap;
}
function getStereoParity(stereo) {
  var newAtomParity = null;
  switch (stereo) {
    case bond.Bond.PATTERN.STEREO.UP:
      newAtomParity = atom.Atom.PATTERN.STEREO_PARITY.ODD;
      break;
    case bond.Bond.PATTERN.STEREO.EITHER:
      newAtomParity = atom.Atom.PATTERN.STEREO_PARITY.EITHER;
      break;
    case bond.Bond.PATTERN.STEREO.DOWN:
      newAtomParity = atom.Atom.PATTERN.STEREO_PARITY.EVEN;
      break;
  }
  return newAtomParity;
}

exports.getStereoAtomsMap = getStereoAtomsMap;
//# sourceMappingURL=helpers.js.map
