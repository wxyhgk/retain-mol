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
import _classCallCheck from '@babel/runtime/helpers/classCallCheck';
import _createClass from '@babel/runtime/helpers/createClass';
import _possibleConstructorReturn from '@babel/runtime/helpers/possibleConstructorReturn';
import _getPrototypeOf from '@babel/runtime/helpers/getPrototypeOf';
import _assertThisInitialized from '@babel/runtime/helpers/assertThisInitialized';
import _inherits from '@babel/runtime/helpers/inherits';
import _defineProperty from '@babel/runtime/helpers/defineProperty';
import { provideEditorInstance } from '../../editor/editorSingleton.modern.js';
import { Coordinates } from '../../editor/shared/coordinates.modern.js';
import { SELECTION_COLOR } from './constants.modern.js';
import '../../../utilities/runAsyncAction.modern.js';
import '../../../utilities/KetcherLogger.modern.js';
import '../../../utilities/SettingsManager.modern.js';
import '../../../utilities/keynorm.modern.js';
import 'react-device-detect';
import '../../../utilities/clipboardUtils.modern.js';
import { assert } from '../../../utilities/assert.modern.js';
import { AttachmentPoint } from '../../../domain/AttachmentPoint.modern.js';
import { Vec2 } from '../../../domain/entities/vec2.modern.js';
import { sectorsList, anglesToSector, checkFor0and360, attachmentPointNumberToAngle } from '../../../domain/helpers/attachmentPointCalculations.modern.js';
import { BaseRenderer } from './BaseRenderer.modern.js';
import { monomerEntityFactory } from '../../../domain/helpers/monomerEntityFactory.modern.js';
import { AmbiguousMonomer } from '../../../domain/entities/AmbiguousMonomer.modern.js';
import { setMonomerSize, getMonomerSize } from './monomerSizeState.modern.js';
import { createRectHighlightPath } from './monomerHighlightShapes.modern.js';

function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var labelPositions = {};
var MONOMER_CSS_CLASS = 'monomer';
var BaseMonomerRenderer = function (_BaseRenderer) {
  _inherits(BaseMonomerRenderer, _BaseRenderer);
  function BaseMonomerRenderer(monomer, monomerHoveredElementId, monomerSymbolElementId, monomerAutochainPreviewElementId, scale) {
    var _this$monomerSymbolEl, _this$monomerSymbolEl2, _this$monomerSymbolEl3, _this$monomerSymbolEl4;
    var _this;
    _classCallCheck(this, BaseMonomerRenderer);
    _this = _callSuper(this, BaseMonomerRenderer, [monomer]);
    _defineProperty(_assertThisInitialized(_this), "monomer", void 0);
    _defineProperty(_assertThisInitialized(_this), "monomerHoveredElementId", void 0);
    _defineProperty(_assertThisInitialized(_this), "monomerSymbolElementId", void 0);
    _defineProperty(_assertThisInitialized(_this), "monomerAutochainPreviewElementId", void 0);
    _defineProperty(_assertThisInitialized(_this), "scale", void 0);
    _defineProperty(_assertThisInitialized(_this), "editor", void 0);
    _defineProperty(_assertThisInitialized(_this), "selectionCircle", void 0);
    _defineProperty(_assertThisInitialized(_this), "selectionBorder", void 0);
    _defineProperty(_assertThisInitialized(_this), "freeSectorsList", sectorsList);
    _defineProperty(_assertThisInitialized(_this), "attachmentPoints", []);
    _defineProperty(_assertThisInitialized(_this), "hoveredAttachmentPoint", null);
    _defineProperty(_assertThisInitialized(_this), "_dragTargetAttachmentPoint", null);
    _defineProperty(_assertThisInitialized(_this), "_dragCircleHoverAttachmentPoint", null);
    _defineProperty(_assertThisInitialized(_this), "monomerSymbolElement", void 0);
    _defineProperty(_assertThisInitialized(_this), "monomerSize", void 0);
    _defineProperty(_assertThisInitialized(_this), "enumerationElement", void 0);
    _defineProperty(_assertThisInitialized(_this), "enumeration", null);
    _defineProperty(_assertThisInitialized(_this), "terminalIndicatorElement", void 0);
    _defineProperty(_assertThisInitialized(_this), "CHAIN_START_TERMINAL_INDICATOR_TEXT", '');
    _defineProperty(_assertThisInitialized(_this), "CHAIN_END_TERMINAL_INDICATOR_TEXT", '');
    _this.monomer = monomer;
    _this.monomerHoveredElementId = monomerHoveredElementId;
    _this.monomerSymbolElementId = monomerSymbolElementId;
    _this.monomerAutochainPreviewElementId = monomerAutochainPreviewElementId;
    _this.scale = scale;
    _this.monomer.setRenderer(_assertThisInitialized(_this));
    _this.editor = provideEditorInstance();
    _this.monomerSymbolElement = document.querySelector("".concat(monomerSymbolElementId, " .monomer-body"));
    _this.monomerSize = {
      width: +((_this$monomerSymbolEl = (_this$monomerSymbolEl2 = _this.monomerSymbolElement) === null || _this$monomerSymbolEl2 === void 0 ? void 0 : _this$monomerSymbolEl2.getAttribute('data-actual-width')) !== null && _this$monomerSymbolEl !== void 0 ? _this$monomerSymbolEl : 0),
      height: +((_this$monomerSymbolEl3 = (_this$monomerSymbolEl4 = _this.monomerSymbolElement) === null || _this$monomerSymbolEl4 === void 0 ? void 0 : _this$monomerSymbolEl4.getAttribute('data-actual-height')) !== null && _this$monomerSymbolEl3 !== void 0 ? _this$monomerSymbolEl3 : 0)
    };
    setMonomerSize(_this.monomerSize);
    return _this;
  }
  _createClass(BaseMonomerRenderer, [{
    key: "editorEvents",
    get: function get() {
      return provideEditorInstance().events;
    }
  }, {
    key: "isSnakeBondForAttachmentPoint",
    value: function isSnakeBondForAttachmentPoint(attachmentPointName) {
      var _this$monomer$attachm;
      var renderer = (_this$monomer$attachm = this.monomer.attachmentPointsToBonds[attachmentPointName]) === null || _this$monomer$attachm === void 0 ? void 0 : _this$monomer$attachm.renderer;
      if (!renderer) return false;
      if ('isSnake' in renderer) {
        return renderer.isSnake && !renderer.polymerBond.isHorizontal;
      }
      return false;
    }
  }, {
    key: "center",
    get: function get() {
      return new Vec2(this.scaledMonomerPosition.x + this.monomerSize.width / 2, this.scaledMonomerPosition.y + this.monomerSize.height / 2);
    }
  }, {
    key: "getHighlightPath",
    value: function getHighlightPath() {
      var offset = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      return createRectHighlightPath(this.center, this.monomerSize.width, this.monomerSize.height, offset);
    }
  }, {
    key: "textColor",
    get: function get() {
      var _colorsMap$this$monom;
      var WHITE = 'white';
      var colorsMap = {
        D: WHITE,
        F: WHITE,
        K: WHITE,
        Q: WHITE,
        R: WHITE,
        W: WHITE,
        Y: WHITE
      };
      return (_colorsMap$this$monom = colorsMap[this.monomer.monomerItem.props.MonomerNaturalAnalogCode]) !== null && _colorsMap$this$monom !== void 0 ? _colorsMap$this$monom : 'black';
    }
  }, {
    key: "getMonomerColor",
    value: function getMonomerColor(theme) {
      var _theme$monomer$color$, _theme$monomer$color$2;
      return (_theme$monomer$color$ = (_theme$monomer$color$2 = theme.monomer.color[this.monomer.monomerItem.props.MonomerNaturalAnalogCode]) === null || _theme$monomer$color$2 === void 0 ? void 0 : _theme$monomer$color$2.regular) !== null && _theme$monomer$color$ !== void 0 ? _theme$monomer$color$ : theme.monomer.color.X.regular;
    }
  }, {
    key: "getPeptideColor",
    value: function getPeptideColor(theme) {
      var _theme$peptide$color$;
      var naturalAnalogCode = this.monomer.monomerItem.props.MonomerNaturalAnalogCode;
      var peptideColor = (_theme$peptide$color$ = theme.peptide.color[naturalAnalogCode]) === null || _theme$peptide$color$ === void 0 ? void 0 : _theme$peptide$color$.regular;
      return peptideColor !== null && peptideColor !== void 0 ? peptideColor : this.getMonomerColor(theme);
    }
  }, {
    key: "redrawAttachmentPoints",
    value: function redrawAttachmentPoints() {
      this.hoveredAttachmentPoint = null;
      if (!this.rootElement) return;
      if (this.monomer.attachmentPointsVisible) {
        this.removeAttachmentPoints();
        this.drawAttachmentPoints();
      } else {
        this.removeAttachmentPoints();
      }
    }
  }, {
    key: "updateAttachmentPoints",
    value: function updateAttachmentPoints() {
      this.hoveredAttachmentPoint = null;
      if (!this.rootElement) return;
      if (this.attachmentPoints.length > 0) {
        this.attachmentPoints.forEach(function (point) {
          point.updateAttachmentPointStyleForHover();
        });
      } else {
        this.drawAttachmentPoints();
      }
    }
  }, {
    key: "redrawAttachmentPointsCoordinates",
    value: function redrawAttachmentPointsCoordinates() {
      var chosenAttachmentPointName = this.monomer.chosenFirstAttachmentPointForBond;
      var chosenAttachmentPoint = this.attachmentPoints.find(function (item) {
        return item.getAttachmentPointName() === chosenAttachmentPointName;
      });
      var angle = chosenAttachmentPoint === null || chosenAttachmentPoint === void 0 ? void 0 : chosenAttachmentPoint.getAngle();
      var allAngles = this.attachmentPoints.map(function (item) {
        return item.getAngle();
      });
      var isSectorOccupied = allAngles.some(function (item) {
        if (angle !== item && typeof angle === 'number') {
          return Math.abs(angle - item) < 20 || Math.abs(angle - item) > 340;
        }
        return false;
      });
      if (isSectorOccupied) {
        this.redrawAttachmentPoints();
        return;
      }
      var attachmentPoint = this.attachmentPoints.find(function (item) {
        return item.getAttachmentPointName() === chosenAttachmentPointName;
      });
      assert(attachmentPoint);
      attachmentPoint.updateCoords();
    }
  }, {
    key: "drawAttachmentPoints",
    value: function drawAttachmentPoints(appendFn) {
      var _this2 = this;
      if (this.attachmentPoints.length) {
        return;
      }
      var appendFnToUse = appendFn !== null && appendFn !== void 0 ? appendFn : this.appendAttachmentPoint.bind(this);
      var hasDragTarget = this._dragTargetAttachmentPoint !== null;
      if (!hasDragTarget) {
        this.monomer.usedAttachmentPointsNamesList.forEach(function (item) {
          var attachmentPoint = appendFnToUse(item);
          var angle = attachmentPoint.getAngle();
          _this2.attachmentPoints.push(attachmentPoint);
          var newList = _this2.freeSectorsList.filter(function (item) {
            return anglesToSector[item].min > angle || anglesToSector[item].max <= angle;
          });
          _this2.freeSectorsList = checkFor0and360(newList);
        });
      }
      var unrenderedAtPoints = [];
      this.monomer.unUsedAttachmentPointsNamesList.forEach(function (item) {
        var properAngleForFreeAttachmentPoint = attachmentPointNumberToAngle[item];
        if (_this2.freeSectorsList.includes(properAngleForFreeAttachmentPoint)) {
          var attachmentPoint = appendFnToUse(item, properAngleForFreeAttachmentPoint);
          _this2.attachmentPoints.push(attachmentPoint);
          var newList = _this2.freeSectorsList.filter(function (item) {
            return item !== properAngleForFreeAttachmentPoint;
          });
          _this2.freeSectorsList = checkFor0and360(newList);
        } else {
          unrenderedAtPoints.push(item);
        }
      });
      unrenderedAtPoints.forEach(function (item) {
        var customAngle = _this2.freeSectorsList.shift();
        var attachmentPoint = appendFnToUse(item, customAngle);
        _this2.attachmentPoints.push(attachmentPoint);
      });
    }
  }, {
    key: "prepareAttachmentPointsParams",
    value: function prepareAttachmentPointsParams(attachmentPointName, customAngle) {
      if (!this.rootElement) {
        throw new Error('Cannot prepare attachment point params before the root element is appended.');
      }
      var rotation;
      if (!this.monomer.isAttachmentPointUsed(attachmentPointName)) {
        rotation = attachmentPointNumberToAngle[attachmentPointName];
      }
      return {
        rootElement: this.rootElement,
        monomer: this.monomer,
        bodyWidth: this.monomerSize.width,
        bodyHeight: this.monomerSize.height,
        canvas: this.canvasWrapper,
        attachmentPointName: attachmentPointName,
        isUsed: this.monomer.isAttachmentPointUsed(attachmentPointName),
        isPotentiallyUsed: this.monomer.isAttachmentPointPotentiallyUsed(attachmentPointName) || this.hoveredAttachmentPoint === attachmentPointName,
        angle: customAngle !== null && customAngle !== void 0 ? customAngle : rotation,
        applyZoomForPositionCalculation: true,
        isSnake: this.isSnakeBondForAttachmentPoint(attachmentPointName),
        isDragTarget: this._dragTargetAttachmentPoint === attachmentPointName,
        isDragCircleHover: this._dragCircleHoverAttachmentPoint === attachmentPointName
      };
    }
  }, {
    key: "appendAttachmentPoint",
    value: function appendAttachmentPoint(attachmentPointName, customAngle) {
      var attachmentPointParams = this.prepareAttachmentPointsParams(attachmentPointName, customAngle);
      return new AttachmentPoint(attachmentPointParams);
    }
  }, {
    key: "removeAttachmentPoints",
    value: function removeAttachmentPoints() {
      this.attachmentPoints.forEach(function (item) {
        item.removeAttachmentPoint();
      });
      this.attachmentPoints = [];
      this.freeSectorsList = sectorsList;
    }
  }, {
    key: "hoverAttachmentPoint",
    value: function hoverAttachmentPoint(attachmentPointName) {
      this.hoveredAttachmentPoint = attachmentPointName;
    }
  }, {
    key: "setDragTargetAttachmentPoint",
    value: function setDragTargetAttachmentPoint(attachmentPointName) {
      this._dragTargetAttachmentPoint = attachmentPointName;
    }
  }, {
    key: "setDragCircleHoverAttachmentPoint",
    value: function setDragCircleHoverAttachmentPoint(attachmentPointName) {
      this._dragCircleHoverAttachmentPoint = attachmentPointName;
    }
  }, {
    key: "raiseAttachmentPoints",
    value: function raiseAttachmentPoints() {
      this.attachmentPoints.forEach(function (attachmentPoint) {
        attachmentPoint.raise();
      });
    }
  }, {
    key: "appendRootElement",
    value: function appendRootElement(canvas) {
      var _this$scale,
        _this3 = this;
      var monomerTypeAttribute = '';
      if (this.monomer instanceof AmbiguousMonomer) {
        monomerTypeAttribute = AmbiguousMonomer.getMonomerClass(this.monomer.monomers);
      } else if (this.monomer.monomerItem.props.isMicromoleculeFragment) {
        monomerTypeAttribute = 'CHEM';
      } else if (this.monomer.monomerItem.props.MonomerClass) {
        monomerTypeAttribute = this.monomer.monomerItem.props.MonomerClass;
      }
      var rootElement = canvas.append('g').data([this]).attr('class', MONOMER_CSS_CLASS).attr('transition', 'transform 0.2s').attr('data-testid', 'monomer').attr('data-monomertype', monomerTypeAttribute).attr('data-monomeralias', this.monomer.label).attr('data-monomerid', this.monomer.id).attr('data-naturalAnalogue', this.monomer.monomerItem.props.MonomerNaturalAnalogCode).attr('data-number-of-attachment-points', this.monomer.listOfAttachmentPoints.length).attr('data-hydrogen-connection-number', this.monomer.hydrogenBonds.length).attr('transform', "translate(".concat(this.scaledMonomerPosition.x, ", ").concat(this.scaledMonomerPosition.y, ") scale(").concat((_this$scale = this.scale) !== null && _this$scale !== void 0 ? _this$scale : 1, ")"));
      this.monomer.listOfAttachmentPoints.forEach(function (attachmentPoint) {
        rootElement.attr("data-".concat(attachmentPoint), !!_this3.monomer.attachmentPointsToBonds[attachmentPoint]);
      });
      return rootElement;
    }
  }, {
    key: "appendLabel",
    value: function appendLabel(rootElement) {
      var _labelPositions$monom, _labelPositions$monom2, _labelPositions$monom3, _labelPositions$monom4;
      var fontSize = 6;
      var textElement = rootElement.append('text').text(this.monomer.label).attr('fill', this.textColor).attr('font-size', "".concat(fontSize, "px")).attr('line-height', "".concat(fontSize, "px")).attr('font-weight', '700').style('cursor', 'pointer').style('user-select', 'none').attr('pointer-events', 'none');
      var _monomerEntityFactory = monomerEntityFactory(this.monomer instanceof AmbiguousMonomer ? this.monomer.variantMonomerItem : this.monomer.monomerItem),
        _monomerEntityFactory2 = _slicedToArray(_monomerEntityFactory, 2),
        monomerClass = _monomerEntityFactory2[1];
      var monomerUniqueKey = this.monomer.label + monomerClass;
      if (!labelPositions[monomerUniqueKey]) {
        var textBBox = textElement.node().getBBox();
        labelPositions[monomerUniqueKey] = {
          x: this.width / 2 - textBBox.width / 2,
          y: this.height / 2
        };
      }
      textElement.attr('x', (_labelPositions$monom = (_labelPositions$monom2 = labelPositions[monomerUniqueKey]) === null || _labelPositions$monom2 === void 0 ? void 0 : _labelPositions$monom2.x) !== null && _labelPositions$monom !== void 0 ? _labelPositions$monom : 0).attr('y', (_labelPositions$monom3 = (_labelPositions$monom4 = labelPositions[monomerUniqueKey]) === null || _labelPositions$monom4 === void 0 ? void 0 : _labelPositions$monom4.y) !== null && _labelPositions$monom3 !== void 0 ? _labelPositions$monom3 : 0);
      if (this.scale && this.scale !== 1) {
        labelPositions[monomerUniqueKey] = undefined;
      }
    }
  }, {
    key: "setLabelVisibility",
    value: function setLabelVisibility(isVisible) {
      var _this$rootElement;
      (_this$rootElement = this.rootElement) === null || _this$rootElement === void 0 || _this$rootElement.select('text').style('opacity', isVisible ? 1 : 0);
    }
  }, {
    key: "appendHover",
    value: function appendHover(hoverAreaElement) {
      var _this$editor$selected;
      var cursor = 'default';
      if (this.hoverElement) this.hoverElement.remove();
      if (((_this$editor$selected = this.editor.selectedTool) === null || _this$editor$selected === void 0 ? void 0 : _this$editor$selected.name) === 'select-tool') cursor = 'move';
      return hoverAreaElement.style('cursor', cursor).append('use').attr('href', this.monomerHoveredElementId).attr('pointer-events', 'none').attr('class', 'dynamic-element');
    }
  }, {
    key: "removeHover",
    value: function removeHover() {
      if (!this.hoverElement) return;
      this.hoverElement.remove();
    }
  }, {
    key: "scaledMonomerPosition",
    get: function get() {
      return BaseMonomerRenderer.getScaledMonomerPosition(this.monomer.position, this.monomerSize);
    }
  }, {
    key: "scaledPosition",
    get: function get() {
      return this.scaledMonomerPosition;
    }
  }, {
    key: "appendSelection",
    value: function appendSelection() {
      if (this.selectionCircle) {
        this.selectionCircle.attr('cx', this.center.x).attr('cy', this.center.y);
      } else {
        var _this$canvas;
        this.selectionCircle = (_this$canvas = this.canvas) === null || _this$canvas === void 0 ? void 0 : _this$canvas.insert('circle', ':first-child').attr('r', "".concat(BaseMonomerRenderer.selectionCircleRadius, "px")).attr('opacity', '0.7').attr('cx', this.center.x).attr('cy', this.center.y).attr('fill', SELECTION_COLOR).attr('class', 'dynamic-element');
      }
    }
  }, {
    key: "removeSelection",
    value: function removeSelection() {
      var _this$selectionCircle, _this$selectionBorder;
      (_this$selectionCircle = this.selectionCircle) === null || _this$selectionCircle === void 0 || _this$selectionCircle.remove();
      (_this$selectionBorder = this.selectionBorder) === null || _this$selectionBorder === void 0 || _this$selectionBorder.remove();
      this.selectionCircle = undefined;
      this.selectionBorder = undefined;
    }
  }, {
    key: "appendHoverAreaElement",
    value: function appendHoverAreaElement() {
      this.hoverAreaElement = this.rootElement;
    }
  }, {
    key: "appendEvents",
    value: function appendEvents() {
      var _this4 = this;
      if (!this.bodyElement) {
        return;
      }
      this.bodyElement.on('mouseover', function (event) {
        _this4.editorEvents.mouseOverDrawingEntity.dispatch(event);
        _this4.editorEvents.mouseOverMonomer.dispatch(event);
      }).on('mousemove', function (event) {
        _this4.editorEvents.mouseOnMoveMonomer.dispatch(event);
      }).on('mouseleave', function (event) {
        var _event$relatedTarget;
        if (((_event$relatedTarget = event.relatedTarget) === null || _event$relatedTarget === void 0 ? void 0 : _event$relatedTarget.__data__) instanceof AttachmentPoint) {
          return;
        }
        _this4.editorEvents.mouseLeaveDrawingEntity.dispatch(event);
        _this4.editorEvents.mouseLeaveMonomer.dispatch(event);
      }).on('mouseup', function (event) {
        _this4.editorEvents.mouseUpMonomer.dispatch(event);
      });
    }
  }, {
    key: "setEnumeration",
    value: function setEnumeration(enumeration) {
      this.enumeration = enumeration;
    }
  }, {
    key: "appendEnumeration",
    value: function appendEnumeration() {
      assert(this.rootElement);
      assert(this.enumerationElementPosition);
      this.enumerationElement = this.rootElement.append('text').attr('direction', 'rtl').attr('fill', '#7C7C7F').attr('font-size', '6px').attr('line-height', '7px').attr('font-weight', '500').attr('text-align', 'right').attr('style', 'user-select: none;').attr('pointer-events', 'none').attr('x', this.enumerationElementPosition.x).attr('y', this.enumerationElementPosition.y).text(this.enumeration);
      this.raiseAttachmentPoints();
    }
  }, {
    key: "redrawEnumeration",
    value: function redrawEnumeration(needToDrawTerminalIndicator) {
      this.redrawChainTerminalIndicator(needToDrawTerminalIndicator);
      if (!this.enumerationElement) return;
      this.enumerationElement.text(this.enumeration);
    }
  }, {
    key: "redrawChainTerminalIndicator",
    value: function redrawChainTerminalIndicator(needToDraw) {
      var _this$terminalIndicat;
      if (!this.rootElement || !this.CHAIN_START_TERMINAL_INDICATOR_TEXT || !this.beginningElementPosition) {
        return;
      }
      (_this$terminalIndicat = this.terminalIndicatorElement) === null || _this$terminalIndicat === void 0 || _this$terminalIndicat.remove();
      if (!needToDraw) {
        return;
      }
      this.terminalIndicatorElement = this.rootElement.append('text').attr('direction', 'rtl').attr('fill', '#0097A8').attr('font-size', '6px').attr('line-height', '7px').attr('font-weight', '700').attr('text-align', 'right').attr('style', 'user-select: none;').attr('pointer-events', 'none').attr('x', this.beginningElementPosition.x).attr('y', this.beginningElementPosition.y).text(this.monomer.monomerItem.isAntisense ? this.CHAIN_END_TERMINAL_INDICATOR_TEXT : this.CHAIN_START_TERMINAL_INDICATOR_TEXT);
      this.raiseAttachmentPoints();
    }
  }, {
    key: "drawModification",
    value: function drawModification() {
      var config = this.modificationConfig;
      var DARK_COLOR = '#333333';
      var LIGHT_COLOR = 'white';
      if (config && this.monomer.isModification) {
        var _this$rootElement2;
        var fillColor;
        if (config.requiresFill) {
          var isTextColorDark = this.textColor === DARK_COLOR;
          fillColor = isTextColorDark ? LIGHT_COLOR : DARK_COLOR;
        }
        var useElement = (_this$rootElement2 = this.rootElement) === null || _this$rootElement2 === void 0 ? void 0 : _this$rootElement2.append('use').attr('xlink:href', config.backgroundId).attr('pointer-events', 'none').attr('class', 'modification-background');
        if (fillColor) {
          useElement === null || useElement === void 0 || useElement.attr('fill', fillColor);
        }
      }
    }
  }, {
    key: "show",
    value: function show(theme) {
      var _this$rootElement3, _this$bodyElement;
      this.rootElement = (_this$rootElement3 = this.rootElement) !== null && _this$rootElement3 !== void 0 ? _this$rootElement3 : this.appendRootElement(this.scale ? this.canvasWrapper : this.canvas);
      this.bodyElement = this.appendBody(this.rootElement, theme);
      (_this$bodyElement = this.bodyElement) === null || _this$bodyElement === void 0 || _this$bodyElement.attr('data-testid', 'shape');
      this.appendEvents();
      this.drawModification();
      this.appendLabel(this.rootElement);
      this.appendHoverAreaElement();
      if (this.monomer.selected) {
        this.drawSelection();
      }
      this.redrawAttachmentPoints();
    }
  }, {
    key: "drawSelection",
    value: function drawSelection() {
      if (!this.rootElement) {
        return;
      }
      if (this.monomer.selected) {
        this.appendSelection();
        this.raiseElement();
      } else {
        this.removeSelection();
      }
    }
  }, {
    key: "raiseElement",
    value: function raiseElement() {
      var _this$selectionCircle2, _this$rootElement4;
      (_this$selectionCircle2 = this.selectionCircle) === null || _this$selectionCircle2 === void 0 || _this$selectionCircle2.raise();
      (_this$rootElement4 = this.rootElement) === null || _this$rootElement4 === void 0 || _this$rootElement4.raise();
    }
  }, {
    key: "moveSelection",
    value: function moveSelection() {
      assert(this.rootElement);
      this.appendSelection();
      this.move();
    }
  }, {
    key: "move",
    value: function move() {
      var _this$rootElement5, _this$scale2;
      (_this$rootElement5 = this.rootElement) === null || _this$rootElement5 === void 0 || _this$rootElement5.attr('transform', "translate(".concat(this.scaledMonomerPosition.x, ", ").concat(this.scaledMonomerPosition.y, ") scale(").concat((_this$scale2 = this.scale) !== null && _this$scale2 !== void 0 ? _this$scale2 : 1, ")"));
    }
  }, {
    key: "remove",
    value: function remove() {
      var _this$rootElement6;
      (_this$rootElement6 = this.rootElement) === null || _this$rootElement6 === void 0 || _this$rootElement6.remove();
      this.rootElement = undefined;
      this.removeSelection();
      if (this.monomer.hovered) {
        this.editorEvents.mouseLeaveMonomer.dispatch();
      }
    }
  }], [{
    key: "isSelectable",
    value: function isSelectable() {
      return true;
    }
  }, {
    key: "selectionCircleRadius",
    get: function get() {
      return 21;
    }
  }, {
    key: "monomerSize",
    get: function get() {
      return getMonomerSize();
    }
  }, {
    key: "getScaledMonomerPosition",
    value: function getScaledMonomerPosition(positionInAngstoms) {
      var monomerSize = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {
        width: 0,
        height: 0
      };
      var monomerPositionInPixels = Coordinates.modelToCanvas(positionInAngstoms);
      return new Vec2(monomerPositionInPixels.x - monomerSize.width / 2, monomerPositionInPixels.y - monomerSize.height / 2);
    }
  }]);
  return BaseMonomerRenderer;
}(BaseRenderer);

export { BaseMonomerRenderer, MONOMER_CSS_CLASS };
//# sourceMappingURL=BaseMonomerRenderer.modern.js.map
