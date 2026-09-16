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
import { BaseBond } from './BaseBond.modern.js';

function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var HydrogenBond = function (_BaseBond) {
  _inherits(HydrogenBond, _BaseBond);
  function HydrogenBond(firstMonomer, secondMonomer) {
    var _this;
    _classCallCheck(this, HydrogenBond);
    _this = _callSuper(this, HydrogenBond);
    _defineProperty(_assertThisInitialized(_this), "firstMonomer", void 0);
    _defineProperty(_assertThisInitialized(_this), "secondMonomer", void 0);
    _defineProperty(_assertThisInitialized(_this), "renderer", undefined);
    _this.firstMonomer = firstMonomer;
    _this.firstMonomer = firstMonomer;
    _this.secondMonomer = secondMonomer;
    return _this;
  }
  _createClass(HydrogenBond, [{
    key: "setFirstMonomer",
    value: function setFirstMonomer(monomer) {
      this.firstMonomer = monomer;
    }
  }, {
    key: "setSecondMonomer",
    value: function setSecondMonomer(monomer) {
      this.secondMonomer = monomer;
    }
  }, {
    key: "setRenderer",
    value: function setRenderer(renderer) {
      _get(_getPrototypeOf(HydrogenBond.prototype), "setBaseRenderer", this).call(this, renderer);
      this.renderer = renderer;
    }
  }, {
    key: "isBackBoneChainConnection",
    get: function get() {
      return false;
    }
  }, {
    key: "firstMonomerAttachmentPoint",
    get: function get() {
      return this.firstMonomer.getAttachmentPointByBond(this);
    }
  }, {
    key: "secondMonomerAttachmentPoint",
    get: function get() {
      var _this$secondMonomer;
      return (_this$secondMonomer = this.secondMonomer) === null || _this$secondMonomer === void 0 ? void 0 : _this$secondMonomer.getAttachmentPointByBond(this);
    }
  }, {
    key: "isSideChainConnection",
    get: function get() {
      return true;
    }
  }, {
    key: "firstEndEntity",
    get: function get() {
      return this.firstMonomer;
    }
  }, {
    key: "secondEndEntity",
    get: function get() {
      return this.secondMonomer;
    }
  }, {
    key: "getAnotherMonomer",
    value: function getAnotherMonomer(monomer) {
      return _get(_getPrototypeOf(HydrogenBond.prototype), "getAnotherEntity", this).call(this, monomer);
    }
  }, {
    key: "isHorizontal",
    get: function get() {
      return false;
    }
  }, {
    key: "isVertical",
    get: function get() {
      return false;
    }
  }]);
  return HydrogenBond;
}(BaseBond);

export { HydrogenBond };
//# sourceMappingURL=HydrogenBond.modern.js.map
