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
require('../../../../utilities/runAsyncAction.js');
require('../../../../utilities/KetcherLogger.js');
require('../../../../utilities/SettingsManager.js');
require('../../../../utilities/keynorm.js');
require('react-device-detect');
require('../../../../utilities/clipboardUtils.js');
var assert = require('../../../../utilities/assert.js');
var BaseSequenceRenderer = require('./BaseSequenceRenderer.js');
var vec2 = require('../../../../domain/entities/vec2.js');
var BaseSequenceItemRenderer = require('./BaseSequenceItemRenderer.js');

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
var MonomerToAtomBondSequenceRenderer = function (_BaseSequenceRenderer) {
  _inherits__default["default"](MonomerToAtomBondSequenceRenderer, _BaseSequenceRenderer);
  function MonomerToAtomBondSequenceRenderer(monomerToAtomBond, monomerNode) {
    var _this;
    _classCallCheck__default["default"](this, MonomerToAtomBondSequenceRenderer);
    _this = _callSuper(this, MonomerToAtomBondSequenceRenderer, [monomerToAtomBond]);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "monomerToAtomBond", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "monomerNode", void 0);
    _this.monomerToAtomBond = monomerToAtomBond;
    _this.monomerNode = monomerNode;
    _this.monomerToAtomBond.setRenderer(_assertThisInitialized__default["default"](_this));
    return _this;
  }
  _createClass__default["default"](MonomerToAtomBondSequenceRenderer, [{
    key: "monomer",
    get: function get() {
      return this.monomerNode.monomer;
    }
  }, {
    key: "atom",
    get: function get() {
      return this.monomerToAtomBond.atom;
    }
  }, {
    key: "scaledPosition",
    get: function get() {
      var _this$atom$renderer, _this$atom$renderer2;
      assert.assert(this.monomer.renderer instanceof BaseSequenceItemRenderer.BaseSequenceItemRenderer);
      var monomerY = this.monomer.renderer.scaledMonomerPositionForSequence.y;
      var monomerX = this.monomer.renderer.scaledMonomerPositionForSequence.x;
      var atomY = (_this$atom$renderer = this.atom.renderer) === null || _this$atom$renderer === void 0 ? void 0 : _this$atom$renderer.center.y;
      var atomX = (_this$atom$renderer2 = this.atom.renderer) === null || _this$atom$renderer2 === void 0 ? void 0 : _this$atom$renderer2.center.x;
      return {
        startPosition: new vec2.Vec2(monomerX, monomerY),
        endPosition: new vec2.Vec2(atomX, atomY)
      };
    }
  }, {
    key: "center",
    get: function get() {
      return vec2.Vec2.centre(new vec2.Vec2(this.scaledPosition.startPosition.x + 6, this.mainLineY.mainLineY1), new vec2.Vec2(this.scaledPosition.startPosition.x + 6, this.mainLineY.mainLineY2));
    }
  }, {
    key: "mainLineY",
    get: function get() {
      var mainLineY1 = this.scaledPosition.startPosition.y - (this.scaledPosition.startPosition.y > this.scaledPosition.endPosition.y ? 15 : -3);
      var mainLineY2 = this.scaledPosition.endPosition.y;
      return {
        mainLineY1: mainLineY1,
        mainLineY2: mainLineY2
      };
    }
  }, {
    key: "show",
    value: function show() {
      var _this$rootElement;
      this.rootElement = this.canvas.insert('g', ":first-child").data([this]);
      (_this$rootElement = this.rootElement) === null || _this$rootElement === void 0 || _this$rootElement.append('path').attr('stroke', 'black').attr('fill', 'none').attr('d', this.getBondPath());
    }
  }, {
    key: "getBondPath",
    value: function getBondPath() {
      return "M ".concat(this.scaledPosition.startPosition.x + 6, ", ").concat(this.mainLineY.mainLineY1, " L ").concat(this.scaledPosition.endPosition.x, ", ").concat(this.mainLineY.mainLineY2);
    }
  }, {
    key: "moveStart",
    value: function moveStart() {
    }
  }, {
    key: "moveEnd",
    value: function moveEnd() {
    }
  }, {
    key: "isSnake",
    get: function get() {
      return false;
    }
  }, {
    key: "isMonomersOnSameHorizontalLine",
    value: function isMonomersOnSameHorizontalLine() {
      return false;
    }
  }]);
  return MonomerToAtomBondSequenceRenderer;
}(BaseSequenceRenderer.BaseSequenceRenderer);

exports.MonomerToAtomBondSequenceRenderer = MonomerToAtomBondSequenceRenderer;
//# sourceMappingURL=MonomerToAtomBondSequenceRenderer.js.map
