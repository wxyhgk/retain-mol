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

var vec2 = require('../../../domain/entities/vec2.js');

var SELECTION_DISTANCE_COEFFICIENT = 0.4;
function findClosestAtom(restruct, pos, skip, minDist) {
  var closestAtom = null;
  var maxMinDist = SELECTION_DISTANCE_COEFFICIENT;
  var skipId = skip && skip.map === 'atoms' ? skip.id : null;
  minDist = minDist || maxMinDist;
  minDist = Math.min(minDist, maxMinDist);
  restruct.visibleAtoms.forEach(function (atom, aid) {
    if (aid === skipId) return;
    var dist = vec2.Vec2.dist(pos, atom.a.pp);
    if (dist < minDist) {
      closestAtom = aid;
      minDist = dist;
    }
  });
  if (closestAtom !== null) {
    return {
      id: closestAtom,
      dist: minDist
    };
  }
  return null;
}
var closest = {
  atom: findClosestAtom
};

exports["default"] = closest;
//# sourceMappingURL=closest.js.map
