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
var index = require('../../node_modules/subscription/index.js');
var Zoom = require('./tools/Zoom.js');
var types$1 = require('../../domain/entities/monomer-chains/types.js');
var types = require('./tools/types.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _slicedToArray__default = /*#__PURE__*/_interopDefaultLegacy(_slicedToArray);

function createEditorEvents() {
  return {
    selectMonomer: new index.Subscription(),
    selectPreset: new index.Subscription(),
    selectTool: new index.Subscription(),
    selectSelectionTool: new index.Subscription(),
    createBondViaModal: new index.Subscription(),
    cancelBondCreationViaModal: new index.Subscription(),
    selectMode: new index.Subscription(),
    layoutModeChange: new index.Subscription(),
    selectHistory: new index.Subscription(),
    error: new index.Subscription(),
    openErrorModal: new index.Subscription(),
    openMonomerConnectionModal: new index.Subscription(),
    mouseOverPolymerBond: new index.Subscription(),
    mouseLeavePolymerBond: new index.Subscription(),
    mouseOnMovePolymerBond: new index.Subscription(),
    mouseOverMonomer: new index.Subscription(),
    mouseOnMoveMonomer: new index.Subscription(),
    mouseLeaveMonomer: new index.Subscription(),
    mouseOverAttachmentPoint: new index.Subscription(),
    mouseMoveAttachmentPoint: new index.Subscription(),
    mouseLeaveAttachmentPoint: new index.Subscription(),
    mouseUpAttachmentPoint: new index.Subscription(),
    mouseDownAttachmentPoint: new index.Subscription(),
    mouseOverDrawingEntity: new index.Subscription(),
    mouseLeaveDrawingEntity: new index.Subscription(),
    mouseUpMonomer: new index.Subscription(),
    rightClickSequence: new index.Subscription(),
    rightClickCanvas: new index.Subscription(),
    rightClickCanvasSequence: new index.Subscription(),
    rightClickPolymerBond: new index.Subscription(),
    rightClickSelectedMonomers: new index.Subscription(),
    keyDown: new index.Subscription(),
    editSequence: new index.Subscription(),
    startNewSequence: new index.Subscription(),
    establishHydrogenBond: new index.Subscription(),
    deleteHydrogenBond: new index.Subscription(),
    turnOnSequenceEditInRNABuilderMode: new index.Subscription(),
    turnOffSequenceEditInRNABuilderMode: new index.Subscription(),
    modifySequenceInRnaBuilder: new index.Subscription(),
    mouseOverSequenceItem: new index.Subscription(),
    mouseOnMoveSequenceItem: new index.Subscription(),
    mouseLeaveSequenceItem: new index.Subscription(),
    changeSequenceTypeEnterMode: new index.Subscription(),
    toggleSequenceEditMode: new index.Subscription(),
    toggleSequenceEditInRNABuilderMode: new index.Subscription(),
    toggleIsSequenceSyncEditMode: new index.Subscription(),
    resetSequenceEditMode: new index.Subscription(),
    clickOnSequenceItem: new index.Subscription(),
    mousedownBetweenSequenceItems: new index.Subscription(),
    mouseDownOnSequenceItem: new index.Subscription(),
    doubleClickOnSequenceItem: new index.Subscription(),
    openConfirmationDialog: new index.Subscription(),
    mouseUpAtom: new index.Subscription(),
    updateMonomersLibrary: new index.Subscription(),
    createAntisenseChain: new index.Subscription(),
    copySelectedStructure: new index.Subscription(),
    pasteFromClipboard: new index.Subscription(),
    deleteSelectedStructure: new index.Subscription(),
    selectEntities: new index.Subscription(),
    modelChange: new index.Subscription(),
    toggleMacromoleculesPropertiesVisibility: new index.Subscription(),
    modifyAminoAcids: new index.Subscription(),
    setEditorLineLength: new index.Subscription(),
    toggleLineLengthHighlighting: new index.Subscription(),
    setLibraryItemDragState: new index.Subscription(),
    placeLibraryItemOnCanvas: new index.Subscription(),
    autochain: new index.Subscription(),
    previewAutochain: new index.Subscription(),
    removeAutochainPreview: new index.Subscription(),
    switchToMacromoleculesMode: new index.Subscription(),
    switchToMoleculesMode: new index.Subscription(),
    layoutCircular: new index.Subscription(),
    flipHorizontal: new index.Subscription(),
    flipVertical: new index.Subscription()
  };
}
var renderersEvents = ['mouseOverPolymerBond', 'mouseLeavePolymerBond', 'mouseOnMovePolymerBond', 'mouseOverMonomer', 'mouseOnMoveMonomer', 'mouseOverAttachmentPoint', 'mouseLeaveAttachmentPoint', 'mouseUpAttachmentPoint', 'mouseDownAttachmentPoint', 'mouseLeaveMonomer', 'mouseOverDrawingEntity', 'mouseLeaveDrawingEntity', 'mouseUpMonomer', 'rightClickSequence', 'rightClickCanvas', 'rightClickCanvasSequence', 'rightClickPolymerBond', 'rightClickSelectedMonomers', 'editSequence', 'startNewSequence', 'turnOnSequenceEditInRNABuilderMode', 'turnOffSequenceEditInRNABuilderMode', 'modifySequenceInRnaBuilder', 'mouseOverSequenceItem', 'mouseOnMoveSequenceItem', 'mouseLeaveSequenceItem', 'changeSequenceTypeEnterMode', 'toggleSequenceEditMode', 'toggleSequenceEditInRNABuilderMode', 'clickOnSequenceItem', 'mousedownBetweenSequenceItems', 'mouseDownOnSequenceItem', 'doubleClickOnSequenceItem', 'mouseUpAtom', 'selectEntities'];
var selectTools = [types.ToolName.selectRectangle, types.ToolName.selectLasso, types.ToolName.selectStructure];
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
      editor.events.changeSequenceTypeEnterMode.dispatch(types$1.SequenceType.RNA);
    }
  },
  DNASequenceType: {
    shortcut: ['Mod+Alt+d'],
    handler: function handler(editor) {
      editor.events.changeSequenceTypeEnterMode.dispatch(types$1.SequenceType.DNA);
    }
  },
  PEPTIDESequenceTYpe: {
    shortcut: ['Mod+Alt+p'],
    handler: function handler(editor) {
      editor.events.changeSequenceTypeEnterMode.dispatch(types$1.SequenceType.PEPTIDE);
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
          var _ref2 = _slicedToArray__default["default"](_ref, 2),
            entity = _ref2[1];
          return entity.hovered;
        });
        hoveredEntities.forEach(function (_ref3) {
          var _ref4 = _slicedToArray__default["default"](_ref3, 2),
            entity = _ref4[1];
          return entity.turnOnSelection();
        });
      }
      var hasEntitiesToDelete = editor.drawingEntitiesManager.selectedEntities.length > 0;
      editor.events.selectTool.dispatch([types.ToolName.erase]);
      if (hasEntitiesToDelete) {
        editor.events.selectTool.dispatch([types.ToolName.selectRectangle]);
      }
    }
  },
  bondSingle: {
    shortcut: '1',
    handler: function handler(editor) {
      if (editor.isSequenceMode) return;
      selectBondTool(editor, types.ToolName.bondSingle);
    }
  },
  bondHydrogen: {
    shortcut: '2',
    handler: function handler(editor) {
      if (editor.isSequenceMode) return;
      selectBondTool(editor, types.ToolName.bondHydrogen);
    }
  },
  clear: {
    shortcut: ['Mod+Delete', 'Mod+Backspace'],
    handler: function handler(editor) {
      editor.events.selectTool.dispatch([types.ToolName.clear]);
      editor.events.selectTool.dispatch([types.ToolName.selectRectangle]);
    }
  },
  'zoom-plus': {
    shortcut: ['Mod+Equal', 'Mod+NumpadAdd'],
    handler: function handler() {
      Zoom.ZoomTool.instance.zoomIn();
    }
  },
  'zoom-minus': {
    shortcut: ['Mod+Minus', 'Mod+NumpadSubtract'],
    handler: function handler() {
      Zoom.ZoomTool.instance.zoomOut();
    }
  },
  'zoom-reset': {
    shortcut: 'Mod+0',
    handler: function handler() {
      Zoom.ZoomTool.instance.resetZoom();
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
      editor.events.selectTool.dispatch([types.ToolName.hand]);
    }
  },
  'hide-scrollbars': {
    shortcut: 'Mod+b',
    handler: function handler() {
      Zoom.ZoomTool.instance.drawScrollBars(true);
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

exports.createEditorEvents = createEditorEvents;
exports.hotkeysConfiguration = hotkeysConfiguration;
exports.renderersEvents = renderersEvents;
//# sourceMappingURL=editorEvents.js.map
