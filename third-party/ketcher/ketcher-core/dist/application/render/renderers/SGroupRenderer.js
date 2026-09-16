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

var _toConsumableArray = require('@babel/runtime/helpers/toConsumableArray');
var _slicedToArray = require('@babel/runtime/helpers/slicedToArray');
var _classCallCheck = require('@babel/runtime/helpers/classCallCheck');
var _createClass = require('@babel/runtime/helpers/createClass');
var _possibleConstructorReturn = require('@babel/runtime/helpers/possibleConstructorReturn');
var _assertThisInitialized = require('@babel/runtime/helpers/assertThisInitialized');
var _get = require('@babel/runtime/helpers/get');
var _getPrototypeOf = require('@babel/runtime/helpers/getPrototypeOf');
var _inherits = require('@babel/runtime/helpers/inherits');
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var BaseRenderer = require('./BaseRenderer.js');
var constants$1 = require('./constants.js');
var scale = require('../../../domain/helpers/scale.js');
require('../../../domain/helpers/functionalGroupsProvider.js');
require('../../../domain/helpers/saltsAndSolventsProvider.js');
require('../../../domain/constants/generics.js');
require('../../../domain/helpers/attachmentPointCalculations.js');
var box2Abs = require('../../../domain/entities/box2Abs.js');
require('../../../domain/entities/atom.js');
require('../../../domain/entities/atomList.js');
require('../../../domain/entities/bond.js');
require('../../../domain/entities/fixedPrecision.js');
require('../../../domain/entities/fragment.js');
require('../../../domain/entities/functionalGroup.js');
require('../../../domain/entities/halfBond.js');
require('../../../domain/entities/loop.js');
require('../../../domain/entities/rgroup.js');
require('../../../domain/entities/rgroupAttachmentPoint.js');
require('../../../domain/entities/rxnArrow.js');
require('../../../domain/entities/rxnPlus.js');
var sgroup = require('../../../domain/entities/sgroup.js');
require('../../../domain/entities/sgroupForest.js');
require('../../../domain/entities/simpleObject.js');
require('../../../domain/entities/struct.js');
require('../../../domain/entities/text.js');
require('../../../domain/entities/pile.js');
var vec2 = require('../../../domain/entities/vec2.js');
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
require('../../../domain/constants/chains.js');
require('../../../domain/constants/monomers.js');
var constants = require('../../editor/shared/constants.js');
var resgroup = require('../restruct/resgroup.js');
var editorSingleton = require('../../editor/editorSingleton.js');
var paperjs = require('paper');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _toConsumableArray__default = /*#__PURE__*/_interopDefaultLegacy(_toConsumableArray);
var _slicedToArray__default = /*#__PURE__*/_interopDefaultLegacy(_slicedToArray);
var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _possibleConstructorReturn__default = /*#__PURE__*/_interopDefaultLegacy(_possibleConstructorReturn);
var _assertThisInitialized__default = /*#__PURE__*/_interopDefaultLegacy(_assertThisInitialized);
var _get__default = /*#__PURE__*/_interopDefaultLegacy(_get);
var _getPrototypeOf__default = /*#__PURE__*/_interopDefaultLegacy(_getPrototypeOf);
var _inherits__default = /*#__PURE__*/_interopDefaultLegacy(_inherits);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);
var paperjs__default = /*#__PURE__*/_interopDefaultLegacy(paperjs);

function _callSuper(t, o, e) { return o = _getPrototypeOf__default["default"](o), _possibleConstructorReturn__default["default"](t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf__default["default"](t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var BORDER_EXT = new vec2.Vec2(0.05 * 3, 0.05 * 3);
var DEFAULT_PADDING_VECTOR = new vec2.Vec2(0.2, 0.4);
var COP_PADDING_VECTOR = new vec2.Vec2(1.2, 1.2);
var BRACKET_STROKE = '#a9a9a9';
var DATA_SGROUP_BACKGROUND = '#F5F5F5';
var FONT_FAMILY = 'Arial';
var FONT_SIZE_SCALE_MULTIPLIER = 1.9;
var FONT_SIZE_SCALE_BASE = 6;
var LINE_WIDTH_SCALE_BASE = 20;
var ATTACHED_LABEL_VERTICAL_SHIFT_FACTOR = 0.8;
var INDEX_LABEL_VERTICAL_SHIFT = 4;
var HOVER_RECT_PADDING = 4;
var HOVER_RECT_RADIUS = 4;
var HOVER_STROKE = '#0097A8';
var HOVER_STROKE_WIDTH = 1.2;
var SGroupRenderer = function (_BaseRenderer) {
  _inherits__default["default"](SGroupRenderer, _BaseRenderer);
  function SGroupRenderer(sgroupDrawingEntity) {
    var _this;
    _classCallCheck__default["default"](this, SGroupRenderer);
    _this = _callSuper(this, SGroupRenderer, [sgroupDrawingEntity]);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "sgroupDrawingEntity", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "labelElements", []);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "atomRenderers", new Map());
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "bondRenderers", new Map());
    _this.sgroupDrawingEntity = sgroupDrawingEntity;
    _this.sgroupDrawingEntity.setRenderer(_assertThisInitialized__default["default"](_this));
    return _this;
  }
  _createClass__default["default"](SGroupRenderer, [{
    key: "struct",
    get: function get() {
      return this.sgroupDrawingEntity.monomer.monomerItem.struct;
    }
  }, {
    key: "sgroup",
    get: function get() {
      return this.sgroupDrawingEntity.sgroup;
    }
  }, {
    key: "addLabelElement",
    value: function addLabelElement(element) {
      this.labelElements.push(element);
      return element;
    }
  }, {
    key: "show",
    value: function show() {
      if (this.sgroup.data.fieldName === 'MRV_IMPLICIT_H') {
        return;
      }
      this.rootElement = this.canvas.insert('g', '.monomer').data([this]).attr('data-testid', 's-group').attr('data-sgroup-type', this.sgroup.type).attr('data-sgroup-expanded', String(this.sgroup.isExpanded())).attr('data-sgroup-id', this.sgroupDrawingEntity.sgroupIdInMicroMode);
      if (this.sgroup.type === sgroup.SGroup.TYPES.DAT) {
        this.drawDataSGroup();
      } else {
        this.drawBracketSGroup();
      }
      this.appendHoverAreaElement();
    }
  }, {
    key: "drawBracketSGroup",
    value: function drawBracketSGroup() {
      var bracketBox = this.calculateBracketBox();
      if (!bracketBox || this.sgroup.isSuperatomWithoutLabel) {
        return;
      }
      this.sgroup.bracketBox = bracketBox;
      this.sgroup.bracketDirection = new vec2.Vec2(1, 0);
      this.sgroup.areas = [bracketBox];
      if (this.sgroup.isContracted()) {
        this.drawContractedSGroupLabel();
        return;
      }
      var options = {};
      switch (this.sgroup.type) {
        case sgroup.SGroup.TYPES.MUL:
          options.lowerIndexText = String(this.sgroup.data.mul);
          break;
        case sgroup.SGroup.TYPES.SRU:
          {
            var connectivity = this.sgroup.data.connectivity === 'ht' ? '' : this.sgroup.data.connectivity || 'eu';
            options.lowerIndexText = this.sgroup.data.subscript || 'n';
            options.upperIndexText = connectivity;
            break;
          }
        case sgroup.SGroup.TYPES.COP:
          options.upperIndexText = this.sgroup.data.connectivity || 'eu';
          if (this.sgroup.data.subtype) {
            options.lowerIndexText = this.sgroup.data.subtype;
          }
          break;
        case sgroup.SGroup.TYPES.SUP:
          options.lowerIndexText = this.getSuperatomLabel();
          options.indexAttribute = {
            'font-style': 'italic'
          };
          break;
      }
      this.drawBrackets(bracketBox, options);
    }
  }, {
    key: "getSuperatomLabel",
    value: function getSuperatomLabel() {
      return this.sgroup.data.name || resgroup.SUPERATOM_CLASS_TEXT[this.sgroup.data["class"]];
    }
  }, {
    key: "drawContractedSGroupLabel",
    value: function drawContractedSGroupLabel() {
      var label = this.getSuperatomLabel();
      if (!label) {
        return;
      }
      var _this$sgroup$getContr = this.sgroup.getContractedPosition(this.struct),
        position = _this$sgroup$getContr.position;
      this.appendText(scale.Scale.modelToCanvas(position, this.editorSettings), label, {
        'font-weight': 'bold'
      });
    }
  }, {
    key: "getSGroupAtomIds",
    value: function getSGroupAtomIds() {
      return new Set(sgroup.SGroup.getAtoms(this.struct, this.sgroup));
    }
  }, {
    key: "applyExpandedStateToStructure",
    value: function applyExpandedStateToStructure(atomRenderers, bondRenderers) {
      var _this2 = this;
      this.atomRenderers = atomRenderers;
      this.bondRenderers = bondRenderers;
      if (this.sgroup.isExpanded()) {
        return;
      }
      var sgroupAtomIds = this.getSGroupAtomIds();
      atomRenderers.forEach(function (atomRenderer) {
        if (atomRenderer.atom.monomer === _this2.sgroupDrawingEntity.monomer && sgroupAtomIds.has(atomRenderer.atom.atomIdInMicroMode)) {
          atomRenderer.setVisibility(false);
        }
      });
      bondRenderers.forEach(function (bondRenderer) {
        var _bondRenderer$bond = bondRenderer.bond,
          firstAtom = _bondRenderer$bond.firstAtom,
          secondAtom = _bondRenderer$bond.secondAtom;
        var isSameMonomer = firstAtom.monomer === _this2.sgroupDrawingEntity.monomer && secondAtom.monomer === _this2.sgroupDrawingEntity.monomer;
        var isBondInsideSGroup = sgroupAtomIds.has(firstAtom.atomIdInMicroMode) && sgroupAtomIds.has(secondAtom.atomIdInMicroMode);
        if (isSameMonomer && isBondInsideSGroup) {
          bondRenderer.setVisibility(false);
        }
      });
    }
  }, {
    key: "drawDataSGroup",
    value: function drawDataSGroup() {
      var _this3 = this;
      this.sgroup.bracketBox = this.calculateBracketBox();
      if (this.sgroup.pp === null) {
        this.sgroup.calculatePP(this.struct);
      }
      if (this.sgroup.data.attached) {
        sgroup.SGroup.getAtoms(this.struct, this.sgroup).forEach(function (atomId) {
          var atom = _this3.struct.atoms.get(atomId);
          if (!atom) {
            return;
          }
          var position = scale.Scale.modelToCanvas(atom.pp, _this3.editorSettings).add(new vec2.Vec2(_this3.editorSettings.microModeScale / LINE_WIDTH_SCALE_BASE, 0));
          _this3.appendValue(position, function (bbox) {
            return _this3.getAttachedDataSGroupLabelShift(position, bbox);
          });
        });
        return;
      }
      if (this.sgroup.pp) {
        var position = scale.Scale.modelToCanvas(this.sgroup.pp, this.editorSettings);
        this.appendValue(position, function (bbox) {
          return _this3.sgroup.data.context === constants.SgContexts.Bond ? _this3.getCenteredDataSGroupLabelShift(position, bbox) : _this3.getAbsoluteDataSGroupLabelShift(position, bbox);
        });
      }
    }
  }, {
    key: "calculateBracketBox",
    value: function calculateBracketBox() {
      var _this4 = this;
      var contentBoxes = [];
      sgroup.SGroup.getAtoms(this.struct, this.sgroup).forEach(function (atomId) {
        var atom = _this4.struct.atoms.get(atomId);
        if (!atom) {
          return;
        }
        contentBoxes.push(new box2Abs.Box2Abs(atom.pp, atom.pp).extend(BORDER_EXT, BORDER_EXT));
      });
      var bracketBox = contentBoxes.reduce(function (box, contentBox) {
        return box ? box2Abs.Box2Abs.union(box, contentBox) : contentBox;
      }, null);
      if (!bracketBox) {
        return null;
      }
      var paddingVector = sgroup.SGroup.isCOPGroup(this.sgroup) ? COP_PADDING_VECTOR : DEFAULT_PADDING_VECTOR;
      return bracketBox.extend(paddingVector, paddingVector);
    }
  }, {
    key: "drawBrackets",
    value: function drawBrackets(bracketBox, _ref) {
      var _this5 = this;
      var lowerIndexText = _ref.lowerIndexText,
        upperIndexText = _ref.upperIndexText,
        indexAttribute = _ref.indexAttribute;
      var brackets = this.getBracketParameters(bracketBox);
      var rightBracket = brackets.reduce(function (currentRightBracket, bracket) {
        return _this5.isMoreRightwardBracket(bracket, currentRightBracket) ? bracket : currentRightBracket;
      }, brackets[0]);
      brackets.forEach(function (bracket) {
        return _this5.appendBracket(bracket);
      });
      if (lowerIndexText) {
        this.appendIndex(lowerIndexText, rightBracket, true, indexAttribute);
      }
      if (upperIndexText) {
        this.appendIndex(upperIndexText, rightBracket, false, indexAttribute);
      }
    }
  }, {
    key: "isMoreRightwardBracket",
    value: function isMoreRightwardBracket(bracket, rightBracket) {
      return !rightBracket || rightBracket.angleDirection.x < bracket.angleDirection.x || rightBracket.angleDirection.x === bracket.angleDirection.x && rightBracket.angleDirection.y > bracket.angleDirection.y;
    }
  }, {
    key: "getBracketParameters",
    value: function getBracketParameters(bracketBox) {
      var angleDirection = this.sgroup.bracketDirection;
      var bracketDirection = angleDirection.rotateSC(1, 0);
      var bracketWidth = Math.min(0.25, bracketBox.sz().x * 0.3);
      var leftCenter = vec2.Vec2.lc2(angleDirection, bracketBox.p0.x, bracketDirection, 0.5 * (bracketBox.p0.y + bracketBox.p1.y));
      var rightCenter = vec2.Vec2.lc2(angleDirection, bracketBox.p1.x, bracketDirection, 0.5 * (bracketBox.p0.y + bracketBox.p1.y));
      var bracketHeight = bracketBox.sz().y;
      return [{
        center: leftCenter,
        direction: angleDirection.negated().rotateSC(1, 0),
        angleDirection: angleDirection.negated(),
        width: bracketWidth,
        height: bracketHeight
      }, {
        center: rightCenter,
        direction: bracketDirection,
        angleDirection: angleDirection,
        width: bracketWidth,
        height: bracketHeight
      }];
    }
  }, {
    key: "appendBracket",
    value: function appendBracket(_ref2) {
      var _this$rootElement;
      var center = _ref2.center,
        direction = _ref2.direction,
        angleDirection = _ref2.angleDirection,
        width = _ref2.width,
        height = _ref2.height;
      var scaledCenter = scale.Scale.modelToCanvas(center, this.editorSettings);
      var scaledDirection = scale.Scale.modelToCanvas(direction, this.editorSettings);
      var scaledAngleDirection = scale.Scale.modelToCanvas(angleDirection, this.editorSettings);
      var bracketPoint0 = scaledCenter.addScaled(scaledDirection, -0.5 * height);
      var bracketPoint1 = scaledCenter.addScaled(scaledDirection, 0.5 * height);
      var bracketArc0 = bracketPoint0.addScaled(scaledAngleDirection, -width);
      var bracketArc1 = bracketPoint1.addScaled(scaledAngleDirection, -width);
      (_this$rootElement = this.rootElement) === null || _this$rootElement === void 0 || _this$rootElement.append('path').attr('d', "M".concat(bracketArc0.x, ",").concat(bracketArc0.y, "L").concat(bracketPoint0.x, ",").concat(bracketPoint0.y, "L").concat(bracketPoint1.x, ",").concat(bracketPoint1.y, "L").concat(bracketArc1.x, ",").concat(bracketArc1.y)).attr('fill', 'none').attr('stroke', BRACKET_STROKE).attr('stroke-width', 1);
    }
  }, {
    key: "appendIndex",
    value: function appendIndex(text, bracket, isLowerText, indexAttribute) {
      var bracketEdge = bracket.center.addScaled(bracket.direction, (isLowerText ? 0.5 : -0.5) * bracket.height);
      var position = scale.Scale.modelToCanvas(bracketEdge.addScaled(bracket.angleDirection, 0.05), this.editorSettings).add(new vec2.Vec2(0, INDEX_LABEL_VERTICAL_SHIFT));
      this.appendText(position, text, indexAttribute);
    }
  }, {
    key: "getCenteredDataSGroupLabelShift",
    value: function getCenteredDataSGroupLabelShift(position, bbox) {
      return new vec2.Vec2(position.x - bbox.x - bbox.width / 2, position.y - bbox.y - bbox.height / 2);
    }
  }, {
    key: "getAbsoluteDataSGroupLabelShift",
    value: function getAbsoluteDataSGroupLabelShift(position, bbox) {
      return new vec2.Vec2(position.x - bbox.x, position.y - bbox.y - bbox.height);
    }
  }, {
    key: "getAttachedDataSGroupLabelShift",
    value: function getAttachedDataSGroupLabelShift(position, bbox) {
      return new vec2.Vec2(position.x - bbox.x, position.y - bbox.y - ATTACHED_LABEL_VERTICAL_SHIFT_FACTOR * bbox.height);
    }
  }, {
    key: "appendValue",
    value: function appendValue(scaledPosition, getLabelShift) {
      var _textElement$node, _valueGroup$node;
      var valueGroup = this.addLabelElement(this.canvas.append('g'));
      var textElement = this.appendText(scaledPosition, this.sgroup.data.fieldValue, undefined, valueGroup);
      var bbox = textElement === null || textElement === void 0 || (_textElement$node = textElement.node()) === null || _textElement$node === void 0 ? void 0 : _textElement$node.getBBox();
      if (!bbox) {
        return;
      }
      var valueBackgroundColor = this.sgroup.selected ? constants$1.SELECTION_COLOR : DATA_SGROUP_BACKGROUND;
      valueGroup.insert('rect', 'text').attr('x', bbox.x - 1).attr('y', bbox.y - 1).attr('width', bbox.width + 2).attr('height', bbox.height + 2).attr('rx', 3).attr('ry', 3).attr('fill', valueBackgroundColor).attr('stroke', valueBackgroundColor);
      var valueBBox = (_valueGroup$node = valueGroup.node()) === null || _valueGroup$node === void 0 ? void 0 : _valueGroup$node.getBBox();
      if (!valueBBox) {
        return;
      }
      var labelShift = getLabelShift(valueBBox);
      valueGroup.attr('transform', "translate(".concat(labelShift.x, ",").concat(labelShift.y, ")"));
    }
  }, {
    key: "appendText",
    value: function appendText(position, text, attributes, parent) {
      var textElement = (parent || this.canvas).append('text').attr('x', position.x).attr('y', position.y).attr('font-size', Math.ceil(FONT_SIZE_SCALE_MULTIPLIER * (this.editorSettings.macroModeScale / FONT_SIZE_SCALE_BASE))).attr('font-family', FONT_FAMILY).attr('data-testid', 's-group-label').attr('data-label-text', text).text(text);
      if (!parent) {
        this.addLabelElement(textElement);
      }
      if (attributes) {
        Object.entries(attributes).forEach(function (_ref3) {
          var _ref4 = _slicedToArray__default["default"](_ref3, 2),
            attribute = _ref4[0],
            value = _ref4[1];
          textElement === null || textElement === void 0 || textElement.attr(attribute, value);
        });
      }
      return textElement;
    }
  }, {
    key: "moveLabelsToFront",
    value: function moveLabelsToFront() {
      this.labelElements.forEach(function (labelElement) {
        labelElement.raise();
      });
    }
  }, {
    key: "remove",
    value: function remove() {
      _get__default["default"](_getPrototypeOf__default["default"](SGroupRenderer.prototype), "remove", this).call(this);
      this.labelElements.forEach(function (labelElement) {
        labelElement.remove();
      });
      this.labelElements = [];
    }
  }, {
    key: "setVisibility",
    value: function setVisibility(isVisible) {
      _get__default["default"](_getPrototypeOf__default["default"](SGroupRenderer.prototype), "setVisibility", this).call(this, isVisible);
      this.labelElements.forEach(function (labelElement) {
        labelElement.style('opacity', isVisible ? 1 : 0);
      });
    }
  }, {
    key: "drawSelection",
    value: function drawSelection() {
    }
  }, {
    key: "moveSelection",
    value: function moveSelection() {
    }
  }, {
    key: "getScaledBracketBox",
    value: function getScaledBracketBox() {
      var _this$sgroup$bracketB;
      return (_this$sgroup$bracketB = this.sgroup.bracketBox) === null || _this$sgroup$bracketB === void 0 ? void 0 : _this$sgroup$bracketB.transform(scale.Scale.modelToCanvas, this.editorSettings);
    }
  }, {
    key: "setHoverRectAttributes",
    value: function setHoverRectAttributes(element) {
      var scaledBracketBox = this.getScaledBracketBox();
      if (!scaledBracketBox) {
        return;
      }
      var size = scaledBracketBox.sz();
      element.attr('x', scaledBracketBox.p0.x - HOVER_RECT_PADDING).attr('y', scaledBracketBox.p0.y - HOVER_RECT_PADDING).attr('width', size.x + HOVER_RECT_PADDING * 2).attr('height', size.y + HOVER_RECT_PADDING * 2).attr('rx', HOVER_RECT_RADIUS).attr('ry', HOVER_RECT_RADIUS);
    }
  }, {
    key: "getSGroupAtomRenderers",
    value: function getSGroupAtomRenderers() {
      var _this6 = this;
      var sgroupAtomIds = this.getSGroupAtomIds();
      return _toConsumableArray__default["default"](this.atomRenderers.values()).filter(function (atomRenderer) {
        return atomRenderer.atom.monomer === _this6.sgroupDrawingEntity.monomer && sgroupAtomIds.has(atomRenderer.atom.atomIdInMicroMode);
      });
    }
  }, {
    key: "getSGroupBondRenderers",
    value: function getSGroupBondRenderers() {
      var _this7 = this;
      var sgroupAtomIds = this.getSGroupAtomIds();
      return _toConsumableArray__default["default"](this.bondRenderers.values()).filter(function (bondRenderer) {
        var _bondRenderer$bond2 = bondRenderer.bond,
          firstAtom = _bondRenderer$bond2.firstAtom,
          secondAtom = _bondRenderer$bond2.secondAtom;
        var isSameMonomer = firstAtom.monomer === _this7.sgroupDrawingEntity.monomer && secondAtom.monomer === _this7.sgroupDrawingEntity.monomer;
        return isSameMonomer && sgroupAtomIds.has(firstAtom.atomIdInMicroMode) && sgroupAtomIds.has(secondAtom.atomIdInMicroMode);
      });
    }
  }, {
    key: "getAtomHoverPath",
    value: function getAtomHoverPath(atomRenderer) {
      var contour = atomRenderer.getHoverContour();
      if (contour.type === 'circle') {
        return new paperjs__default["default"].Path.Circle(new paperjs__default["default"].Point(contour.center.x, contour.center.y), contour.radius);
      }
      return new paperjs__default["default"].Path.Rectangle(new paperjs__default["default"].Rectangle(contour.x, contour.y, contour.width, contour.height), new paperjs__default["default"].Size(contour.radius, contour.radius));
    }
  }, {
    key: "getBondHoverPath",
    value: function getBondHoverPath(bondRenderer) {
      var pathData = bondRenderer.getHoverContourPath();
      return pathData ? new paperjs__default["default"].CompoundPath(pathData) : null;
    }
  }, {
    key: "getCombinedStructureHoverPathData",
    value: function getCombinedStructureHoverPathData() {
      var _this8 = this,
        _combinedPath;
      paperjs__default["default"].setup(document.createElement('canvas'));
      var hoverPaths = [].concat(_toConsumableArray__default["default"](this.getSGroupAtomRenderers().map(function (atomRenderer) {
        return _this8.getAtomHoverPath(atomRenderer);
      })), _toConsumableArray__default["default"](this.getSGroupBondRenderers().map(function (bondRenderer) {
        return _this8.getBondHoverPath(bondRenderer);
      }).filter(function (path) {
        return Boolean(path);
      })));
      var combinedPath;
      hoverPaths.forEach(function (path) {
        if (!path.closed) {
          path.closePath();
        }
        combinedPath = combinedPath ? combinedPath.unite(path) : path;
      });
      return (_combinedPath = combinedPath) === null || _combinedPath === void 0 ? void 0 : _combinedPath.pathData;
    }
  }, {
    key: "appendHover",
    value: function appendHover() {
      if (!this.rootElement || this.hoverElement || !this.sgroup.bracketBox) {
        return;
      }
      var hoverGroup = this.rootElement.insert('g', ':first-child').attr('pointer-events', 'none').attr('class', 'dynamic-element');
      var combinedPathData = this.getCombinedStructureHoverPathData();
      if (combinedPathData) {
        hoverGroup.append('path').attr('d', combinedPathData).attr('fill', 'none').attr('stroke', HOVER_STROKE).attr('stroke-width', HOVER_STROKE_WIDTH);
      }
      var hoverRect = hoverGroup.append('rect').attr('fill', 'none').attr('stroke', HOVER_STROKE).attr('stroke-width', HOVER_STROKE_WIDTH);
      this.setHoverRectAttributes(hoverRect);
      this.hoverElement = hoverGroup;
      return this.hoverElement;
    }
  }, {
    key: "removeHover",
    value: function removeHover() {
      var _this$hoverElement;
      (_this$hoverElement = this.hoverElement) === null || _this$hoverElement === void 0 || _this$hoverElement.remove();
      this.hoverElement = undefined;
    }
  }, {
    key: "appendHoverAreaElement",
    value: function appendHoverAreaElement() {
      var _this9 = this;
      if (!this.rootElement || !this.sgroup.bracketBox) {
        return;
      }
      this.hoverAreaElement = this.rootElement.insert('rect', ':first-child').data([this]).attr('fill', 'none').attr('stroke', 'none').attr('pointer-events', 'all').attr('class', 'dynamic-element');
      this.setHoverRectAttributes(this.hoverAreaElement);
      this.hoverAreaElement.on('mouseover', function (event) {
        editorSingleton.provideEditorInstance().events.mouseOverDrawingEntity.dispatch(event);
        _this9.appendHover();
      }).on('mouseleave', function (event) {
        editorSingleton.provideEditorInstance().events.mouseLeaveDrawingEntity.dispatch(event);
        _this9.removeHover();
      });
    }
  }]);
  return SGroupRenderer;
}(BaseRenderer.BaseRenderer);

exports.SGroupRenderer = SGroupRenderer;
//# sourceMappingURL=SGroupRenderer.js.map
