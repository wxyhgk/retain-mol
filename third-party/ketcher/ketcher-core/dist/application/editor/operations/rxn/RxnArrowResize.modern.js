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
import _slicedToArray from '@babel/runtime/helpers/slicedToArray';
import _classCallCheck from '@babel/runtime/helpers/classCallCheck';
import _createClass from '@babel/runtime/helpers/createClass';
import _possibleConstructorReturn from '@babel/runtime/helpers/possibleConstructorReturn';
import _getPrototypeOf from '@babel/runtime/helpers/getPrototypeOf';
import _assertThisInitialized from '@babel/runtime/helpers/assertThisInitialized';
import _inherits from '@babel/runtime/helpers/inherits';
import _defineProperty from '@babel/runtime/helpers/defineProperty';
import { RxnArrow } from '../../../../domain/entities/rxnArrow.modern.js';
import { Vec2 } from '../../../../domain/entities/vec2.modern.js';
import { Scale } from '../../../../domain/helpers/scale.modern.js';
import '../../../../domain/helpers/functionalGroupsProvider.modern.js';
import '../../../../domain/helpers/saltsAndSolventsProvider.modern.js';
import '../../../../domain/constants/generics.modern.js';
import '../../../../domain/helpers/attachmentPointCalculations.modern.js';
import { toFixed } from '../../../../utilities/toFixed.modern.js';
import '../../../../utilities/runAsyncAction.modern.js';
import '../../../../utilities/KetcherLogger.modern.js';
import '../../../../utilities/SettingsManager.modern.js';
import '../../../../utilities/keynorm.modern.js';
import 'react-device-detect';
import '../../../../utilities/clipboardUtils.modern.js';
import { assert } from '../../../../utilities/assert.modern.js';
import { OperationType } from '../OperationType.modern.js';
import { BaseOperation } from '../BaseOperation.modern.js';

function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var ARROW_MAX_SNAPPING_ANGLE = Math.PI / 36;
var RxnArrowResize = function (_Base) {
  _inherits(RxnArrowResize, _Base);
  function RxnArrowResize(id, d, current, anchor, noinvalidate, isSnappingEnabled) {
    var _this;
    _classCallCheck(this, RxnArrowResize);
    _this = _callSuper(this, RxnArrowResize, [OperationType.RXN_ARROW_RESIZE]);
    _defineProperty(_assertThisInitialized(_this), "data", void 0);
    _defineProperty(_assertThisInitialized(_this), "isSnappingEnabled", void 0);
    _this.data = {
      id: id,
      d: d,
      current: current,
      anchor: anchor,
      noinvalidate: noinvalidate
    };
    _this.isSnappingEnabled = isSnappingEnabled;
    return _this;
  }
  _createClass(RxnArrowResize, [{
    key: "execute",
    value: function execute(restruct) {
      var struct = restruct.molecule;
      var id = this.data.id;
      var d = this.data.d;
      var current = this.data.current;
      var item = struct.rxnArrows.get(id);
      var reItem = restruct.rxnArrows.get(id);
      assert(item != null && reItem != null);
      var anchor = this.data.anchor;
      if (anchor) {
        var previousPos0 = item.pos[0].get_xy0();
        var previousPos1 = item.pos[1].get_xy0();
        var middlePoint;
        if (RxnArrow.isElliptical(item)) {
          var _reItem$getReferenceP = reItem.getReferencePoints();
          var _reItem$getReferenceP2 = _slicedToArray(_reItem$getReferenceP, 3);
          middlePoint = _reItem$getReferenceP2[2];
        }
        if (
        toFixed(anchor.x) === toFixed(item.pos[1].x) && toFixed(anchor.y) === toFixed(item.pos[1].y)) {
          if (this.isSnappingEnabled) {
            var currentArrowVector = current.sub(item.pos[0]);
            var snappedArrowVector = getSnappedArrowVector(currentArrowVector);
            var snappedCurrent = item.pos[0].add(snappedArrowVector);
            current.x = snappedCurrent.x;
            current.y = snappedCurrent.y;
          }
          item.pos[1].x = anchor.x = current.x;
          current.x = previousPos1.x;
          item.pos[1].y = anchor.y = current.y;
          current.y = previousPos1.y;
        }
        if (
        toFixed(anchor.x) === toFixed(item.pos[0].x) && toFixed(anchor.y) === toFixed(item.pos[0].y)) {
          if (this.isSnappingEnabled) {
            var _currentArrowVector = current.sub(item.pos[1]);
            var _snappedArrowVector = getSnappedArrowVector(_currentArrowVector);
            var _snappedCurrent = item.pos[1].add(_snappedArrowVector);
            current.x = _snappedCurrent.x;
            current.y = _snappedCurrent.y;
          }
          item.pos[0].x = anchor.x = current.x;
          current.x = previousPos0.x;
          item.pos[0].y = anchor.y = current.y;
          current.y = previousPos0.y;
        }
        if (middlePoint && toFixed(anchor.x) === toFixed(middlePoint.x) && toFixed(anchor.y) === toFixed(middlePoint.y)) {
          var _reItem$getArrowParam = reItem.getArrowParams(item.pos[0].x, item.pos[0].y, item.pos[1].x, item.pos[1].y),
            angle = _reItem$getArrowParam.angle;
          var angleInRadians = angle * Math.PI / 180;
          var cosAngle = Math.cos(angleInRadians);
          var sinAngle = Math.sin(angleInRadians);
          var diffX = current.x - anchor.x;
          var diffY = current.y - anchor.y;
          var diff = diffY * cosAngle - diffX * sinAngle;
          if (item.height !== undefined) {
            item.height -= diff;
          }
          var _reItem$getReferenceP3 = reItem.getReferencePoints(),
            _reItem$getReferenceP4 = _slicedToArray(_reItem$getReferenceP3, 3),
            newMiddlePoint = _reItem$getReferenceP4[2];
          anchor.y = newMiddlePoint.y;
          anchor.x = newMiddlePoint.x;
        }
      } else {
        if (this.isSnappingEnabled) {
          d = getSnappedArrowVector(d);
        }
        item.pos[1].add_(d);
      }
      reItem.visel.translate(Scale.modelToCanvas(d, restruct.render.options));
      this.data.d = d.negated();
      if (!this.data.noinvalidate) {
        BaseOperation.invalidateItem(restruct, 'rxnArrows', id, 1);
      }
    }
  }, {
    key: "invert",
    value: function invert() {
      return new RxnArrowResize(this.data.id, this.data.d, this.data.current, this.data.anchor, this.data.noinvalidate, this.isSnappingEnabled);
    }
  }, {
    key: "isDummy",
    value: function isDummy() {
      var d = this.data.d;
      return d.x === 0 && d.y === 0;
    }
  }]);
  return RxnArrowResize;
}(BaseOperation);
function getSnappedArrowVector(arrow) {
  var AXIS = {
    POSITIVE_X: 0,
    POSITIVE_Y: Math.PI / 2,
    NEGATIVE_X: [Math.PI, -Math.PI],
    NEGATIVE_Y: -Math.PI / 2
  };
  var oxAngle = arrow.oxAngle();
  var arrowLength = arrow.length();
  var isSnappingToPositiveXAxis = Math.abs(oxAngle - AXIS.POSITIVE_X) <= ARROW_MAX_SNAPPING_ANGLE;
  if (isSnappingToPositiveXAxis) {
    return new Vec2(arrowLength, 0);
  }
  var isSnappingToPositiveYAxis = Math.abs(oxAngle - AXIS.POSITIVE_Y) <= ARROW_MAX_SNAPPING_ANGLE;
  if (isSnappingToPositiveYAxis) {
    return new Vec2(0, arrowLength);
  }
  var isSnappingToNegativeXAxis = Math.abs(oxAngle - AXIS.NEGATIVE_X[0]) <= ARROW_MAX_SNAPPING_ANGLE || Math.abs(oxAngle - AXIS.NEGATIVE_X[1]) <= ARROW_MAX_SNAPPING_ANGLE;
  if (isSnappingToNegativeXAxis) {
    return new Vec2(-arrowLength, 0);
  }
  var isSnappingToNegativeYAxis = Math.abs(oxAngle - AXIS.NEGATIVE_Y) <= ARROW_MAX_SNAPPING_ANGLE;
  if (isSnappingToNegativeYAxis) {
    return new Vec2(0, -arrowLength);
  }
  return arrow;
}

export { ARROW_MAX_SNAPPING_ANGLE, RxnArrowResize, getSnappedArrowVector };
//# sourceMappingURL=RxnArrowResize.modern.js.map
