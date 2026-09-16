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
var TextCommand;
(function (TextCommand) {
  TextCommand["Bold"] = "BOLD";
  TextCommand["Italic"] = "ITALIC";
  TextCommand["Subscript"] = "SUBSCRIPT";
  TextCommand["Superscript"] = "SUPERSCRIPT";
  TextCommand["FontSize"] = "CUSTOM_FONT_SIZE";
})(TextCommand || (TextCommand = {}));
function preparePositions(positions) {
  if (!(positions !== null && positions !== void 0 && positions.length)) {
    return [new Vec2(), new Vec2(), new Vec2(), new Vec2()];
  }
  return positions.map(function (position) {
    return new Vec2(position);
  });
}
var Text = function (_BaseMicromoleculeEnt) {
  _inherits(Text, _BaseMicromoleculeEnt);
  function Text(attributes) {
    var _attributes$content;
    var _this;
    _classCallCheck(this, Text);
    _this = _callSuper(this, Text, [attributes === null || attributes === void 0 ? void 0 : attributes.initiallySelected]);
    _defineProperty(_assertThisInitialized(_this), "content", void 0);
    _defineProperty(_assertThisInitialized(_this), "position", void 0);
    _defineProperty(_assertThisInitialized(_this), "pos", void 0);
    _this.pos = preparePositions(attributes === null || attributes === void 0 ? void 0 : attributes.pos);
    _this.content = (_attributes$content = attributes === null || attributes === void 0 ? void 0 : attributes.content) !== null && _attributes$content !== void 0 ? _attributes$content : '';
    _this.position = attributes !== null && attributes !== void 0 && attributes.position ? new Vec2(attributes.position) : new Vec2();
    return _this;
  }
  _createClass(Text, [{
    key: "setPos",
    value: function setPos(coords) {
      this.pos = coords !== null && coords !== void 0 ? coords : [];
    }
  }, {
    key: "clone",
    value: function clone() {
      return new Text(this);
    }
  }]);
  return Text;
}(BaseMicromoleculeEntity);

export { Text, TextCommand };
//# sourceMappingURL=text.modern.js.map
