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
var Sugar = require('../../../domain/entities/Sugar.js');
require('../../../domain/entities/atom.js');
require('../../../domain/entities/atomList.js');
require('../../../domain/entities/bond.js');
require('../../../domain/entities/fixedPrecision.js');
require('../../../domain/entities/fragment.js');
require('../../../domain/entities/functionalGroup.js');
require('../../../domain/entities/halfBond.js');
require('../../../domain/entities/loop.js');
require('../../../domain/entities/rgroup.js');
require('../../../domain/entities/rgroupAttachmentPoint.js');
require('../../../domain/entities/rxnArrow.js');
require('../../../domain/entities/rxnPlus.js');
require('../../../domain/entities/sgroup.js');
require('../../../domain/entities/sgroupForest.js');
require('../../../domain/entities/simpleObject.js');
require('../../../domain/entities/struct.js');
require('../../../domain/entities/text.js');
require('../../../domain/entities/pile.js');
var vec2 = require('../../../domain/entities/vec2.js');
require('../../../domain/entities/box2Abs.js');
require('../../../domain/entities/pool.js');
require('../../../domain/entities/image.js');
require('../../../domain/entities/multitailArrow.js');
require('../../../domain/entities/highlight.js');
require('../../../domain/entities/sGroupAttachmentPoint.js');
require('../../../domain/entities/monomerMicromolecule.js');
require('../../../domain/entities/Peptide.js');
require('../../../domain/entities/BaseMonomer.js');
require('../../../domain/entities/Chem.js');
require('../../../domain/entities/RNABase.js');
var Phosphate = require('../../../domain/entities/Phosphate.js');
require('../../../domain/entities/Axis.js');
require('../../../domain/entities/Nucleoside.js');
require('../../../domain/entities/Nucleotide.js');
require('../../../domain/entities/monomer-chains/types.js');
require('../../../domain/entities/monomer-chains/Chain.js');
require('../../../domain/entities/monomer-chains/ChainsCollection.js');
require('../../../domain/entities/MonomerSequenceNode.js');
require('../../../domain/entities/EmptySequenceNode.js');
require('../../../domain/entities/LinkerSequenceNode.js');
require('../../../domain/entities/UnresolvedMonomer.js');
require('../../../domain/entities/UnsplitNucleotide.js');
require('../../../domain/entities/PolymerBond.js');
require('../../../domain/entities/AmbiguousMonomer.js');
require('../../../domain/entities/MonomerToAtomBond.js');
require('../../../domain/entities/HydrogenBond.js');
require('../../../domain/entities/SGroupDrawingEntity.js');
require('../../../domain/entities/BackBoneSequenceNode.js');
require('../../../domain/entities/Command.js');
require('../../../utilities/runAsyncAction.js');
require('../../../utilities/KetcherLogger.js');
require('../../../utilities/SettingsManager.js');
require('../../../utilities/keynorm.js');
require('react-device-detect');
require('../../../utilities/clipboardUtils.js');
require('../../../domain/entities/CoreAtom.js');
require('../../../domain/entities/CoreStereoFlag.js');
require('@babel/runtime/helpers/typeof');
require('../../../domain/constants/elements.js');
require('../../../domain/constants/element.types.js');
require('../../../domain/constants/generics.js');
require('../../../domain/constants/chains.js');
require('../../../domain/constants/monomers.js');
var layout = require('../../../domain/constants/layout.js');
var EditorHistory = require('../EditorHistory.js');
var coordinates = require('../shared/coordinates.js');
require('../editor.types.js');
require('./select/SelectBase.js');
require('./select/SelectRectangle.js');
require('./select/SelectLasso.js');
require('./select/SelectFragment.js');
var monomerFactory = require('../../render/renderers/monomerFactory.js');
var rnaPresetConnections = require('./rnaPresetConnections.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _slicedToArray__default = /*#__PURE__*/_interopDefaultLegacy(_slicedToArray);
var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);

var RnaPresetTool = function () {
  function RnaPresetTool(editor) {
    _classCallCheck__default["default"](this, RnaPresetTool);
    _defineProperty__default["default"](this, "editor", void 0);
    _defineProperty__default["default"](this, "rnaBase", void 0);
    _defineProperty__default["default"](this, "sugar", void 0);
    _defineProperty__default["default"](this, "phosphate", void 0);
    _defineProperty__default["default"](this, "connections", void 0);
    _defineProperty__default["default"](this, "rnaBasePreview", void 0);
    _defineProperty__default["default"](this, "phosphatePreview", void 0);
    _defineProperty__default["default"](this, "sugarPreview", void 0);
    _defineProperty__default["default"](this, "rnaBasePreviewRenderer", void 0);
    _defineProperty__default["default"](this, "phosphatePreviewRenderer", void 0);
    _defineProperty__default["default"](this, "sugarPreviewRenderer", void 0);
    _defineProperty__default["default"](this, "MONOMER_PREVIEW_SCALE_FACTOR", 0.5);
    _defineProperty__default["default"](this, "MONOMER_PREVIEW_OFFSET_X", 30);
    _defineProperty__default["default"](this, "MONOMER_PREVIEW_OFFSET_Y", 30);
    _defineProperty__default["default"](this, "RNA_BASE_PREVIEW_OFFSET_X", 1);
    _defineProperty__default["default"](this, "RNA_BASE_PREVIEW_OFFSET_Y", 20);
    _defineProperty__default["default"](this, "PHOSPHATE_PREVIEW_OFFSET_X", 18);
    _defineProperty__default["default"](this, "history", void 0);
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
    this.history = EditorHistory.EditorHistory.getInstance(this.editor);
  }
  _createClass__default["default"](RnaPresetTool, [{
    key: "mousedown",
    value: function mousedown() {
      if (!this.sugar || !this.sugarPreviewRenderer) {
        this.editor.events.error.dispatch('No sugar in RNA preset found');
        return;
      }
      var phosphatePosition;
      if (this.phosphatePreviewRenderer) {
        var phosphateOffset = rnaPresetConnections.getRnaPresetPhosphatePosition(this) === 'left' ? -layout.SnakeLayoutCellWidth : layout.SnakeLayoutCellWidth;
        phosphatePosition = coordinates.Coordinates.canvasToModel(new vec2.Vec2(this.editor.lastCursorPositionOfCanvas.x + phosphateOffset, this.editor.lastCursorPositionOfCanvas.y));
      }
      var _this$editor$drawingE = this.editor.drawingEntitiesManager.addRnaPreset({
          sugar: this.sugar,
          sugarPosition: coordinates.Coordinates.canvasToModel(new vec2.Vec2(this.editor.lastCursorPositionOfCanvas.x, this.editor.lastCursorPositionOfCanvas.y)),
          phosphate: this.phosphate,
          phosphatePosition: phosphatePosition,
          rnaBase: this.rnaBase,
          rnaBasePosition: this.rnaBasePreviewRenderer ? coordinates.Coordinates.canvasToModel(new vec2.Vec2(this.editor.lastCursorPositionOfCanvas.x, this.editor.lastCursorPositionOfCanvas.y + layout.SnakeLayoutCellWidth)) : undefined,
          connections: this.connections
        }),
        modelChanges = _this$editor$drawingE.command,
        monomers = _this$editor$drawingE.monomers;
      this.history.update(modelChanges);
      this.editor.renderersContainer.update(modelChanges);
      this.editor.calculateAndStoreNextAutochainPosition(monomers.find(function (monomer) {
        return monomer instanceof Phosphate.Phosphate;
      }) || monomers.find(function (monomer) {
        return monomer instanceof Sugar.Sugar;
      }));
    }
  }, {
    key: "mousemove",
    value: function mousemove() {
      var _this$sugarPreview, _this$rnaBasePreview, _this$phosphatePrevie, _this$rnaBasePreviewR, _this$phosphatePrevie2, _this$sugarPreviewRen;
      (_this$sugarPreview = this.sugarPreview) === null || _this$sugarPreview === void 0 || _this$sugarPreview.moveAbsolute(coordinates.Coordinates.canvasToModel(new vec2.Vec2(this.editor.lastCursorPosition.x + this.MONOMER_PREVIEW_OFFSET_X, this.editor.lastCursorPosition.y + this.MONOMER_PREVIEW_OFFSET_Y)));
      (_this$rnaBasePreview = this.rnaBasePreview) === null || _this$rnaBasePreview === void 0 || _this$rnaBasePreview.moveAbsolute(coordinates.Coordinates.canvasToModel(new vec2.Vec2(this.editor.lastCursorPosition.x + this.MONOMER_PREVIEW_OFFSET_X + this.RNA_BASE_PREVIEW_OFFSET_X, this.editor.lastCursorPosition.y + this.MONOMER_PREVIEW_OFFSET_Y + this.RNA_BASE_PREVIEW_OFFSET_Y)));
      (_this$phosphatePrevie = this.phosphatePreview) === null || _this$phosphatePrevie === void 0 || _this$phosphatePrevie.moveAbsolute(coordinates.Coordinates.canvasToModel(new vec2.Vec2(this.editor.lastCursorPosition.x + this.MONOMER_PREVIEW_OFFSET_X + (rnaPresetConnections.getRnaPresetPhosphatePosition(this) === 'left' ? -this.PHOSPHATE_PREVIEW_OFFSET_X : this.PHOSPHATE_PREVIEW_OFFSET_X), this.editor.lastCursorPosition.y + this.MONOMER_PREVIEW_OFFSET_Y)));
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
      var _monomerFactory = monomerFactory.monomerFactory(this.sugar),
        _monomerFactory2 = _slicedToArray__default["default"](_monomerFactory, 2),
        Sugar = _monomerFactory2[0],
        SugarRenderer = _monomerFactory2[1];
      this.sugarPreview = new Sugar(this.sugar);
      this.sugarPreviewRenderer = new SugarRenderer(this.sugarPreview, this.MONOMER_PREVIEW_SCALE_FACTOR);
      (_this$sugarPreviewRen3 = this.sugarPreviewRenderer) === null || _this$sugarPreviewRen3 === void 0 || _this$sugarPreviewRen3.show(this.editor.theme);
      if (this.rnaBase) {
        var _this$rnaBasePreviewR3;
        var _monomerFactory3 = monomerFactory.monomerFactory(this.rnaBase),
          _monomerFactory4 = _slicedToArray__default["default"](_monomerFactory3, 2),
          RNABase = _monomerFactory4[0],
          RNABaseRenderer = _monomerFactory4[1];
        this.rnaBasePreview = new RNABase(this.rnaBase);
        this.rnaBasePreviewRenderer = new RNABaseRenderer(this.rnaBasePreview, this.MONOMER_PREVIEW_SCALE_FACTOR);
        (_this$rnaBasePreviewR3 = this.rnaBasePreviewRenderer) === null || _this$rnaBasePreviewR3 === void 0 || _this$rnaBasePreviewR3.show(this.editor.theme);
      }
      if (this.phosphate) {
        var _this$phosphatePrevie4;
        var _monomerFactory5 = monomerFactory.monomerFactory(this.phosphate),
          _monomerFactory6 = _slicedToArray__default["default"](_monomerFactory5, 2),
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

exports.RnaPresetTool = RnaPresetTool;
//# sourceMappingURL=RnaPreset.js.map
