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
var DrawingEntity = require('./DrawingEntity.js');
var vec2 = require('./vec2.js');

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
exports.BondType = void 0;
(function (BondType) {
  BondType[BondType["None"] = 0] = "None";
  BondType[BondType["Single"] = 1] = "Single";
  BondType[BondType["Double"] = 2] = "Double";
  BondType[BondType["Triple"] = 3] = "Triple";
  BondType[BondType["Aromatic"] = 4] = "Aromatic";
  BondType[BondType["SingleDouble"] = 5] = "SingleDouble";
  BondType[BondType["SingleAromatic"] = 6] = "SingleAromatic";
  BondType[BondType["DoubleAromatic"] = 7] = "DoubleAromatic";
  BondType[BondType["Any"] = 8] = "Any";
  BondType[BondType["Dative"] = 9] = "Dative";
  BondType[BondType["Hydrogen"] = 10] = "Hydrogen";
})(exports.BondType || (exports.BondType = {}));
exports.BondStereo = void 0;
(function (BondStereo) {
  BondStereo[BondStereo["None"] = 0] = "None";
  BondStereo[BondStereo["Up"] = 1] = "Up";
  BondStereo[BondStereo["Either"] = 4] = "Either";
  BondStereo[BondStereo["Down"] = 6] = "Down";
  BondStereo[BondStereo["CisTrans"] = 3] = "CisTrans";
})(exports.BondStereo || (exports.BondStereo = {}));
var Bond = function (_DrawingEntity) {
  _inherits__default["default"](Bond, _DrawingEntity);
  function Bond(firstAtom, secondAtom, bondIdInMicroMode) {
    var _this;
    var type = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : exports.BondType.Single;
    var stereo = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : exports.BondStereo.None;
    var cip = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : null;
    _classCallCheck__default["default"](this, Bond);
    _this = _callSuper(this, Bond, [firstAtom.position]);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "firstAtom", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "secondAtom", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "bondIdInMicroMode", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "type", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "stereo", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "cip", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "endPosition", new vec2.Vec2());
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "renderer", undefined);
    _this.firstAtom = firstAtom;
    _this.secondAtom = secondAtom;
    _this.bondIdInMicroMode = bondIdInMicroMode;
    _this.type = type;
    _this.stereo = stereo;
    _this.cip = cip;
    _this.endPosition = secondAtom.position;
    return _this;
  }
  _createClass__default["default"](Bond, [{
    key: "setRenderer",
    value: function setRenderer(renderer) {
      _get__default["default"](_getPrototypeOf__default["default"](Bond.prototype), "setBaseRenderer", this).call(this, renderer);
      this.renderer = renderer;
    }
  }, {
    key: "startPosition",
    get: function get() {
      return this.position;
    }
  }, {
    key: "center",
    get: function get() {
      return vec2.Vec2.centre(this.startPosition, this.endPosition);
    }
  }, {
    key: "moveBondStartAbsolute",
    value: function moveBondStartAbsolute(x, y) {
      this.moveAbsolute(new vec2.Vec2(x, y));
    }
  }, {
    key: "moveBondEndAbsolute",
    value: function moveBondEndAbsolute(x, y) {
      this.endPosition = new vec2.Vec2(x, y);
    }
  }, {
    key: "moveToLinkedAtoms",
    value: function moveToLinkedAtoms() {
      var firstAtomCenter = this.firstAtom.position;
      var secondAtomCenter = this.secondAtom.position;
      this.moveBondStartAbsolute(firstAtomCenter.x, firstAtomCenter.y);
      if (secondAtomCenter) {
        this.moveBondEndAbsolute(secondAtomCenter.x, secondAtomCenter.y);
      }
    }
  }, {
    key: "moveToLinkedEntities",
    value: function moveToLinkedEntities() {
      this.moveToLinkedAtoms();
    }
  }]);
  return Bond;
}(DrawingEntity.DrawingEntity);

exports.Bond = Bond;
//# sourceMappingURL=CoreBond.js.map
