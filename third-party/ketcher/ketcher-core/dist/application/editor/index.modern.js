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
import utils from './shared/utils.modern.js';
import './operations/atom/index.modern.js';
import './operations/bond/index.modern.js';
export { CanvasLoad } from './operations/CanvasLoad.modern.js';
import './operations/descriptors.modern.js';
export { EnhancedFlagMove } from './operations/EnhancedFlagMove.modern.js';
export { EnhancedFlagClear } from './operations/EnhancedFlagClear.modern.js';
import './operations/ifThen.modern.js';
import './operations/fragment.modern.js';
import './operations/fragmentStereoAtom.modern.js';
export { FragmentStereoFlag } from './operations/FragmentStereoFlag.modern.js';
export { CalcImplicitH } from './operations/calcimplicitH.modern.js';
export { LoopMove } from './operations/LoopMove.modern.js';
export { OperationPriority, OperationType } from './operations/OperationType.modern.js';
export { ImageMove } from './operations/image/imageMove.modern.js';
export { ImageResize } from './operations/image/imageResize.modern.js';
export { ImageDelete, ImageUpsert } from './operations/image/imageUpsertDelete.modern.js';
export { MultitailArrowAddTail, MultitailArrowRemoveTail } from './operations/multitailArrow/multitailArrowAddRemoveTail.modern.js';
export { MultitailArrowMove } from './operations/multitailArrow/multitailArrowMove.modern.js';
export { MultitailArrowMoveHeadTail } from './operations/multitailArrow/multitailArrowMoveHeadTail.modern.js';
export { MultitailArrowResizeTailHead } from './operations/multitailArrow/multitailArrowResizeTailHead.modern.js';
export { MultitailArrowDelete, MultitailArrowUpsert } from './operations/multitailArrow/multitailArrowUpsertDelete.modern.js';
export { RGroupAttr } from './operations/rgroup/RGroupAttr.modern.js';
export { RGroupFragment } from './operations/rgroup/RGroupFragment.modern.js';
import './operations/rgroupAttachmentPoint/index.modern.js';
export { RxnArrowAdd, RxnArrowDelete } from './operations/rxn/index.modern.js';
export { SimpleObjectAdd, SimpleObjectDelete, SimpleObjectMove, SimpleObjectResize, makeCircleFromEllipse } from './operations/simpleObject.modern.js';
export { SGroupCreate, SGroupDelete } from './operations/sgroup/index.modern.js';
export { TextCreate, TextDelete } from './operations/Text/TextCreateDelete.modern.js';
export { TextUpdate } from './operations/Text/TextUpdate.modern.js';
export { TextMove } from './operations/Text/TextMove.modern.js';
export { AttachmentPointHoverOperation } from './operations/monomer/AttachmentPointHoverOperation.modern.js';
export { FlipMonomerOperation } from './operations/monomer/FlipMonomerOperation.modern.js';
export { MonomerAddOperation } from './operations/monomer/MonomerAddOperation.modern.js';
export { MonomerDeleteOperation } from './operations/monomer/MonomerDeleteOperation.modern.js';
import '../../domain/entities/AmbiguousMonomer.modern.js';
import '../../domain/helpers/monomers.modern.js';
import '../render/renderers/AmbiguousMonomerRenderer.modern.js';
import '@babel/runtime/helpers/slicedToArray';
import '@babel/runtime/helpers/toConsumableArray';
import '../../domain/entities/atom.modern.js';
import '../../domain/entities/atomList.modern.js';
import '../../domain/entities/bond.modern.js';
import '../../domain/entities/fixedPrecision.modern.js';
import '../../domain/entities/fragment.modern.js';
import '../../domain/entities/functionalGroup.modern.js';
import '../../domain/entities/halfBond.modern.js';
import '../../domain/entities/loop.modern.js';
import '../../domain/entities/rgroup.modern.js';
import '../../domain/entities/rgroupAttachmentPoint.modern.js';
import '../../domain/entities/rxnArrow.modern.js';
import '../../domain/entities/rxnPlus.modern.js';
import '../../domain/entities/sgroup.modern.js';
import '../../domain/entities/sgroupForest.modern.js';
import '../../domain/entities/simpleObject.modern.js';
import '../../domain/entities/struct.modern.js';
import '../../domain/entities/text.modern.js';
import '../../domain/entities/pile.modern.js';
import '../../domain/entities/vec2.modern.js';
import '../../domain/entities/box2Abs.modern.js';
import '../../domain/entities/pool.modern.js';
import '../../domain/entities/image.modern.js';
import '../../domain/entities/multitailArrow.modern.js';
import '../../domain/entities/highlight.modern.js';
import '../../domain/entities/sGroupAttachmentPoint.modern.js';
import '../../domain/entities/monomerMicromolecule.modern.js';
import '../../domain/entities/Peptide.modern.js';
import '../../domain/entities/BaseMonomer.modern.js';
import '../../domain/entities/Chem.modern.js';
import '../../domain/entities/Sugar.modern.js';
import '../../domain/entities/RNABase.modern.js';
import '../../domain/entities/Phosphate.modern.js';
import '../../domain/entities/Axis.modern.js';
import '../../domain/entities/Nucleoside.modern.js';
import '../../domain/entities/Nucleotide.modern.js';
import '../../domain/entities/monomer-chains/types.modern.js';
import '../../domain/entities/monomer-chains/Chain.modern.js';
import '../../domain/entities/monomer-chains/ChainsCollection.modern.js';
import '../../domain/entities/MonomerSequenceNode.modern.js';
import '../../domain/entities/EmptySequenceNode.modern.js';
import '../../domain/entities/LinkerSequenceNode.modern.js';
import '../../domain/entities/UnresolvedMonomer.modern.js';
import '../../domain/entities/UnsplitNucleotide.modern.js';
import '../../domain/entities/PolymerBond.modern.js';
import '../../domain/entities/MonomerToAtomBond.modern.js';
import '../../domain/entities/HydrogenBond.modern.js';
import '../../domain/entities/SGroupDrawingEntity.modern.js';
import '../../domain/entities/BackBoneSequenceNode.modern.js';
import '../../domain/entities/Command.modern.js';
import '../../utilities/runAsyncAction.modern.js';
import '../../utilities/KetcherLogger.modern.js';
import '../../utilities/SettingsManager.modern.js';
import '../../utilities/keynorm.modern.js';
import 'react-device-detect';
import '../../utilities/clipboardUtils.modern.js';
import '../../domain/entities/CoreAtom.modern.js';
import '../../domain/entities/CoreStereoFlag.modern.js';
import '@babel/runtime/helpers/defineProperty';
import '@babel/runtime/helpers/typeof';
import '../../domain/constants/elements.modern.js';
import '../../domain/constants/element.types.modern.js';
import '../../domain/constants/generics.modern.js';
import '../../domain/constants/chains.modern.js';
import '../../domain/constants/monomers.modern.js';
import '../render/renderers/ChemRenderer.modern.js';
import '../render/renderers/PeptideRenderer.modern.js';
import '../render/renderers/PhosphateRenderer.modern.js';
import '../render/renderers/RNABaseRenderer.modern.js';
import '../render/renderers/SugarRenderer.modern.js';
import '../render/renderers/UnresolvedMonomerRenderer.modern.js';
import '../render/renderers/UnsplitNucleotideRenderer.modern.js';
export { MonomerHoverOperation } from './operations/monomer/MonomerHoverOperation.modern.js';
export { MonomerItemModifyOperation } from './operations/monomer/MonomerItemModifyOperation.modern.js';
export { MonomerMoveOperation } from './operations/monomer/MonomerMoveOperation.modern.js';
export { RotateMonomerOperation } from './operations/monomer/RotateMonomerOperation.modern.js';
export { ShiftMonomerOperation } from './operations/monomer/ShiftMonomerOperation.modern.js';
export { ReinitializeModeOperation, RestoreSequenceCaretPositionOperation } from './operations/modes/index.modern.js';
export { AssignAttachmentAtomOperation } from './operations/monomerCreation/AssignAttachmentAtomOperation.modern.js';
export { AssignLeavingGroupAtomOperation, RemoveAttachmentPointOperation } from './operations/monomerCreation/AssignLeavingGroupAtomOperation.modern.js';
export { MarkAsRnaComponentOperation } from './operations/monomerCreation/MarkAsRnaComponentOperation.modern.js';
export { ReassignAttachmentPointOperation } from './operations/monomerCreation/ReassignAttachmentPointOperation.modern.js';
export { ReassignLeavingAtomOperation } from './operations/monomerCreation/ReassignLeavingAtomOperation.modern.js';
export { Action } from './actions/action.modern.js';
export { ActionTransaction, runActionTransaction } from './actions/actionTransaction.modern.js';
export { atomForNewBond, atomGetAttr, atomGetDegree, atomGetPos, atomGetSGroups, findStereoAtoms, formatSelection, getRelSGroupsBySelection, getSelectionFromStruct, isAttachmentBond, structSelection } from './actions/utils.modern.js';
import '../../domain/helpers/functionalGroupsProvider.modern.js';
import '../../domain/helpers/saltsAndSolventsProvider.modern.js';
import '../../domain/helpers/attachmentPointCalculations.modern.js';
import 'lodash/fp';
export { SGroupAttachmentPointAdd, SGroupAttachmentPointRemove } from './operations/sgroup/sgroupAttachmentPoints.modern.js';
export { EditorClassName, KETCHER_MACROMOLECULES_ROOT_NODE_SELECTOR, KETCHER_ROOT_NODE_CLASS_NAME, MonomerCodeToGroup, MonomerGroupCodes, MonomerGroups, SgContexts, defaultBondThickness, selectionKeys } from './shared/constants.modern.js';
import 'lodash';
export { bondChangingAction, fromBondAddition, fromBondFlipping, fromBondsAttrs, fromBondsMerge, removeAttachmentPointFromSuperatom } from './actions/bond.modern.js';
import './operations/highlight.modern.js';
export { Coordinates } from './shared/coordinates.modern.js';
export { EditorType } from './editor.types.modern.js';
export { CoreEditor, MonomerLibraryConvertError, MonomerLibraryUpdateError, NATURAL_AMINO_ACID_MODIFICATION_TYPE } from './Editor.modern.js';
export { EditorHistory } from './EditorHistory.modern.js';
export { FlexMode } from './modes/FlexMode.modern.js';
export { SequenceMode } from './modes/SequenceMode.modern.js';
export { SnakeMode } from './modes/SnakeMode.modern.js';
export { createEditorEvents, hotkeysConfiguration, renderersEvents } from './editorEvents.modern.js';
export { toolsMap } from './tools/index.modern.js';
export { MacromoleculesConverter } from './MacromoleculesConverter.modern.js';
export { MoleculeEditPlanError, MoleculeEditPlanExecutor, validateMoleculeEditPlan } from './MoleculeEditPlanExecutor.modern.js';
export { MACROMOLECULES_BOND_TYPES, ToolName } from './tools/types.modern.js';
export { PresetPosition, calculateAmbiguousMonomerPreviewLeft, calculateAmbiguousMonomerPreviewTop, calculateBondPreviewPosition, calculateMonomerPreviewTop, calculateNucleoElementPreviewTop, preview } from './previewPosition.modern.js';

var vectorUtils = {
  fracAngle: utils.fracAngle,
  calcAngle: utils.calcAngle,
  degrees: utils.degrees,
  calcNewAtomPos: utils.calcNewAtomPos
};

export { vectorUtils };
//# sourceMappingURL=index.modern.js.map
