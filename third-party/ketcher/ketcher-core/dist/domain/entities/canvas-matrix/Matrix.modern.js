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

var Matrix = function () {
  function Matrix() {
    _classCallCheck(this, Matrix);
    _defineProperty(this, "matrix", void 0);
    this.matrix = [];
  }
  _createClass(Matrix, [{
    key: "get",
    value: function get(x, y) {
      if (!this.matrix[x]) {
        return undefined;
      }
      return this.matrix[x][y];
    }
  }, {
    key: "getRow",
    value: function getRow(x) {
      return this.matrix[x];
    }
  }, {
    key: "set",
    value: function set(x, y, value) {
      if (!this.matrix[x]) {
        this.matrix[x] = [];
      }
      this.matrix[x][y] = value;
    }
  }, {
    key: "height",
    get: function get() {
      return this.matrix.length;
    }
  }, {
    key: "width",
    get: function get() {
      return this.matrix.reduce(function (max, row) {
        return Math.max(max, row.length);
      }, 0);
    }
  }, {
    key: "forEach",
    value: function forEach(callback) {
      for (var x = 0; x < this.matrix.length; x++) {
        for (var y = 0; y < ((_this$matrix$x = this.matrix[x]) === null || _this$matrix$x === void 0 ? void 0 : _this$matrix$x.length); y++) {
          var _this$matrix$x;
          var value = this.matrix[x][y];
          if (value) {
            callback(value, x, y);
          }
        }
      }
    }
  }, {
    key: "forEachRightToLeft",
    value: function forEachRightToLeft(callback) {
      for (var x = this.matrix.length - 1; x >= 0; x--) {
        for (var y = ((_this$matrix$x2 = this.matrix[x]) === null || _this$matrix$x2 === void 0 ? void 0 : _this$matrix$x2.length) - 1; y >= 0; y--) {
          var _this$matrix$x2;
          var value = this.matrix[x][y];
          if (value) {
            callback(value, x, y);
          }
        }
      }
    }
  }, {
    key: "forEachBottomToTop",
    value: function forEachBottomToTop(callback) {
      for (var y = ((_this$matrix$ = this.matrix[0]) === null || _this$matrix$ === void 0 ? void 0 : _this$matrix$.length) - 1; y >= 0; y--) {
        var _this$matrix$;
        for (var x = this.matrix.length - 1; x >= 0; x--) {
          var value = this.matrix[x][y];
          if (value) {
            callback(value, x, y);
          }
        }
      }
    }
  }]);
  return Matrix;
}();

export { Matrix };
//# sourceMappingURL=Matrix.modern.js.map
