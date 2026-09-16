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
import _asyncToGenerator from '@babel/runtime/helpers/asyncToGenerator';
import _classCallCheck from '@babel/runtime/helpers/classCallCheck';
import _createClass from '@babel/runtime/helpers/createClass';
import _possibleConstructorReturn from '@babel/runtime/helpers/possibleConstructorReturn';
import _get from '@babel/runtime/helpers/get';
import _getPrototypeOf from '@babel/runtime/helpers/getPrototypeOf';
import _inherits from '@babel/runtime/helpers/inherits';
import _regeneratorRuntime from '@babel/runtime/regenerator';
import { BaseMode } from './BaseMode.modern.js';
import { ZoomTool } from '../tools/Zoom.modern.js';
import { Coordinates } from '../shared/coordinates.modern.js';
import { provideEditorInstance } from '../editorSingleton.modern.js';
import { Command } from '../../../domain/entities/Command.modern.js';
import { ReinitializeModeOperation } from '../operations/modes/index.modern.js';
import '../../../domain/entities/atom.modern.js';
import '../../../domain/entities/atomList.modern.js';
import '../../../domain/entities/bond.modern.js';
import '../../../domain/entities/fixedPrecision.modern.js';
import '../../../domain/entities/fragment.modern.js';
import '../../../domain/entities/functionalGroup.modern.js';
import '../../../domain/entities/halfBond.modern.js';
import '../../../domain/entities/loop.modern.js';
import '../../../domain/entities/rgroup.modern.js';
import '../../../domain/entities/rgroupAttachmentPoint.modern.js';
import '../../../domain/entities/rxnArrow.modern.js';
import '../../../domain/entities/rxnPlus.modern.js';
import '../../../domain/entities/sgroup.modern.js';
import '../../../domain/entities/sgroupForest.modern.js';
import '../../../domain/entities/simpleObject.modern.js';
import '../../../domain/entities/struct.modern.js';
import '../../../domain/entities/text.modern.js';
import '../../../domain/entities/pile.modern.js';
import { Vec2 } from '../../../domain/entities/vec2.modern.js';
import '../../../domain/entities/box2Abs.modern.js';
import '../../../domain/entities/pool.modern.js';
import '../../../domain/entities/image.modern.js';
import '../../../domain/entities/multitailArrow.modern.js';
import '../../../domain/entities/highlight.modern.js';
import '../../../domain/entities/sGroupAttachmentPoint.modern.js';
import '../../../domain/entities/monomerMicromolecule.modern.js';
import '../../../domain/entities/Peptide.modern.js';
import '../../../domain/entities/BaseMonomer.modern.js';
import '../../../domain/entities/Chem.modern.js';
import '../../../domain/entities/Sugar.modern.js';
import '../../../domain/entities/RNABase.modern.js';
import '../../../domain/entities/Phosphate.modern.js';
import '../../../domain/entities/Axis.modern.js';
import '../../../domain/entities/Nucleoside.modern.js';
import '../../../domain/entities/Nucleotide.modern.js';
import '../../../domain/entities/monomer-chains/types.modern.js';
import '../../../domain/entities/monomer-chains/Chain.modern.js';
import '../../../domain/entities/monomer-chains/ChainsCollection.modern.js';
import '../../../domain/entities/MonomerSequenceNode.modern.js';
import '../../../domain/entities/EmptySequenceNode.modern.js';
import '../../../domain/entities/LinkerSequenceNode.modern.js';
import '../../../domain/entities/UnresolvedMonomer.modern.js';
import '../../../domain/entities/UnsplitNucleotide.modern.js';
import '../../../domain/entities/PolymerBond.modern.js';
import '../../../domain/entities/AmbiguousMonomer.modern.js';
import '../../../domain/entities/MonomerToAtomBond.modern.js';
import '../../../domain/entities/HydrogenBond.modern.js';
import '../../../domain/entities/SGroupDrawingEntity.modern.js';
import '../../../domain/entities/BackBoneSequenceNode.modern.js';
import '@babel/runtime/helpers/slicedToArray';
import '../../../utilities/runAsyncAction.modern.js';
import '../../../utilities/KetcherLogger.modern.js';
import '../../../utilities/SettingsManager.modern.js';
import '../../../utilities/keynorm.modern.js';
import 'react-device-detect';
import '../../../utilities/clipboardUtils.modern.js';
import '../../../domain/entities/CoreAtom.modern.js';
import '../../../domain/entities/CoreStereoFlag.modern.js';
import '@babel/runtime/helpers/defineProperty';
import '@babel/runtime/helpers/typeof';
import '../../../domain/constants/elements.modern.js';
import '../../../domain/constants/element.types.modern.js';
import '../../../domain/constants/generics.modern.js';
import '../../../domain/constants/chains.modern.js';
import '../../../domain/constants/monomers.modern.js';
import { registerMode } from './modesRegistry.modern.js';
import { getRenderedStructuresBbox } from '../../render/renderers/utils.modern.js';

function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var SnakeMode = function (_BaseMode) {
  _inherits(SnakeMode, _BaseMode);
  function SnakeMode(previousMode) {
    _classCallCheck(this, SnakeMode);
    return _callSuper(this, SnakeMode, ['snake-layout-mode', previousMode]);
  }
  _createClass(SnakeMode, [{
    key: "initialize",
    value: function initialize(_needRemoveSelection) {
      var _isUndo = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var command = _get(_getPrototypeOf(SnakeMode.prototype), "initialize", this).call(this);
      var editor = provideEditorInstance();
      var modelChanges = _isUndo ? new Command() : editor.drawingEntitiesManager.applySnakeLayout(true);
      editor.drawingEntitiesManager.applyFlexLayoutMode();
      command.merge(modelChanges);
      editor.renderersContainer.update(modelChanges);
      command.setUndoOperationReverse();
      if (editor.drawingEntitiesManager.hasMonomers) {
        editor.scrollToTopLeftCorner();
      }
      return command;
    }
  }, {
    key: "getNewNodePosition",
    value: function getNewNodePosition() {
      var editor = provideEditorInstance();
      return Coordinates.modelToCanvas(editor.drawingEntitiesManager.bottomRightMonomerPosition);
    }
  }, {
    key: "scrollForView",
    value: function () {
      var _scrollForView = _asyncToGenerator(_regeneratorRuntime.mark(function _callee() {
        var zoom, drawnEntitiesBoundingBox;
        return _regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              zoom = ZoomTool.instance;
              drawnEntitiesBoundingBox = getRenderedStructuresBbox();
              if (zoom.isFitToCanvasHeight(drawnEntitiesBoundingBox.height)) {
                zoom.scrollTo(new Vec2(drawnEntitiesBoundingBox.left, drawnEntitiesBoundingBox.top), false, 2);
              } else {
                zoom.scrollTo(new Vec2(drawnEntitiesBoundingBox.left, drawnEntitiesBoundingBox.bottom), true, 2);
              }
            case 3:
            case "end":
              return _context.stop();
          }
        }, _callee);
      }));
      function scrollForView() {
        return _scrollForView.apply(this, arguments);
      }
      return scrollForView;
    }()
  }, {
    key: "applyAdditionalPasteOperations",
    value: function applyAdditionalPasteOperations(mergedDrawingEntities) {
      var command = new Command();
      var editor = provideEditorInstance();
      command.addOperation(new ReinitializeModeOperation());
      command.merge(editor.drawingEntitiesManager.selectDrawingEntities(mergedDrawingEntities.allEntitiesArray));
      return command;
    }
  }, {
    key: "isPasteAllowedByMode",
    value: function isPasteAllowedByMode() {
      return true;
    }
  }, {
    key: "isPasteAvailable",
    value: function isPasteAvailable() {
      return true;
    }
  }]);
  return SnakeMode;
}(BaseMode);
registerMode('snake-layout-mode', SnakeMode);

export { SnakeMode };
//# sourceMappingURL=SnakeMode.modern.js.map
