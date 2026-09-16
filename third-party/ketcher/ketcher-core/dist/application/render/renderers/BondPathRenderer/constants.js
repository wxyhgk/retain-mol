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

var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var CoreBond = require('../../../../domain/entities/CoreBond.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);

var BondWidth = 2;
var StereoBondWidth = 6;
var BondSpace = 6;
var LinesOffset = BondSpace / 2;
var BondDashArrayMap = _defineProperty__default["default"](_defineProperty__default["default"](_defineProperty__default["default"](_defineProperty__default["default"](_defineProperty__default["default"](_defineProperty__default["default"]({}, CoreBond.BondType.Aromatic, '6'), CoreBond.BondType.SingleDouble, '6'), CoreBond.BondType.SingleAromatic, '4 4 1 4'), CoreBond.BondType.DoubleAromatic, '4 4 1 4'), CoreBond.BondType.Any, '6'), CoreBond.BondType.Hydrogen, '3');

exports.BondDashArrayMap = BondDashArrayMap;
exports.BondSpace = BondSpace;
exports.BondWidth = BondWidth;
exports.LinesOffset = LinesOffset;
exports.StereoBondWidth = StereoBondWidth;
//# sourceMappingURL=constants.js.map
