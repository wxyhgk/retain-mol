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

var utils$1 = require('./shared/utils.js');
require('./operations/atom/index.js');
require('./operations/bond/index.js');
var CanvasLoad = require('./operations/CanvasLoad.js');
require('./operations/descriptors.js');
var EnhancedFlagMove = require('./operations/EnhancedFlagMove.js');
var EnhancedFlagClear = require('./operations/EnhancedFlagClear.js');
require('./operations/ifThen.js');
require('./operations/fragment.js');
require('./operations/fragmentStereoAtom.js');
var FragmentStereoFlag = require('./operations/FragmentStereoFlag.js');
var calcimplicitH = require('./operations/calcimplicitH.js');
var LoopMove = require('./operations/LoopMove.js');
var OperationType = require('./operations/OperationType.js');
var imageMove = require('./operations/image/imageMove.js');
var imageResize = require('./operations/image/imageResize.js');
var imageUpsertDelete = require('./operations/image/imageUpsertDelete.js');
var multitailArrowAddRemoveTail = require('./operations/multitailArrow/multitailArrowAddRemoveTail.js');
var multitailArrowMove = require('./operations/multitailArrow/multitailArrowMove.js');
var multitailArrowMoveHeadTail = require('./operations/multitailArrow/multitailArrowMoveHeadTail.js');
var multitailArrowResizeTailHead = require('./operations/multitailArrow/multitailArrowResizeTailHead.js');
var multitailArrowUpsertDelete = require('./operations/multitailArrow/multitailArrowUpsertDelete.js');
var RGroupAttr = require('./operations/rgroup/RGroupAttr.js');
var RGroupFragment = require('./operations/rgroup/RGroupFragment.js');
require('./operations/rgroupAttachmentPoint/index.js');
var index = require('./operations/rxn/index.js');
var simpleObject = require('./operations/simpleObject.js');
var index$2 = require('./operations/sgroup/index.js');
var TextCreateDelete = require('./operations/Text/TextCreateDelete.js');
var TextUpdate = require('./operations/Text/TextUpdate.js');
var TextMove = require('./operations/Text/TextMove.js');
var AttachmentPointHoverOperation = require('./operations/monomer/AttachmentPointHoverOperation.js');
var FlipMonomerOperation = require('./operations/monomer/FlipMonomerOperation.js');
var MonomerAddOperation = require('./operations/monomer/MonomerAddOperation.js');
var MonomerDeleteOperation = require('./operations/monomer/MonomerDeleteOperation.js');
require('../../domain/entities/AmbiguousMonomer.js');
require('../../domain/helpers/monomers.js');
require('../render/renderers/AmbiguousMonomerRenderer.js');
require('@babel/runtime/helpers/slicedToArray');
require('@babel/runtime/helpers/toConsumableArray');
require('../../domain/entities/atom.js');
require('../../domain/entities/atomList.js');
require('../../domain/entities/bond.js');
require('../../domain/entities/fixedPrecision.js');
require('../../domain/entities/fragment.js');
require('../../domain/entities/functionalGroup.js');
require('../../domain/entities/halfBond.js');
require('../../domain/entities/loop.js');
require('../../domain/entities/rgroup.js');
require('../../domain/entities/rgroupAttachmentPoint.js');
require('../../domain/entities/rxnArrow.js');
require('../../domain/entities/rxnPlus.js');
require('../../domain/entities/sgroup.js');
require('../../domain/entities/sgroupForest.js');
require('../../domain/entities/simpleObject.js');
require('../../domain/entities/struct.js');
require('../../domain/entities/text.js');
require('../../domain/entities/pile.js');
require('../../domain/entities/vec2.js');
require('../../domain/entities/box2Abs.js');
require('../../domain/entities/pool.js');
require('../../domain/entities/image.js');
require('../../domain/entities/multitailArrow.js');
require('../../domain/entities/highlight.js');
require('../../domain/entities/sGroupAttachmentPoint.js');
require('../../domain/entities/monomerMicromolecule.js');
require('../../domain/entities/Peptide.js');
require('../../domain/entities/BaseMonomer.js');
require('../../domain/entities/Chem.js');
require('../../domain/entities/Sugar.js');
require('../../domain/entities/RNABase.js');
require('../../domain/entities/Phosphate.js');
require('../../domain/entities/Axis.js');
require('../../domain/entities/Nucleoside.js');
require('../../domain/entities/Nucleotide.js');
require('../../domain/entities/monomer-chains/types.js');
require('../../domain/entities/monomer-chains/Chain.js');
require('../../domain/entities/monomer-chains/ChainsCollection.js');
require('../../domain/entities/MonomerSequenceNode.js');
require('../../domain/entities/EmptySequenceNode.js');
require('../../domain/entities/LinkerSequenceNode.js');
require('../../domain/entities/UnresolvedMonomer.js');
require('../../domain/entities/UnsplitNucleotide.js');
require('../../domain/entities/PolymerBond.js');
require('../../domain/entities/MonomerToAtomBond.js');
require('../../domain/entities/HydrogenBond.js');
require('../../domain/entities/SGroupDrawingEntity.js');
require('../../domain/entities/BackBoneSequenceNode.js');
require('../../domain/entities/Command.js');
require('../../utilities/runAsyncAction.js');
require('../../utilities/KetcherLogger.js');
require('../../utilities/SettingsManager.js');
require('../../utilities/keynorm.js');
require('react-device-detect');
require('../../utilities/clipboardUtils.js');
require('../../domain/entities/CoreAtom.js');
require('../../domain/entities/CoreStereoFlag.js');
require('@babel/runtime/helpers/defineProperty');
require('@babel/runtime/helpers/typeof');
require('../../domain/constants/elements.js');
require('../../domain/constants/element.types.js');
require('../../domain/constants/generics.js');
require('../../domain/constants/chains.js');
require('../../domain/constants/monomers.js');
require('../render/renderers/ChemRenderer.js');
require('../render/renderers/PeptideRenderer.js');
require('../render/renderers/PhosphateRenderer.js');
require('../render/renderers/RNABaseRenderer.js');
require('../render/renderers/SugarRenderer.js');
require('../render/renderers/UnresolvedMonomerRenderer.js');
require('../render/renderers/UnsplitNucleotideRenderer.js');
var MonomerHoverOperation = require('./operations/monomer/MonomerHoverOperation.js');
var MonomerItemModifyOperation = require('./operations/monomer/MonomerItemModifyOperation.js');
var MonomerMoveOperation = require('./operations/monomer/MonomerMoveOperation.js');
var RotateMonomerOperation = require('./operations/monomer/RotateMonomerOperation.js');
var ShiftMonomerOperation = require('./operations/monomer/ShiftMonomerOperation.js');
var index$3 = require('./operations/modes/index.js');
var AssignAttachmentAtomOperation = require('./operations/monomerCreation/AssignAttachmentAtomOperation.js');
var AssignLeavingGroupAtomOperation = require('./operations/monomerCreation/AssignLeavingGroupAtomOperation.js');
var MarkAsRnaComponentOperation = require('./operations/monomerCreation/MarkAsRnaComponentOperation.js');
var ReassignAttachmentPointOperation = require('./operations/monomerCreation/ReassignAttachmentPointOperation.js');
var ReassignLeavingAtomOperation = require('./operations/monomerCreation/ReassignLeavingAtomOperation.js');
var action = require('./actions/action.js');
var actionTransaction = require('./actions/actionTransaction.js');
var utils = require('./actions/utils.js');
require('../../domain/helpers/functionalGroupsProvider.js');
require('../../domain/helpers/saltsAndSolventsProvider.js');
require('../../domain/helpers/attachmentPointCalculations.js');
require('lodash/fp');
var sgroupAttachmentPoints = require('./operations/sgroup/sgroupAttachmentPoints.js');
var constants = require('./shared/constants.js');
require('lodash');
var bond = require('./actions/bond.js');
require('./operations/highlight.js');
var coordinates = require('./shared/coordinates.js');
var editor_types = require('./editor.types.js');
var Editor = require('./Editor.js');
var EditorHistory = require('./EditorHistory.js');
var FlexMode = require('./modes/FlexMode.js');
var SequenceMode = require('./modes/SequenceMode.js');
var SnakeMode = require('./modes/SnakeMode.js');
var editorEvents = require('./editorEvents.js');
var index$5 = require('./tools/index.js');
var MacromoleculesConverter = require('./MacromoleculesConverter.js');
var MoleculeEditPlanExecutor = require('./MoleculeEditPlanExecutor.js');
var types = require('./tools/types.js');
var previewPosition = require('./previewPosition.js');

var vectorUtils = {
  fracAngle: utils$1["default"].fracAngle,
  calcAngle: utils$1["default"].calcAngle,
  degrees: utils$1["default"].degrees,
  calcNewAtomPos: utils$1["default"].calcNewAtomPos
};

exports.CanvasLoad = CanvasLoad.CanvasLoad;
exports.EnhancedFlagMove = EnhancedFlagMove.EnhancedFlagMove;
exports.EnhancedFlagClear = EnhancedFlagClear.EnhancedFlagClear;
exports.FragmentStereoFlag = FragmentStereoFlag.FragmentStereoFlag;
exports.CalcImplicitH = calcimplicitH.CalcImplicitH;
exports.LoopMove = LoopMove.LoopMove;
Object.defineProperty(exports, 'OperationPriority', {
    enumerable: true,
    get: function () { return OperationType.OperationPriority; }
});
exports.OperationType = OperationType.OperationType;
exports.ImageMove = imageMove.ImageMove;
exports.ImageResize = imageResize.ImageResize;
exports.ImageDelete = imageUpsertDelete.ImageDelete;
exports.ImageUpsert = imageUpsertDelete.ImageUpsert;
exports.MultitailArrowAddTail = multitailArrowAddRemoveTail.MultitailArrowAddTail;
exports.MultitailArrowRemoveTail = multitailArrowAddRemoveTail.MultitailArrowRemoveTail;
exports.MultitailArrowMove = multitailArrowMove.MultitailArrowMove;
exports.MultitailArrowMoveHeadTail = multitailArrowMoveHeadTail.MultitailArrowMoveHeadTail;
exports.MultitailArrowResizeTailHead = multitailArrowResizeTailHead.MultitailArrowResizeTailHead;
exports.MultitailArrowDelete = multitailArrowUpsertDelete.MultitailArrowDelete;
exports.MultitailArrowUpsert = multitailArrowUpsertDelete.MultitailArrowUpsert;
exports.RGroupAttr = RGroupAttr.RGroupAttr;
exports.RGroupFragment = RGroupFragment.RGroupFragment;
exports.RxnArrowAdd = index.RxnArrowAdd;
exports.RxnArrowDelete = index.RxnArrowDelete;
exports.SimpleObjectAdd = simpleObject.SimpleObjectAdd;
exports.SimpleObjectDelete = simpleObject.SimpleObjectDelete;
exports.SimpleObjectMove = simpleObject.SimpleObjectMove;
exports.SimpleObjectResize = simpleObject.SimpleObjectResize;
exports.makeCircleFromEllipse = simpleObject.makeCircleFromEllipse;
exports.SGroupCreate = index$2.SGroupCreate;
exports.SGroupDelete = index$2.SGroupDelete;
exports.TextCreate = TextCreateDelete.TextCreate;
exports.TextDelete = TextCreateDelete.TextDelete;
exports.TextUpdate = TextUpdate.TextUpdate;
exports.TextMove = TextMove.TextMove;
exports.AttachmentPointHoverOperation = AttachmentPointHoverOperation.AttachmentPointHoverOperation;
exports.FlipMonomerOperation = FlipMonomerOperation.FlipMonomerOperation;
exports.MonomerAddOperation = MonomerAddOperation.MonomerAddOperation;
exports.MonomerDeleteOperation = MonomerDeleteOperation.MonomerDeleteOperation;
exports.MonomerHoverOperation = MonomerHoverOperation.MonomerHoverOperation;
exports.MonomerItemModifyOperation = MonomerItemModifyOperation.MonomerItemModifyOperation;
exports.MonomerMoveOperation = MonomerMoveOperation.MonomerMoveOperation;
exports.RotateMonomerOperation = RotateMonomerOperation.RotateMonomerOperation;
exports.ShiftMonomerOperation = ShiftMonomerOperation.ShiftMonomerOperation;
exports.ReinitializeModeOperation = index$3.ReinitializeModeOperation;
exports.RestoreSequenceCaretPositionOperation = index$3.RestoreSequenceCaretPositionOperation;
exports.AssignAttachmentAtomOperation = AssignAttachmentAtomOperation.AssignAttachmentAtomOperation;
exports.AssignLeavingGroupAtomOperation = AssignLeavingGroupAtomOperation.AssignLeavingGroupAtomOperation;
exports.RemoveAttachmentPointOperation = AssignLeavingGroupAtomOperation.RemoveAttachmentPointOperation;
exports.MarkAsRnaComponentOperation = MarkAsRnaComponentOperation.MarkAsRnaComponentOperation;
exports.ReassignAttachmentPointOperation = ReassignAttachmentPointOperation.ReassignAttachmentPointOperation;
exports.ReassignLeavingAtomOperation = ReassignLeavingAtomOperation.ReassignLeavingAtomOperation;
exports.Action = action.Action;
exports.ActionTransaction = actionTransaction.ActionTransaction;
exports.runActionTransaction = actionTransaction.runActionTransaction;
exports.atomForNewBond = utils.atomForNewBond;
exports.atomGetAttr = utils.atomGetAttr;
exports.atomGetDegree = utils.atomGetDegree;
exports.atomGetPos = utils.atomGetPos;
exports.atomGetSGroups = utils.atomGetSGroups;
exports.findStereoAtoms = utils.findStereoAtoms;
exports.formatSelection = utils.formatSelection;
exports.getRelSGroupsBySelection = utils.getRelSGroupsBySelection;
exports.getSelectionFromStruct = utils.getSelectionFromStruct;
exports.isAttachmentBond = utils.isAttachmentBond;
exports.structSelection = utils.structSelection;
exports.SGroupAttachmentPointAdd = sgroupAttachmentPoints.SGroupAttachmentPointAdd;
exports.SGroupAttachmentPointRemove = sgroupAttachmentPoints.SGroupAttachmentPointRemove;
exports.EditorClassName = constants.EditorClassName;
exports.KETCHER_MACROMOLECULES_ROOT_NODE_SELECTOR = constants.KETCHER_MACROMOLECULES_ROOT_NODE_SELECTOR;
exports.KETCHER_ROOT_NODE_CLASS_NAME = constants.KETCHER_ROOT_NODE_CLASS_NAME;
exports.MonomerCodeToGroup = constants.MonomerCodeToGroup;
Object.defineProperty(exports, 'MonomerGroupCodes', {
    enumerable: true,
    get: function () { return constants.MonomerGroupCodes; }
});
Object.defineProperty(exports, 'MonomerGroups', {
    enumerable: true,
    get: function () { return constants.MonomerGroups; }
});
exports.SgContexts = constants.SgContexts;
exports.defaultBondThickness = constants.defaultBondThickness;
exports.selectionKeys = constants.selectionKeys;
exports.bondChangingAction = bond.bondChangingAction;
exports.fromBondAddition = bond.fromBondAddition;
exports.fromBondFlipping = bond.fromBondFlipping;
exports.fromBondsAttrs = bond.fromBondsAttrs;
exports.fromBondsMerge = bond.fromBondsMerge;
exports.removeAttachmentPointFromSuperatom = bond.removeAttachmentPointFromSuperatom;
exports.Coordinates = coordinates.Coordinates;
Object.defineProperty(exports, 'EditorType', {
    enumerable: true,
    get: function () { return editor_types.EditorType; }
});
exports.CoreEditor = Editor.CoreEditor;
exports.MonomerLibraryConvertError = Editor.MonomerLibraryConvertError;
exports.MonomerLibraryUpdateError = Editor.MonomerLibraryUpdateError;
exports.NATURAL_AMINO_ACID_MODIFICATION_TYPE = Editor.NATURAL_AMINO_ACID_MODIFICATION_TYPE;
exports.EditorHistory = EditorHistory.EditorHistory;
exports.FlexMode = FlexMode.FlexMode;
exports.SequenceMode = SequenceMode.SequenceMode;
exports.SnakeMode = SnakeMode.SnakeMode;
exports.createEditorEvents = editorEvents.createEditorEvents;
exports.hotkeysConfiguration = editorEvents.hotkeysConfiguration;
exports.renderersEvents = editorEvents.renderersEvents;
exports.toolsMap = index$5.toolsMap;
exports.MacromoleculesConverter = MacromoleculesConverter.MacromoleculesConverter;
exports.MoleculeEditPlanError = MoleculeEditPlanExecutor.MoleculeEditPlanError;
exports.MoleculeEditPlanExecutor = MoleculeEditPlanExecutor.MoleculeEditPlanExecutor;
exports.validateMoleculeEditPlan = MoleculeEditPlanExecutor.validateMoleculeEditPlan;
Object.defineProperty(exports, 'MACROMOLECULES_BOND_TYPES', {
    enumerable: true,
    get: function () { return types.MACROMOLECULES_BOND_TYPES; }
});
Object.defineProperty(exports, 'ToolName', {
    enumerable: true,
    get: function () { return types.ToolName; }
});
Object.defineProperty(exports, 'PresetPosition', {
    enumerable: true,
    get: function () { return previewPosition.PresetPosition; }
});
exports.calculateAmbiguousMonomerPreviewLeft = previewPosition.calculateAmbiguousMonomerPreviewLeft;
exports.calculateAmbiguousMonomerPreviewTop = previewPosition.calculateAmbiguousMonomerPreviewTop;
exports.calculateBondPreviewPosition = previewPosition.calculateBondPreviewPosition;
exports.calculateMonomerPreviewTop = previewPosition.calculateMonomerPreviewTop;
exports.calculateNucleoElementPreviewTop = previewPosition.calculateNucleoElementPreviewTop;
exports.preview = previewPosition.preview;
exports.vectorUtils = vectorUtils;
//# sourceMappingURL=index.js.map
