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

var FixedPrecisionCoordinates = function () {
  function FixedPrecisionCoordinates(value) {
    _classCallCheck(this, FixedPrecisionCoordinates);
    _defineProperty(this, "value", void 0);
    this.value = value instanceof FixedPrecisionCoordinates ? value.value : value;
  }
  _createClass(FixedPrecisionCoordinates, [{
    key: "add",
    value: function add(fixedPrecisionValue) {
      return new FixedPrecisionCoordinates(this.value + fixedPrecisionValue.value);
    }
  }, {
    key: "sub",
    value: function sub(fixedPrecisionValue) {
      return new FixedPrecisionCoordinates(this.value - fixedPrecisionValue.value);
    }
  }, {
    key: "multiply",
    value: function multiply(value) {
      var isFixedPrecision = value instanceof FixedPrecisionCoordinates;
      var multiplier = isFixedPrecision ? value.value : value;
      var result = this.value * multiplier;
      return new FixedPrecisionCoordinates(Math.round(isFixedPrecision ? result / FixedPrecisionCoordinates.MULTIPLIER : result));
    }
  }, {
    key: "divide",
    value: function divide(value) {
      var isFixedPrecision = value instanceof FixedPrecisionCoordinates;
      var delimiter = isFixedPrecision ? value.value : value;
      var result = this.value / delimiter;
      return new FixedPrecisionCoordinates(Math.round(isFixedPrecision ? result * FixedPrecisionCoordinates.MULTIPLIER : result));
    }
  }, {
    key: "getFloatingPrecision",
    value: function getFloatingPrecision() {
      return this.value / FixedPrecisionCoordinates.MULTIPLIER;
    }
  }], [{
    key: "fromFloatingPrecision",
    value: function fromFloatingPrecision(value) {
      return new FixedPrecisionCoordinates(Math.round(value * FixedPrecisionCoordinates.MULTIPLIER));
    }
  }]);
  return FixedPrecisionCoordinates;
}();
_defineProperty(FixedPrecisionCoordinates, "MULTIPLIER", Math.pow(10, 5));

export { FixedPrecisionCoordinates };
//# sourceMappingURL=fixedPrecision.modern.js.map
