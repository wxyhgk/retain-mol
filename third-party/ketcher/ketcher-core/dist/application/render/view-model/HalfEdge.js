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

var _classCallCheck = require('@babel/runtime/helpers/classCallCheck');
var _createClass = require('@babel/runtime/helpers/createClass');
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var vec2 = require('../../../domain/entities/vec2.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);

var HalfEdge = function () {
  function HalfEdge(id, firstAtom, secondAtom, bond) {
    _classCallCheck__default["default"](this, HalfEdge);
    _defineProperty__default["default"](this, "id", void 0);
    _defineProperty__default["default"](this, "firstAtom", void 0);
    _defineProperty__default["default"](this, "secondAtom", void 0);
    _defineProperty__default["default"](this, "bond", void 0);
    _defineProperty__default["default"](this, "direction", void 0);
    _defineProperty__default["default"](this, "loopId", void 0);
    _defineProperty__default["default"](this, "oppositeHalfEdge", void 0);
    _defineProperty__default["default"](this, "nextHalfEdge", void 0);
    _defineProperty__default["default"](this, "sinToLeftNeighborHalfEdge", void 0);
    _defineProperty__default["default"](this, "cosToLeftNeighborHalfEdge", void 0);
    _defineProperty__default["default"](this, "leftNeighborHalfEdge", void 0);
    _defineProperty__default["default"](this, "sinToRightNeighborHalfEdge", void 0);
    _defineProperty__default["default"](this, "cosToRightNeighborHalfEdge", void 0);
    _defineProperty__default["default"](this, "rightNeighborHalfEdge", void 0);
    this.id = id;
    this.firstAtom = firstAtom;
    this.secondAtom = secondAtom;
    this.bond = bond;
    this.direction = new vec2.Vec2();
    this.loopId = -1;
    this.sinToLeftNeighborHalfEdge = 0;
    this.cosToLeftNeighborHalfEdge = 0;
    this.sinToRightNeighborHalfEdge = 0;
    this.cosToRightNeighborHalfEdge = 0;
  }
  _createClass__default["default"](HalfEdge, [{
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
      return this.firstAtom.position || new vec2.Vec2(0, 0);
    }
  }]);
  return HalfEdge;
}();

exports.HalfEdge = HalfEdge;
//# sourceMappingURL=HalfEdge.js.map
