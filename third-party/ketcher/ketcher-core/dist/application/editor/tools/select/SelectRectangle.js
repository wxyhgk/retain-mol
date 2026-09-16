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
var _possibleConstructorReturn = require('@babel/runtime/helpers/possibleConstructorReturn');
var _getPrototypeOf = require('@babel/runtime/helpers/getPrototypeOf');
var _assertThisInitialized = require('@babel/runtime/helpers/assertThisInitialized');
var _inherits = require('@babel/runtime/helpers/inherits');
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var editorSingleton = require('../../editorSingleton.js');
var coordinates = require('../../shared/coordinates.js');
var SelectBase = require('./SelectBase.js');
require('../../../../domain/entities/atom.js');
require('../../../../domain/entities/atomList.js');
require('../../../../domain/entities/bond.js');
require('../../../../domain/entities/fixedPrecision.js');
require('../../../../domain/entities/fragment.js');
require('../../../../domain/entities/functionalGroup.js');
require('../../../../domain/entities/halfBond.js');
require('../../../../domain/entities/loop.js');
require('../../../../domain/entities/rgroup.js');
require('../../../../domain/entities/rgroupAttachmentPoint.js');
require('../../../../domain/entities/rxnArrow.js');
require('../../../../domain/entities/rxnPlus.js');
require('../../../../domain/entities/sgroup.js');
require('../../../../domain/entities/sgroupForest.js');
require('../../../../domain/entities/simpleObject.js');
require('../../../../domain/entities/struct.js');
require('../../../../domain/entities/text.js');
require('../../../../domain/entities/pile.js');
var vec2 = require('../../../../domain/entities/vec2.js');
require('../../../../domain/entities/box2Abs.js');
require('../../../../domain/entities/pool.js');
require('../../../../domain/entities/image.js');
require('../../../../domain/entities/multitailArrow.js');
require('../../../../domain/entities/highlight.js');
require('../../../../domain/entities/sGroupAttachmentPoint.js');
require('../../../../domain/entities/monomerMicromolecule.js');
require('../../../../domain/entities/Peptide.js');
require('../../../../domain/entities/BaseMonomer.js');
require('../../../../domain/entities/Chem.js');
require('../../../../domain/entities/Sugar.js');
require('../../../../domain/entities/RNABase.js');
require('../../../../domain/entities/Phosphate.js');
require('../../../../domain/entities/Axis.js');
require('../../../../domain/entities/Nucleoside.js');
require('../../../../domain/entities/Nucleotide.js');
require('../../../../domain/entities/monomer-chains/types.js');
require('../../../../domain/entities/monomer-chains/Chain.js');
require('../../../../domain/entities/monomer-chains/ChainsCollection.js');
require('../../../../domain/entities/MonomerSequenceNode.js');
require('../../../../domain/entities/EmptySequenceNode.js');
require('../../../../domain/entities/LinkerSequenceNode.js');
require('../../../../domain/entities/UnresolvedMonomer.js');
require('../../../../domain/entities/UnsplitNucleotide.js');
require('../../../../domain/entities/PolymerBond.js');
require('../../../../domain/entities/AmbiguousMonomer.js');
require('../../../../domain/entities/MonomerToAtomBond.js');
require('../../../../domain/entities/HydrogenBond.js');
require('../../../../domain/entities/SGroupDrawingEntity.js');
require('../../../../domain/entities/BackBoneSequenceNode.js');
require('@babel/runtime/helpers/slicedToArray');
require('../../../../domain/entities/Command.js');
require('../../../../utilities/runAsyncAction.js');
require('../../../../utilities/KetcherLogger.js');
require('../../../../utilities/SettingsManager.js');
require('../../../../utilities/keynorm.js');
require('react-device-detect');
require('../../../../utilities/clipboardUtils.js');
require('../../../../domain/entities/CoreAtom.js');
require('../../../../domain/entities/CoreStereoFlag.js');
require('@babel/runtime/helpers/typeof');
require('../../../../domain/constants/elements.js');
require('../../../../domain/constants/element.types.js');
require('../../../../domain/constants/generics.js');
require('../../../../domain/constants/chains.js');
require('../../../../domain/constants/monomers.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _possibleConstructorReturn__default = /*#__PURE__*/_interopDefaultLegacy(_possibleConstructorReturn);
var _getPrototypeOf__default = /*#__PURE__*/_interopDefaultLegacy(_getPrototypeOf);
var _assertThisInitialized__default = /*#__PURE__*/_interopDefaultLegacy(_assertThisInitialized);
var _inherits__default = /*#__PURE__*/_interopDefaultLegacy(_inherits);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);

function _callSuper(t, o, e) { return o = _getPrototypeOf__default["default"](o), _possibleConstructorReturn__default["default"](t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf__default["default"](t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var SelectRectangle = function (_SelectBase) {
  _inherits__default["default"](SelectRectangle, _SelectBase);
  function SelectRectangle(editor) {
    var _this;
    _classCallCheck__default["default"](this, SelectRectangle);
    _this = _callSuper(this, SelectRectangle, [editor]);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "editor", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "selectionViewParams", {
      type: 'rectangle',
      start: [0, 0],
      width: 0,
      height: 0
    });
    _this.editor = editor;
    return _this;
  }
  _createClass__default["default"](SelectRectangle, [{
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
      var editor = editorSingleton.provideEditorInstance();
      if (editor.isSequenceEditMode || editor.isSequenceEditInRNABuilderMode) return;
      requestAnimationFrame(function () {
        var lastCursorCanvasPosition = coordinates.Coordinates.viewToCanvas(_this2.editor.lastCursorPosition);
        var topLeftX = Math.min(_this2.selectionStartCanvasPosition.x, lastCursorCanvasPosition.x);
        var topLeftY = Math.min(_this2.selectionStartCanvasPosition.y, lastCursorCanvasPosition.y);
        var bottomRightX = Math.max(_this2.selectionStartCanvasPosition.x, lastCursorCanvasPosition.x);
        var bottomRightY = Math.max(_this2.selectionStartCanvasPosition.y, lastCursorCanvasPosition.y);
        var topLeftPoint = new vec2.Vec2(topLeftX, topLeftY);
        var bottomRightPoint = new vec2.Vec2(bottomRightX, bottomRightY);
        var modelChanges = _this2.editor.drawingEntitiesManager.selectIfLocatedInRectangle(topLeftPoint, bottomRightPoint, _this2.previousSelectedEntities, isShiftPressed);
        _this2.editor.renderersContainer.update(modelChanges);
        _this2.editor.transientDrawingView.update();
      });
    }
  }]);
  return SelectRectangle;
}(SelectBase.SelectBase);

exports.SelectRectangle = SelectRectangle;
//# sourceMappingURL=SelectRectangle.js.map
