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
import { BaseSequenceItemRenderer } from './BaseSequenceItemRenderer.modern.js';

function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var MonomerToAtomBondSequenceRenderer = function (_BaseSequenceRenderer) {
  _inherits(MonomerToAtomBondSequenceRenderer, _BaseSequenceRenderer);
  function MonomerToAtomBondSequenceRenderer(monomerToAtomBond, monomerNode) {
    var _this;
    _classCallCheck(this, MonomerToAtomBondSequenceRenderer);
    _this = _callSuper(this, MonomerToAtomBondSequenceRenderer, [monomerToAtomBond]);
    _defineProperty(_assertThisInitialized(_this), "monomerToAtomBond", void 0);
    _defineProperty(_assertThisInitialized(_this), "monomerNode", void 0);
    _this.monomerToAtomBond = monomerToAtomBond;
    _this.monomerNode = monomerNode;
    _this.monomerToAtomBond.setRenderer(_assertThisInitialized(_this));
    return _this;
  }
  _createClass(MonomerToAtomBondSequenceRenderer, [{
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
      assert(this.monomer.renderer instanceof BaseSequenceItemRenderer);
      var monomerY = this.monomer.renderer.scaledMonomerPositionForSequence.y;
      var monomerX = this.monomer.renderer.scaledMonomerPositionForSequence.x;
      var atomY = (_this$atom$renderer = this.atom.renderer) === null || _this$atom$renderer === void 0 ? void 0 : _this$atom$renderer.center.y;
      var atomX = (_this$atom$renderer2 = this.atom.renderer) === null || _this$atom$renderer2 === void 0 ? void 0 : _this$atom$renderer2.center.x;
      return {
        startPosition: new Vec2(monomerX, monomerY),
        endPosition: new Vec2(atomX, atomY)
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
}(BaseSequenceRenderer);

export { MonomerToAtomBondSequenceRenderer };
//# sourceMappingURL=MonomerToAtomBondSequenceRenderer.modern.js.map
