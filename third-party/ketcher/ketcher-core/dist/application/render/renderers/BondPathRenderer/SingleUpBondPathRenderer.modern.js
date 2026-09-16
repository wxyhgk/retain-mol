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
import _slicedToArray from '@babel/runtime/helpers/slicedToArray';
import { StereoBondWidth } from './constants.modern.js';
import '../../../../domain/entities/atom.modern.js';
import '../../../../domain/entities/atomList.modern.js';
import '../../../../domain/entities/bond.modern.js';
import '../../../../domain/entities/fixedPrecision.modern.js';
import '../../../../domain/entities/fragment.modern.js';
import '../../../../domain/entities/functionalGroup.modern.js';
import '../../../../domain/entities/halfBond.modern.js';
import '../../../../domain/entities/loop.modern.js';
import '../../../../domain/entities/rgroup.modern.js';
import '../../../../domain/entities/rgroupAttachmentPoint.modern.js';
import '../../../../domain/entities/rxnArrow.modern.js';
import '../../../../domain/entities/rxnPlus.modern.js';
import '../../../../domain/entities/sgroup.modern.js';
import '../../../../domain/entities/sgroupForest.modern.js';
import '../../../../domain/entities/simpleObject.modern.js';
import '../../../../domain/entities/struct.modern.js';
import '../../../../domain/entities/text.modern.js';
import '../../../../domain/entities/pile.modern.js';
import { Vec2 } from '../../../../domain/entities/vec2.modern.js';
import '../../../../domain/entities/box2Abs.modern.js';
import '../../../../domain/entities/pool.modern.js';
import '../../../../domain/entities/image.modern.js';
import '../../../../domain/entities/multitailArrow.modern.js';
import '../../../../domain/entities/highlight.modern.js';
import '../../../../domain/entities/sGroupAttachmentPoint.modern.js';
import '../../../../domain/entities/monomerMicromolecule.modern.js';
import '../../../../domain/entities/Peptide.modern.js';
import '../../../../domain/entities/BaseMonomer.modern.js';
import '../../../../domain/entities/Chem.modern.js';
import '../../../../domain/entities/Sugar.modern.js';
import '../../../../domain/entities/RNABase.modern.js';
import '../../../../domain/entities/Phosphate.modern.js';
import '../../../../domain/entities/Axis.modern.js';
import '../../../../domain/entities/Nucleoside.modern.js';
import '../../../../domain/entities/Nucleotide.modern.js';
import '../../../../domain/entities/monomer-chains/types.modern.js';
import '../../../../domain/entities/monomer-chains/Chain.modern.js';
import '../../../../domain/entities/monomer-chains/ChainsCollection.modern.js';
import '../../../../domain/entities/MonomerSequenceNode.modern.js';
import '../../../../domain/entities/EmptySequenceNode.modern.js';
import '../../../../domain/entities/LinkerSequenceNode.modern.js';
import '../../../../domain/entities/UnresolvedMonomer.modern.js';
import '../../../../domain/entities/UnsplitNucleotide.modern.js';
import '../../../../domain/entities/PolymerBond.modern.js';
import '../../../../domain/entities/AmbiguousMonomer.modern.js';
import '../../../../domain/entities/MonomerToAtomBond.modern.js';
import '../../../../domain/entities/HydrogenBond.modern.js';
import '../../../../domain/entities/SGroupDrawingEntity.modern.js';
import '../../../../domain/entities/BackBoneSequenceNode.modern.js';
import '../../../../domain/entities/Command.modern.js';
import '../../../../utilities/runAsyncAction.modern.js';
import '../../../../utilities/KetcherLogger.modern.js';
import '../../../../utilities/SettingsManager.modern.js';
import '../../../../utilities/keynorm.modern.js';
import 'react-device-detect';
import '../../../../utilities/clipboardUtils.modern.js';
import '../../../../domain/entities/CoreAtom.modern.js';
import '../../../../domain/entities/CoreStereoFlag.modern.js';
import '@babel/runtime/helpers/defineProperty';
import '@babel/runtime/helpers/typeof';
import '../../../../domain/constants/elements.modern.js';
import '../../../../domain/constants/element.types.modern.js';
import '../../../../domain/constants/generics.modern.js';
import '../../../../domain/constants/chains.modern.js';
import '../../../../domain/constants/monomers.modern.js';
import { BondType, BondStereo } from '../../../../domain/entities/CoreBond.modern.js';

function isSingleUpBond(bond) {
  return bond.type === BondType.Single && bond.stereo === BondStereo.Up;
}
function isBoldStereoBond(bond, viewModel) {
  var halfEdges = viewModel.bondsToHalfEdges.get(bond);
  if (!halfEdges) {
    return false;
  }
  var _halfEdges = _slicedToArray(halfEdges, 2),
    firstHalfEdge = _halfEdges[0],
    secondHalfEdge = _halfEdges[1];
  return Boolean(findIncomingStereoUpHalfEdge(firstHalfEdge, bond, false, viewModel)) && Boolean(findIncomingStereoUpHalfEdge(secondHalfEdge, bond, false, viewModel));
}
function findIncomingStereoUpHalfEdge(halfEdge, currentBond, includeBold, viewModel) {
  for (var _i = 0, _arr = [halfEdge.leftNeighborHalfEdge, halfEdge.rightNeighborHalfEdge]; _i < _arr.length; _i++) {
    var neighbor = _arr[_i];
    if (!neighbor) {
      continue;
    }
    var neighborBond = neighbor.bond;
    if (neighborBond === currentBond || !isSingleUpBond(neighborBond)) {
      continue;
    }
    if (neighborBond.secondAtom === halfEdge.firstAtom || includeBold && isBoldStereoBond(neighborBond, viewModel)) {
      return neighbor;
    }
  }
  return undefined;
}
function getBoldStereoEndpoints(halfEdgeDir, neighborHalfEdgeDir, atomPos) {
  var cos = Vec2.dot(halfEdgeDir, neighborHalfEdgeDir);
  var sin = Vec2.cross(halfEdgeDir, neighborHalfEdgeDir);
  var cosHalf = Math.sqrt(0.5 * (1 - cos));
  var biss = neighborHalfEdgeDir.rotateSC((sin >= 0 ? -1 : 1) * cosHalf, Math.sqrt(0.5 * (1 + cos)));
  var denomAdd = 0.3;
  var scale = 0.7;
  var width = scale * StereoBondWidth / (cosHalf + denomAdd);
  var p1 = atomPos.addScaled(biss, width);
  var p2 = atomPos.addScaled(biss.negated(), width);
  return sin > 0 ? [p1, p2] : [p2, p1];
}
var SingleUpBondPathRenderer = function () {
  function SingleUpBondPathRenderer() {
    _classCallCheck(this, SingleUpBondPathRenderer);
  }
  _createClass(SingleUpBondPathRenderer, null, [{
    key: "preparePaths",
    value: function preparePaths(bondVectors, viewModel) {
      var startPosition = bondVectors.startPosition,
        endPosition = bondVectors.endPosition,
        firstHalfEdge = bondVectors.firstHalfEdge,
        secondHalfEdge = bondVectors.secondHalfEdge;
      var currentBond = firstHalfEdge.bond;
      var startNeighbor = findIncomingStereoUpHalfEdge(firstHalfEdge, currentBond, true, viewModel);
      var endNeighbor = findIncomingStereoUpHalfEdge(secondHalfEdge, currentBond, true, viewModel);
      if (startNeighbor && endNeighbor && isBoldStereoBond(currentBond, viewModel)) {
        var _getBoldStereoEndpoin = getBoldStereoEndpoints(firstHalfEdge.direction, startNeighbor.direction, startPosition),
          _getBoldStereoEndpoin2 = _slicedToArray(_getBoldStereoEndpoin, 2),
          a1 = _getBoldStereoEndpoin2[0],
          a2 = _getBoldStereoEndpoin2[1];
        var _getBoldStereoEndpoin3 = getBoldStereoEndpoints(secondHalfEdge.direction, endNeighbor.direction, endPosition),
          _getBoldStereoEndpoin4 = _slicedToArray(_getBoldStereoEndpoin3, 2),
          a3 = _getBoldStereoEndpoin4[0],
          a4 = _getBoldStereoEndpoin4[1];
        var _svgPath = {
          d: "\n          M".concat(a1.x, ",").concat(a1.y, "\n          L").concat(a2.x, ",").concat(a2.y, "\n          L").concat(a3.x, ",").concat(a3.y, "\n          L").concat(a4.x, ",").concat(a4.y, "\n          Z\n        "),
          attrs: {
            'stroke-width': '2'
          }
        };
        return [_svgPath];
      }
      var bondEndFirstPoint;
      var bondEndSecondPoint;
      if (endNeighbor) {
        var _getBoldStereoEndpoin5 = getBoldStereoEndpoints(secondHalfEdge.direction, endNeighbor.direction, endPosition);
        var _getBoldStereoEndpoin6 = _slicedToArray(_getBoldStereoEndpoin5, 2);
        bondEndFirstPoint = _getBoldStereoEndpoin6[0];
        bondEndSecondPoint = _getBoldStereoEndpoin6[1];
      } else {
        var halfOfBondEndWidth = 0.7 * StereoBondWidth;
        bondEndFirstPoint = endPosition.addScaled(firstHalfEdge.leftNormal, halfOfBondEndWidth);
        bondEndSecondPoint = endPosition.addScaled(firstHalfEdge.leftNormal, -halfOfBondEndWidth);
      }
      var svgPath = {
        d: "\n          M".concat(startPosition.x, ",").concat(startPosition.y, "\n          L").concat(bondEndFirstPoint.x, ",").concat(bondEndFirstPoint.y, "\n          L").concat(bondEndSecondPoint.x, ",").concat(bondEndSecondPoint.y, "\n          Z\n        "),
        attrs: {
          'stroke-width': '2'
        }
      };
      return [svgPath];
    }
  }]);
  return SingleUpBondPathRenderer;
}();

export { SingleUpBondPathRenderer as default };
//# sourceMappingURL=SingleUpBondPathRenderer.modern.js.map
