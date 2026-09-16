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
import { Vec2 } from './vec2.modern.js';
import { BaseMicromoleculeEntity } from './BaseMicromoleculeEntity.modern.js';

function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var SimpleObjectMode;
(function (SimpleObjectMode) {
  SimpleObjectMode["ellipse"] = "ellipse";
  SimpleObjectMode["rectangle"] = "rectangle";
  SimpleObjectMode["line"] = "line";
})(SimpleObjectMode || (SimpleObjectMode = {}));
var SimpleObject = function (_BaseMicromoleculeEnt) {
  _inherits(SimpleObject, _BaseMicromoleculeEnt);
  function SimpleObject(attributes) {
    var _attributes$mode;
    var _this;
    _classCallCheck(this, SimpleObject);
    _this = _callSuper(this, SimpleObject, [attributes === null || attributes === void 0 ? void 0 : attributes.initiallySelected]);
    _defineProperty(_assertThisInitialized(_this), "pos", void 0);
    _defineProperty(_assertThisInitialized(_this), "mode", void 0);
    _this.pos = [];
    if (attributes !== null && attributes !== void 0 && attributes.pos) {
      for (var i = 0; i < attributes.pos.length; i++) {
        var currentP = attributes.pos[i];
        _this.pos[i] = currentP ? new Vec2(attributes.pos[i]) : new Vec2();
      }
    }
    _this.mode = (_attributes$mode = attributes === null || attributes === void 0 ? void 0 : attributes.mode) !== null && _attributes$mode !== void 0 ? _attributes$mode : SimpleObjectMode.line;
    return _this;
  }
  _createClass(SimpleObject, [{
    key: "clone",
    value: function clone() {
      return new SimpleObject(this);
    }
  }, {
    key: "center",
    value: function center() {
      if (this.mode === SimpleObjectMode.rectangle) {
        return Vec2.centre(this.pos[0], this.pos[1]);
      }
      return this.pos[0];
    }
  }]);
  return SimpleObject;
}(BaseMicromoleculeEntity);

export { SimpleObject, SimpleObjectMode };
//# sourceMappingURL=simpleObject.modern.js.map
