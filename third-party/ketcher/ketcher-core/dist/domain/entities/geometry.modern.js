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
import { Vec2 } from './vec2.modern.js';

function geometricCenter(positions) {
  return positions.reduce(function (sum, pp) {
    return sum.add(pp);
  }, new Vec2(0, 0)).scaled(1 / positions.length);
}
function getAtomPositions(atomIds, atoms) {
  return atomIds.map(function (id) {
    var _atoms$get;
    return (_atoms$get = atoms.get(id)) === null || _atoms$get === void 0 ? void 0 : _atoms$get.pp;
  }).filter(function (pp) {
    return pp !== null;
  });
}

export { geometricCenter, getAtomPositions };
//# sourceMappingURL=geometry.modern.js.map
