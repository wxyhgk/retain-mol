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
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var _classCallCheck = require('@babel/runtime/helpers/classCallCheck');
var _createClass = require('@babel/runtime/helpers/createClass');
var _possibleConstructorReturn = require('@babel/runtime/helpers/possibleConstructorReturn');
var _getPrototypeOf = require('@babel/runtime/helpers/getPrototypeOf');
var _assertThisInitialized = require('@babel/runtime/helpers/assertThisInitialized');
var _inherits = require('@babel/runtime/helpers/inherits');
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var vec2 = require('./vec2.js');
var BaseMicromoleculeEntity = require('./BaseMicromoleculeEntity.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _possibleConstructorReturn__default = /*#__PURE__*/_interopDefaultLegacy(_possibleConstructorReturn);
var _getPrototypeOf__default = /*#__PURE__*/_interopDefaultLegacy(_getPrototypeOf);
var _assertThisInitialized__default = /*#__PURE__*/_interopDefaultLegacy(_assertThisInitialized);
var _inherits__default = /*#__PURE__*/_interopDefaultLegacy(_inherits);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);

function _callSuper(t, o, e) { return o = _getPrototypeOf__default["default"](o), _possibleConstructorReturn__default["default"](t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf__default["default"](t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
exports.TextCommand = void 0;
(function (TextCommand) {
  TextCommand["Bold"] = "BOLD";
  TextCommand["Italic"] = "ITALIC";
  TextCommand["Subscript"] = "SUBSCRIPT";
  TextCommand["Superscript"] = "SUPERSCRIPT";
  TextCommand["FontSize"] = "CUSTOM_FONT_SIZE";
})(exports.TextCommand || (exports.TextCommand = {}));
function preparePositions(positions) {
  if (!(positions !== null && positions !== void 0 && positions.length)) {
    return [new vec2.Vec2(), new vec2.Vec2(), new vec2.Vec2(), new vec2.Vec2()];
  }
  return positions.map(function (position) {
    return new vec2.Vec2(position);
  });
}
var Text = function (_BaseMicromoleculeEnt) {
  _inherits__default["default"](Text, _BaseMicromoleculeEnt);
  function Text(attributes) {
    var _attributes$content;
    var _this;
    _classCallCheck__default["default"](this, Text);
    _this = _callSuper(this, Text, [attributes === null || attributes === void 0 ? void 0 : attributes.initiallySelected]);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "content", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "position", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "pos", void 0);
    _this.pos = preparePositions(attributes === null || attributes === void 0 ? void 0 : attributes.pos);
    _this.content = (_attributes$content = attributes === null || attributes === void 0 ? void 0 : attributes.content) !== null && _attributes$content !== void 0 ? _attributes$content : '';
    _this.position = attributes !== null && attributes !== void 0 && attributes.position ? new vec2.Vec2(attributes.position) : new vec2.Vec2();
    return _this;
  }
  _createClass__default["default"](Text, [{
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
}(BaseMicromoleculeEntity.BaseMicromoleculeEntity);

exports.Text = Text;
//# sourceMappingURL=text.js.map
