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

var _createClass = require('@babel/runtime/helpers/createClass');
var _classCallCheck = require('@babel/runtime/helpers/classCallCheck');
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var bond = require('./bond.js');
require('../../utilities/runAsyncAction.js');
require('../../utilities/KetcherLogger.js');
require('../../utilities/SettingsManager.js');
require('../../utilities/keynorm.js');
require('react-device-detect');
require('../../utilities/clipboardUtils.js');
var assert = require('../../utilities/assert.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);

var Loop = _createClass__default["default"](function Loop(hbs, struct, isConvex) {
  var _this = this;
  _classCallCheck__default["default"](this, Loop);
  _defineProperty__default["default"](this, "hbs", void 0);
  _defineProperty__default["default"](this, "dblBonds", void 0);
  _defineProperty__default["default"](this, "aromatic", void 0);
  _defineProperty__default["default"](this, "convex", void 0);
  this.hbs = hbs;
  this.dblBonds = 0;
  this.aromatic = true;
  this.convex = isConvex || false;
  hbs.forEach(function (hb) {
    var halfBond = struct.halfBonds.get(hb);
    assert.assert(halfBond, "Expected half-bond ".concat(hb, " to exist when constructing loop"));
    var bond$1 = struct.bonds.get(halfBond.bid);
    assert.assert(bond$1, "Expected bond ".concat(halfBond.bid, " to exist for half-bond ").concat(hb, " when constructing loop"));
    if (bond$1.type !== bond.Bond.PATTERN.TYPE.AROMATIC) _this.aromatic = false;
    if (bond$1.type === bond.Bond.PATTERN.TYPE.DOUBLE) _this.dblBonds++;
  });
});

exports.Loop = Loop;
//# sourceMappingURL=loop.js.map
