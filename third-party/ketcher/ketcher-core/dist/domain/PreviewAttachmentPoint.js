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

var _slicedToArray = require('@babel/runtime/helpers/slicedToArray');
var _classCallCheck = require('@babel/runtime/helpers/classCallCheck');
var _createClass = require('@babel/runtime/helpers/createClass');
var _possibleConstructorReturn = require('@babel/runtime/helpers/possibleConstructorReturn');
var _getPrototypeOf = require('@babel/runtime/helpers/getPrototypeOf');
var _assertThisInitialized = require('@babel/runtime/helpers/assertThisInitialized');
var _inherits = require('@babel/runtime/helpers/inherits');
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var AttachmentPoint = require('./AttachmentPoint.js');
var util = require('../application/render/util.js');
var vec2 = require('./entities/vec2.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _slicedToArray__default = /*#__PURE__*/_interopDefaultLegacy(_slicedToArray);
var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _possibleConstructorReturn__default = /*#__PURE__*/_interopDefaultLegacy(_possibleConstructorReturn);
var _getPrototypeOf__default = /*#__PURE__*/_interopDefaultLegacy(_getPrototypeOf);
var _assertThisInitialized__default = /*#__PURE__*/_interopDefaultLegacy(_assertThisInitialized);
var _inherits__default = /*#__PURE__*/_interopDefaultLegacy(_inherits);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);

function _callSuper(t, o, e) { return o = _getPrototypeOf__default["default"](o), _possibleConstructorReturn__default["default"](t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf__default["default"](t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var PreviewAttachmentPoint = function (_AttachmentPoint) {
  _inherits__default["default"](PreviewAttachmentPoint, _AttachmentPoint);
  function PreviewAttachmentPoint(constructorParams) {
    var _this;
    _classCallCheck__default["default"](this, PreviewAttachmentPoint);
    _this = _callSuper(this, PreviewAttachmentPoint, [constructorParams, true]);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "connected", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "selected", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "usage", void 0);
    _this.connected = constructorParams.connected;
    _this.selected = constructorParams.selected;
    _this.usage = constructorParams.usage;
    _this.appendAttachmentPoint();
    return _this;
  }
  _createClass__default["default"](PreviewAttachmentPoint, [{
    key: "renderAttachmentPointByCoordinates",
    value: function renderAttachmentPointByCoordinates(attachmentOnBorder, attachmentPointCoordinates) {
      var _this$attachmentPoint;
      this.attachmentPoint = this.rootElement.insert('g', ':first-child').data([this]).style('pointer-events', 'none').style('cursor', 'pointer').attr('class', 'dynamic-element');
      var attachmentPointElement = this.attachmentPoint.append('g');
      attachmentPointElement.append('line').attr('x1', attachmentOnBorder.x).attr('y1', attachmentOnBorder.y).attr('x2', attachmentPointCoordinates.x).attr('y2', attachmentPointCoordinates.y).attr('stroke', this.stroke).attr('stroke-linecap', 'round').attr('stroke-width', '1px');
      var _util$useLabelStyles = util["default"].useLabelStyles(this.selected, this.connected, this.usage),
        color = _util$useLabelStyles.color,
        stroke = _util$useLabelStyles.stroke,
        fill = _util$useLabelStyles.fill;
      var labelGroup = (_this$attachmentPoint = this.attachmentPoint) === null || _this$attachmentPoint === void 0 ? void 0 : _this$attachmentPoint.append('g');
      var angleInRadians = vec2.Vec2.degrees_to_radians(this.initialAngle);
      var cos = Math.cos(angleInRadians);
      var sin = Math.sin(angleInRadians);
      var centerX = attachmentPointCoordinates.x - 10;
      var centerY = attachmentPointCoordinates.y - 8;
      var rectX = centerX - 10 * cos;
      var rectY = centerY - 10 * sin;
      var labelX = attachmentPointCoordinates.x - 10 * cos;
      var labelY = attachmentPointCoordinates.y - 10 * sin;
      labelGroup.append('rect').attr('x', rectX).attr('y', rectY).attr('rx', 4).attr('ry', 4).attr('width', 20).attr('height', 16).attr('fill', fill).attr('stroke', stroke).attr('stroke-width', '1px');
      labelGroup.append('text').attr('x', labelX).attr('y', labelY).attr('fill', color).attr('font-size', '10px').attr('text-anchor', 'middle').attr('alignment-baseline', 'middle').text(this.attachmentPointName);
      return this.attachmentPoint;
    }
  }, {
    key: "appendAttachmentPoint",
    value: function appendAttachmentPoint() {
      var _this$getCoordinates = this.getCoordinates(this.initialAngle),
        _this$getCoordinates2 = _slicedToArray__default["default"](_this$getCoordinates, 2),
        attachmentToBorderCoordinates = _this$getCoordinates2[0],
        attachmentPointCoordinates = _this$getCoordinates2[1];
      var attachmentPoint = this.renderAttachmentPointByCoordinates(attachmentToBorderCoordinates, attachmentPointCoordinates);
      this.element = attachmentPoint;
      return attachmentPoint;
    }
  }]);
  return PreviewAttachmentPoint;
}(AttachmentPoint.AttachmentPoint);

exports.PreviewAttachmentPoint = PreviewAttachmentPoint;
//# sourceMappingURL=PreviewAttachmentPoint.js.map
