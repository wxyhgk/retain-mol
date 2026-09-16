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
import { Bond } from '../../../domain/entities/bond.modern.js';

var Loop = function () {
  function Loop(halfEdges) {
    var isConvex = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    _classCallCheck(this, Loop);
    _defineProperty(this, "halfEdges", void 0);
    _defineProperty(this, "isConvex", void 0);
    _defineProperty(this, "doubleBondsAmount", 0);
    _defineProperty(this, "aromatic", true);
    this.halfEdges = halfEdges;
    this.isConvex = isConvex;
    this.calculateDoubleBondsAmount();
  }
  _createClass(Loop, [{
    key: "calculateDoubleBondsAmount",
    value: function calculateDoubleBondsAmount() {
      var _this = this;
      this.halfEdges.forEach(function (halfEdge) {
        if (halfEdge.bond.type !== Bond.PATTERN.TYPE.AROMATIC) _this.aromatic = false;
        if (halfEdge.bond.type === Bond.PATTERN.TYPE.DOUBLE) _this.doubleBondsAmount++;
      });
    }
  }]);
  return Loop;
}();

export { Loop };
//# sourceMappingURL=Loop.modern.js.map
