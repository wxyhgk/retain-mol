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
import _assertThisInitialized from '@babel/runtime/helpers/assertThisInitialized';
import _get from '@babel/runtime/helpers/get';
import _getPrototypeOf from '@babel/runtime/helpers/getPrototypeOf';
import _inherits from '@babel/runtime/helpers/inherits';
import _defineProperty from '@babel/runtime/helpers/defineProperty';
import { BaseRenderer } from './BaseRenderer.modern.js';
import { Coordinates } from '../../editor/shared/coordinates.modern.js';
import { provideEditorInstance } from '../../editor/editorSingleton.modern.js';
import { ketcherProvider } from '../../ketcherProvider.modern.js';
import { StereoFlag } from '../../../domain/entities/fragment.modern.js';
import '../../../domain/entities/atom.modern.js';
import '../../../domain/entities/atomList.modern.js';
import '../../../domain/entities/bond.modern.js';
import '../../../domain/entities/fixedPrecision.modern.js';
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
import '../../../domain/entities/Command.modern.js';
import '../../../utilities/runAsyncAction.modern.js';
import '../../../utilities/KetcherLogger.modern.js';
import '../../../utilities/SettingsManager.modern.js';
import '../../../utilities/keynorm.modern.js';
import 'react-device-detect';
import '../../../utilities/clipboardUtils.modern.js';
import '../../../domain/entities/CoreAtom.modern.js';
import '../../../domain/entities/CoreStereoFlag.modern.js';
import '@babel/runtime/helpers/typeof';
import '../../../domain/constants/elements.modern.js';
import '../../../domain/constants/element.types.modern.js';
import '../../../domain/constants/generics.modern.js';
import '../../../domain/constants/chains.modern.js';
import '../../../domain/constants/monomers.modern.js';

function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var StereoFlagRenderer = function (_BaseRenderer) {
  _inherits(StereoFlagRenderer, _BaseRenderer);
  function StereoFlagRenderer(stereoFlag) {
    var _this;
    _classCallCheck(this, StereoFlagRenderer);
    _this = _callSuper(this, StereoFlagRenderer, [stereoFlag]);
    _defineProperty(_assertThisInitialized(_this), "stereoFlag", void 0);
    _defineProperty(_assertThisInitialized(_this), "selectionElement", void 0);
    _defineProperty(_assertThisInitialized(_this), "textElement", void 0);
    _this.stereoFlag = stereoFlag;
    _this.stereoFlag.setRenderer(_assertThisInitialized(_this));
    return _this;
  }
  _createClass(StereoFlagRenderer, [{
    key: "scaledPosition",
    get: function get() {
      return Coordinates.modelToCanvas(this.stereoFlag.position);
    }
  }, {
    key: "flagLabel",
    get: function get() {
      switch (this.stereoFlag.flagType) {
        case StereoFlag.Abs:
          return 'ABS';
        case StereoFlag.And:
          return 'AND Enantiomer';
        case StereoFlag.Or:
          return 'OR Enantiomer';
        case StereoFlag.Mixed:
          return 'Mixed';
        default:
          return '';
      }
    }
  }, {
    key: "show",
    value: function show() {
      if (!this.shouldDisplayStereoFlag()) {
        return;
      }
      this.rootElement = this.canvas.insert('g', ".monomer").data([this]).attr('data-testid', 'stereo-flag').attr('pointer-events', 'all').attr('transform', "translate(".concat(this.scaledPosition.x, ", ").concat(this.scaledPosition.y, ")"));
      this.textElement = this.rootElement.append('text').attr('font-family', 'Arial').attr('font-size', '13px').attr('fill', '#000').attr('y', 4).text(this.flagLabel);
      this.appendHoverAreaElement();
      this.drawSelection();
    }
  }, {
    key: "shouldDisplayStereoFlag",
    value: function shouldDisplayStereoFlag() {
      var _ketcherProvider$getK, _settings$showStereoF;
      var editor = provideEditorInstance();
      var settings = (_ketcherProvider$getK = ketcherProvider.getKetcher(editor.ketcherId).settingsService) === null || _ketcherProvider$getK === void 0 ? void 0 : _ketcherProvider$getK.getSettings();
      return ((_settings$showStereoF = settings === null || settings === void 0 ? void 0 : settings.showStereoFlags) !== null && _settings$showStereoF !== void 0 ? _settings$showStereoF : true) && !(settings !== null && settings !== void 0 && settings.ignoreChiralFlag);
    }
  }, {
    key: "getTextBBox",
    value: function getTextBBox() {
      var _this$textElement;
      var textNode = (_this$textElement = this.textElement) === null || _this$textElement === void 0 ? void 0 : _this$textElement.node();
      if (!textNode) {
        var HOVER_PADDING = 4;
        return {
          x: -HOVER_PADDING,
          y: -10,
          width: 50,
          height: 16
        };
      }
      return textNode.getBBox();
    }
  }, {
    key: "setSelectionContourAttributes",
    value: function setSelectionContourAttributes(selectionContourElement) {
      var position = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : new Vec2(0, 0);
      var bbox = this.getTextBBox();
      var HOVER_PADDING = 4;
      return selectionContourElement.attr('x', position.x + bbox.x - HOVER_PADDING).attr('y', position.y + bbox.y - HOVER_PADDING).attr('width', bbox.width + HOVER_PADDING * 2).attr('height', bbox.height + HOVER_PADDING * 2).attr('rx', 4);
    }
  }, {
    key: "appendHover",
    value: function appendHover() {
      if (!this.rootElement) {
        return;
      }
      if (this.hoverElement) {
        return;
      }
      this.hoverElement = this.rootElement.insert('rect', ':first-child').attr('fill', 'none').attr('stroke', '#0097A8').attr('stroke-width', 1.2).attr('pointer-events', 'none').attr('class', 'dynamic-element');
      this.setSelectionContourAttributes(this.hoverElement);
    }
  }, {
    key: "appendHoverAreaElement",
    value: function appendHoverAreaElement() {
      var _this2 = this;
      if (!this.rootElement) {
        return;
      }
      this.hoverAreaElement = this.rootElement.append('rect').attr('fill', 'none').attr('stroke', 'none').attr('pointer-events', 'all').attr('class', 'dynamic-element');
      this.setSelectionContourAttributes(this.hoverAreaElement);
      this.hoverAreaElement.each(function (_, index, nodes) {
        var node = nodes[index];
        node.__data__ = _this2;
      });
      this.hoverAreaElement.on('mouseover', function (event) {
        provideEditorInstance().events.mouseOverDrawingEntity.dispatch(event);
        _this2.appendHover();
      }).on('mouseleave', function (event) {
        provideEditorInstance().events.mouseLeaveDrawingEntity.dispatch(event);
        _this2.removeHover();
      });
    }
  }, {
    key: "drawSelection",
    value: function drawSelection() {
      if (!this.rootElement) {
        return;
      }
      if (this.stereoFlag.selected) {
        this.appendSelection();
      } else {
        this.removeSelection();
      }
    }
  }, {
    key: "appendSelection",
    value: function appendSelection() {
      var _this$canvas;
      if (!this.rootElement || this.selectionElement) {
        return;
      }
      this.selectionElement = (_this$canvas = this.canvas) === null || _this$canvas === void 0 ? void 0 : _this$canvas.insert('rect', ':first-child').attr('fill', '#57ff8f').attr('stroke', '#57ff8f').attr('class', 'dynamic-element');
      this.setSelectionContourAttributes(this.selectionElement, this.scaledPosition);
    }
  }, {
    key: "removeSelection",
    value: function removeSelection() {
      var _this$selectionElemen;
      (_this$selectionElemen = this.selectionElement) === null || _this$selectionElemen === void 0 || _this$selectionElemen.remove();
      this.selectionElement = undefined;
    }
  }, {
    key: "move",
    value: function move() {
      if (!this.rootElement) {
        return;
      }
      this.remove();
      this.show();
    }
  }, {
    key: "removeHover",
    value: function removeHover() {
      var _this$hoverElement;
      (_this$hoverElement = this.hoverElement) === null || _this$hoverElement === void 0 || _this$hoverElement.remove();
      this.hoverElement = undefined;
    }
  }, {
    key: "remove",
    value: function remove() {
      _get(_getPrototypeOf(StereoFlagRenderer.prototype), "remove", this).call(this);
      this.removeHover();
      this.removeSelection();
    }
  }, {
    key: "moveSelection",
    value: function moveSelection() {}
  }]);
  return StereoFlagRenderer;
}(BaseRenderer);

export { StereoFlagRenderer };
//# sourceMappingURL=StereoFlagRenderer.modern.js.map
