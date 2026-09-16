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
var BaseBond = require('./BaseBond.js');

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
var HydrogenBond = function (_BaseBond) {
  _inherits__default["default"](HydrogenBond, _BaseBond);
  function HydrogenBond(firstMonomer, secondMonomer) {
    var _this;
    _classCallCheck__default["default"](this, HydrogenBond);
    _this = _callSuper(this, HydrogenBond);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "firstMonomer", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "secondMonomer", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "renderer", undefined);
    _this.firstMonomer = firstMonomer;
    _this.firstMonomer = firstMonomer;
    _this.secondMonomer = secondMonomer;
    return _this;
  }
  _createClass__default["default"](HydrogenBond, [{
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
      _get__default["default"](_getPrototypeOf__default["default"](HydrogenBond.prototype), "setBaseRenderer", this).call(this, renderer);
      this.renderer = renderer;
    }
  }, {
    key: "isBackBoneChainConnection",
    get: function get() {
      return false;
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
      return true;
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
      return _get__default["default"](_getPrototypeOf__default["default"](HydrogenBond.prototype), "getAnotherEntity", this).call(this, monomer);
    }
  }, {
    key: "isHorizontal",
    get: function get() {
      return false;
    }
  }, {
    key: "isVertical",
    get: function get() {
      return false;
    }
  }]);
  return HydrogenBond;
}(BaseBond.BaseBond);

exports.HydrogenBond = HydrogenBond;
//# sourceMappingURL=HydrogenBond.js.map
