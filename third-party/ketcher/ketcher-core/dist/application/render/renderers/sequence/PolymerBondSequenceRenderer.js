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
var constants = require('../constants.js');
var BaseSequenceItemRenderer = require('./BaseSequenceItemRenderer.js');
var HydrogenBond = require('../../../../domain/entities/HydrogenBond.js');

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
var PolymerBondSequenceRenderer = function (_BaseSequenceRenderer) {
  _inherits__default["default"](PolymerBondSequenceRenderer, _BaseSequenceRenderer);
  function PolymerBondSequenceRenderer(polymerBond, firstNode, secondNode) {
    var _this;
    _classCallCheck__default["default"](this, PolymerBondSequenceRenderer);
    _this = _callSuper(this, PolymerBondSequenceRenderer, [polymerBond]);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "polymerBond", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "firstNode", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "secondNode", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "selectionElement", void 0);
    _this.polymerBond = polymerBond;
    _this.firstNode = firstNode;
    _this.secondNode = secondNode;
    return _this;
  }
  _createClass__default["default"](PolymerBondSequenceRenderer, [{
    key: "isHydrogenBond",
    get: function get() {
      return this.polymerBond instanceof HydrogenBond.HydrogenBond;
    }
  }, {
    key: "firstMonomer",
    get: function get() {
      var _this$firstNode;
      return ((_this$firstNode = this.firstNode) === null || _this$firstNode === void 0 ? void 0 : _this$firstNode.monomer) || this.polymerBond.firstMonomer;
    }
  }, {
    key: "secondMonomer",
    get: function get() {
      var _this$secondNode;
      return ((_this$secondNode = this.secondNode) === null || _this$secondNode === void 0 ? void 0 : _this$secondNode.monomer) || this.polymerBond.secondMonomer;
    }
  }, {
    key: "areMonomersOnSameRow",
    get: function get() {
      var _this$secondMonomer, _this$firstMonomer$re, _this$secondMonomer2;
      assert.assert(this.firstMonomer.renderer instanceof BaseSequenceItemRenderer.BaseSequenceItemRenderer);
      assert.assert(((_this$secondMonomer = this.secondMonomer) === null || _this$secondMonomer === void 0 ? void 0 : _this$secondMonomer.renderer) instanceof BaseSequenceItemRenderer.BaseSequenceItemRenderer);
      return ((_this$firstMonomer$re = this.firstMonomer.renderer) === null || _this$firstMonomer$re === void 0 ? void 0 : _this$firstMonomer$re.scaledMonomerPositionForSequence.y) === ((_this$secondMonomer2 = this.secondMonomer) === null || _this$secondMonomer2 === void 0 || (_this$secondMonomer2 = _this$secondMonomer2.renderer) === null || _this$secondMonomer2 === void 0 ? void 0 : _this$secondMonomer2.scaledMonomerPositionForSequence.y);
    }
  }, {
    key: "scaledPosition",
    get: function get() {
      var _this$secondMonomer3;
      assert.assert(this.firstMonomer.renderer instanceof BaseSequenceItemRenderer.BaseSequenceItemRenderer);
      assert.assert(((_this$secondMonomer3 = this.secondMonomer) === null || _this$secondMonomer3 === void 0 ? void 0 : _this$secondMonomer3.renderer) instanceof BaseSequenceItemRenderer.BaseSequenceItemRenderer);
      var firstMonomerY = this.firstMonomer.renderer.scaledMonomerPositionForSequence.y;
      var firstMonomerX = this.firstMonomer.renderer.scaledMonomerPositionForSequence.x;
      var secondMonomerY = this.secondMonomer.renderer.scaledMonomerPositionForSequence.y;
      var secondMonomerX = this.secondMonomer.renderer.scaledMonomerPositionForSequence.x;
      return {
        startPosition: new vec2.Vec2(firstMonomerX, firstMonomerY),
        endPosition: new vec2.Vec2(secondMonomerX, secondMonomerY)
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
      var mainLineY1 = this.scaledPosition.startPosition.y - (this.scaledPosition.startPosition.y > this.scaledPosition.endPosition.y ? 15 : -3) + (this.areMonomersOnSameRow ? -25 : 0);
      var mainLineY2 = this.scaledPosition.endPosition.y - (this.scaledPosition.endPosition.y > this.scaledPosition.startPosition.y ? 15 : -3) + (this.areMonomersOnSameRow ? -25 : 0);
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
      (_this$rootElement = this.rootElement) === null || _this$rootElement === void 0 || _this$rootElement.append('path').attr('stroke', 'black').attr('fill', 'none').attr('d', this.getBondPath()).attr('stroke-dasharray', this.isHydrogenBond ? '2' : '0');
    }
  }, {
    key: "drawSelection",
    value: function drawSelection() {
      assert.assert(this.rootElement);
      if (this.polymerBond.selected) {
        var _this$selectionElemen, _this$rootElement2;
        (_this$selectionElemen = this.selectionElement) === null || _this$selectionElemen === void 0 || _this$selectionElemen.remove();
        this.selectionElement = (_this$rootElement2 = this.rootElement) === null || _this$rootElement2 === void 0 ? void 0 : _this$rootElement2.insert('path', ':first-child').attr('stroke', constants.SELECTION_COLOR).attr('stroke-width', '6').attr('fill', 'none');
        this.selectionElement.attr('d', this.getBondPath());
      } else {
        var _this$selectionElemen2;
        (_this$selectionElemen2 = this.selectionElement) === null || _this$selectionElemen2 === void 0 || _this$selectionElemen2.remove();
      }
    }
  }, {
    key: "getBondPath",
    value: function getBondPath() {
      var path = '';
      if (this.areMonomersOnSameRow) {
        path = "M ".concat(this.scaledPosition.startPosition.x + 6, ",\n      ").concat(this.mainLineY.mainLineY1 + 5, " \n      L ").concat(this.scaledPosition.startPosition.x + 6, ", ").concat(this.mainLineY.mainLineY1, " \n      L ").concat(this.scaledPosition.endPosition.x + 6, ", ").concat(this.mainLineY.mainLineY2, "\n      L ").concat(this.scaledPosition.endPosition.x + 6, ", ").concat(this.mainLineY.mainLineY2 + 5);
      } else {
        path = "M ".concat(this.scaledPosition.startPosition.x + 6, ", ").concat(this.mainLineY.mainLineY1, " L ").concat(this.scaledPosition.endPosition.x + 6, ", ").concat(this.mainLineY.mainLineY2);
      }
      return path;
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
  return PolymerBondSequenceRenderer;
}(BaseSequenceRenderer.BaseSequenceRenderer);

exports.PolymerBondSequenceRenderer = PolymerBondSequenceRenderer;
//# sourceMappingURL=PolymerBondSequenceRenderer.js.map
