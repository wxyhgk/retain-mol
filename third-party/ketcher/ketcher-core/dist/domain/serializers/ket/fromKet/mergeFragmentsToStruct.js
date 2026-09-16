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

var atomBondToStruct = require('./atomBondToStruct.js');

function mergeFragmentsToStruct(ketItem, struct) {
  var atomsOffset = 0;
  if (ketItem.fragments) {
    ketItem.fragments.forEach(function (fragment) {
      var _fragment$atoms, _fragment$bonds, _fragment$atoms$lengt, _fragment$atoms2;
      (_fragment$atoms = fragment.atoms) === null || _fragment$atoms === void 0 || _fragment$atoms.forEach(function (atom) {
        return struct.atoms.add(atomBondToStruct.atomToStruct(atom));
      });
      (_fragment$bonds = fragment.bonds) === null || _fragment$bonds === void 0 || _fragment$bonds.forEach(function (bond) {
        return struct.bonds.add(atomBondToStruct.bondToStruct(bond, atomsOffset));
      });
      atomsOffset += (_fragment$atoms$lengt = (_fragment$atoms2 = fragment.atoms) === null || _fragment$atoms2 === void 0 ? void 0 : _fragment$atoms2.length) !== null && _fragment$atoms$lengt !== void 0 ? _fragment$atoms$lengt : 0;
    });
  }
  return struct;
}

exports.mergeFragmentsToStruct = mergeFragmentsToStruct;
//# sourceMappingURL=mergeFragmentsToStruct.js.map
