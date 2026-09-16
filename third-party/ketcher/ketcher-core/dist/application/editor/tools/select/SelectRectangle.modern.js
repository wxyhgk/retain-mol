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
import _possibleConstructorReturn from '@babel/runtime/helpers/possibleConstructorReturn';
import _getPrototypeOf from '@babel/runtime/helpers/getPrototypeOf';
import _assertThisInitialized from '@babel/runtime/helpers/assertThisInitialized';
import _inherits from '@babel/runtime/helpers/inherits';
import _defineProperty from '@babel/runtime/helpers/defineProperty';
import { provideEditorInstance } from '../../editorSingleton.modern.js';
import { Coordinates } from '../../shared/coordinates.modern.js';
import { SelectBase } from './SelectBase.modern.js';
import '../../../../domain/entities/atom.modern.js';
import '../../../../domain/entities/atomList.modern.js';
import '../../../../domain/entities/bond.modern.js';
import '../../../../domain/entities/fixedPrecision.modern.js';
import '../../../../domain/entities/fragment.modern.js';
import '../../../../domain/entities/functionalGroup.modern.js';
import '../../../../domain/entities/halfBond.modern.js';
import '../../../../domain/entities/loop.modern.js';
import '../../../../domain/entities/rgroup.modern.js';
import '../../../../domain/entities/rgroupAttachmentPoint.modern.js';
import '../../../../domain/entities/rxnArrow.modern.js';
import '../../../../domain/entities/rxnPlus.modern.js';
import '../../../../domain/entities/sgroup.modern.js';
import '../../../../domain/entities/sgroupForest.modern.js';
import '../../../../domain/entities/simpleObject.modern.js';
import '../../../../domain/entities/struct.modern.js';
import '../../../../domain/entities/text.modern.js';
import '../../../../domain/entities/pile.modern.js';
import { Vec2 } from '../../../../domain/entities/vec2.modern.js';
import '../../../../domain/entities/box2Abs.modern.js';
import '../../../../domain/entities/pool.modern.js';
import '../../../../domain/entities/image.modern.js';
import '../../../../domain/entities/multitailArrow.modern.js';
import '../../../../domain/entities/highlight.modern.js';
import '../../../../domain/entities/sGroupAttachmentPoint.modern.js';
import '../../../../domain/entities/monomerMicromolecule.modern.js';
import '../../../../domain/entities/Peptide.modern.js';
import '../../../../domain/entities/BaseMonomer.modern.js';
import '../../../../domain/entities/Chem.modern.js';
import '../../../../domain/entities/Sugar.modern.js';
import '../../../../domain/entities/RNABase.modern.js';
import '../../../../domain/entities/Phosphate.modern.js';
import '../../../../domain/entities/Axis.modern.js';
import '../../../../domain/entities/Nucleoside.modern.js';
import '../../../../domain/entities/Nucleotide.modern.js';
import '../../../../domain/entities/monomer-chains/types.modern.js';
import '../../../../domain/entities/monomer-chains/Chain.modern.js';
import '../../../../domain/entities/monomer-chains/ChainsCollection.modern.js';
import '../../../../domain/entities/MonomerSequenceNode.modern.js';
import '../../../../domain/entities/EmptySequenceNode.modern.js';
import '../../../../domain/entities/LinkerSequenceNode.modern.js';
import '../../../../domain/entities/UnresolvedMonomer.modern.js';
import '../../../../domain/entities/UnsplitNucleotide.modern.js';
import '../../../../domain/entities/PolymerBond.modern.js';
import '../../../../domain/entities/AmbiguousMonomer.modern.js';
import '../../../../domain/entities/MonomerToAtomBond.modern.js';
import '../../../../domain/entities/HydrogenBond.modern.js';
import '../../../../domain/entities/SGroupDrawingEntity.modern.js';
import '../../../../domain/entities/BackBoneSequenceNode.modern.js';
import '@babel/runtime/helpers/slicedToArray';
import '../../../../domain/entities/Command.modern.js';
import '../../../../utilities/runAsyncAction.modern.js';
import '../../../../utilities/KetcherLogger.modern.js';
import '../../../../utilities/SettingsManager.modern.js';
import '../../../../utilities/keynorm.modern.js';
import 'react-device-detect';
import '../../../../utilities/clipboardUtils.modern.js';
import '../../../../domain/entities/CoreAtom.modern.js';
import '../../../../domain/entities/CoreStereoFlag.modern.js';
import '@babel/runtime/helpers/typeof';
import '../../../../domain/constants/elements.modern.js';
import '../../../../domain/constants/element.types.modern.js';
import '../../../../domain/constants/generics.modern.js';
import '../../../../domain/constants/chains.modern.js';
import '../../../../domain/constants/monomers.modern.js';

function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var SelectRectangle = function (_SelectBase) {
  _inherits(SelectRectangle, _SelectBase);
  function SelectRectangle(editor) {
    var _this;
    _classCallCheck(this, SelectRectangle);
    _this = _callSuper(this, SelectRectangle, [editor]);
    _defineProperty(_assertThisInitialized(_this), "editor", void 0);
    _defineProperty(_assertThisInitialized(_this), "selectionViewParams", {
      type: 'rectangle',
      start: [0, 0],
      width: 0,
      height: 0
    });
    _this.editor = editor;
    return _this;
  }
  _createClass(SelectRectangle, [{
    key: "updateSelectionViewParams",
    value: function updateSelectionViewParams() {
      var newWidth = this.editor.lastCursorPositionOfCanvas.x - this.mousePositionBeforeMove.x;
      var newHeight = this.editor.lastCursorPositionOfCanvas.y - this.mousePositionBeforeMove.y;
      this.selectionViewParams.start[0] = newWidth < 0 ? this.editor.lastCursorPositionOfCanvas.x : this.mousePositionBeforeMove.x;
      this.selectionViewParams.start[1] = newHeight < 0 ? this.editor.lastCursorPositionOfCanvas.y : this.mousePositionBeforeMove.y;
      this.selectionViewParams.width = Math.abs(newWidth);
      this.selectionViewParams.height = Math.abs(newHeight);
    }
  }, {
    key: "createSelectionView",
    value: function createSelectionView() {
      this.editor.transientDrawingView.showSelection(this.selectionViewParams);
    }
  }, {
    key: "onSelectionMove",
    value: function onSelectionMove(isShiftPressed) {
      var _this2 = this;
      var editor = provideEditorInstance();
      if (editor.isSequenceEditMode || editor.isSequenceEditInRNABuilderMode) return;
      requestAnimationFrame(function () {
        var lastCursorCanvasPosition = Coordinates.viewToCanvas(_this2.editor.lastCursorPosition);
        var topLeftX = Math.min(_this2.selectionStartCanvasPosition.x, lastCursorCanvasPosition.x);
        var topLeftY = Math.min(_this2.selectionStartCanvasPosition.y, lastCursorCanvasPosition.y);
        var bottomRightX = Math.max(_this2.selectionStartCanvasPosition.x, lastCursorCanvasPosition.x);
        var bottomRightY = Math.max(_this2.selectionStartCanvasPosition.y, lastCursorCanvasPosition.y);
        var topLeftPoint = new Vec2(topLeftX, topLeftY);
        var bottomRightPoint = new Vec2(bottomRightX, bottomRightY);
        var modelChanges = _this2.editor.drawingEntitiesManager.selectIfLocatedInRectangle(topLeftPoint, bottomRightPoint, _this2.previousSelectedEntities, isShiftPressed);
        _this2.editor.renderersContainer.update(modelChanges);
        _this2.editor.transientDrawingView.update();
      });
    }
  }]);
  return SelectRectangle;
}(SelectBase);

export { SelectRectangle };
//# sourceMappingURL=SelectRectangle.modern.js.map
