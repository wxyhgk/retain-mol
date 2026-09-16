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
var multitailArrow = require('./multitailArrow.js');
var fixedPrecision = require('./fixedPrecision.js');
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
var MultitailArrow = function (_DrawingEntity) {
  _inherits__default["default"](MultitailArrow, _DrawingEntity);
  function MultitailArrow(spineTopX, spineTopY, height, headOffsetX, headOffsetY, tailLength, tailsYOffset) {
    var _this;
    _classCallCheck__default["default"](this, MultitailArrow);
    _this = _callSuper(this, MultitailArrow);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "spineTopX", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "spineTopY", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "height", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "headOffsetX", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "headOffsetY", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "tailLength", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "tailsYOffset", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "renderer", undefined);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "arrowId", void 0);
    _this.spineTopX = spineTopX;
    _this.spineTopY = spineTopY;
    _this.height = height;
    _this.headOffsetX = headOffsetX;
    _this.headOffsetY = headOffsetY;
    _this.tailLength = tailLength;
    _this.tailsYOffset = tailsYOffset;
    return _this;
  }
  _createClass__default["default"](MultitailArrow, [{
    key: "center",
    get: function get() {
      return vec2.Vec2.centre(new vec2.Vec2(this.spineTopX.sub(this.tailLength).getFloatingPrecision(), this.spineTopY.getFloatingPrecision()), new vec2.Vec2(this.spineTopX.add(this.headOffsetX).getFloatingPrecision(), this.spineTopY.add(this.height).getFloatingPrecision()));
    }
  }, {
    key: "setRenderer",
    value: function setRenderer(renderer) {
      _get__default["default"](_getPrototypeOf__default["default"](MultitailArrow.prototype), "setBaseRenderer", this).call(this, renderer);
      this.renderer = renderer;
    }
  }, {
    key: "moveRelative",
    value: function moveRelative(delta) {
      this.spineTopX = this.spineTopX.add(fixedPrecision.FixedPrecisionCoordinates.fromFloatingPrecision(delta.x));
      this.spineTopY = this.spineTopY.add(fixedPrecision.FixedPrecisionCoordinates.fromFloatingPrecision(delta.y));
    }
  }, {
    key: "moveAbsolute",
    value: function moveAbsolute(position) {
      var delta = vec2.Vec2.diff(position, new vec2.Vec2(this.spineTopX.value, this.spineTopY.value));
      this.moveRelative(delta);
    }
  }, {
    key: "toKetNode",
    value: function toKetNode() {
      return multitailArrow.MultitailArrow.getParametersForKetNode(this.spineTopX, this.spineTopY, this.headOffsetX, this.headOffsetY, this.tailLength, this.tailsYOffset, this.height, this.center, false);
    }
  }, {
    key: "getReferencePositions",
    value: function getReferencePositions() {
      return multitailArrow.MultitailArrow.getReferencePositions(this.spineTopX, this.spineTopY, this.height, this.headOffsetX, this.headOffsetY, this.tailLength, this.tailsYOffset);
    }
  }], [{
    key: "fromKet",
    value: function fromKet(multitailArrowKetNode) {
      var _MicromoleculeMultita = multitailArrow.MultitailArrow.getConstructorParamsFromKetNode(multitailArrowKetNode),
        spineTopX = _MicromoleculeMultita.spineTopX,
        spineTopY = _MicromoleculeMultita.spineTopY,
        height = _MicromoleculeMultita.height,
        headOffsetX = _MicromoleculeMultita.headOffsetX,
        headOffsetY = _MicromoleculeMultita.headOffsetY,
        tailsLength = _MicromoleculeMultita.tailsLength,
        tailsYOffset = _MicromoleculeMultita.tailsYOffset;
      return new MultitailArrow(spineTopX, spineTopY, height, headOffsetX, headOffsetY, tailsLength, tailsYOffset);
    }
  }]);
  return MultitailArrow;
}(DrawingEntity.DrawingEntity);

exports.MultitailArrow = MultitailArrow;
//# sourceMappingURL=CoreMultitailArrow.js.map
