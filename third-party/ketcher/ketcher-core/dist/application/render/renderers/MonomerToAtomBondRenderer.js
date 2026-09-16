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
var AtomRenderer = require('./AtomRenderer.js');
var BaseRenderer = require('./BaseRenderer.js');
var scale = require('../../../domain/helpers/scale.js');
require('../../../domain/helpers/functionalGroupsProvider.js');
require('../../../domain/helpers/saltsAndSolventsProvider.js');
require('../../../domain/constants/generics.js');
require('../../../domain/helpers/attachmentPointCalculations.js');
var constants = require('./constants.js');
var box2Abs = require('../../../domain/entities/box2Abs.js');
var vec2 = require('../../../domain/entities/vec2.js');
var util = require('../util.js');

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
var MonomerToAtomBondRenderer = function (_BaseRenderer) {
  _inherits__default["default"](MonomerToAtomBondRenderer, _BaseRenderer);
  function MonomerToAtomBondRenderer(monomerToAtomBond) {
    var _this;
    _classCallCheck__default["default"](this, MonomerToAtomBondRenderer);
    _this = _callSuper(this, MonomerToAtomBondRenderer, [monomerToAtomBond]);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "monomerToAtomBond", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "selectionElement", void 0);
    _this.monomerToAtomBond = monomerToAtomBond;
    _this.monomerToAtomBond.setRenderer(_assertThisInitialized__default["default"](_this));
    return _this;
  }
  _createClass__default["default"](MonomerToAtomBondRenderer, [{
    key: "scaledPosition",
    get: function get() {
      var startPositionInPixels = scale.Scale.modelToCanvas(this.monomerToAtomBond.startPosition, this.editorSettings);
      var endPositionInPixels = scale.Scale.modelToCanvas(this.monomerToAtomBond.endPosition, this.editorSettings);
      if (this.monomerToAtomBond.atom.baseRenderer instanceof AtomRenderer.AtomRenderer && !this.monomerToAtomBond.atom.baseRenderer.isLabelVisible) {
        return {
          startPosition: startPositionInPixels,
          endPosition: endPositionInPixels
        };
      }
      var atomRenderer = this.monomerToAtomBond.atom.baseRenderer;
      var atomRootBoundingClientRect = atomRenderer.rootBoundingClientRect;
      if (atomRootBoundingClientRect) {
        var atomVisualBBox = new box2Abs.Box2Abs(new vec2.Vec2(atomRootBoundingClientRect.x - atomRenderer.scaledPosition.x, atomRootBoundingClientRect.y - atomRenderer.scaledPosition.y), new vec2.Vec2(atomRootBoundingClientRect.x - atomRenderer.scaledPosition.x + atomRootBoundingClientRect.width, atomRootBoundingClientRect.y - atomRenderer.scaledPosition.y + atomRootBoundingClientRect.height));
        var combinedVisualBBox;
        if (atomRenderer.isLabelVisible && atomRenderer.labelBoundingBox) {
          var labelBBox = atomRenderer.labelBoundingBox;
          combinedVisualBBox = new box2Abs.Box2Abs(new vec2.Vec2(labelBBox.x, labelBBox.y), new vec2.Vec2(labelBBox.x + labelBBox.width, labelBBox.y + labelBBox.height));
        } else {
          combinedVisualBBox = new box2Abs.Box2Abs(new vec2.Vec2(atomVisualBBox.p0.x, atomVisualBBox.p0.y), new vec2.Vec2(atomVisualBBox.p1.x, atomVisualBBox.p1.y));
        }
        var directionX = endPositionInPixels.x - startPositionInPixels.x;
        var directionY = endPositionInPixels.y - startPositionInPixels.y;
        var distance = Math.sqrt(directionX * directionX + directionY * directionY);
        var normalizedDirectionX = directionX / distance;
        var normalizedDirectionY = directionY / distance;
        var bondDirection = new vec2.Vec2(normalizedDirectionX, normalizedDirectionY);
        var rayDirection = bondDirection.negated();
        var shift = util["default"].shiftRayBox(new vec2.Vec2(0, 0), rayDirection, combinedVisualBBox);
        endPositionInPixels.x = endPositionInPixels.x + rayDirection.x * (shift + 6);
        endPositionInPixels.y = endPositionInPixels.y + rayDirection.y * (shift + 6);
      }
      return {
        startPosition: startPositionInPixels,
        endPosition: endPositionInPixels
      };
    }
  }, {
    key: "show",
    value: function show() {
      var _this2 = this,
        _this$monomerToAtomBo,
        _this$rootElement;
      var atomRenderer = this.monomerToAtomBond.atom.baseRenderer;
      if (!(atomRenderer !== null && atomRenderer !== void 0 && atomRenderer.rootBoundingClientRect)) {
        setTimeout(function () {
          if (_this2.monomerToAtomBond.renderer === _this2) {
            _this2.show();
          }
        }, 10);
        return;
      }
      this.rootElement = this.rootElement || this.canvas.insert('g', ".monomer").data([this]).attr('data-testid', 'bond').attr('data-bondtype', 'covalent').attr('data-bondid', this.monomerToAtomBond.id).attr('data-frommonomerid', this.monomerToAtomBond.monomer.id).attr('data-toatomid', this.monomerToAtomBond.atom.id).attr('data-fromconnectionpoint', (_this$monomerToAtomBo = this.monomerToAtomBond.monomer.getAttachmentPointByBond(this.monomerToAtomBond)) !== null && _this$monomerToAtomBo !== void 0 ? _this$monomerToAtomBo : '').attr('transform', "translate(".concat(this.scaledPosition.startPosition.x, ", ").concat(this.scaledPosition.startPosition.y, ")"));
      (_this$rootElement = this.rootElement) === null || _this$rootElement === void 0 || _this$rootElement.append('line').attr('x1', 0).attr('y1', 0).attr('x2', this.scaledPosition.endPosition.x - this.scaledPosition.startPosition.x).attr('y2', this.scaledPosition.endPosition.y - this.scaledPosition.startPosition.y).attr('stroke', '#000').attr('stroke-width', this.editorSettings.microModeScale / 20);
      this.appendHover();
    }
  }, {
    key: "appendHover",
    value: function appendHover() {
      var _this$rootElement2;
      (_this$rootElement2 = this.rootElement) === null || _this$rootElement2 === void 0 || _this$rootElement2.append('line').attr('x1', 0).attr('y1', 0).attr('x2', this.scaledPosition.endPosition.x - this.scaledPosition.startPosition.x).attr('y2', this.scaledPosition.endPosition.y - this.scaledPosition.startPosition.y).attr('stroke', 'transparent').attr('stroke-width', 10);
    }
  }, {
    key: "appendHoverAreaElement",
    value: function appendHoverAreaElement() {
    }
  }, {
    key: "drawSelection",
    value: function drawSelection() {
      if (!this.rootElement) {
        return;
      }
      if (this.monomerToAtomBond.selected) {
        this.appendSelection();
      } else {
        this.removeSelection();
      }
    }
  }, {
    key: "appendSelection",
    value: function appendSelection() {
      var _this$rootElement3;
      this.selectionElement = (_this$rootElement3 = this.rootElement) === null || _this$rootElement3 === void 0 ? void 0 : _this$rootElement3.insert('line', ':first-child').attr('x1', 0).attr('y1', 0).attr('x2', this.scaledPosition.endPosition.x - this.scaledPosition.startPosition.x).attr('y2', this.scaledPosition.endPosition.y - this.scaledPosition.startPosition.y).attr('stroke', constants.SELECTION_COLOR).attr('stroke-width', 10);
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
    key: "moveSelection",
    value: function moveSelection() {
    }
  }]);
  return MonomerToAtomBondRenderer;
}(BaseRenderer.BaseRenderer);

exports.MonomerToAtomBondRenderer = MonomerToAtomBondRenderer;
//# sourceMappingURL=MonomerToAtomBondRenderer.js.map
