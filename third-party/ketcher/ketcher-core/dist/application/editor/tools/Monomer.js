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
require('../../../domain/entities/Sugar.js');
require('../../../domain/entities/RNABase.js');
require('../../../domain/entities/Phosphate.js');
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
var AmbiguousMonomer = require('../../../domain/entities/AmbiguousMonomer.js');
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
var assert = require('../../../utilities/assert.js');
require('../../../domain/entities/CoreAtom.js');
require('../../../domain/entities/CoreStereoFlag.js');
require('@babel/runtime/helpers/typeof');
require('../../../domain/constants/elements.js');
require('../../../domain/constants/element.types.js');
require('../../../domain/constants/generics.js');
require('../../../domain/constants/chains.js');
require('../../../domain/constants/monomers.js');
var EditorHistory = require('../EditorHistory.js');
var coordinates = require('../shared/coordinates.js');
require('../editor.types.js');
require('./select/SelectBase.js');
require('./select/SelectRectangle.js');
require('./select/SelectLasso.js');
require('./select/SelectFragment.js');
require('../../render/renderers/BaseRenderer.js');
require('../../render/renderers/BaseMonomerRenderer.js');
require('../../render/renderers/AtomRenderer.js');
require('../../render/renderers/ChemRenderer.js');
require('../../render/renderers/PeptideRenderer.js');
require('../../render/renderers/PhosphateRenderer.js');
require('../../render/renderers/SugarRenderer.js');
require('../../render/renderers/RNABaseRenderer.js');
require('../../render/renderers/UnresolvedMonomerRenderer.js');
require('../../render/renderers/UnsplitNucleotideRenderer.js');
var AmbiguousMonomerRenderer = require('../../render/renderers/AmbiguousMonomerRenderer.js');
require('../../render/renderers/SGroupRenderer.js');
require('../../render/renderers/RenderersManager.js');
require('@babel/runtime/helpers/toConsumableArray');
require('../../render/renderers/sequence/BaseSequenceItemRenderer.js');
require('../../render/renderers/StereoFlagRenderer.js');
require('../../render/renderers/sequence/SequenceRenderer.js');
require('../../render/renderers/sequence/BackBoneBondSequenceRenderer.js');
require('../../render/renderers/sequence/BaseSequenceRenderer.js');
require('../../render/renderers/sequence/ChemSequenceItemRenderer.js');
require('../../render/renderers/sequence/EmptySequenceItemRenderer.js');
require('../../render/renderers/sequence/NucleotideSequenceItemRenderer.js');
require('../../render/renderers/sequence/NucleosideSequenceItemRenderer.js');
require('../../render/renderers/sequence/PeptideSequenceItemRenderer.js');
require('../../render/renderers/sequence/PhosphateSequenceItemRenderer.js');
require('../../render/renderers/sequence/PolymerBondSequenceRenderer.js');
require('../../render/renderers/sequence/RNASequenceItemRenderer.js');
require('../../render/renderers/sequence/SequenceNodeRendererFactory.js');
require('../../render/renderers/sequence/UnresolvedMonomerSequenceItemRenderer.js');
require('../../render/renderers/sequence/UnsplitNucleotideSequenceItemRenderer.js');
var monomerFactory = require('../../render/renderers/monomerFactory.js');
var monomers = require('../../../domain/helpers/monomers.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _slicedToArray__default = /*#__PURE__*/_interopDefaultLegacy(_slicedToArray);
var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);

var MonomerTool = function () {
  function MonomerTool(editor) {
    _classCallCheck__default["default"](this, MonomerTool);
    _defineProperty__default["default"](this, "editor", void 0);
    _defineProperty__default["default"](this, "monomerPreview", void 0);
    _defineProperty__default["default"](this, "monomerPreviewRenderer", void 0);
    _defineProperty__default["default"](this, "MONOMER_PREVIEW_SCALE_FACTOR", 0.8);
    _defineProperty__default["default"](this, "MONOMER_PREVIEW_OFFSET_X", 30);
    _defineProperty__default["default"](this, "MONOMER_PREVIEW_OFFSET_Y", 30);
    _defineProperty__default["default"](this, "history", void 0);
    _defineProperty__default["default"](this, "monomer", void 0);
    this.editor = editor;
    for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }
    var monomer = args[0];
    this.monomer = monomer;
    this.history = EditorHistory.EditorHistory.getInstance(this.editor);
  }
  _createClass__default["default"](MonomerTool, [{
    key: "mousedown",
    value: function mousedown() {
      assert.assert(this.monomerPreviewRenderer);
      var modelChanges;
      var position = coordinates.Coordinates.canvasToModel(new vec2.Vec2(this.editor.lastCursorPositionOfCanvas.x, this.editor.lastCursorPositionOfCanvas.y));
      if (monomers.isAmbiguousMonomerLibraryItem(this.monomer)) {
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
      var position = coordinates.Coordinates.canvasToModel(new vec2.Vec2(this.editor.lastCursorPosition.x + this.MONOMER_PREVIEW_OFFSET_X, this.editor.lastCursorPosition.y + this.MONOMER_PREVIEW_OFFSET_Y));
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
        if (monomers.isAmbiguousMonomerLibraryItem(this.monomer)) {
          var variantMonomer = new AmbiguousMonomer.AmbiguousMonomer(this.monomer);
          this.monomerPreview = variantMonomer;
          this.monomerPreviewRenderer = new AmbiguousMonomerRenderer.AmbiguousMonomerRenderer(variantMonomer, this.MONOMER_PREVIEW_SCALE_FACTOR);
        } else {
          var _monomerFactory = monomerFactory.monomerFactory(this.monomer),
            _monomerFactory2 = _slicedToArray__default["default"](_monomerFactory, 2),
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

exports.MonomerTool = MonomerTool;
//# sourceMappingURL=Monomer.js.map
