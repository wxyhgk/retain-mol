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
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var editorSingleton = require('../../../editor/editorSingleton.js');
require('../../renderStruct.js');
require('../../raphaelRender.js');
require('../../restruct/reobject.js');
require('../../restruct/reatom.js');
require('../../restruct/rebond.js');
require('../../restruct/reenhancedFlag.js');
require('../../restruct/refrag.js');
require('../../restruct/rergroup.js');
require('../../restruct/rerxnarrow.js');
require('../../restruct/rerxnplus.js');
require('../../restruct/resgroup.js');
require('../../restruct/resimpleObject.js');
require('../../restruct/restruct.js');
require('../../restruct/retext.js');
require('../../restruct/visel.js');
require('../../restruct/generalEnumTypes.js');
require('../../restruct/showHydrogenLabels.js');
require('../../restruct/rergroupAttachmentPoint.js');
require('../../restruct/reImage.js');
require('../../restruct/remultitailArrow.js');
require('../BaseRenderer.js');
var BaseMonomerRenderer = require('../BaseMonomerRenderer.js');
require('../AtomRenderer.js');
require('../ChemRenderer.js');
require('../PeptideRenderer.js');
require('../PhosphateRenderer.js');
require('../SugarRenderer.js');
require('../RNABaseRenderer.js');
require('../UnresolvedMonomerRenderer.js');
require('../UnsplitNucleotideRenderer.js');
require('../AmbiguousMonomerRenderer.js');
require('../SGroupRenderer.js');
require('../RenderersManager.js');
require('@babel/runtime/helpers/toConsumableArray');
require('../../../../utilities/runAsyncAction.js');
require('../../../../utilities/KetcherLogger.js');
require('../../../../utilities/SettingsManager.js');
require('../../../../utilities/keynorm.js');
require('react-device-detect');
require('../../../../utilities/clipboardUtils.js');
var BaseSequenceItemRenderer = require('../sequence/BaseSequenceItemRenderer.js');
require('../../../../domain/entities/Chem.js');
require('../StereoFlagRenderer.js');
require('../sequence/SequenceRenderer.js');
require('../sequence/BackBoneBondSequenceRenderer.js');
require('../sequence/BaseSequenceRenderer.js');
require('../sequence/ChemSequenceItemRenderer.js');
require('../sequence/EmptySequenceItemRenderer.js');
require('../sequence/NucleotideSequenceItemRenderer.js');
require('../sequence/NucleosideSequenceItemRenderer.js');
require('../sequence/PeptideSequenceItemRenderer.js');
require('../sequence/PhosphateSequenceItemRenderer.js');
require('../sequence/PolymerBondSequenceRenderer.js');
require('../sequence/RNASequenceItemRenderer.js');
require('../sequence/SequenceNodeRendererFactory.js');
require('../sequence/UnresolvedMonomerSequenceItemRenderer.js');
require('../sequence/UnsplitNucleotideSequenceItemRenderer.js');
require('../../../../domain/entities/vec2.js');
require('../../../../domain/helpers/functionalGroupsProvider.js');
require('../../../../domain/helpers/saltsAndSolventsProvider.js');
require('../../../../domain/constants/generics.js');
require('../../../../domain/helpers/attachmentPointCalculations.js');
require('../../scrollbar/scrollbar-container.js');
require('../../notifyRenderComplete.js');
require('lodash');
require('../constants.js');
require('../../render.types.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);

var ModifyAminoAcidsView = function () {
  function ModifyAminoAcidsView() {
    _classCallCheck__default["default"](this, ModifyAminoAcidsView);
  }
  _createClass__default["default"](ModifyAminoAcidsView, null, [{
    key: "show",
    value: function show(transientLayer, params) {
      var editor = editorSingleton.provideEditorInstance();
      var monomersToModify = params.monomersToModify;
      if (editor.mode.modeName === 'sequence-layout-mode') {
        monomersToModify.forEach(function (monomer) {
          var renderer = monomer.renderer;
          if (!(renderer instanceof BaseSequenceItemRenderer.BaseSequenceItemRenderer)) {
            return;
          }
          var monomerRendererPositionInPixels = renderer.scaledMonomerPositionForSequence;
          if (!monomerRendererPositionInPixels) {
            return;
          }
          var group = transientLayer.append('g').attr('transform', "translate(".concat(monomerRendererPositionInPixels.x - 2, ", ").concat(monomerRendererPositionInPixels.y - 18, ")"));
          group.append('rect').attr('width', 16).attr('height', 24).attr('fill', '#4EE581').attr('rx', 2).attr('style', "\n            filter: drop-shadow(0px 1px 1px #676884D9);\n          ");
          group.append('text').text(renderer.symbolToDisplay).attr('y', 18).attr('x', 2).attr('font-family', 'Courier New').attr('font-size', '20px').attr('font-weight', '700').attr('style', 'user-select: none');
          if (renderer.node.modified) {
            group === null || group === void 0 || group.append('path').attr('d', 'M 2,21 L 14,21').attr('stroke', '#333333').attr('stroke-linecap', 'round').attr('stroke-width', '1.7px');
          }
        });
      } else {
        monomersToModify.forEach(function (monomer) {
          var _monomer$renderer;
          var monomerCenterInPixels = (_monomer$renderer = monomer.renderer) === null || _monomer$renderer === void 0 ? void 0 : _monomer$renderer.center;
          if (!monomerCenterInPixels) {
            return;
          }
          transientLayer.append('circle').attr('cx', monomerCenterInPixels.x).attr('cy', monomerCenterInPixels.y).attr('r', BaseMonomerRenderer.BaseMonomerRenderer.selectionCircleRadius).attr('fill', 'none').attr('stroke', '#0097A8').attr('stroke-width', 1);
        });
      }
    }
  }]);
  return ModifyAminoAcidsView;
}();
_defineProperty__default["default"](ModifyAminoAcidsView, "viewName", 'ModifyAminoAcidsView');

exports.ModifyAminoAcidsView = ModifyAminoAcidsView;
//# sourceMappingURL=ModifyAminoAcidsView.js.map
