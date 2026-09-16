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
import { DrawingEntity } from './DrawingEntity.modern.js';
import { Vec2 } from './vec2.modern.js';

function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var BaseBond = function (_DrawingEntity) {
  _inherits(BaseBond, _DrawingEntity);
  function BaseBond() {
    var _this;
    _classCallCheck(this, BaseBond);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _callSuper(this, BaseBond, [].concat(args));
    _defineProperty(_assertThisInitialized(_this), "endPosition", new Vec2());
    _defineProperty(_assertThisInitialized(_this), "_isOverlappedByMonomer", false);
    return _this;
  }
  _createClass(BaseBond, [{
    key: "finished",
    get: function get() {
      return Boolean(this.firstEndEntity && this.secondEndEntity);
    }
  }, {
    key: "center",
    get: function get() {
      return Vec2.centre(this.startPosition, this.endPosition);
    }
  }, {
    key: "moveToLinkedEntities",
    value: function moveToLinkedEntities() {
      var _this$secondEndEntity;
      var firstMonomerCenter = this.firstEndEntity.position;
      var secondMonomerCenter = (_this$secondEndEntity = this.secondEndEntity) === null || _this$secondEndEntity === void 0 ? void 0 : _this$secondEndEntity.position;
      this.moveBondStartAbsolute(firstMonomerCenter.x, firstMonomerCenter.y);
      if (secondMonomerCenter) {
        this.moveBondEndAbsolute(secondMonomerCenter.x, secondMonomerCenter.y);
      }
    }
  }, {
    key: "moveBondStartAbsolute",
    value: function moveBondStartAbsolute(x, y) {
      this.moveAbsolute(new Vec2(x, y));
    }
  }, {
    key: "moveBondEndAbsolute",
    value: function moveBondEndAbsolute(x, y) {
      this.endPosition = new Vec2(x, y);
    }
  }, {
    key: "startPosition",
    get: function get() {
      return this.position;
    }
  }, {
    key: "getAnotherEntity",
    value: function getAnotherEntity(monomer) {
      return this.firstEndEntity === monomer ? this.secondEndEntity : this.firstEndEntity;
    }
  }, {
    key: "isOverlappedByMonomer",
    get: function get() {
      return this._isOverlappedByMonomer;
    },
    set: function set(value) {
      this._isOverlappedByMonomer = value;
    }
  }]);
  return BaseBond;
}(DrawingEntity);

export { BaseBond };
//# sourceMappingURL=BaseBond.modern.js.map
