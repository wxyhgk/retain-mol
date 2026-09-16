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
import { AttachmentPoint } from './AttachmentPoint.modern.js';
import util from '../application/render/util.modern.js';
import { Vec2 } from './entities/vec2.modern.js';

function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var PreviewAttachmentPoint = function (_AttachmentPoint) {
  _inherits(PreviewAttachmentPoint, _AttachmentPoint);
  function PreviewAttachmentPoint(constructorParams) {
    var _this;
    _classCallCheck(this, PreviewAttachmentPoint);
    _this = _callSuper(this, PreviewAttachmentPoint, [constructorParams, true]);
    _defineProperty(_assertThisInitialized(_this), "connected", void 0);
    _defineProperty(_assertThisInitialized(_this), "selected", void 0);
    _defineProperty(_assertThisInitialized(_this), "usage", void 0);
    _this.connected = constructorParams.connected;
    _this.selected = constructorParams.selected;
    _this.usage = constructorParams.usage;
    _this.appendAttachmentPoint();
    return _this;
  }
  _createClass(PreviewAttachmentPoint, [{
    key: "renderAttachmentPointByCoordinates",
    value: function renderAttachmentPointByCoordinates(attachmentOnBorder, attachmentPointCoordinates) {
      var _this$attachmentPoint;
      this.attachmentPoint = this.rootElement.insert('g', ':first-child').data([this]).style('pointer-events', 'none').style('cursor', 'pointer').attr('class', 'dynamic-element');
      var attachmentPointElement = this.attachmentPoint.append('g');
      attachmentPointElement.append('line').attr('x1', attachmentOnBorder.x).attr('y1', attachmentOnBorder.y).attr('x2', attachmentPointCoordinates.x).attr('y2', attachmentPointCoordinates.y).attr('stroke', this.stroke).attr('stroke-linecap', 'round').attr('stroke-width', '1px');
      var _util$useLabelStyles = util.useLabelStyles(this.selected, this.connected, this.usage),
        color = _util$useLabelStyles.color,
        stroke = _util$useLabelStyles.stroke,
        fill = _util$useLabelStyles.fill;
      var labelGroup = (_this$attachmentPoint = this.attachmentPoint) === null || _this$attachmentPoint === void 0 ? void 0 : _this$attachmentPoint.append('g');
      var angleInRadians = Vec2.degrees_to_radians(this.initialAngle);
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
        _this$getCoordinates2 = _slicedToArray(_this$getCoordinates, 2),
        attachmentToBorderCoordinates = _this$getCoordinates2[0],
        attachmentPointCoordinates = _this$getCoordinates2[1];
      var attachmentPoint = this.renderAttachmentPointByCoordinates(attachmentToBorderCoordinates, attachmentPointCoordinates);
      this.element = attachmentPoint;
      return attachmentPoint;
    }
  }]);
  return PreviewAttachmentPoint;
}(AttachmentPoint);

export { PreviewAttachmentPoint };
//# sourceMappingURL=PreviewAttachmentPoint.modern.js.map
