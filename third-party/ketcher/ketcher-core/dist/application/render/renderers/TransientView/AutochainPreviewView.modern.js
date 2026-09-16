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
import _slicedToArray from '@babel/runtime/helpers/slicedToArray';
import _classCallCheck from '@babel/runtime/helpers/classCallCheck';
import _createClass from '@babel/runtime/helpers/createClass';
import _defineProperty from '@babel/runtime/helpers/defineProperty';
import { provideEditorInstance } from '../../../editor/editorSingleton.modern.js';
import { Coordinates } from '../../../editor/shared/coordinates.modern.js';
import { getRnaPresetPhosphatePosition } from '../../../editor/tools/rnaPresetConnections.modern.js';
import { monomerFactory } from '../monomerFactory.modern.js';
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
import { KetcherLogger } from '../../../../utilities/KetcherLogger.modern.js';
import '../../../../utilities/SettingsManager.modern.js';
import '../../../../utilities/keynorm.modern.js';
import 'react-device-detect';
import '../../../../utilities/clipboardUtils.modern.js';
import '../../../../domain/entities/CoreAtom.modern.js';
import '../../../../domain/entities/CoreStereoFlag.modern.js';
import '@babel/runtime/helpers/typeof';
import '../../../../domain/constants/elements.modern.js';
import '../../../../domain/constants/element.types.modern.js';
import '../../../../domain/constants/generics.modern.js';
import '../../../../domain/constants/chains.modern.js';
import '../../../../domain/constants/monomers.modern.js';
import { SnakeLayoutCellWidth } from '../../../../domain/constants/layout.modern.js';
import { isLibraryItemRnaPreset } from '../../../../domain/helpers/monomers.modern.js';

var AutochainPreviewView = function () {
  function AutochainPreviewView() {
    _classCallCheck(this, AutochainPreviewView);
  }
  _createClass(AutochainPreviewView, null, [{
    key: "showSingleMonomerPreview",
    value: function showSingleMonomerPreview(transientLayer, monomerOrRnaItem, scaledPosition) {
      var _monomerAutochainSymb, _monomerAutochainSymb2;
      var editor = provideEditorInstance();
      var _monomerFactory = monomerFactory(monomerOrRnaItem),
        _monomerFactory2 = _slicedToArray(_monomerFactory, 2),
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
      var scaledPosition = Coordinates.modelToCanvas(position);
      var sizeOfAutochainPreviewToConnect;
      if (isLibraryItemRnaPreset(monomerOrRnaItem)) {
        var _monomerOrRnaItem$pho;
        if (!monomerOrRnaItem.sugar) {
          KetcherLogger.error('Cannot show autochain preview for RNA preset without sugar');
          return;
        }
        var phosphateOnLeft = ((_monomerOrRnaItem$pho = monomerOrRnaItem.phosphatePosition) !== null && _monomerOrRnaItem$pho !== void 0 ? _monomerOrRnaItem$pho : getRnaPresetPhosphatePosition(monomerOrRnaItem)) === 'left';
        var sugarPosition = phosphateOnLeft && monomerOrRnaItem.phosphate ? position.add(new Vec2(1.5, 0)) : position;
        var scaledSugarPosition = Coordinates.modelToCanvas(sugarPosition);
        sizeOfAutochainPreviewToConnect = AutochainPreviewView.showSingleMonomerPreview(transientLayer, monomerOrRnaItem.sugar, scaledSugarPosition);
        var leftConnectionPointX = scaledSugarPosition.x - sizeOfAutochainPreviewToConnect.width / 2;
        if (monomerOrRnaItem.base) {
          var basePosition = sugarPosition.add(new Vec2(0, 1.5));
          var scaledBasePosition = Coordinates.modelToCanvas(basePosition);
          var sizeOfBaseAutochainPreview = AutochainPreviewView.showSingleMonomerPreview(transientLayer, monomerOrRnaItem.base, scaledBasePosition);
          AutochainPreviewView.showBondPreview(transientLayer, scaledSugarPosition.x, scaledSugarPosition.y + sizeOfAutochainPreviewToConnect.height / 2, scaledSugarPosition.x, scaledBasePosition.y - sizeOfBaseAutochainPreview.height / 2);
        }
        if (monomerOrRnaItem.phosphate) {
          var phosphatePosition = phosphateOnLeft ? position : sugarPosition.add(new Vec2(1.5, 0));
          var scaledPhosphatePosition = Coordinates.modelToCanvas(phosphatePosition);
          var sizeOfPhosphateAutochainPreview = AutochainPreviewView.showSingleMonomerPreview(transientLayer, monomerOrRnaItem.phosphate, scaledPhosphatePosition);
          AutochainPreviewView.showBondPreview(transientLayer, phosphateOnLeft ? scaledPhosphatePosition.x + sizeOfPhosphateAutochainPreview.width / 2 : scaledSugarPosition.x + sizeOfAutochainPreviewToConnect.width / 2, scaledSugarPosition.y, phosphateOnLeft ? scaledSugarPosition.x - sizeOfAutochainPreviewToConnect.width / 2 : scaledPhosphatePosition.x - sizeOfPhosphateAutochainPreview.width / 2, scaledSugarPosition.y);
          if (phosphateOnLeft) {
            leftConnectionPointX = scaledPhosphatePosition.x - sizeOfPhosphateAutochainPreview.width / 2;
          }
        }
        if (selectedMonomerToConnect) {
          AutochainPreviewView.showBondPreview(transientLayer, scaledPosition.x - SnakeLayoutCellWidth, scaledPosition.y, leftConnectionPointX, scaledPosition.y);
        }
      } else {
        sizeOfAutochainPreviewToConnect = AutochainPreviewView.showSingleMonomerPreview(transientLayer, monomerOrRnaItem, scaledPosition);
      }
      if (selectedMonomerToConnect && !isLibraryItemRnaPreset(monomerOrRnaItem)) {
        AutochainPreviewView.showBondPreview(transientLayer, scaledPosition.x - SnakeLayoutCellWidth, scaledPosition.y, scaledPosition.x - sizeOfAutochainPreviewToConnect.width / 2, scaledPosition.y);
      }
    }
  }]);
  return AutochainPreviewView;
}();
_defineProperty(AutochainPreviewView, "viewName", 'AutochainPreviewView');

export { AutochainPreviewView };
//# sourceMappingURL=AutochainPreviewView.modern.js.map
