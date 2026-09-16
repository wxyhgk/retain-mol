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
import { Sugar } from '../../../domain/entities/Sugar.modern.js';
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
import '../../../domain/entities/RNABase.modern.js';
import { Phosphate } from '../../../domain/entities/Phosphate.modern.js';
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
import '../../../domain/entities/AmbiguousMonomer.modern.js';
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
import '../../../domain/entities/CoreAtom.modern.js';
import '../../../domain/entities/CoreStereoFlag.modern.js';
import '@babel/runtime/helpers/typeof';
import '../../../domain/constants/elements.modern.js';
import '../../../domain/constants/element.types.modern.js';
import '../../../domain/constants/generics.modern.js';
import '../../../domain/constants/chains.modern.js';
import '../../../domain/constants/monomers.modern.js';
import { SnakeLayoutCellWidth } from '../../../domain/constants/layout.modern.js';
import { EditorHistory } from '../EditorHistory.modern.js';
import { Coordinates } from '../shared/coordinates.modern.js';
import '../editor.types.modern.js';
import './select/SelectBase.modern.js';
import './select/SelectRectangle.modern.js';
import './select/SelectLasso.modern.js';
import './select/SelectFragment.modern.js';
import { monomerFactory } from '../../render/renderers/monomerFactory.modern.js';
import { getRnaPresetPhosphatePosition } from './rnaPresetConnections.modern.js';

var RnaPresetTool = function () {
  function RnaPresetTool(editor) {
    _classCallCheck(this, RnaPresetTool);
    _defineProperty(this, "editor", void 0);
    _defineProperty(this, "rnaBase", void 0);
    _defineProperty(this, "sugar", void 0);
    _defineProperty(this, "phosphate", void 0);
    _defineProperty(this, "connections", void 0);
    _defineProperty(this, "rnaBasePreview", void 0);
    _defineProperty(this, "phosphatePreview", void 0);
    _defineProperty(this, "sugarPreview", void 0);
    _defineProperty(this, "rnaBasePreviewRenderer", void 0);
    _defineProperty(this, "phosphatePreviewRenderer", void 0);
    _defineProperty(this, "sugarPreviewRenderer", void 0);
    _defineProperty(this, "MONOMER_PREVIEW_SCALE_FACTOR", 0.5);
    _defineProperty(this, "MONOMER_PREVIEW_OFFSET_X", 30);
    _defineProperty(this, "MONOMER_PREVIEW_OFFSET_Y", 30);
    _defineProperty(this, "RNA_BASE_PREVIEW_OFFSET_X", 1);
    _defineProperty(this, "RNA_BASE_PREVIEW_OFFSET_Y", 20);
    _defineProperty(this, "PHOSPHATE_PREVIEW_OFFSET_X", 18);
    _defineProperty(this, "history", void 0);
    this.editor = editor;
    for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }
    var preset = args[0];
    this.editor = editor;
    if (preset !== null && preset !== void 0 && preset.base) {
      this.rnaBase = preset === null || preset === void 0 ? void 0 : preset.base;
    }
    if (preset !== null && preset !== void 0 && preset.phosphate) {
      this.phosphate = preset === null || preset === void 0 ? void 0 : preset.phosphate;
    }
    this.connections = (preset === null || preset === void 0 ? void 0 : preset.connections) || [];
    if (preset !== null && preset !== void 0 && preset.sugar) {
      this.sugar = preset === null || preset === void 0 ? void 0 : preset.sugar;
    }
    if (preset !== null && preset !== void 0 && preset.connections) {
      this.connections = preset === null || preset === void 0 ? void 0 : preset.connections;
    }
    this.history = EditorHistory.getInstance(this.editor);
  }
  _createClass(RnaPresetTool, [{
    key: "mousedown",
    value: function mousedown() {
      if (!this.sugar || !this.sugarPreviewRenderer) {
        this.editor.events.error.dispatch('No sugar in RNA preset found');
        return;
      }
      var phosphatePosition;
      if (this.phosphatePreviewRenderer) {
        var phosphateOffset = getRnaPresetPhosphatePosition(this) === 'left' ? -SnakeLayoutCellWidth : SnakeLayoutCellWidth;
        phosphatePosition = Coordinates.canvasToModel(new Vec2(this.editor.lastCursorPositionOfCanvas.x + phosphateOffset, this.editor.lastCursorPositionOfCanvas.y));
      }
      var _this$editor$drawingE = this.editor.drawingEntitiesManager.addRnaPreset({
          sugar: this.sugar,
          sugarPosition: Coordinates.canvasToModel(new Vec2(this.editor.lastCursorPositionOfCanvas.x, this.editor.lastCursorPositionOfCanvas.y)),
          phosphate: this.phosphate,
          phosphatePosition: phosphatePosition,
          rnaBase: this.rnaBase,
          rnaBasePosition: this.rnaBasePreviewRenderer ? Coordinates.canvasToModel(new Vec2(this.editor.lastCursorPositionOfCanvas.x, this.editor.lastCursorPositionOfCanvas.y + SnakeLayoutCellWidth)) : undefined,
          connections: this.connections
        }),
        modelChanges = _this$editor$drawingE.command,
        monomers = _this$editor$drawingE.monomers;
      this.history.update(modelChanges);
      this.editor.renderersContainer.update(modelChanges);
      this.editor.calculateAndStoreNextAutochainPosition(monomers.find(function (monomer) {
        return monomer instanceof Phosphate;
      }) || monomers.find(function (monomer) {
        return monomer instanceof Sugar;
      }));
    }
  }, {
    key: "mousemove",
    value: function mousemove() {
      var _this$sugarPreview, _this$rnaBasePreview, _this$phosphatePrevie, _this$rnaBasePreviewR, _this$phosphatePrevie2, _this$sugarPreviewRen;
      (_this$sugarPreview = this.sugarPreview) === null || _this$sugarPreview === void 0 || _this$sugarPreview.moveAbsolute(Coordinates.canvasToModel(new Vec2(this.editor.lastCursorPosition.x + this.MONOMER_PREVIEW_OFFSET_X, this.editor.lastCursorPosition.y + this.MONOMER_PREVIEW_OFFSET_Y)));
      (_this$rnaBasePreview = this.rnaBasePreview) === null || _this$rnaBasePreview === void 0 || _this$rnaBasePreview.moveAbsolute(Coordinates.canvasToModel(new Vec2(this.editor.lastCursorPosition.x + this.MONOMER_PREVIEW_OFFSET_X + this.RNA_BASE_PREVIEW_OFFSET_X, this.editor.lastCursorPosition.y + this.MONOMER_PREVIEW_OFFSET_Y + this.RNA_BASE_PREVIEW_OFFSET_Y)));
      (_this$phosphatePrevie = this.phosphatePreview) === null || _this$phosphatePrevie === void 0 || _this$phosphatePrevie.moveAbsolute(Coordinates.canvasToModel(new Vec2(this.editor.lastCursorPosition.x + this.MONOMER_PREVIEW_OFFSET_X + (getRnaPresetPhosphatePosition(this) === 'left' ? -this.PHOSPHATE_PREVIEW_OFFSET_X : this.PHOSPHATE_PREVIEW_OFFSET_X), this.editor.lastCursorPosition.y + this.MONOMER_PREVIEW_OFFSET_Y)));
      (_this$rnaBasePreviewR = this.rnaBasePreviewRenderer) === null || _this$rnaBasePreviewR === void 0 || _this$rnaBasePreviewR.move();
      (_this$phosphatePrevie2 = this.phosphatePreviewRenderer) === null || _this$phosphatePrevie2 === void 0 || _this$phosphatePrevie2.move();
      (_this$sugarPreviewRen = this.sugarPreviewRenderer) === null || _this$sugarPreviewRen === void 0 || _this$sugarPreviewRen.move();
    }
  }, {
    key: "mouseLeaveClientArea",
    value: function mouseLeaveClientArea() {
      var _this$sugarPreviewRen2, _this$phosphatePrevie3, _this$rnaBasePreviewR2;
      (_this$sugarPreviewRen2 = this.sugarPreviewRenderer) === null || _this$sugarPreviewRen2 === void 0 || _this$sugarPreviewRen2.remove();
      this.sugarPreviewRenderer = undefined;
      this.sugarPreview = undefined;
      (_this$phosphatePrevie3 = this.phosphatePreviewRenderer) === null || _this$phosphatePrevie3 === void 0 || _this$phosphatePrevie3.remove();
      this.phosphatePreviewRenderer = undefined;
      this.phosphatePreview = undefined;
      (_this$rnaBasePreviewR2 = this.rnaBasePreviewRenderer) === null || _this$rnaBasePreviewR2 === void 0 || _this$rnaBasePreviewR2.remove();
      this.rnaBasePreviewRenderer = undefined;
      this.rnaBasePreview = undefined;
    }
  }, {
    key: "mouseover",
    value: function mouseover() {
      var _this$sugarPreviewRen3;
      if (!this.sugar) {
        this.editor.events.error.dispatch('No sugar in RNA preset found');
        return;
      }
      if (this.sugarPreview) {
        return;
      }
      var _monomerFactory = monomerFactory(this.sugar),
        _monomerFactory2 = _slicedToArray(_monomerFactory, 2),
        Sugar = _monomerFactory2[0],
        SugarRenderer = _monomerFactory2[1];
      this.sugarPreview = new Sugar(this.sugar);
      this.sugarPreviewRenderer = new SugarRenderer(this.sugarPreview, this.MONOMER_PREVIEW_SCALE_FACTOR);
      (_this$sugarPreviewRen3 = this.sugarPreviewRenderer) === null || _this$sugarPreviewRen3 === void 0 || _this$sugarPreviewRen3.show(this.editor.theme);
      if (this.rnaBase) {
        var _this$rnaBasePreviewR3;
        var _monomerFactory3 = monomerFactory(this.rnaBase),
          _monomerFactory4 = _slicedToArray(_monomerFactory3, 2),
          RNABase = _monomerFactory4[0],
          RNABaseRenderer = _monomerFactory4[1];
        this.rnaBasePreview = new RNABase(this.rnaBase);
        this.rnaBasePreviewRenderer = new RNABaseRenderer(this.rnaBasePreview, this.MONOMER_PREVIEW_SCALE_FACTOR);
        (_this$rnaBasePreviewR3 = this.rnaBasePreviewRenderer) === null || _this$rnaBasePreviewR3 === void 0 || _this$rnaBasePreviewR3.show(this.editor.theme);
      }
      if (this.phosphate) {
        var _this$phosphatePrevie4;
        var _monomerFactory5 = monomerFactory(this.phosphate),
          _monomerFactory6 = _slicedToArray(_monomerFactory5, 2),
          _Phosphate = _monomerFactory6[0],
          PhosphateRenderer = _monomerFactory6[1];
        this.phosphatePreview = new _Phosphate(this.phosphate);
        this.phosphatePreviewRenderer = new PhosphateRenderer(this.phosphatePreview, this.MONOMER_PREVIEW_SCALE_FACTOR);
        (_this$phosphatePrevie4 = this.phosphatePreviewRenderer) === null || _this$phosphatePrevie4 === void 0 || _this$phosphatePrevie4.show(this.editor.theme);
      }
    }
  }, {
    key: "hidePreview",
    value: function hidePreview() {
      var _this$rnaBasePreviewR4, _this$phosphatePrevie5, _this$sugarPreviewRen4;
      (_this$rnaBasePreviewR4 = this.rnaBasePreviewRenderer) === null || _this$rnaBasePreviewR4 === void 0 || _this$rnaBasePreviewR4.remove();
      (_this$phosphatePrevie5 = this.phosphatePreviewRenderer) === null || _this$phosphatePrevie5 === void 0 || _this$phosphatePrevie5.remove();
      (_this$sugarPreviewRen4 = this.sugarPreviewRenderer) === null || _this$sugarPreviewRen4 === void 0 || _this$sugarPreviewRen4.remove();
    }
  }, {
    key: "destroy",
    value: function destroy() {
      this.hidePreview();
    }
  }]);
  return RnaPresetTool;
}();

export { RnaPresetTool };
//# sourceMappingURL=RnaPreset.modern.js.map
