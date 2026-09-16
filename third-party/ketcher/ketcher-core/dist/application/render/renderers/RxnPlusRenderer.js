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
var BaseRenderer = require('./BaseRenderer.js');
var coordinates = require('../../editor/shared/coordinates.js');
var editorSettings = require('../../editor/editorSettings.js');
var vec2 = require('../../../domain/entities/vec2.js');
var constants = require('./constants.js');

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
var RxnPlusRenderer = function (_BaseRenderer) {
  _inherits__default["default"](RxnPlusRenderer, _BaseRenderer);
  function RxnPlusRenderer(rxnPlus) {
    var _this;
    _classCallCheck__default["default"](this, RxnPlusRenderer);
    _this = _callSuper(this, RxnPlusRenderer, [rxnPlus]);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "rxnPlus", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "selectionElement", void 0);
    _this.rxnPlus = rxnPlus;
    _this.rxnPlus.setRenderer(_assertThisInitialized__default["default"](_this));
    return _this;
  }
  _createClass__default["default"](RxnPlusRenderer, [{
    key: "scaledPosition",
    get: function get() {
      return coordinates.Coordinates.modelToCanvas(this.rxnPlus.position);
    }
  }, {
    key: "halfOfLineLength",
    get: function get() {
      var macroModeScale = editorSettings.provideEditorSettings().macroModeScale;
      return macroModeScale / 5;
    }
  }, {
    key: "setSelectionContourAttributes",
    value: function setSelectionContourAttributes(selectionContourElement) {
      var position = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : new vec2.Vec2(0, 0);
      var macroModeScale = editorSettings.provideEditorSettings().macroModeScale;
      return selectionContourElement.attr('x', position.x - macroModeScale / 4).attr('y', position.y - macroModeScale / 4).attr('width', macroModeScale / 2).attr('height', macroModeScale / 2).attr('rx', macroModeScale / 8);
    }
  }, {
    key: "show",
    value: function show() {
      this.rootElement = this.canvas.insert('g', ".monomer").data([this]).attr('data-testid', 'rxn-plus').attr('transform', "translate(".concat(this.scaledPosition.x, ", ").concat(this.scaledPosition.y, ")"));
      var halfOfLineLength = this.halfOfLineLength;
      var pathDAttr = "M0,".concat(-halfOfLineLength, "L0,").concat(halfOfLineLength, "M").concat(-halfOfLineLength, ",0L").concat(halfOfLineLength, ",0");
      this.rootElement.append('path').attr('d', pathDAttr).attr('fill', 'none').attr('stroke', '#000').attr('stroke-width', 2);
      this.appendHoverAreaElement();
      this.drawSelection();
    }
  }, {
    key: "appendHover",
    value: function appendHover() {
      if (!this.rootElement) {
        return;
      }
      this.hoverElement = this.rootElement.insert('rect', ':first-child').attr('fill', 'none').attr('stroke', '#0097A8').attr('stroke-width', 1.2).attr('class', 'dynamic-element');
      this.setSelectionContourAttributes(this.hoverElement);
    }
  }, {
    key: "appendHoverAreaElement",
    value: function appendHoverAreaElement() {
      var _this$hoverAreaElemen,
        _this2 = this;
      if (!this.rootElement) {
        return;
      }
      this.hoverAreaElement = this.rootElement.append('rect').attr('fill', 'none').attr('stroke', 'none').attr('pointer-events', 'all').attr('class', 'dynamic-element');
      this.setSelectionContourAttributes(this.hoverAreaElement);
      (_this$hoverAreaElemen = this.hoverAreaElement) === null || _this$hoverAreaElemen === void 0 || _this$hoverAreaElemen.on('mouseover', function () {
        _this2.appendHover();
      }).on('mouseout', function () {
        _this2.removeHover();
      });
    }
  }, {
    key: "drawSelection",
    value: function drawSelection() {
      if (!this.rootElement) {
        return;
      }
      if (this.rxnPlus.selected) {
        this.appendSelection();
      } else {
        this.removeSelection();
      }
    }
  }, {
    key: "appendSelection",
    value: function appendSelection() {
      var _this$canvas;
      if (!this.rootElement) {
        return;
      }
      this.selectionElement = (_this$canvas = this.canvas) === null || _this$canvas === void 0 ? void 0 : _this$canvas.insert('rect', ':first-child').attr('fill', constants.SELECTION_COLOR).attr('stroke', constants.SELECTION_COLOR).attr('class', 'dynamic-element');
      this.setSelectionContourAttributes(this.selectionElement, this.scaledPosition);
    }
  }, {
    key: "removeSelection",
    value: function removeSelection() {
      var _this$selectionElemen;
      (_this$selectionElemen = this.selectionElement) === null || _this$selectionElemen === void 0 || _this$selectionElemen.remove();
      this.selectionElement = undefined;
    }
  }, {
    key: "move",
    value: function move() {
      if (!this.rootElement) {
        return;
      }
      this.remove();
      this.show();
    }
  }, {
    key: "removeHover",
    value: function removeHover() {
      var _this$hoverElement;
      (_this$hoverElement = this.hoverElement) === null || _this$hoverElement === void 0 || _this$hoverElement.remove();
      this.hoverElement = undefined;
    }
  }, {
    key: "remove",
    value: function remove() {
      _get__default["default"](_getPrototypeOf__default["default"](RxnPlusRenderer.prototype), "remove", this).call(this);
      this.removeHover();
      this.removeSelection();
    }
  }, {
    key: "moveSelection",
    value: function moveSelection() {
    }
  }]);
  return RxnPlusRenderer;
}(BaseRenderer.BaseRenderer);

exports.RxnPlusRenderer = RxnPlusRenderer;
//# sourceMappingURL=RxnPlusRenderer.js.map
