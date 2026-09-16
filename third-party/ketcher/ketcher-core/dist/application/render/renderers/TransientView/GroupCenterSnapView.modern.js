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
import '../../../../domain/constants/elements.modern.js';
import '../../../../domain/constants/element.types.modern.js';
import '../../../../domain/constants/generics.modern.js';
import '../../../../domain/constants/chains.modern.js';
import { MonomerSize } from '../../../../domain/constants/monomers.modern.js';

var GroupCentersnapView = function () {
  function GroupCentersnapView() {
    _classCallCheck(this, GroupCentersnapView);
  }
  _createClass(GroupCentersnapView, null, [{
    key: "show",
    value: function show(transientLayer, params) {
      var absoluteSnapPosition = params.absoluteSnapPosition,
        isVertical = params.isVertical,
        monomerPair = params.monomerPair;
      var snapPositionInPixels = Coordinates.modelToCanvas(absoluteSnapPosition);
      var LINE_LENGTH = 80;
      transientLayer.append('circle').attr('cx', snapPositionInPixels.x).attr('cy', snapPositionInPixels.y).attr('r', 6).attr('fill', 'darkgreen').attr('stroke-width', 0);
      if (isVertical && Math.abs(monomerPair[0].position.y - monomerPair[1].position.y) > MonomerSize * 2 || Math.abs(monomerPair[0].position.x - monomerPair[1].position.x) < MonomerSize * 2) {
        var rightMonomerPosition = monomerPair[0].position.x > monomerPair[1].position.x ? monomerPair[0].position : monomerPair[1].position;
        var rightMonomerPositionInPixels = Coordinates.modelToCanvas(rightMonomerPosition);
        var mostRightPointX = Math.abs(rightMonomerPositionInPixels.x) + LINE_LENGTH;
        transientLayer.append('line').attr('x1', snapPositionInPixels.x).attr('y1', snapPositionInPixels.y).attr('x2', mostRightPointX).attr('y2', snapPositionInPixels.y).attr('stroke', 'darkgreen').attr('stroke-width', 0.5).attr('stroke-dasharray', 4);
        monomerPair.forEach(function (monomer) {
          var monomerPositionInPixels = Coordinates.modelToCanvas(monomer.position);
          transientLayer.append('line').attr('x1', monomerPositionInPixels.x).attr('y1', monomerPositionInPixels.y).attr('x2', mostRightPointX).attr('y2', monomerPositionInPixels.y).attr('stroke', '#365CFF').attr('stroke-width', 0.5).attr('stroke-dasharray', 4);
          transientLayer.append('line').attr('x1', mostRightPointX).attr('y1', monomerPositionInPixels.y).attr('x2', mostRightPointX).attr('y2', snapPositionInPixels.y).attr('stroke', '#365CFF').attr('stroke-width', 0.5).attr('marker-end', 'url(#arrow-marker-arc)').style('opacity', 0.75);
        });
      } else {
        var bottomMonomerPosition = monomerPair[0].position.y > monomerPair[1].position.y ? monomerPair[0].position : monomerPair[1].position;
        var bottomMonomerPositionInPixels = Coordinates.modelToCanvas(bottomMonomerPosition);
        transientLayer.append('line').attr('x1', snapPositionInPixels.x).attr('y1', snapPositionInPixels.y).attr('x2', snapPositionInPixels.x).attr('y2', bottomMonomerPositionInPixels.y + LINE_LENGTH).attr('stroke', 'darkgreen').attr('stroke-width', 0.5).attr('stroke-dasharray', 4);
        monomerPair.forEach(function (monomer) {
          var monomerPositionInPixels = Coordinates.modelToCanvas(monomer.position);
          transientLayer.append('line').attr('x1', monomerPositionInPixels.x).attr('y1', monomerPositionInPixels.y).attr('x2', monomerPositionInPixels.x).attr('y2', bottomMonomerPositionInPixels.y + LINE_LENGTH).attr('stroke', '#365CFF').attr('stroke-width', 0.5).attr('stroke-dasharray', 4);
          transientLayer.append('line').attr('x1', monomerPositionInPixels.x).attr('y1', bottomMonomerPositionInPixels.y + LINE_LENGTH).attr('x2', snapPositionInPixels.x).attr('y2', bottomMonomerPositionInPixels.y + LINE_LENGTH).attr('stroke', '#365CFF').attr('stroke-width', 0.5).attr('marker-end', 'url(#arrow-marker-arc)').style('opacity', 0.75);
        });
      }
    }
  }]);
  return GroupCentersnapView;
}();
_defineProperty(GroupCentersnapView, "viewName", 'GroupCentersnapView');

export { GroupCentersnapView };
//# sourceMappingURL=GroupCenterSnapView.modern.js.map
