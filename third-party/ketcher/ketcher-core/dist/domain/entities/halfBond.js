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
var vec2 = require('./vec2.js');
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

var HalfBond = _createClass__default["default"](function HalfBond(begin, end, bid) {
  _classCallCheck__default["default"](this, HalfBond);
  _defineProperty__default["default"](this, "begin", void 0);
  _defineProperty__default["default"](this, "end", void 0);
  _defineProperty__default["default"](this, "bid", void 0);
  _defineProperty__default["default"](this, "dir", void 0);
  _defineProperty__default["default"](this, "norm", void 0);
  _defineProperty__default["default"](this, "ang", void 0);
  _defineProperty__default["default"](this, "p", void 0);
  _defineProperty__default["default"](this, "loop", void 0);
  _defineProperty__default["default"](this, "contra", void 0);
  _defineProperty__default["default"](this, "next", void 0);
  _defineProperty__default["default"](this, "leftSin", void 0);
  _defineProperty__default["default"](this, "leftCos", void 0);
  _defineProperty__default["default"](this, "leftNeighbor", void 0);
  _defineProperty__default["default"](this, "rightSin", void 0);
  _defineProperty__default["default"](this, "rightCos", void 0);
  _defineProperty__default["default"](this, "rightNeighbor", void 0);
  assert.assert(arguments.length === 3, 'Invalid parameter number.');
  this.begin = begin;
  this.end = end;
  this.bid = bid;
  this.dir = new vec2.Vec2();
  this.norm = new vec2.Vec2();
  this.ang = 0;
  this.p = new vec2.Vec2();
  this.loop = -1;
  this.contra = -1;
  this.next = -1;
  this.leftSin = 0;
  this.leftCos = 0;
  this.leftNeighbor = 0;
  this.rightSin = 0;
  this.rightCos = 0;
  this.rightNeighbor = 0;
});

exports.HalfBond = HalfBond;
//# sourceMappingURL=halfBond.js.map
