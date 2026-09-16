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
import { Subscription as Subscription_1 } from '../../node_modules/subscription/index.modern.js';
import { ZoomTool } from './tools/Zoom.modern.js';
import { SequenceType } from '../../domain/entities/monomer-chains/types.modern.js';
import { ToolName } from './tools/types.modern.js';

function createEditorEvents() {
  return {
    selectMonomer: new Subscription_1(),
    selectPreset: new Subscription_1(),
    selectTool: new Subscription_1(),
    selectSelectionTool: new Subscription_1(),
    createBondViaModal: new Subscription_1(),
    cancelBondCreationViaModal: new Subscription_1(),
    selectMode: new Subscription_1(),
    layoutModeChange: new Subscription_1(),
    selectHistory: new Subscription_1(),
    error: new Subscription_1(),
    openErrorModal: new Subscription_1(),
    openMonomerConnectionModal: new Subscription_1(),
    mouseOverPolymerBond: new Subscription_1(),
    mouseLeavePolymerBond: new Subscription_1(),
    mouseOnMovePolymerBond: new Subscription_1(),
    mouseOverMonomer: new Subscription_1(),
    mouseOnMoveMonomer: new Subscription_1(),
    mouseLeaveMonomer: new Subscription_1(),
    mouseOverAttachmentPoint: new Subscription_1(),
    mouseMoveAttachmentPoint: new Subscription_1(),
    mouseLeaveAttachmentPoint: new Subscription_1(),
    mouseUpAttachmentPoint: new Subscription_1(),
    mouseDownAttachmentPoint: new Subscription_1(),
    mouseOverDrawingEntity: new Subscription_1(),
    mouseLeaveDrawingEntity: new Subscription_1(),
    mouseUpMonomer: new Subscription_1(),
    rightClickSequence: new Subscription_1(),
    rightClickCanvas: new Subscription_1(),
    rightClickCanvasSequence: new Subscription_1(),
    rightClickPolymerBond: new Subscription_1(),
    rightClickSelectedMonomers: new Subscription_1(),
    keyDown: new Subscription_1(),
    editSequence: new Subscription_1(),
    startNewSequence: new Subscription_1(),
    establishHydrogenBond: new Subscription_1(),
    deleteHydrogenBond: new Subscription_1(),
    turnOnSequenceEditInRNABuilderMode: new Subscription_1(),
    turnOffSequenceEditInRNABuilderMode: new Subscription_1(),
    modifySequenceInRnaBuilder: new Subscription_1(),
    mouseOverSequenceItem: new Subscription_1(),
    mouseOnMoveSequenceItem: new Subscription_1(),
    mouseLeaveSequenceItem: new Subscription_1(),
    changeSequenceTypeEnterMode: new Subscription_1(),
    toggleSequenceEditMode: new Subscription_1(),
    toggleSequenceEditInRNABuilderMode: new Subscription_1(),
    toggleIsSequenceSyncEditMode: new Subscription_1(),
    resetSequenceEditMode: new Subscription_1(),
    clickOnSequenceItem: new Subscription_1(),
    mousedownBetweenSequenceItems: new Subscription_1(),
    mouseDownOnSequenceItem: new Subscription_1(),
    doubleClickOnSequenceItem: new Subscription_1(),
    openConfirmationDialog: new Subscription_1(),
    mouseUpAtom: new Subscription_1(),
    updateMonomersLibrary: new Subscription_1(),
    createAntisenseChain: new Subscription_1(),
    copySelectedStructure: new Subscription_1(),
    pasteFromClipboard: new Subscription_1(),
    deleteSelectedStructure: new Subscription_1(),
    selectEntities: new Subscription_1(),
    modelChange: new Subscription_1(),
    toggleMacromoleculesPropertiesVisibility: new Subscription_1(),
    modifyAminoAcids: new Subscription_1(),
    setEditorLineLength: new Subscription_1(),
    toggleLineLengthHighlighting: new Subscription_1(),
    setLibraryItemDragState: new Subscription_1(),
    placeLibraryItemOnCanvas: new Subscription_1(),
    autochain: new Subscription_1(),
    previewAutochain: new Subscription_1(),
    removeAutochainPreview: new Subscription_1(),
    switchToMacromoleculesMode: new Subscription_1(),
    switchToMoleculesMode: new Subscription_1(),
    layoutCircular: new Subscription_1(),
    flipHorizontal: new Subscription_1(),
    flipVertical: new Subscription_1()
  };
}
var renderersEvents = ['mouseOverPolymerBond', 'mouseLeavePolymerBond', 'mouseOnMovePolymerBond', 'mouseOverMonomer', 'mouseOnMoveMonomer', 'mouseOverAttachmentPoint', 'mouseLeaveAttachmentPoint', 'mouseUpAttachmentPoint', 'mouseDownAttachmentPoint', 'mouseLeaveMonomer', 'mouseOverDrawingEntity', 'mouseLeaveDrawingEntity', 'mouseUpMonomer', 'rightClickSequence', 'rightClickCanvas', 'rightClickCanvasSequence', 'rightClickPolymerBond', 'rightClickSelectedMonomers', 'editSequence', 'startNewSequence', 'turnOnSequenceEditInRNABuilderMode', 'turnOffSequenceEditInRNABuilderMode', 'modifySequenceInRnaBuilder', 'mouseOverSequenceItem', 'mouseOnMoveSequenceItem', 'mouseLeaveSequenceItem', 'changeSequenceTypeEnterMode', 'toggleSequenceEditMode', 'toggleSequenceEditInRNABuilderMode', 'clickOnSequenceItem', 'mousedownBetweenSequenceItems', 'mouseDownOnSequenceItem', 'doubleClickOnSequenceItem', 'mouseUpAtom', 'selectEntities'];
var selectTools = [ToolName.selectRectangle, ToolName.selectLasso, ToolName.selectStructure];
var currentSelectToolIdx = 0;
var selectBondTool = function selectBondTool(editor, toolName) {
  editor.events.selectTool.dispatch([toolName, {
    toolName: toolName
  }]);
};
var hotkeysConfiguration = {
  RNASequenceType: {
    shortcut: ['Mod+Alt+r'],
    handler: function handler(editor) {
      editor.events.changeSequenceTypeEnterMode.dispatch(SequenceType.RNA);
    }
  },
  DNASequenceType: {
    shortcut: ['Mod+Alt+d'],
    handler: function handler(editor) {
      editor.events.changeSequenceTypeEnterMode.dispatch(SequenceType.DNA);
    }
  },
  PEPTIDESequenceTYpe: {
    shortcut: ['Mod+Alt+p'],
    handler: function handler(editor) {
      editor.events.changeSequenceTypeEnterMode.dispatch(SequenceType.PEPTIDE);
    }
  },
  exit: {
    shortcut: ['Escape'],
    handler: function handler(editor) {
      currentSelectToolIdx = 0;
      editor.events.selectSelectionTool.dispatch();
      editor.cancelLibraryItemDrag();
    }
  },
  switchSelectTool: {
    shortcut: ['Shift+Tab'],
    handler: function handler(editor) {
      currentSelectToolIdx = (currentSelectToolIdx + 1) % selectTools.length;
      editor.events.selectTool.dispatch([selectTools[currentSelectToolIdx]]);
      editor.cancelLibraryItemDrag();
    }
  },
  undo: {
    shortcut: 'Mod+z',
    handler: function handler(editor) {
      editor.onSelectHistory('undo');
    }
  },
  redo: {
    shortcut: ['Mod+Shift+z', 'Mod+y'],
    handler: function handler(editor) {
      editor.onSelectHistory('redo');
    }
  },
  erase: {
    shortcut: ['Delete', 'Backspace'],
    handler: function handler(editor) {
      var hasSelectedEntities = editor.drawingEntitiesManager.selectedEntities.length > 0;
      if (!hasSelectedEntities) {
        var hoveredEntities = editor.drawingEntitiesManager.allEntities.filter(function (_ref) {
          var _ref2 = _slicedToArray(_ref, 2),
            entity = _ref2[1];
          return entity.hovered;
        });
        hoveredEntities.forEach(function (_ref3) {
          var _ref4 = _slicedToArray(_ref3, 2),
            entity = _ref4[1];
          return entity.turnOnSelection();
        });
      }
      var hasEntitiesToDelete = editor.drawingEntitiesManager.selectedEntities.length > 0;
      editor.events.selectTool.dispatch([ToolName.erase]);
      if (hasEntitiesToDelete) {
        editor.events.selectTool.dispatch([ToolName.selectRectangle]);
      }
    }
  },
  bondSingle: {
    shortcut: '1',
    handler: function handler(editor) {
      if (editor.isSequenceMode) return;
      selectBondTool(editor, ToolName.bondSingle);
    }
  },
  bondHydrogen: {
    shortcut: '2',
    handler: function handler(editor) {
      if (editor.isSequenceMode) return;
      selectBondTool(editor, ToolName.bondHydrogen);
    }
  },
  clear: {
    shortcut: ['Mod+Delete', 'Mod+Backspace'],
    handler: function handler(editor) {
      editor.events.selectTool.dispatch([ToolName.clear]);
      editor.events.selectTool.dispatch([ToolName.selectRectangle]);
    }
  },
  'zoom-plus': {
    shortcut: ['Mod+Equal', 'Mod+NumpadAdd'],
    handler: function handler() {
      ZoomTool.instance.zoomIn();
    }
  },
  'zoom-minus': {
    shortcut: ['Mod+Minus', 'Mod+NumpadSubtract'],
    handler: function handler() {
      ZoomTool.instance.zoomOut();
    }
  },
  'zoom-reset': {
    shortcut: 'Mod+0',
    handler: function handler() {
      ZoomTool.instance.resetZoom();
    }
  },
  'select-all': {
    shortcut: 'Mod+a',
    handler: function handler(editor) {
      var modelChanges = editor.drawingEntitiesManager.selectAllDrawingEntities();
      editor.renderersContainer.update(modelChanges);
    }
  },
  hand: {
    shortcut: 'Mod+Alt+h',
    handler: function handler(editor) {
      editor.events.selectTool.dispatch([ToolName.hand]);
    }
  },
  'hide-scrollbars': {
    shortcut: 'Mod+b',
    handler: function handler() {
      ZoomTool.instance.drawScrollBars(true);
    }
  },
  createRnaAntisenseStrand: {
    shortcut: ['Shift+Alt+r'],
    handler: function handler(editor) {
      editor.events.createAntisenseChain.dispatch(false);
    }
  },
  createDnaAntisenseStrand: {
    shortcut: ['Shift+Alt+d'],
    handler: function handler(editor) {
      editor.events.createAntisenseChain.dispatch(true);
    }
  },
  toggleMacromoleculesPropertiesVisibility: {
    shortcut: 'Alt+c',
    handler: function handler(editor) {
      editor.events.toggleMacromoleculesPropertiesVisibility.dispatch();
    }
  },
  arrangeRing: {
    shortcut: ['Shift+Alt+c'],
    handler: function handler(editor) {
      editor.events.layoutCircular.dispatch();
    }
  }
};

export { createEditorEvents, hotkeysConfiguration, renderersEvents };
//# sourceMappingURL=editorEvents.modern.js.map
