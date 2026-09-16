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
var bond = require('../../../domain/entities/bond.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);

var Loop = function () {
  function Loop(halfEdges) {
    var isConvex = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    _classCallCheck__default["default"](this, Loop);
    _defineProperty__default["default"](this, "halfEdges", void 0);
    _defineProperty__default["default"](this, "isConvex", void 0);
    _defineProperty__default["default"](this, "doubleBondsAmount", 0);
    _defineProperty__default["default"](this, "aromatic", true);
    this.halfEdges = halfEdges;
    this.isConvex = isConvex;
    this.calculateDoubleBondsAmount();
  }
  _createClass__default["default"](Loop, [{
    key: "calculateDoubleBondsAmount",
    value: function calculateDoubleBondsAmount() {
      var _this = this;
      this.halfEdges.forEach(function (halfEdge) {
        if (halfEdge.bond.type !== bond.Bond.PATTERN.TYPE.AROMATIC) _this.aromatic = false;
        if (halfEdge.bond.type === bond.Bond.PATTERN.TYPE.DOUBLE) _this.doubleBondsAmount++;
      });
    }
  }]);
  return Loop;
}();

exports.Loop = Loop;
//# sourceMappingURL=Loop.js.map
