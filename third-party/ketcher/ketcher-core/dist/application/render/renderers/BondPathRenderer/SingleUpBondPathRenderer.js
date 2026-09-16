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
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var _classCallCheck = require('@babel/runtime/helpers/classCallCheck');
var _createClass = require('@babel/runtime/helpers/createClass');
var _slicedToArray = require('@babel/runtime/helpers/slicedToArray');
var constants = require('./constants.js');
require('../../../../domain/entities/atom.js');
require('../../../../domain/entities/atomList.js');
require('../../../../domain/entities/bond.js');
require('../../../../domain/entities/fixedPrecision.js');
require('../../../../domain/entities/fragment.js');
require('../../../../domain/entities/functionalGroup.js');
require('../../../../domain/entities/halfBond.js');
require('../../../../domain/entities/loop.js');
require('../../../../domain/entities/rgroup.js');
require('../../../../domain/entities/rgroupAttachmentPoint.js');
require('../../../../domain/entities/rxnArrow.js');
require('../../../../domain/entities/rxnPlus.js');
require('../../../../domain/entities/sgroup.js');
require('../../../../domain/entities/sgroupForest.js');
require('../../../../domain/entities/simpleObject.js');
require('../../../../domain/entities/struct.js');
require('../../../../domain/entities/text.js');
require('../../../../domain/entities/pile.js');
var vec2 = require('../../../../domain/entities/vec2.js');
require('../../../../domain/entities/box2Abs.js');
require('../../../../domain/entities/pool.js');
require('../../../../domain/entities/image.js');
require('../../../../domain/entities/multitailArrow.js');
require('../../../../domain/entities/highlight.js');
require('../../../../domain/entities/sGroupAttachmentPoint.js');
require('../../../../domain/entities/monomerMicromolecule.js');
require('../../../../domain/entities/Peptide.js');
require('../../../../domain/entities/BaseMonomer.js');
require('../../../../domain/entities/Chem.js');
require('../../../../domain/entities/Sugar.js');
require('../../../../domain/entities/RNABase.js');
require('../../../../domain/entities/Phosphate.js');
require('../../../../domain/entities/Axis.js');
require('../../../../domain/entities/Nucleoside.js');
require('../../../../domain/entities/Nucleotide.js');
require('../../../../domain/entities/monomer-chains/types.js');
require('../../../../domain/entities/monomer-chains/Chain.js');
require('../../../../domain/entities/monomer-chains/ChainsCollection.js');
require('../../../../domain/entities/MonomerSequenceNode.js');
require('../../../../domain/entities/EmptySequenceNode.js');
require('../../../../domain/entities/LinkerSequenceNode.js');
require('../../../../domain/entities/UnresolvedMonomer.js');
require('../../../../domain/entities/UnsplitNucleotide.js');
require('../../../../domain/entities/PolymerBond.js');
require('../../../../domain/entities/AmbiguousMonomer.js');
require('../../../../domain/entities/MonomerToAtomBond.js');
require('../../../../domain/entities/HydrogenBond.js');
require('../../../../domain/entities/SGroupDrawingEntity.js');
require('../../../../domain/entities/BackBoneSequenceNode.js');
require('../../../../domain/entities/Command.js');
require('../../../../utilities/runAsyncAction.js');
require('../../../../utilities/KetcherLogger.js');
require('../../../../utilities/SettingsManager.js');
require('../../../../utilities/keynorm.js');
require('react-device-detect');
require('../../../../utilities/clipboardUtils.js');
require('../../../../domain/entities/CoreAtom.js');
require('../../../../domain/entities/CoreStereoFlag.js');
require('@babel/runtime/helpers/defineProperty');
require('@babel/runtime/helpers/typeof');
require('../../../../domain/constants/elements.js');
require('../../../../domain/constants/element.types.js');
require('../../../../domain/constants/generics.js');
require('../../../../domain/constants/chains.js');
require('../../../../domain/constants/monomers.js');
var CoreBond = require('../../../../domain/entities/CoreBond.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _slicedToArray__default = /*#__PURE__*/_interopDefaultLegacy(_slicedToArray);

function isSingleUpBond(bond) {
  return bond.type === CoreBond.BondType.Single && bond.stereo === CoreBond.BondStereo.Up;
}
function isBoldStereoBond(bond, viewModel) {
  var halfEdges = viewModel.bondsToHalfEdges.get(bond);
  if (!halfEdges) {
    return false;
  }
  var _halfEdges = _slicedToArray__default["default"](halfEdges, 2),
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
  var cos = vec2.Vec2.dot(halfEdgeDir, neighborHalfEdgeDir);
  var sin = vec2.Vec2.cross(halfEdgeDir, neighborHalfEdgeDir);
  var cosHalf = Math.sqrt(0.5 * (1 - cos));
  var biss = neighborHalfEdgeDir.rotateSC((sin >= 0 ? -1 : 1) * cosHalf, Math.sqrt(0.5 * (1 + cos)));
  var denomAdd = 0.3;
  var scale = 0.7;
  var width = scale * constants.StereoBondWidth / (cosHalf + denomAdd);
  var p1 = atomPos.addScaled(biss, width);
  var p2 = atomPos.addScaled(biss.negated(), width);
  return sin > 0 ? [p1, p2] : [p2, p1];
}
var SingleUpBondPathRenderer = function () {
  function SingleUpBondPathRenderer() {
    _classCallCheck__default["default"](this, SingleUpBondPathRenderer);
  }
  _createClass__default["default"](SingleUpBondPathRenderer, null, [{
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
          _getBoldStereoEndpoin2 = _slicedToArray__default["default"](_getBoldStereoEndpoin, 2),
          a1 = _getBoldStereoEndpoin2[0],
          a2 = _getBoldStereoEndpoin2[1];
        var _getBoldStereoEndpoin3 = getBoldStereoEndpoints(secondHalfEdge.direction, endNeighbor.direction, endPosition),
          _getBoldStereoEndpoin4 = _slicedToArray__default["default"](_getBoldStereoEndpoin3, 2),
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
        var _getBoldStereoEndpoin6 = _slicedToArray__default["default"](_getBoldStereoEndpoin5, 2);
        bondEndFirstPoint = _getBoldStereoEndpoin6[0];
        bondEndSecondPoint = _getBoldStereoEndpoin6[1];
      } else {
        var halfOfBondEndWidth = 0.7 * constants.StereoBondWidth;
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

exports["default"] = SingleUpBondPathRenderer;
//# sourceMappingURL=SingleUpBondPathRenderer.js.map
