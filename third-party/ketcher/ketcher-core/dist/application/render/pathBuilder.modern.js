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
import { toFixed } from '../../utilities/toFixed.modern.js';
import '../../utilities/runAsyncAction.modern.js';
import '../../utilities/KetcherLogger.modern.js';
import '../../utilities/SettingsManager.modern.js';
import '../../utilities/keynorm.modern.js';
import 'react-device-detect';
import '../../utilities/clipboardUtils.modern.js';
import { Vec2 } from '../../domain/entities/vec2.modern.js';

var PathBuilder = function () {
  function PathBuilder(initialPath) {
    _classCallCheck(this, PathBuilder);
    _defineProperty(this, "pathParts", void 0);
    this.pathParts = [];
    if (initialPath) {
      this.pathParts.push(initialPath);
    }
  }
  _createClass(PathBuilder, [{
    key: "addMovement",
    value: function addMovement(to) {
      this.pathParts.push("M".concat(PathBuilder.generatePoint(to)));
      return this;
    }
  }, {
    key: "addLine",
    value: function addLine(to, from) {
      if (from) {
        this.addMovement(from);
      }
      this.pathParts.push("L".concat(PathBuilder.generatePoint(to)));
      return this;
    }
  }, {
    key: "addClosedLine",
    value: function addClosedLine(to, from) {
      this.addLine(to, from);
      var index = this.pathParts.length - 1;
      this.pathParts[index] = this.pathParts[index].concat('Z');
      return this;
    }
  }, {
    key: "addQuadraticBezierCurve",
    value: function addQuadraticBezierCurve(control, to) {
      this.pathParts.push("Q".concat(PathBuilder.generatePoint(control), " ").concat(PathBuilder.generatePoint(to)));
      return this;
    }
  }, {
    key: "addPathParts",
    value: function addPathParts(pathParts) {
      this.pathParts = this.pathParts.concat(pathParts);
      return this;
    }
  }, {
    key: "addOpenArrowPathParts",
    value: function addOpenArrowPathParts(start, arrowLength) {
      var tipXOffset = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 7;
      var tipYOffset = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 5;
      var endX = start.x + arrowLength;
      var end = new Vec2(endX, start.y);
      var tipX = endX - tipXOffset;
      return this.addLine(end, start).addLine({
        x: tipX,
        y: end.y - tipYOffset
      }).addLine({
        x: tipX,
        y: end.y + tipYOffset
      }, end);
    }
  }, {
    key: "addFilledTriangleArrowPathParts",
    value: function addFilledTriangleArrowPathParts(start, arrowLength) {
      var triangleLength = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 8;
      var triangleWidth = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 4;
      var endX = start.x + arrowLength;
      var end = new Vec2(endX, start.y);
      var triangleBottom = new Vec2(endX - triangleLength, end.y);
      var tipX = endX - triangleLength;
      return this.addLine(start, triangleBottom).addLine({
        x: tipX,
        y: end.y - triangleWidth
      }, end).addClosedLine({
        x: tipX,
        y: end.y + triangleWidth
      });
    }
  }, {
    key: "addMultitailArrowBase",
    value: function addMultitailArrowBase(topY, bottomY, spineX, tailLength) {
      var cubicBezierOffset = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 6;
      var tailX = spineX - tailLength;
      var tailStart = spineX - cubicBezierOffset;
      return this.addMovement({
        x: tailX,
        y: topY
      }).addLine({
        x: tailStart,
        y: topY
      }).addQuadraticBezierCurve({
        x: spineX,
        y: topY
      }, {
        x: spineX,
        y: topY + cubicBezierOffset
      }).addLine({
        x: spineX,
        y: bottomY - cubicBezierOffset
      }).addQuadraticBezierCurve({
        x: spineX,
        y: bottomY
      }, {
        x: tailStart,
        y: bottomY
      }).addLine({
        x: tailX,
        y: bottomY
      });
    }
  }, {
    key: "build",
    value: function build() {
      return this.pathParts.join(' ');
    }
  }], [{
    key: "generatePoint",
    value: function generatePoint(point) {
      return "".concat(toFixed(point.x), ",").concat(toFixed(point.y));
    }
  }]);
  return PathBuilder;
}();

export { PathBuilder };
//# sourceMappingURL=pathBuilder.modern.js.map
