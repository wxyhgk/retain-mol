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
import utils from '../../shared/utils.modern.js';
import { OperationType } from '../OperationType.modern.js';
import { BaseOperation } from '../BaseOperation.modern.js';

function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var RxnArrowRotate = function (_Base) {
  _inherits(RxnArrowRotate, _Base);
  function RxnArrowRotate(id, angle, center, noinvalidate) {
    var _this;
    _classCallCheck(this, RxnArrowRotate);
    _this = _callSuper(this, RxnArrowRotate, [OperationType.RXN_ARROW_ROTATE]);
    _defineProperty(_assertThisInitialized(_this), "data", void 0);
    _this.data = {
      id: id,
      angle: angle,
      center: center,
      noinvalidate: noinvalidate
    };
    return _this;
  }
  _createClass(RxnArrowRotate, [{
    key: "execute",
    value: function execute(reStruct) {
      var _this2 = this,
        _reStruct$rxnArrows$g;
      var degree = utils.degrees(this.data.angle);
      var arrowId = this.data.id;
      var arrow = reStruct.molecule.rxnArrows.get(arrowId);
      if (arrow) {
        arrow.pos = arrow.pos.map(function (p) {
          return p.rotateAroundOrigin(degree, _this2.data.center);
        });
      }
      var options = reStruct.render.options;
      var drawingCenter = this.data.center.scaled(options.microModeScale).add(options.offset);
      (_reStruct$rxnArrows$g = reStruct.rxnArrows.get(arrowId)) === null || _reStruct$rxnArrows$g === void 0 || _reStruct$rxnArrows$g.visel.rotate(degree, drawingCenter);
      if (!this.data.noinvalidate) {
        BaseOperation.invalidateItem(reStruct, 'rxnArrows', arrowId, 1);
      }
    }
  }, {
    key: "invert",
    value: function invert() {
      var move = new RxnArrowRotate(this.data.id, -this.data.angle, this.data.center, this.data.noinvalidate);
      return move;
    }
  }, {
    key: "isDummy",
    value: function isDummy() {
      return this.data.angle === 0;
    }
  }]);
  return RxnArrowRotate;
}(BaseOperation);

export { RxnArrowRotate };
//# sourceMappingURL=RxnArrowRotate.modern.js.map
