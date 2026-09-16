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
import _classCallCheck from '@babel/runtime/helpers/classCallCheck';
import _createClass from '@babel/runtime/helpers/createClass';
import _defineProperty from '@babel/runtime/helpers/defineProperty';
import { Vec2 } from '../../../domain/entities/vec2.modern.js';

var HalfEdge = function () {
  function HalfEdge(id, firstAtom, secondAtom, bond) {
    _classCallCheck(this, HalfEdge);
    _defineProperty(this, "id", void 0);
    _defineProperty(this, "firstAtom", void 0);
    _defineProperty(this, "secondAtom", void 0);
    _defineProperty(this, "bond", void 0);
    _defineProperty(this, "direction", void 0);
    _defineProperty(this, "loopId", void 0);
    _defineProperty(this, "oppositeHalfEdge", void 0);
    _defineProperty(this, "nextHalfEdge", void 0);
    _defineProperty(this, "sinToLeftNeighborHalfEdge", void 0);
    _defineProperty(this, "cosToLeftNeighborHalfEdge", void 0);
    _defineProperty(this, "leftNeighborHalfEdge", void 0);
    _defineProperty(this, "sinToRightNeighborHalfEdge", void 0);
    _defineProperty(this, "cosToRightNeighborHalfEdge", void 0);
    _defineProperty(this, "rightNeighborHalfEdge", void 0);
    this.id = id;
    this.firstAtom = firstAtom;
    this.secondAtom = secondAtom;
    this.bond = bond;
    this.direction = new Vec2();
    this.loopId = -1;
    this.sinToLeftNeighborHalfEdge = 0;
    this.cosToLeftNeighborHalfEdge = 0;
    this.sinToRightNeighborHalfEdge = 0;
    this.cosToRightNeighborHalfEdge = 0;
  }
  _createClass(HalfEdge, [{
    key: "leftNormal",
    get: function get() {
      return this.direction.turnLeft();
    }
  }, {
    key: "angle",
    get: function get() {
      return this.direction.oxAngle();
    }
  }, {
    key: "position",
    get: function get() {
      return this.firstAtom.position || new Vec2(0, 0);
    }
  }]);
  return HalfEdge;
}();

export { HalfEdge };
//# sourceMappingURL=HalfEdge.modern.js.map
