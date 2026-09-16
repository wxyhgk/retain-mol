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
var _assertThisInitialized = require('@babel/runtime/helpers/assertThisInitialized');
var _get = require('@babel/runtime/helpers/get');
var _getPrototypeOf = require('@babel/runtime/helpers/getPrototypeOf');
var _inherits = require('@babel/runtime/helpers/inherits');
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var polymerBondMonomerConnections = require('../helpers/polymerBondMonomerConnections.js');
var monomers$1 = require('../types/monomers.js');
require('../types/entities.js');
var BaseBond = require('./BaseBond.js');
require('../constants/elements.js');
require('../constants/element.types.js');
require('../constants/generics.js');
require('../constants/chains.js');
var monomers = require('../constants/monomers.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _possibleConstructorReturn__default = /*#__PURE__*/_interopDefaultLegacy(_possibleConstructorReturn);
var _assertThisInitialized__default = /*#__PURE__*/_interopDefaultLegacy(_assertThisInitialized);
var _get__default = /*#__PURE__*/_interopDefaultLegacy(_get);
var _getPrototypeOf__default = /*#__PURE__*/_interopDefaultLegacy(_getPrototypeOf);
var _inherits__default = /*#__PURE__*/_interopDefaultLegacy(_inherits);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);

function _callSuper(t, o, e) { return o = _getPrototypeOf__default["default"](o), _possibleConstructorReturn__default["default"](t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf__default["default"](t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var PolymerBond = function (_BaseBond) {
  _inherits__default["default"](PolymerBond, _BaseBond);
  function PolymerBond(firstMonomer, secondMonomer) {
    var _this;
    _classCallCheck__default["default"](this, PolymerBond);
    _this = _callSuper(this, PolymerBond);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "firstMonomer", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "secondMonomer", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "renderer", undefined);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "hasAntisenseInRow", false);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "nextRowPositionX", void 0);
    _this.firstMonomer = firstMonomer;
    _this.firstMonomer = firstMonomer;
    _this.secondMonomer = secondMonomer;
    return _this;
  }
  _createClass__default["default"](PolymerBond, [{
    key: "setFirstMonomer",
    value: function setFirstMonomer(monomer) {
      this.firstMonomer = monomer;
    }
  }, {
    key: "setSecondMonomer",
    value: function setSecondMonomer(monomer) {
      this.secondMonomer = monomer;
    }
  }, {
    key: "setRenderer",
    value: function setRenderer(renderer) {
      _get__default["default"](_getPrototypeOf__default["default"](PolymerBond.prototype), "setBaseRenderer", this).call(this, renderer);
      this.renderer = renderer;
    }
  }, {
    key: "isBackBoneChainConnection",
    get: function get() {
      return !this.isSideChainConnection;
    }
  }, {
    key: "firstMonomerAttachmentPoint",
    get: function get() {
      return this.firstMonomer.getAttachmentPointByBond(this);
    }
  }, {
    key: "secondMonomerAttachmentPoint",
    get: function get() {
      var _this$secondMonomer;
      return (_this$secondMonomer = this.secondMonomer) === null || _this$secondMonomer === void 0 ? void 0 : _this$secondMonomer.getAttachmentPointByBond(this);
    }
  }, {
    key: "isSideChainConnection",
    get: function get() {
      var firstMonomerAttachmentPoint = this.firstMonomerAttachmentPoint;
      var secondMonomerAttachmentPoint = this.secondMonomerAttachmentPoint;
      if (!firstMonomerAttachmentPoint || !secondMonomerAttachmentPoint) {
        return false;
      }
      return (!(PolymerBond.backBoneChainAttachmentPoints.includes(firstMonomerAttachmentPoint) && PolymerBond.backBoneChainAttachmentPoints.includes(secondMonomerAttachmentPoint)) || polymerBondMonomerConnections.isMonomerConnectedToR2RnaBase(this.firstMonomer) && polymerBondMonomerConnections.isRnaBaseOrAmbiguousRnaBase(this.secondMonomer) || polymerBondMonomerConnections.isMonomerConnectedToR2RnaBase(this.secondMonomer) && polymerBondMonomerConnections.isRnaBaseOrAmbiguousRnaBase(this.firstMonomer) || firstMonomerAttachmentPoint === secondMonomerAttachmentPoint) && !polymerBondMonomerConnections.isBondBetweenSugarAndBaseOfRna(this);
    }
  }, {
    key: "firstEndEntity",
    get: function get() {
      return this.firstMonomer;
    }
  }, {
    key: "secondEndEntity",
    get: function get() {
      return this.secondMonomer;
    }
  }, {
    key: "getAnotherMonomer",
    value: function getAnotherMonomer(monomer) {
      return _get__default["default"](_getPrototypeOf__default["default"](PolymerBond.prototype), "getAnotherEntity", this).call(this, monomer);
    }
  }, {
    key: "isHorizontal",
    get: function get() {
      if (!this.secondMonomer) {
        return false;
      }
      return Math.abs(this.firstMonomer.position.y - this.secondMonomer.position.y) < monomers.HalfMonomerSize;
    }
  }, {
    key: "isVertical",
    get: function get() {
      if (!this.secondMonomer) {
        return false;
      }
      return Math.abs(this.firstMonomer.position.x - this.secondMonomer.position.x) < monomers.HalfMonomerSize;
    }
  }], [{
    key: "backBoneChainAttachmentPoints",
    get: function get() {
      return [monomers$1.AttachmentPointName.R1, monomers$1.AttachmentPointName.R2];
    }
  }]);
  return PolymerBond;
}(BaseBond.BaseBond);

exports.PolymerBond = PolymerBond;
//# sourceMappingURL=PolymerBond.js.map
