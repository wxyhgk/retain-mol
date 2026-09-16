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

var SVGPathDAttributeUtility = function () {
  function SVGPathDAttributeUtility() {
    _classCallCheck(this, SVGPathDAttributeUtility);
  }
  _createClass(SVGPathDAttributeUtility, null, [{
    key: "generateAbsoluteLine",
    value: function generateAbsoluteLine(x, y) {
      return "L ".concat(x, ",").concat(y);
    }
  }, {
    key: "generateHorizontalAbsoluteLine",
    value: function generateHorizontalAbsoluteLine(x) {
      return "H ".concat(x);
    }
  }, {
    key: "generateMoveTo",
    value: function generateMoveTo(x, y) {
      return "M ".concat(x, ",").concat(y);
    }
  }, {
    key: "generateQuadraticRelativeCurve",
    value: function generateQuadraticRelativeCurve(dx1, dy1, dx, dy) {
      var controlPoint = "".concat(dx1, ",").concat(dy1);
      var endPoint = "".concat(dx, ",").concat(dy);
      return "q ".concat(controlPoint, " ").concat(endPoint);
    }
  }, {
    key: "generateVerticalAbsoluteLine",
    value: function generateVerticalAbsoluteLine(y) {
      return "V ".concat(y);
    }
  }]);
  return SVGPathDAttributeUtility;
}();

export { SVGPathDAttributeUtility };
//# sourceMappingURL=SVGPathDAttributeUtility.modern.js.map
