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
import '../../../domain/entities/atom.modern.js';
import '../../../domain/entities/atomList.modern.js';
import '../../../domain/entities/bond.modern.js';
import '../../../domain/entities/fixedPrecision.modern.js';
import '../../../domain/entities/fragment.modern.js';
import '../../../domain/entities/functionalGroup.modern.js';
import '../../../domain/entities/halfBond.modern.js';
import '../../../domain/entities/loop.modern.js';
import '../../../domain/entities/rgroup.modern.js';
import '../../../domain/entities/rgroupAttachmentPoint.modern.js';
import '../../../domain/entities/rxnArrow.modern.js';
import '../../../domain/entities/rxnPlus.modern.js';
import '../../../domain/entities/sgroup.modern.js';
import '../../../domain/entities/sgroupForest.modern.js';
import '../../../domain/entities/simpleObject.modern.js';
import '../../../domain/entities/struct.modern.js';
import '../../../domain/entities/text.modern.js';
import '../../../domain/entities/pile.modern.js';
import { Vec2 } from '../../../domain/entities/vec2.modern.js';
import '../../../domain/entities/box2Abs.modern.js';
import '../../../domain/entities/pool.modern.js';
import '../../../domain/entities/image.modern.js';
import '../../../domain/entities/multitailArrow.modern.js';
import '../../../domain/entities/highlight.modern.js';
import '../../../domain/entities/sGroupAttachmentPoint.modern.js';
import '../../../domain/entities/monomerMicromolecule.modern.js';
import '../../../domain/entities/Peptide.modern.js';
import '../../../domain/entities/BaseMonomer.modern.js';
import '../../../domain/entities/Chem.modern.js';
import '../../../domain/entities/Sugar.modern.js';
import '../../../domain/entities/RNABase.modern.js';
import '../../../domain/entities/Phosphate.modern.js';
import '../../../domain/entities/Axis.modern.js';
import '../../../domain/entities/Nucleoside.modern.js';
import '../../../domain/entities/Nucleotide.modern.js';
import '../../../domain/entities/monomer-chains/types.modern.js';
import '../../../domain/entities/monomer-chains/Chain.modern.js';
import '../../../domain/entities/monomer-chains/ChainsCollection.modern.js';
import '../../../domain/entities/MonomerSequenceNode.modern.js';
import '../../../domain/entities/EmptySequenceNode.modern.js';
import '../../../domain/entities/LinkerSequenceNode.modern.js';
import '../../../domain/entities/UnresolvedMonomer.modern.js';
import '../../../domain/entities/UnsplitNucleotide.modern.js';
import '../../../domain/entities/PolymerBond.modern.js';
import { AmbiguousMonomer } from '../../../domain/entities/AmbiguousMonomer.modern.js';
import '../../../domain/entities/MonomerToAtomBond.modern.js';
import '../../../domain/entities/HydrogenBond.modern.js';
import '../../../domain/entities/SGroupDrawingEntity.modern.js';
import '../../../domain/entities/BackBoneSequenceNode.modern.js';
import '../../../domain/entities/Command.modern.js';
import '../../../utilities/runAsyncAction.modern.js';
import '../../../utilities/KetcherLogger.modern.js';
import '../../../utilities/SettingsManager.modern.js';
import '../../../utilities/keynorm.modern.js';
import 'react-device-detect';
import '../../../utilities/clipboardUtils.modern.js';
import { assert } from '../../../utilities/assert.modern.js';
import '../../../domain/entities/CoreAtom.modern.js';
import '../../../domain/entities/CoreStereoFlag.modern.js';
import '@babel/runtime/helpers/typeof';
import '../../../domain/constants/elements.modern.js';
import '../../../domain/constants/element.types.modern.js';
import '../../../domain/constants/generics.modern.js';
import '../../../domain/constants/chains.modern.js';
import '../../../domain/constants/monomers.modern.js';
import { EditorHistory } from '../EditorHistory.modern.js';
import { Coordinates } from '../shared/coordinates.modern.js';
import '../editor.types.modern.js';
import './select/SelectBase.modern.js';
import './select/SelectRectangle.modern.js';
import './select/SelectLasso.modern.js';
import './select/SelectFragment.modern.js';
import '../../render/renderers/BaseRenderer.modern.js';
import '../../render/renderers/BaseMonomerRenderer.modern.js';
import '../../render/renderers/AtomRenderer.modern.js';
import '../../render/renderers/ChemRenderer.modern.js';
import '../../render/renderers/PeptideRenderer.modern.js';
import '../../render/renderers/PhosphateRenderer.modern.js';
import '../../render/renderers/SugarRenderer.modern.js';
import '../../render/renderers/RNABaseRenderer.modern.js';
import '../../render/renderers/UnresolvedMonomerRenderer.modern.js';
import '../../render/renderers/UnsplitNucleotideRenderer.modern.js';
import { AmbiguousMonomerRenderer } from '../../render/renderers/AmbiguousMonomerRenderer.modern.js';
import '../../render/renderers/SGroupRenderer.modern.js';
import '../../render/renderers/RenderersManager.modern.js';
import '@babel/runtime/helpers/toConsumableArray';
import '../../render/renderers/sequence/BaseSequenceItemRenderer.modern.js';
import '../../render/renderers/StereoFlagRenderer.modern.js';
import '../../render/renderers/sequence/SequenceRenderer.modern.js';
import '../../render/renderers/sequence/BackBoneBondSequenceRenderer.modern.js';
import '../../render/renderers/sequence/BaseSequenceRenderer.modern.js';
import '../../render/renderers/sequence/ChemSequenceItemRenderer.modern.js';
import '../../render/renderers/sequence/EmptySequenceItemRenderer.modern.js';
import '../../render/renderers/sequence/NucleotideSequenceItemRenderer.modern.js';
import '../../render/renderers/sequence/NucleosideSequenceItemRenderer.modern.js';
import '../../render/renderers/sequence/PeptideSequenceItemRenderer.modern.js';
import '../../render/renderers/sequence/PhosphateSequenceItemRenderer.modern.js';
import '../../render/renderers/sequence/PolymerBondSequenceRenderer.modern.js';
import '../../render/renderers/sequence/RNASequenceItemRenderer.modern.js';
import '../../render/renderers/sequence/SequenceNodeRendererFactory.modern.js';
import '../../render/renderers/sequence/UnresolvedMonomerSequenceItemRenderer.modern.js';
import '../../render/renderers/sequence/UnsplitNucleotideSequenceItemRenderer.modern.js';
import { monomerFactory } from '../../render/renderers/monomerFactory.modern.js';
import { isAmbiguousMonomerLibraryItem } from '../../../domain/helpers/monomers.modern.js';

var MonomerTool = function () {
  function MonomerTool(editor) {
    _classCallCheck(this, MonomerTool);
    _defineProperty(this, "editor", void 0);
    _defineProperty(this, "monomerPreview", void 0);
    _defineProperty(this, "monomerPreviewRenderer", void 0);
    _defineProperty(this, "MONOMER_PREVIEW_SCALE_FACTOR", 0.8);
    _defineProperty(this, "MONOMER_PREVIEW_OFFSET_X", 30);
    _defineProperty(this, "MONOMER_PREVIEW_OFFSET_Y", 30);
    _defineProperty(this, "history", void 0);
    _defineProperty(this, "monomer", void 0);
    this.editor = editor;
    for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }
    var monomer = args[0];
    this.monomer = monomer;
    this.history = EditorHistory.getInstance(this.editor);
  }
  _createClass(MonomerTool, [{
    key: "mousedown",
    value: function mousedown() {
      assert(this.monomerPreviewRenderer);
      var modelChanges;
      var position = Coordinates.canvasToModel(new Vec2(this.editor.lastCursorPositionOfCanvas.x, this.editor.lastCursorPositionOfCanvas.y));
      if (isAmbiguousMonomerLibraryItem(this.monomer)) {
        modelChanges = this.editor.drawingEntitiesManager.addAmbiguousMonomer(this.monomer, position);
      } else {
        modelChanges = this.editor.drawingEntitiesManager.addMonomer(this.monomer,
        position);
      }
      this.history.update(modelChanges);
      this.editor.renderersContainer.update(modelChanges);
      this.editor.calculateAndStoreNextAutochainPosition(modelChanges.operations[0].monomer);
    }
  }, {
    key: "mousemove",
    value: function mousemove() {
      var _this$monomerPreview, _this$monomerPreviewR;
      var position = Coordinates.canvasToModel(new Vec2(this.editor.lastCursorPosition.x + this.MONOMER_PREVIEW_OFFSET_X, this.editor.lastCursorPosition.y + this.MONOMER_PREVIEW_OFFSET_Y));
      (_this$monomerPreview = this.monomerPreview) === null || _this$monomerPreview === void 0 || _this$monomerPreview.moveAbsolute(position);
      (_this$monomerPreviewR = this.monomerPreviewRenderer) === null || _this$monomerPreviewR === void 0 || _this$monomerPreviewR.move();
    }
  }, {
    key: "mouseLeaveClientArea",
    value: function mouseLeaveClientArea() {
      this.hidePreview();
    }
  }, {
    key: "mouseover",
    value: function mouseover() {
      if (!this.monomerPreview) {
        var _this$monomerPreviewR2;
        if (isAmbiguousMonomerLibraryItem(this.monomer)) {
          var variantMonomer = new AmbiguousMonomer(this.monomer);
          this.monomerPreview = variantMonomer;
          this.monomerPreviewRenderer = new AmbiguousMonomerRenderer(variantMonomer, this.MONOMER_PREVIEW_SCALE_FACTOR);
        } else {
          var _monomerFactory = monomerFactory(this.monomer),
            _monomerFactory2 = _slicedToArray(_monomerFactory, 2),
            Monomer = _monomerFactory2[0],
            MonomerRenderer = _monomerFactory2[1];
          this.monomerPreview = new Monomer(this.monomer);
          this.monomerPreviewRenderer = new MonomerRenderer(this.monomerPreview, this.MONOMER_PREVIEW_SCALE_FACTOR, false);
        }
        (_this$monomerPreviewR2 = this.monomerPreviewRenderer) === null || _this$monomerPreviewR2 === void 0 || _this$monomerPreviewR2.show(this.editor.theme);
      }
    }
  }, {
    key: "hidePreview",
    value: function hidePreview() {
      var _this$monomerPreviewR3;
      (_this$monomerPreviewR3 = this.monomerPreviewRenderer) === null || _this$monomerPreviewR3 === void 0 || _this$monomerPreviewR3.remove();
      this.monomerPreviewRenderer = undefined;
      this.monomerPreview = undefined;
    }
  }, {
    key: "destroy",
    value: function destroy() {
      this.hidePreview();
    }
  }]);
  return MonomerTool;
}();

export { MonomerTool };
//# sourceMappingURL=Monomer.modern.js.map
