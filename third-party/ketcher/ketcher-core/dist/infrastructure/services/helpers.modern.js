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
import _defineProperty from '@babel/runtime/helpers/defineProperty';
import '../../application/render/renderStruct.modern.js';
import '../../application/render/raphaelRender.modern.js';
import '../../application/render/restruct/reobject.modern.js';
import '../../application/render/restruct/reatom.modern.js';
import '../../application/render/restruct/rebond.modern.js';
import '../../application/render/restruct/reenhancedFlag.modern.js';
import '../../application/render/restruct/refrag.modern.js';
import '../../application/render/restruct/rergroup.modern.js';
import '../../application/render/restruct/rerxnarrow.modern.js';
import '../../application/render/restruct/rerxnplus.modern.js';
import '../../application/render/restruct/resgroup.modern.js';
import '../../application/render/restruct/resimpleObject.modern.js';
import '../../application/render/restruct/restruct.modern.js';
import '../../application/render/restruct/retext.modern.js';
import '../../application/render/restruct/visel.modern.js';
import '../../application/render/restruct/generalEnumTypes.modern.js';
import { ShowHydrogenLabels } from '../../application/render/restruct/showHydrogenLabels.modern.js';
import '../../application/render/restruct/rergroupAttachmentPoint.modern.js';
import '../../application/render/restruct/reImage.modern.js';
import '../../application/render/restruct/remultitailArrow.modern.js';
import '../../application/render/renderers/BaseRenderer.modern.js';
import '../../application/render/renderers/BaseMonomerRenderer.modern.js';
import '../../application/render/renderers/AtomRenderer.modern.js';
import '../../application/render/renderers/ChemRenderer.modern.js';
import '../../application/render/renderers/PeptideRenderer.modern.js';
import '../../application/render/renderers/PhosphateRenderer.modern.js';
import '../../application/render/renderers/SugarRenderer.modern.js';
import '../../application/render/renderers/RNABaseRenderer.modern.js';
import '../../application/render/renderers/UnresolvedMonomerRenderer.modern.js';
import '../../application/render/renderers/UnsplitNucleotideRenderer.modern.js';
import '../../application/render/renderers/AmbiguousMonomerRenderer.modern.js';
import '../../application/render/renderers/SGroupRenderer.modern.js';
import '../../application/render/renderers/RenderersManager.modern.js';
import '@babel/runtime/helpers/toConsumableArray';
import '../../utilities/runAsyncAction.modern.js';
import '../../utilities/KetcherLogger.modern.js';
import '../../utilities/SettingsManager.modern.js';
import '../../utilities/keynorm.modern.js';
import 'react-device-detect';
import '../../utilities/clipboardUtils.modern.js';
import '../../application/render/renderers/sequence/BaseSequenceItemRenderer.modern.js';
import '../../domain/entities/Chem.modern.js';
import '../../application/render/renderers/StereoFlagRenderer.modern.js';
import '../../application/render/renderers/sequence/SequenceRenderer.modern.js';
import '../../application/render/renderers/sequence/BackBoneBondSequenceRenderer.modern.js';
import '../../application/render/renderers/sequence/BaseSequenceRenderer.modern.js';
import '../../application/render/renderers/sequence/ChemSequenceItemRenderer.modern.js';
import '../../application/render/renderers/sequence/EmptySequenceItemRenderer.modern.js';
import '../../application/render/renderers/sequence/NucleotideSequenceItemRenderer.modern.js';
import '../../application/render/renderers/sequence/NucleosideSequenceItemRenderer.modern.js';
import '../../application/render/renderers/sequence/PeptideSequenceItemRenderer.modern.js';
import '../../application/render/renderers/sequence/PhosphateSequenceItemRenderer.modern.js';
import '../../application/render/renderers/sequence/PolymerBondSequenceRenderer.modern.js';
import '../../application/render/renderers/sequence/RNASequenceItemRenderer.modern.js';
import '../../application/render/renderers/sequence/SequenceNodeRendererFactory.modern.js';
import '../../application/render/renderers/sequence/UnresolvedMonomerSequenceItemRenderer.modern.js';
import '../../application/render/renderers/sequence/UnsplitNucleotideSequenceItemRenderer.modern.js';
import '../../domain/entities/vec2.modern.js';
import '../../domain/helpers/functionalGroupsProvider.modern.js';
import '../../domain/helpers/saltsAndSolventsProvider.modern.js';
import '../../domain/constants/generics.modern.js';
import '../../domain/helpers/attachmentPointCalculations.modern.js';
import '../../application/render/scrollbar/scrollbar-container.modern.js';
import '../../application/render/notifyRenderComplete.modern.js';
import 'lodash';
import '../../application/render/renderers/constants.modern.js';
import '../../application/render/render.types.modern.js';
import { ketcherProvider } from '../../application/ketcherProvider.modern.js';

var IndigoShowHydrogenLabelsMode;
(function (IndigoShowHydrogenLabelsMode) {
  IndigoShowHydrogenLabelsMode["OFF"] = "none";
  IndigoShowHydrogenLabelsMode["HETERO"] = "hetero";
  IndigoShowHydrogenLabelsMode["TERMINAL_HETERO"] = "terminal-hetero";
  IndigoShowHydrogenLabelsMode["ALL"] = "all";
})(IndigoShowHydrogenLabelsMode || (IndigoShowHydrogenLabelsMode = {}));
function getLabelRenderModeForIndigo(ketcherId) {
  var renderModeMapping = _defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty({}, ShowHydrogenLabels.Off, IndigoShowHydrogenLabelsMode.HETERO), ShowHydrogenLabels.Hetero, IndigoShowHydrogenLabelsMode.HETERO), ShowHydrogenLabels.Terminal, IndigoShowHydrogenLabelsMode.TERMINAL_HETERO), ShowHydrogenLabels.TerminalAndHetero, IndigoShowHydrogenLabelsMode.TERMINAL_HETERO), ShowHydrogenLabels.On, IndigoShowHydrogenLabelsMode.ALL);
  return renderModeMapping[ketcherProvider.getKetcher(ketcherId).editor.options().showHydrogenLabels] || IndigoShowHydrogenLabelsMode.OFF;
}

export { getLabelRenderModeForIndigo };
//# sourceMappingURL=helpers.modern.js.map
