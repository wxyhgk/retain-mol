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
import { Coordinates } from '../../../editor/shared/coordinates.modern.js';
import { HydrogenBond } from '../../../../domain/entities/HydrogenBond.modern.js';

var BondSnapView = function () {
  function BondSnapView() {
    _classCallCheck(this, BondSnapView);
  }
  _createClass(BondSnapView, null, [{
    key: "show",
    value: function show(transientLayer, bond) {
      var startPositionInPixels = Coordinates.modelToCanvas(bond.startPosition);
      var endPositionInPixels = Coordinates.modelToCanvas(bond.endPosition);
      transientLayer.append('circle').attr('cx', startPositionInPixels.x).attr('cy', startPositionInPixels.y).attr('r', 4).attr('fill', 'white').attr('style', 'pointer-events: none');
      transientLayer.append('circle').attr('cx', startPositionInPixels.x).attr('cy', startPositionInPixels.y).attr('r', 3).attr('fill', '#365CFF').attr('style', 'pointer-events: none');
      transientLayer.append('circle').attr('cx', endPositionInPixels.x).attr('cy', endPositionInPixels.y).attr('r', 4).attr('fill', 'white').attr('style', 'pointer-events: none');
      transientLayer.append('circle').attr('cx', endPositionInPixels.x).attr('cy', endPositionInPixels.y).attr('r', 3).attr('fill', '#365CFF').attr('style', 'pointer-events: none');
      transientLayer.append('line').attr('x1', startPositionInPixels.x).attr('y1', startPositionInPixels.y).attr('x2', endPositionInPixels.x).attr('y2', endPositionInPixels.y).attr('stroke', '#365CFF').attr('stroke-width', 1).attr('stroke-dasharray', bond instanceof HydrogenBond ? '2' : '0').attr('style', 'pointer-events: none');
    }
  }]);
  return BondSnapView;
}();
_defineProperty(BondSnapView, "viewName", 'BondSnapView');

export { BondSnapView };
//# sourceMappingURL=BondSnapView.modern.js.map
