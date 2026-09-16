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
var _assertThisInitialized = require('@babel/runtime/helpers/assertThisInitialized');
var _get = require('@babel/runtime/helpers/get');
var _getPrototypeOf = require('@babel/runtime/helpers/getPrototypeOf');
var _inherits = require('@babel/runtime/helpers/inherits');
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var BaseRenderer = require('./BaseRenderer.js');
var coordinates = require('../../editor/shared/coordinates.js');
var editorSingleton = require('../../editor/editorSingleton.js');
var ketcherProvider = require('../../ketcherProvider.js');
var fragment = require('../../../domain/entities/fragment.js');
require('../../../domain/entities/atom.js');
require('../../../domain/entities/atomList.js');
require('../../../domain/entities/bond.js');
require('../../../domain/entities/fixedPrecision.js');
require('../../../domain/entities/functionalGroup.js');
require('../../../domain/entities/halfBond.js');
require('../../../domain/entities/loop.js');
require('../../../domain/entities/rgroup.js');
require('../../../domain/entities/rgroupAttachmentPoint.js');
require('../../../domain/entities/rxnArrow.js');
require('../../../domain/entities/rxnPlus.js');
require('../../../domain/entities/sgroup.js');
require('../../../domain/entities/sgroupForest.js');
require('../../../domain/entities/simpleObject.js');
require('../../../domain/entities/struct.js');
require('../../../domain/entities/text.js');
require('../../../domain/entities/pile.js');
var vec2 = require('../../../domain/entities/vec2.js');
require('../../../domain/entities/box2Abs.js');
require('../../../domain/entities/pool.js');
require('../../../domain/entities/image.js');
require('../../../domain/entities/multitailArrow.js');
require('../../../domain/entities/highlight.js');
require('../../../domain/entities/sGroupAttachmentPoint.js');
require('../../../domain/entities/monomerMicromolecule.js');
require('../../../domain/entities/Peptide.js');
require('../../../domain/entities/BaseMonomer.js');
require('../../../domain/entities/Chem.js');
require('../../../domain/entities/Sugar.js');
require('../../../domain/entities/RNABase.js');
require('../../../domain/entities/Phosphate.js');
require('../../../domain/entities/Axis.js');
require('../../../domain/entities/Nucleoside.js');
require('../../../domain/entities/Nucleotide.js');
require('../../../domain/entities/monomer-chains/types.js');
require('../../../domain/entities/monomer-chains/Chain.js');
require('../../../domain/entities/monomer-chains/ChainsCollection.js');
require('../../../domain/entities/MonomerSequenceNode.js');
require('../../../domain/entities/EmptySequenceNode.js');
require('../../../domain/entities/LinkerSequenceNode.js');
require('../../../domain/entities/UnresolvedMonomer.js');
require('../../../domain/entities/UnsplitNucleotide.js');
require('../../../domain/entities/PolymerBond.js');
require('../../../domain/entities/AmbiguousMonomer.js');
require('../../../domain/entities/MonomerToAtomBond.js');
require('../../../domain/entities/HydrogenBond.js');
require('../../../domain/entities/SGroupDrawingEntity.js');
require('../../../domain/entities/BackBoneSequenceNode.js');
require('@babel/runtime/helpers/slicedToArray');
require('../../../domain/entities/Command.js');
require('../../../utilities/runAsyncAction.js');
require('../../../utilities/KetcherLogger.js');
require('../../../utilities/SettingsManager.js');
require('../../../utilities/keynorm.js');
require('react-device-detect');
require('../../../utilities/clipboardUtils.js');
require('../../../domain/entities/CoreAtom.js');
require('../../../domain/entities/CoreStereoFlag.js');
require('@babel/runtime/helpers/typeof');
require('../../../domain/constants/elements.js');
require('../../../domain/constants/element.types.js');
require('../../../domain/constants/generics.js');
require('../../../domain/constants/chains.js');
require('../../../domain/constants/monomers.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _possibleConstructorReturn__default = /*#__PURE__*/_interopDefaultLegacy(_possibleConstructorReturn);
var _assertThisInitialized__default = /*#__PURE__*/_interopDefaultLegacy(_assertThisInitialized);
var _get__default = /*#__PURE__*/_interopDefaultLegacy(_get);
var _getPrototypeOf__default = /*#__PURE__*/_interopDefaultLegacy(_getPrototypeOf);
var _inherits__default = /*#__PURE__*/_interopDefaultLegacy(_inherits);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);

function _callSuper(t, o, e) { return o = _getPrototypeOf__default["default"](o), _possibleConstructorReturn__default["default"](t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf__default["default"](t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var StereoFlagRenderer = function (_BaseRenderer) {
  _inherits__default["default"](StereoFlagRenderer, _BaseRenderer);
  function StereoFlagRenderer(stereoFlag) {
    var _this;
    _classCallCheck__default["default"](this, StereoFlagRenderer);
    _this = _callSuper(this, StereoFlagRenderer, [stereoFlag]);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "stereoFlag", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "selectionElement", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "textElement", void 0);
    _this.stereoFlag = stereoFlag;
    _this.stereoFlag.setRenderer(_assertThisInitialized__default["default"](_this));
    return _this;
  }
  _createClass__default["default"](StereoFlagRenderer, [{
    key: "scaledPosition",
    get: function get() {
      return coordinates.Coordinates.modelToCanvas(this.stereoFlag.position);
    }
  }, {
    key: "flagLabel",
    get: function get() {
      switch (this.stereoFlag.flagType) {
        case fragment.StereoFlag.Abs:
          return 'ABS';
        case fragment.StereoFlag.And:
          return 'AND Enantiomer';
        case fragment.StereoFlag.Or:
          return 'OR Enantiomer';
        case fragment.StereoFlag.Mixed:
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
      var editor = editorSingleton.provideEditorInstance();
      var settings = (_ketcherProvider$getK = ketcherProvider.ketcherProvider.getKetcher(editor.ketcherId).settingsService) === null || _ketcherProvider$getK === void 0 ? void 0 : _ketcherProvider$getK.getSettings();
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
      var position = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : new vec2.Vec2(0, 0);
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
        editorSingleton.provideEditorInstance().events.mouseOverDrawingEntity.dispatch(event);
        _this2.appendHover();
      }).on('mouseleave', function (event) {
        editorSingleton.provideEditorInstance().events.mouseLeaveDrawingEntity.dispatch(event);
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
      _get__default["default"](_getPrototypeOf__default["default"](StereoFlagRenderer.prototype), "remove", this).call(this);
      this.removeHover();
      this.removeSelection();
    }
  }, {
    key: "moveSelection",
    value: function moveSelection() {}
  }]);
  return StereoFlagRenderer;
}(BaseRenderer.BaseRenderer);

exports.StereoFlagRenderer = StereoFlagRenderer;
//# sourceMappingURL=StereoFlagRenderer.js.map
