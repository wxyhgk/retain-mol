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
var _possibleConstructorReturn = require('@babel/runtime/helpers/possibleConstructorReturn');
var _getPrototypeOf = require('@babel/runtime/helpers/getPrototypeOf');
var _inherits = require('@babel/runtime/helpers/inherits');
var BaseMonomer = require('./BaseMonomer.js');
var ChemSubChain = require('./monomer-chains/ChemSubChain.js');
var monomers = require('../types/monomers.js');
require('../types/entities.js');
var monomers$1 = require('../helpers/monomers.js');
var MonomerToAtomBond = require('./MonomerToAtomBond.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _possibleConstructorReturn__default = /*#__PURE__*/_interopDefaultLegacy(_possibleConstructorReturn);
var _getPrototypeOf__default = /*#__PURE__*/_interopDefaultLegacy(_getPrototypeOf);
var _inherits__default = /*#__PURE__*/_interopDefaultLegacy(_inherits);

function _callSuper(t, o, e) { return o = _getPrototypeOf__default["default"](o), _possibleConstructorReturn__default["default"](t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf__default["default"](t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var RNABase = function (_BaseMonomer) {
  _inherits__default["default"](RNABase, _BaseMonomer);
  function RNABase() {
    _classCallCheck__default["default"](this, RNABase);
    return _callSuper(this, RNABase, arguments);
  }
  _createClass__default["default"](RNABase, [{
    key: "getValidSourcePoint",
    value: function getValidSourcePoint() {
      if (this.chosenFirstAttachmentPointForBond) {
        return this.chosenFirstAttachmentPointForBond;
      }
      return this.firstFreeAttachmentPoint;
    }
  }, {
    key: "getValidTargetPoint",
    value: function getValidTargetPoint() {
      if (this.potentialSecondAttachmentPointForBond) {
        return this.potentialSecondAttachmentPointForBond;
      }
      return this.firstFreeAttachmentPoint;
    }
  }, {
    key: "SubChainConstructor",
    get: function get() {
      return ChemSubChain.ChemSubChain;
    }
  }, {
    key: "sideConnections",
    get: function get() {
      var _this = this;
      var sideConnections = [];
      this.forEachBond(function (polymerBond, attachmentPointName) {
        if (!(polymerBond instanceof MonomerToAtomBond.MonomerToAtomBond) && (attachmentPointName !== monomers.AttachmentPointName.R1 || !monomers$1.getSugarFromRnaBase(_this))) {
          sideConnections.push(polymerBond);
        }
      });
      return sideConnections;
    }
  }]);
  return RNABase;
}(BaseMonomer.BaseMonomer);

exports.RNABase = RNABase;
//# sourceMappingURL=RNABase.js.map
