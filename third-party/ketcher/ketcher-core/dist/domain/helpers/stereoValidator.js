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

function isCorrectStereoCenter(bond, beginNeighs, endNeighs, struct) {
  var beginAtom = struct.atoms.get(bond.begin);
  var EndAtomNeigh = NaN;
  if ((endNeighs === null || endNeighs === void 0 ? void 0 : endNeighs.length) === 2) {
    EndAtomNeigh = endNeighs[0].aid === bond.begin ? endNeighs[1].aid : endNeighs[0].aid;
  }
  if (bond.stereo > 0) {
    var _struct$atomGetNeighb;
    if ((endNeighs === null || endNeighs === void 0 ? void 0 : endNeighs.length) === 1 && (beginNeighs === null || beginNeighs === void 0 ? void 0 : beginNeighs.length) === 2 && Number(beginAtom === null || beginAtom === void 0 ? void 0 : beginAtom.implicitH) % 2 === 0) {
      return false;
    }
    if ((endNeighs === null || endNeighs === void 0 ? void 0 : endNeighs.length) === 2 && (beginNeighs === null || beginNeighs === void 0 ? void 0 : beginNeighs.length) === 2 && Number(beginAtom === null || beginAtom === void 0 ? void 0 : beginAtom.implicitH) % 2 === 0 && ((_struct$atomGetNeighb = struct.atomGetNeighbors(EndAtomNeigh)) === null || _struct$atomGetNeighb === void 0 ? void 0 : _struct$atomGetNeighb.length) === 1) {
      return false;
    }
    if ((beginNeighs === null || beginNeighs === void 0 ? void 0 : beginNeighs.length) === 1) {
      return false;
    }
    return true;
  } else {
    return false;
  }
}
var StereoValidator = {
  isCorrectStereoCenter: isCorrectStereoCenter
};

exports.StereoValidator = StereoValidator;
//# sourceMappingURL=stereoValidator.js.map
