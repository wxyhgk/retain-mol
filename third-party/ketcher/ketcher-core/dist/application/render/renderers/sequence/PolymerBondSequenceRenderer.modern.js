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
import _classCallCheck from '@babel/runtime/helpers/classCallCheck';
import _createClass from '@babel/runtime/helpers/createClass';
import _possibleConstructorReturn from '@babel/runtime/helpers/possibleConstructorReturn';
import _getPrototypeOf from '@babel/runtime/helpers/getPrototypeOf';
import _assertThisInitialized from '@babel/runtime/helpers/assertThisInitialized';
import _inherits from '@babel/runtime/helpers/inherits';
import _defineProperty from '@babel/runtime/helpers/defineProperty';
import '../../../../utilities/runAsyncAction.modern.js';
import '../../../../utilities/KetcherLogger.modern.js';
import '../../../../utilities/SettingsManager.modern.js';
import '../../../../utilities/keynorm.modern.js';
import 'react-device-detect';
import '../../../../utilities/clipboardUtils.modern.js';
import { assert } from '../../../../utilities/assert.modern.js';
import { BaseSequenceRenderer } from './BaseSequenceRenderer.modern.js';
import { Vec2 } from '../../../../domain/entities/vec2.modern.js';
import { SELECTION_COLOR } from '../constants.modern.js';
import { BaseSequenceItemRenderer } from './BaseSequenceItemRenderer.modern.js';
import { HydrogenBond } from '../../../../domain/entities/HydrogenBond.modern.js';

function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var PolymerBondSequenceRenderer = function (_BaseSequenceRenderer) {
  _inherits(PolymerBondSequenceRenderer, _BaseSequenceRenderer);
  function PolymerBondSequenceRenderer(polymerBond, firstNode, secondNode) {
    var _this;
    _classCallCheck(this, PolymerBondSequenceRenderer);
    _this = _callSuper(this, PolymerBondSequenceRenderer, [polymerBond]);
    _defineProperty(_assertThisInitialized(_this), "polymerBond", void 0);
    _defineProperty(_assertThisInitialized(_this), "firstNode", void 0);
    _defineProperty(_assertThisInitialized(_this), "secondNode", void 0);
    _defineProperty(_assertThisInitialized(_this), "selectionElement", void 0);
    _this.polymerBond = polymerBond;
    _this.firstNode = firstNode;
    _this.secondNode = secondNode;
    return _this;
  }
  _createClass(PolymerBondSequenceRenderer, [{
    key: "isHydrogenBond",
    get: function get() {
      return this.polymerBond instanceof HydrogenBond;
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
      assert(this.firstMonomer.renderer instanceof BaseSequenceItemRenderer);
      assert(((_this$secondMonomer = this.secondMonomer) === null || _this$secondMonomer === void 0 ? void 0 : _this$secondMonomer.renderer) instanceof BaseSequenceItemRenderer);
      return ((_this$firstMonomer$re = this.firstMonomer.renderer) === null || _this$firstMonomer$re === void 0 ? void 0 : _this$firstMonomer$re.scaledMonomerPositionForSequence.y) === ((_this$secondMonomer2 = this.secondMonomer) === null || _this$secondMonomer2 === void 0 || (_this$secondMonomer2 = _this$secondMonomer2.renderer) === null || _this$secondMonomer2 === void 0 ? void 0 : _this$secondMonomer2.scaledMonomerPositionForSequence.y);
    }
  }, {
    key: "scaledPosition",
    get: function get() {
      var _this$secondMonomer3;
      assert(this.firstMonomer.renderer instanceof BaseSequenceItemRenderer);
      assert(((_this$secondMonomer3 = this.secondMonomer) === null || _this$secondMonomer3 === void 0 ? void 0 : _this$secondMonomer3.renderer) instanceof BaseSequenceItemRenderer);
      var firstMonomerY = this.firstMonomer.renderer.scaledMonomerPositionForSequence.y;
      var firstMonomerX = this.firstMonomer.renderer.scaledMonomerPositionForSequence.x;
      var secondMonomerY = this.secondMonomer.renderer.scaledMonomerPositionForSequence.y;
      var secondMonomerX = this.secondMonomer.renderer.scaledMonomerPositionForSequence.x;
      return {
        startPosition: new Vec2(firstMonomerX, firstMonomerY),
        endPosition: new Vec2(secondMonomerX, secondMonomerY)
      };
    }
  }, {
    key: "center",
    get: function get() {
      return Vec2.centre(new Vec2(this.scaledPosition.startPosition.x + 6, this.mainLineY.mainLineY1), new Vec2(this.scaledPosition.startPosition.x + 6, this.mainLineY.mainLineY2));
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
      assert(this.rootElement);
      if (this.polymerBond.selected) {
        var _this$selectionElemen, _this$rootElement2;
        (_this$selectionElemen = this.selectionElement) === null || _this$selectionElemen === void 0 || _this$selectionElemen.remove();
        this.selectionElement = (_this$rootElement2 = this.rootElement) === null || _this$rootElement2 === void 0 ? void 0 : _this$rootElement2.insert('path', ':first-child').attr('stroke', SELECTION_COLOR).attr('stroke-width', '6').attr('fill', 'none');
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
}(BaseSequenceRenderer);

export { PolymerBondSequenceRenderer };
//# sourceMappingURL=PolymerBondSequenceRenderer.modern.js.map
