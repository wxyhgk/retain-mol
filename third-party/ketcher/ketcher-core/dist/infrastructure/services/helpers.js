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

var _defineProperty = require('@babel/runtime/helpers/defineProperty');
require('../../application/render/renderStruct.js');
require('../../application/render/raphaelRender.js');
require('../../application/render/restruct/reobject.js');
require('../../application/render/restruct/reatom.js');
require('../../application/render/restruct/rebond.js');
require('../../application/render/restruct/reenhancedFlag.js');
require('../../application/render/restruct/refrag.js');
require('../../application/render/restruct/rergroup.js');
require('../../application/render/restruct/rerxnarrow.js');
require('../../application/render/restruct/rerxnplus.js');
require('../../application/render/restruct/resgroup.js');
require('../../application/render/restruct/resimpleObject.js');
require('../../application/render/restruct/restruct.js');
require('../../application/render/restruct/retext.js');
require('../../application/render/restruct/visel.js');
require('../../application/render/restruct/generalEnumTypes.js');
var showHydrogenLabels = require('../../application/render/restruct/showHydrogenLabels.js');
require('../../application/render/restruct/rergroupAttachmentPoint.js');
require('../../application/render/restruct/reImage.js');
require('../../application/render/restruct/remultitailArrow.js');
require('../../application/render/renderers/BaseRenderer.js');
require('../../application/render/renderers/BaseMonomerRenderer.js');
require('../../application/render/renderers/AtomRenderer.js');
require('../../application/render/renderers/ChemRenderer.js');
require('../../application/render/renderers/PeptideRenderer.js');
require('../../application/render/renderers/PhosphateRenderer.js');
require('../../application/render/renderers/SugarRenderer.js');
require('../../application/render/renderers/RNABaseRenderer.js');
require('../../application/render/renderers/UnresolvedMonomerRenderer.js');
require('../../application/render/renderers/UnsplitNucleotideRenderer.js');
require('../../application/render/renderers/AmbiguousMonomerRenderer.js');
require('../../application/render/renderers/SGroupRenderer.js');
require('../../application/render/renderers/RenderersManager.js');
require('@babel/runtime/helpers/toConsumableArray');
require('../../utilities/runAsyncAction.js');
require('../../utilities/KetcherLogger.js');
require('../../utilities/SettingsManager.js');
require('../../utilities/keynorm.js');
require('react-device-detect');
require('../../utilities/clipboardUtils.js');
require('../../application/render/renderers/sequence/BaseSequenceItemRenderer.js');
require('../../domain/entities/Chem.js');
require('../../application/render/renderers/StereoFlagRenderer.js');
require('../../application/render/renderers/sequence/SequenceRenderer.js');
require('../../application/render/renderers/sequence/BackBoneBondSequenceRenderer.js');
require('../../application/render/renderers/sequence/BaseSequenceRenderer.js');
require('../../application/render/renderers/sequence/ChemSequenceItemRenderer.js');
require('../../application/render/renderers/sequence/EmptySequenceItemRenderer.js');
require('../../application/render/renderers/sequence/NucleotideSequenceItemRenderer.js');
require('../../application/render/renderers/sequence/NucleosideSequenceItemRenderer.js');
require('../../application/render/renderers/sequence/PeptideSequenceItemRenderer.js');
require('../../application/render/renderers/sequence/PhosphateSequenceItemRenderer.js');
require('../../application/render/renderers/sequence/PolymerBondSequenceRenderer.js');
require('../../application/render/renderers/sequence/RNASequenceItemRenderer.js');
require('../../application/render/renderers/sequence/SequenceNodeRendererFactory.js');
require('../../application/render/renderers/sequence/UnresolvedMonomerSequenceItemRenderer.js');
require('../../application/render/renderers/sequence/UnsplitNucleotideSequenceItemRenderer.js');
require('../../domain/entities/vec2.js');
require('../../domain/helpers/functionalGroupsProvider.js');
require('../../domain/helpers/saltsAndSolventsProvider.js');
require('../../domain/constants/generics.js');
require('../../domain/helpers/attachmentPointCalculations.js');
require('../../application/render/scrollbar/scrollbar-container.js');
require('../../application/render/notifyRenderComplete.js');
require('lodash');
require('../../application/render/renderers/constants.js');
require('../../application/render/render.types.js');
var ketcherProvider = require('../../application/ketcherProvider.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);

var IndigoShowHydrogenLabelsMode;
(function (IndigoShowHydrogenLabelsMode) {
  IndigoShowHydrogenLabelsMode["OFF"] = "none";
  IndigoShowHydrogenLabelsMode["HETERO"] = "hetero";
  IndigoShowHydrogenLabelsMode["TERMINAL_HETERO"] = "terminal-hetero";
  IndigoShowHydrogenLabelsMode["ALL"] = "all";
})(IndigoShowHydrogenLabelsMode || (IndigoShowHydrogenLabelsMode = {}));
function getLabelRenderModeForIndigo(ketcherId) {
  var renderModeMapping = _defineProperty__default["default"](_defineProperty__default["default"](_defineProperty__default["default"](_defineProperty__default["default"](_defineProperty__default["default"]({}, showHydrogenLabels.ShowHydrogenLabels.Off, IndigoShowHydrogenLabelsMode.HETERO), showHydrogenLabels.ShowHydrogenLabels.Hetero, IndigoShowHydrogenLabelsMode.HETERO), showHydrogenLabels.ShowHydrogenLabels.Terminal, IndigoShowHydrogenLabelsMode.TERMINAL_HETERO), showHydrogenLabels.ShowHydrogenLabels.TerminalAndHetero, IndigoShowHydrogenLabelsMode.TERMINAL_HETERO), showHydrogenLabels.ShowHydrogenLabels.On, IndigoShowHydrogenLabelsMode.ALL);
  return renderModeMapping[ketcherProvider.ketcherProvider.getKetcher(ketcherId).editor.options().showHydrogenLabels] || IndigoShowHydrogenLabelsMode.OFF;
}

exports.getLabelRenderModeForIndigo = getLabelRenderModeForIndigo;
//# sourceMappingURL=helpers.js.map
