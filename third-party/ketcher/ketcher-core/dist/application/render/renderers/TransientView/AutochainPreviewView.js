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

var _slicedToArray = require('@babel/runtime/helpers/slicedToArray');
var _classCallCheck = require('@babel/runtime/helpers/classCallCheck');
var _createClass = require('@babel/runtime/helpers/createClass');
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var editorSingleton = require('../../../editor/editorSingleton.js');
var coordinates = require('../../../editor/shared/coordinates.js');
var rnaPresetConnections = require('../../../editor/tools/rnaPresetConnections.js');
var monomerFactory = require('../monomerFactory.js');
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
var KetcherLogger = require('../../../../utilities/KetcherLogger.js');
require('../../../../utilities/SettingsManager.js');
require('../../../../utilities/keynorm.js');
require('react-device-detect');
require('../../../../utilities/clipboardUtils.js');
require('../../../../domain/entities/CoreAtom.js');
require('../../../../domain/entities/CoreStereoFlag.js');
require('@babel/runtime/helpers/typeof');
require('../../../../domain/constants/elements.js');
require('../../../../domain/constants/element.types.js');
require('../../../../domain/constants/generics.js');
require('../../../../domain/constants/chains.js');
require('../../../../domain/constants/monomers.js');
var layout = require('../../../../domain/constants/layout.js');
var monomers = require('../../../../domain/helpers/monomers.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _slicedToArray__default = /*#__PURE__*/_interopDefaultLegacy(_slicedToArray);
var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);

var AutochainPreviewView = function () {
  function AutochainPreviewView() {
    _classCallCheck__default["default"](this, AutochainPreviewView);
  }
  _createClass__default["default"](AutochainPreviewView, null, [{
    key: "showSingleMonomerPreview",
    value: function showSingleMonomerPreview(transientLayer, monomerOrRnaItem, scaledPosition) {
      var _monomerAutochainSymb, _monomerAutochainSymb2;
      var editor = editorSingleton.provideEditorInstance();
      var _monomerFactory = monomerFactory.monomerFactory(monomerOrRnaItem),
        _monomerFactory2 = _slicedToArray__default["default"](_monomerFactory, 2),
        Monomer = _monomerFactory2[0],
        MonomerRenderer = _monomerFactory2[1];
      var monomerInstance = new Monomer(monomerOrRnaItem);
      var monomerRenderer = new MonomerRenderer(monomerInstance);
      var monomerAutochainSymbolElementId = monomerRenderer.monomerAutochainPreviewElementId;
      var monomerAutochainSymbolElement = editor.canvas.querySelector(monomerAutochainSymbolElementId);
      var monomerAutochainPreviewSize = {
        width: Number((_monomerAutochainSymb = monomerAutochainSymbolElement === null || monomerAutochainSymbolElement === void 0 ? void 0 : monomerAutochainSymbolElement.getAttribute('data-actual-width')) !== null && _monomerAutochainSymb !== void 0 ? _monomerAutochainSymb : 0),
        height: Number((_monomerAutochainSymb2 = monomerAutochainSymbolElement === null || monomerAutochainSymbolElement === void 0 ? void 0 : monomerAutochainSymbolElement.getAttribute('data-actual-height')) !== null && _monomerAutochainSymb2 !== void 0 ? _monomerAutochainSymb2 : 0)
      };
      transientLayer.append('g').attr('transform-origin', 'center').attr('transform', "translate(".concat(scaledPosition.x - monomerAutochainPreviewSize.width / 2, ", ").concat(scaledPosition.y - monomerAutochainPreviewSize.height / 2, ")")).append('use').attr('href', monomerAutochainSymbolElementId).attr('fill', 'none').attr('stroke', '#167782');
      return monomerAutochainPreviewSize;
    }
  }, {
    key: "showBondPreview",
    value: function showBondPreview(transientLayer, x1, y1, x2, y2) {
      transientLayer.append('line').attr('x1', x1).attr('y1', y1).attr('x2', x2).attr('y2', y2).attr('stroke', '#167782').attr('stroke-width', 1).attr('stroke-dasharray', '4 4');
    }
  }, {
    key: "show",
    value: function show(transientLayer, params) {
      var monomerOrRnaItem = params.monomerOrRnaItem,
        position = params.position,
        selectedMonomerToConnect = params.selectedMonomerToConnect;
      var scaledPosition = coordinates.Coordinates.modelToCanvas(position);
      var sizeOfAutochainPreviewToConnect;
      if (monomers.isLibraryItemRnaPreset(monomerOrRnaItem)) {
        var _monomerOrRnaItem$pho;
        if (!monomerOrRnaItem.sugar) {
          KetcherLogger.KetcherLogger.error('Cannot show autochain preview for RNA preset without sugar');
          return;
        }
        var phosphateOnLeft = ((_monomerOrRnaItem$pho = monomerOrRnaItem.phosphatePosition) !== null && _monomerOrRnaItem$pho !== void 0 ? _monomerOrRnaItem$pho : rnaPresetConnections.getRnaPresetPhosphatePosition(monomerOrRnaItem)) === 'left';
        var sugarPosition = phosphateOnLeft && monomerOrRnaItem.phosphate ? position.add(new vec2.Vec2(1.5, 0)) : position;
        var scaledSugarPosition = coordinates.Coordinates.modelToCanvas(sugarPosition);
        sizeOfAutochainPreviewToConnect = AutochainPreviewView.showSingleMonomerPreview(transientLayer, monomerOrRnaItem.sugar, scaledSugarPosition);
        var leftConnectionPointX = scaledSugarPosition.x - sizeOfAutochainPreviewToConnect.width / 2;
        if (monomerOrRnaItem.base) {
          var basePosition = sugarPosition.add(new vec2.Vec2(0, 1.5));
          var scaledBasePosition = coordinates.Coordinates.modelToCanvas(basePosition);
          var sizeOfBaseAutochainPreview = AutochainPreviewView.showSingleMonomerPreview(transientLayer, monomerOrRnaItem.base, scaledBasePosition);
          AutochainPreviewView.showBondPreview(transientLayer, scaledSugarPosition.x, scaledSugarPosition.y + sizeOfAutochainPreviewToConnect.height / 2, scaledSugarPosition.x, scaledBasePosition.y - sizeOfBaseAutochainPreview.height / 2);
        }
        if (monomerOrRnaItem.phosphate) {
          var phosphatePosition = phosphateOnLeft ? position : sugarPosition.add(new vec2.Vec2(1.5, 0));
          var scaledPhosphatePosition = coordinates.Coordinates.modelToCanvas(phosphatePosition);
          var sizeOfPhosphateAutochainPreview = AutochainPreviewView.showSingleMonomerPreview(transientLayer, monomerOrRnaItem.phosphate, scaledPhosphatePosition);
          AutochainPreviewView.showBondPreview(transientLayer, phosphateOnLeft ? scaledPhosphatePosition.x + sizeOfPhosphateAutochainPreview.width / 2 : scaledSugarPosition.x + sizeOfAutochainPreviewToConnect.width / 2, scaledSugarPosition.y, phosphateOnLeft ? scaledSugarPosition.x - sizeOfAutochainPreviewToConnect.width / 2 : scaledPhosphatePosition.x - sizeOfPhosphateAutochainPreview.width / 2, scaledSugarPosition.y);
          if (phosphateOnLeft) {
            leftConnectionPointX = scaledPhosphatePosition.x - sizeOfPhosphateAutochainPreview.width / 2;
          }
        }
        if (selectedMonomerToConnect) {
          AutochainPreviewView.showBondPreview(transientLayer, scaledPosition.x - layout.SnakeLayoutCellWidth, scaledPosition.y, leftConnectionPointX, scaledPosition.y);
        }
      } else {
        sizeOfAutochainPreviewToConnect = AutochainPreviewView.showSingleMonomerPreview(transientLayer, monomerOrRnaItem, scaledPosition);
      }
      if (selectedMonomerToConnect && !monomers.isLibraryItemRnaPreset(monomerOrRnaItem)) {
        AutochainPreviewView.showBondPreview(transientLayer, scaledPosition.x - layout.SnakeLayoutCellWidth, scaledPosition.y, scaledPosition.x - sizeOfAutochainPreviewToConnect.width / 2, scaledPosition.y);
      }
    }
  }]);
  return AutochainPreviewView;
}();
_defineProperty__default["default"](AutochainPreviewView, "viewName", 'AutochainPreviewView');

exports.AutochainPreviewView = AutochainPreviewView;
//# sourceMappingURL=AutochainPreviewView.js.map
