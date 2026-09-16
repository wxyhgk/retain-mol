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
import { BondDashArrayMap, BondWidth } from './constants.modern.js';
import { BondType } from '../../../../domain/entities/CoreBond.modern.js';

var SingleBondPathRenderer = function () {
  function SingleBondPathRenderer() {
    _classCallCheck(this, SingleBondPathRenderer);
  }
  _createClass(SingleBondPathRenderer, null, [{
    key: "preparePaths",
    value: function preparePaths(bondVectors, type) {
      var startPosition = bondVectors.startPosition,
        endPosition = bondVectors.endPosition;
      var strokeDasharray = type !== undefined ? BondDashArrayMap[type] : 'none';
      var svgPath = {
        d: "\n          M".concat(startPosition.x, ",").concat(startPosition.y, "\n          L").concat(endPosition.x, ",").concat(endPosition.y, "\n        "),
        attrs: {
          'marker-end': type === BondType.Dative ? 'url(#arrow-marker)' : 'none',
          'stroke-dasharray': strokeDasharray,
          'stroke-width': "".concat(BondWidth)
        }
      };
      return [svgPath];
    }
  }]);
  return SingleBondPathRenderer;
}();

export { SingleBondPathRenderer as default };
//# sourceMappingURL=SingleBondPathRenderer.modern.js.map
