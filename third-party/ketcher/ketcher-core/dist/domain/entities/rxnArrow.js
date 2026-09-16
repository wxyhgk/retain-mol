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
var _assertThisInitialized = require('@babel/runtime/helpers/assertThisInitialized');
var _inherits = require('@babel/runtime/helpers/inherits');
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var vec2 = require('./vec2.js');
var BaseMicromoleculeEntity = require('./BaseMicromoleculeEntity.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _possibleConstructorReturn__default = /*#__PURE__*/_interopDefaultLegacy(_possibleConstructorReturn);
var _getPrototypeOf__default = /*#__PURE__*/_interopDefaultLegacy(_getPrototypeOf);
var _assertThisInitialized__default = /*#__PURE__*/_interopDefaultLegacy(_assertThisInitialized);
var _inherits__default = /*#__PURE__*/_interopDefaultLegacy(_inherits);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);

function _callSuper(t, o, e) { return o = _getPrototypeOf__default["default"](o), _possibleConstructorReturn__default["default"](t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf__default["default"](t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
exports.RxnArrowMode = void 0;
(function (RxnArrowMode) {
  RxnArrowMode["OpenAngle"] = "open-angle";
  RxnArrowMode["FilledTriangle"] = "filled-triangle";
  RxnArrowMode["FilledBow"] = "filled-bow";
  RxnArrowMode["DashedOpenAngle"] = "dashed-open-angle";
  RxnArrowMode["Failed"] = "failed";
  RxnArrowMode["Retrosynthetic"] = "retrosynthetic";
  RxnArrowMode["BothEndsFilledTriangle"] = "both-ends-filled-triangle";
  RxnArrowMode["EquilibriumFilledTriangle"] = "equilibrium-filled-triangle";
  RxnArrowMode["EquilibriumFilledHalfBow"] = "equilibrium-filled-half-bow";
  RxnArrowMode["EquilibriumOpenAngle"] = "equilibrium-open-angle";
  RxnArrowMode["UnbalancedEquilibriumFilledHalfBow"] = "unbalanced-equilibrium-filled-half-bow";
  RxnArrowMode["UnbalancedEquilibriumOpenHalfAngle"] = "unbalanced-equilibrium-open-half-angle";
  RxnArrowMode["UnbalancedEquilibriumLargeFilledHalfBow"] = "unbalanced-equilibrium-large-filled-half-bow";
  RxnArrowMode["UnbalancedEquilibriumFilledHalfTriangle"] = "unbalanced-equilibrium-filled-half-triangle";
  RxnArrowMode["EllipticalArcFilledBow"] = "elliptical-arc-arrow-filled-bow";
  RxnArrowMode["EllipticalArcFilledTriangle"] = "elliptical-arc-arrow-filled-triangle";
  RxnArrowMode["EllipticalArcOpenAngle"] = "elliptical-arc-arrow-open-angle";
  RxnArrowMode["EllipticalArcOpenHalfAngle"] = "elliptical-arc-arrow-open-half-angle";
})(exports.RxnArrowMode || (exports.RxnArrowMode = {}));
var RxnArrow = function (_BaseMicromoleculeEnt) {
  _inherits__default["default"](RxnArrow, _BaseMicromoleculeEnt);
  function RxnArrow(attributes) {
    var _this;
    _classCallCheck__default["default"](this, RxnArrow);
    _this = _callSuper(this, RxnArrow, [attributes === null || attributes === void 0 ? void 0 : attributes.initiallySelected]);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "mode", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "pos", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "height", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "arrowId", void 0);
    _this.pos = [];
    _this.arrowId = attributes.arrowId;
    if (attributes.pos) {
      for (var i = 0; i < attributes.pos.length; i++) {
        var currentP = attributes.pos[i];
        _this.pos[i] = currentP ? new vec2.Vec2(attributes.pos[i]) : new vec2.Vec2();
      }
    }
    _this.mode = attributes.mode;
    var defaultHeight = 1;
    if (RxnArrow.isElliptical(_assertThisInitialized__default["default"](_this))) {
      var _attributes$height;
      _this.height = (_attributes$height = attributes.height) !== null && _attributes$height !== void 0 ? _attributes$height : defaultHeight;
    }
    return _this;
  }
  _createClass__default["default"](RxnArrow, [{
    key: "clone",
    value: function clone() {
      return new RxnArrow(this);
    }
  }, {
    key: "center",
    value: function center() {
      return vec2.Vec2.centre(this.pos[0], this.pos[1]);
    }
  }], [{
    key: "isElliptical",
    value: function isElliptical(arrow) {
      return [exports.RxnArrowMode.EllipticalArcFilledBow, exports.RxnArrowMode.EllipticalArcFilledTriangle, exports.RxnArrowMode.EllipticalArcOpenHalfAngle, exports.RxnArrowMode.EllipticalArcOpenAngle].includes(arrow.mode);
    }
  }]);
  return RxnArrow;
}(BaseMicromoleculeEntity.BaseMicromoleculeEntity);

exports.RxnArrow = RxnArrow;
//# sourceMappingURL=rxnArrow.js.map
