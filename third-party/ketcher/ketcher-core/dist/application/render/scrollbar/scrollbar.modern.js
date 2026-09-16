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
import _defineProperty from '@babel/runtime/helpers/defineProperty';

function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
var Scrollbar = function () {
  function Scrollbar(render) {
    _classCallCheck(this, Scrollbar);
    _defineProperty(this, "bar", null);
    _defineProperty(this, "render", void 0);
    _defineProperty(this, "viewBoxBeforeDrag", null);
    _defineProperty(this, "MIN_LENGTH", 40);
    _defineProperty(this, "RADIUS", 2);
    _defineProperty(this, "MARGIN", 5);
    _defineProperty(this, "WIDTH", 4);
    _defineProperty(this, "DIST_TO_EDGE", 5);
    _defineProperty(this, "COLOR", '#b2bbc3');
    this.render = render;
  }
  _createClass(Scrollbar, [{
    key: "destroy",
    value: function destroy() {
      this.hide();
    }
  }, {
    key: "update",
    value: function update() {
      this.bar = this.hasOffset() ? this.redraw() : this.hide();
    }
  }, {
    key: "redraw",
    value: function redraw() {
      return this.bar ? this.updateAttr() : this.draw();
    }
  }, {
    key: "updateAttr",
    value: function updateAttr() {
      if (!this.bar) throw new Error('Unexpected state no bar');
      var attr = this.getDynamicAttr();
      return this.bar.attr(attr);
    }
  }, {
    key: "hide",
    value: function hide() {
      var _this$bar, _this$bar2;
      (_this$bar = this.bar) === null || _this$bar === void 0 || _this$bar.undrag();
      (_this$bar2 = this.bar) === null || _this$bar2 === void 0 || _this$bar2.remove();
      return null;
    }
  }, {
    key: "draw",
    value: function draw() {
      var _this$getDynamicAttr = this.getDynamicAttr(),
        x = _this$getDynamicAttr.x,
        y = _this$getDynamicAttr.y,
        width = _this$getDynamicAttr.width,
        height = _this$getDynamicAttr.height,
        r = _this$getDynamicAttr.r;
      var bar = this.render.paper.rect(x, y, width, height, r).attr({
        stroke: this.COLOR,
        fill: this.COLOR
      });
      bar.drag(this.onDragMove, this.onDragStart, this.onDragEnd, this, this, this);
      return bar;
    }
  }, {
    key: "onDragStart",
    value: function onDragStart(_x, _y, event) {
      this.viewBoxBeforeDrag = _objectSpread({}, this.render.viewBox);
      event.stopPropagation();
    }
  }, {
    key: "onDragEnd",
    value: function onDragEnd(event) {
      event.stopPropagation();
    }
  }]);
  return Scrollbar;
}();

export { Scrollbar };
//# sourceMappingURL=scrollbar.modern.js.map
