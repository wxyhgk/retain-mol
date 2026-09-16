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
import { provideEditorInstance } from '../../../editor/editorSingleton.modern.js';
import '../../renderStruct.modern.js';
import '../../raphaelRender.modern.js';
import '../../restruct/reobject.modern.js';
import '../../restruct/reatom.modern.js';
import '../../restruct/rebond.modern.js';
import '../../restruct/reenhancedFlag.modern.js';
import '../../restruct/refrag.modern.js';
import '../../restruct/rergroup.modern.js';
import '../../restruct/rerxnarrow.modern.js';
import '../../restruct/rerxnplus.modern.js';
import '../../restruct/resgroup.modern.js';
import '../../restruct/resimpleObject.modern.js';
import '../../restruct/restruct.modern.js';
import '../../restruct/retext.modern.js';
import '../../restruct/visel.modern.js';
import '../../restruct/generalEnumTypes.modern.js';
import '../../restruct/showHydrogenLabels.modern.js';
import '../../restruct/rergroupAttachmentPoint.modern.js';
import '../../restruct/reImage.modern.js';
import '../../restruct/remultitailArrow.modern.js';
import '../BaseRenderer.modern.js';
import { BaseMonomerRenderer } from '../BaseMonomerRenderer.modern.js';
import '../AtomRenderer.modern.js';
import '../ChemRenderer.modern.js';
import '../PeptideRenderer.modern.js';
import '../PhosphateRenderer.modern.js';
import '../SugarRenderer.modern.js';
import '../RNABaseRenderer.modern.js';
import '../UnresolvedMonomerRenderer.modern.js';
import '../UnsplitNucleotideRenderer.modern.js';
import '../AmbiguousMonomerRenderer.modern.js';
import '../SGroupRenderer.modern.js';
import '../RenderersManager.modern.js';
import '@babel/runtime/helpers/toConsumableArray';
import '../../../../utilities/runAsyncAction.modern.js';
import '../../../../utilities/KetcherLogger.modern.js';
import '../../../../utilities/SettingsManager.modern.js';
import '../../../../utilities/keynorm.modern.js';
import 'react-device-detect';
import '../../../../utilities/clipboardUtils.modern.js';
import { BaseSequenceItemRenderer } from '../sequence/BaseSequenceItemRenderer.modern.js';
import '../../../../domain/entities/Chem.modern.js';
import '../StereoFlagRenderer.modern.js';
import '../sequence/SequenceRenderer.modern.js';
import '../sequence/BackBoneBondSequenceRenderer.modern.js';
import '../sequence/BaseSequenceRenderer.modern.js';
import '../sequence/ChemSequenceItemRenderer.modern.js';
import '../sequence/EmptySequenceItemRenderer.modern.js';
import '../sequence/NucleotideSequenceItemRenderer.modern.js';
import '../sequence/NucleosideSequenceItemRenderer.modern.js';
import '../sequence/PeptideSequenceItemRenderer.modern.js';
import '../sequence/PhosphateSequenceItemRenderer.modern.js';
import '../sequence/PolymerBondSequenceRenderer.modern.js';
import '../sequence/RNASequenceItemRenderer.modern.js';
import '../sequence/SequenceNodeRendererFactory.modern.js';
import '../sequence/UnresolvedMonomerSequenceItemRenderer.modern.js';
import '../sequence/UnsplitNucleotideSequenceItemRenderer.modern.js';
import '../../../../domain/entities/vec2.modern.js';
import '../../../../domain/helpers/functionalGroupsProvider.modern.js';
import '../../../../domain/helpers/saltsAndSolventsProvider.modern.js';
import '../../../../domain/constants/generics.modern.js';
import '../../../../domain/helpers/attachmentPointCalculations.modern.js';
import '../../scrollbar/scrollbar-container.modern.js';
import '../../notifyRenderComplete.modern.js';
import 'lodash';
import '../constants.modern.js';
import '../../render.types.modern.js';

var ModifyAminoAcidsView = function () {
  function ModifyAminoAcidsView() {
    _classCallCheck(this, ModifyAminoAcidsView);
  }
  _createClass(ModifyAminoAcidsView, null, [{
    key: "show",
    value: function show(transientLayer, params) {
      var editor = provideEditorInstance();
      var monomersToModify = params.monomersToModify;
      if (editor.mode.modeName === 'sequence-layout-mode') {
        monomersToModify.forEach(function (monomer) {
          var renderer = monomer.renderer;
          if (!(renderer instanceof BaseSequenceItemRenderer)) {
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
          transientLayer.append('circle').attr('cx', monomerCenterInPixels.x).attr('cy', monomerCenterInPixels.y).attr('r', BaseMonomerRenderer.selectionCircleRadius).attr('fill', 'none').attr('stroke', '#0097A8').attr('stroke-width', 1);
        });
      }
    }
  }]);
  return ModifyAminoAcidsView;
}();
_defineProperty(ModifyAminoAcidsView, "viewName", 'ModifyAminoAcidsView');

export { ModifyAminoAcidsView };
//# sourceMappingURL=ModifyAminoAcidsView.modern.js.map
