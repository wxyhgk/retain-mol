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
import _assertThisInitialized from '@babel/runtime/helpers/assertThisInitialized';
import _get from '@babel/runtime/helpers/get';
import _getPrototypeOf from '@babel/runtime/helpers/getPrototypeOf';
import _inherits from '@babel/runtime/helpers/inherits';
import _defineProperty from '@babel/runtime/helpers/defineProperty';
import { BaseRenderer } from './BaseRenderer.modern.js';
import { Coordinates } from '../../editor/shared/coordinates.modern.js';
import { provideEditorSettings } from '../../editor/editorSettings.modern.js';
import { Vec2 } from '../../../domain/entities/vec2.modern.js';
import { SELECTION_COLOR } from './constants.modern.js';

function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var RxnPlusRenderer = function (_BaseRenderer) {
  _inherits(RxnPlusRenderer, _BaseRenderer);
  function RxnPlusRenderer(rxnPlus) {
    var _this;
    _classCallCheck(this, RxnPlusRenderer);
    _this = _callSuper(this, RxnPlusRenderer, [rxnPlus]);
    _defineProperty(_assertThisInitialized(_this), "rxnPlus", void 0);
    _defineProperty(_assertThisInitialized(_this), "selectionElement", void 0);
    _this.rxnPlus = rxnPlus;
    _this.rxnPlus.setRenderer(_assertThisInitialized(_this));
    return _this;
  }
  _createClass(RxnPlusRenderer, [{
    key: "scaledPosition",
    get: function get() {
      return Coordinates.modelToCanvas(this.rxnPlus.position);
    }
  }, {
    key: "halfOfLineLength",
    get: function get() {
      var macroModeScale = provideEditorSettings().macroModeScale;
      return macroModeScale / 5;
    }
  }, {
    key: "setSelectionContourAttributes",
    value: function setSelectionContourAttributes(selectionContourElement) {
      var position = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : new Vec2(0, 0);
      var macroModeScale = provideEditorSettings().macroModeScale;
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
      this.selectionElement = (_this$canvas = this.canvas) === null || _this$canvas === void 0 ? void 0 : _this$canvas.insert('rect', ':first-child').attr('fill', SELECTION_COLOR).attr('stroke', SELECTION_COLOR).attr('class', 'dynamic-element');
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
      _get(_getPrototypeOf(RxnPlusRenderer.prototype), "remove", this).call(this);
      this.removeHover();
      this.removeSelection();
    }
  }, {
    key: "moveSelection",
    value: function moveSelection() {
    }
  }]);
  return RxnPlusRenderer;
}(BaseRenderer);

export { RxnPlusRenderer };
//# sourceMappingURL=RxnPlusRenderer.modern.js.map
