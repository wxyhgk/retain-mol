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
import { AtomRenderer } from './AtomRenderer.modern.js';
import { BaseRenderer } from './BaseRenderer.modern.js';
import { Scale } from '../../../domain/helpers/scale.modern.js';
import '../../../domain/helpers/functionalGroupsProvider.modern.js';
import '../../../domain/helpers/saltsAndSolventsProvider.modern.js';
import '../../../domain/constants/generics.modern.js';
import '../../../domain/helpers/attachmentPointCalculations.modern.js';
import { SELECTION_COLOR } from './constants.modern.js';
import { Box2Abs } from '../../../domain/entities/box2Abs.modern.js';
import { Vec2 } from '../../../domain/entities/vec2.modern.js';
import util from '../util.modern.js';

function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var MonomerToAtomBondRenderer = function (_BaseRenderer) {
  _inherits(MonomerToAtomBondRenderer, _BaseRenderer);
  function MonomerToAtomBondRenderer(monomerToAtomBond) {
    var _this;
    _classCallCheck(this, MonomerToAtomBondRenderer);
    _this = _callSuper(this, MonomerToAtomBondRenderer, [monomerToAtomBond]);
    _defineProperty(_assertThisInitialized(_this), "monomerToAtomBond", void 0);
    _defineProperty(_assertThisInitialized(_this), "selectionElement", void 0);
    _this.monomerToAtomBond = monomerToAtomBond;
    _this.monomerToAtomBond.setRenderer(_assertThisInitialized(_this));
    return _this;
  }
  _createClass(MonomerToAtomBondRenderer, [{
    key: "scaledPosition",
    get: function get() {
      var startPositionInPixels = Scale.modelToCanvas(this.monomerToAtomBond.startPosition, this.editorSettings);
      var endPositionInPixels = Scale.modelToCanvas(this.monomerToAtomBond.endPosition, this.editorSettings);
      if (this.monomerToAtomBond.atom.baseRenderer instanceof AtomRenderer && !this.monomerToAtomBond.atom.baseRenderer.isLabelVisible) {
        return {
          startPosition: startPositionInPixels,
          endPosition: endPositionInPixels
        };
      }
      var atomRenderer = this.monomerToAtomBond.atom.baseRenderer;
      var atomRootBoundingClientRect = atomRenderer.rootBoundingClientRect;
      if (atomRootBoundingClientRect) {
        var atomVisualBBox = new Box2Abs(new Vec2(atomRootBoundingClientRect.x - atomRenderer.scaledPosition.x, atomRootBoundingClientRect.y - atomRenderer.scaledPosition.y), new Vec2(atomRootBoundingClientRect.x - atomRenderer.scaledPosition.x + atomRootBoundingClientRect.width, atomRootBoundingClientRect.y - atomRenderer.scaledPosition.y + atomRootBoundingClientRect.height));
        var combinedVisualBBox;
        if (atomRenderer.isLabelVisible && atomRenderer.labelBoundingBox) {
          var labelBBox = atomRenderer.labelBoundingBox;
          combinedVisualBBox = new Box2Abs(new Vec2(labelBBox.x, labelBBox.y), new Vec2(labelBBox.x + labelBBox.width, labelBBox.y + labelBBox.height));
        } else {
          combinedVisualBBox = new Box2Abs(new Vec2(atomVisualBBox.p0.x, atomVisualBBox.p0.y), new Vec2(atomVisualBBox.p1.x, atomVisualBBox.p1.y));
        }
        var directionX = endPositionInPixels.x - startPositionInPixels.x;
        var directionY = endPositionInPixels.y - startPositionInPixels.y;
        var distance = Math.sqrt(directionX * directionX + directionY * directionY);
        var normalizedDirectionX = directionX / distance;
        var normalizedDirectionY = directionY / distance;
        var bondDirection = new Vec2(normalizedDirectionX, normalizedDirectionY);
        var rayDirection = bondDirection.negated();
        var shift = util.shiftRayBox(new Vec2(0, 0), rayDirection, combinedVisualBBox);
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
      this.selectionElement = (_this$rootElement3 = this.rootElement) === null || _this$rootElement3 === void 0 ? void 0 : _this$rootElement3.insert('line', ':first-child').attr('x1', 0).attr('y1', 0).attr('x2', this.scaledPosition.endPosition.x - this.scaledPosition.startPosition.x).attr('y2', this.scaledPosition.endPosition.y - this.scaledPosition.startPosition.y).attr('stroke', SELECTION_COLOR).attr('stroke-width', 10);
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
}(BaseRenderer);

export { MonomerToAtomBondRenderer };
//# sourceMappingURL=MonomerToAtomBondRenderer.modern.js.map
