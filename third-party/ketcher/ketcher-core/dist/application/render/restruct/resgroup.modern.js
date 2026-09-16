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
import { FunctionalGroup } from '../../../domain/entities/functionalGroup.modern.js';
import { SUPERATOM_CLASS, SGroup } from '../../../domain/entities/sgroup.modern.js';
import { MonomerMicromolecule } from '../../../domain/entities/monomerMicromolecule.modern.js';
import { Box2Abs } from '../../../domain/entities/box2Abs.modern.js';
import { Vec2 } from '../../../domain/entities/vec2.modern.js';
import { SgContexts } from '../../editor/shared/constants.modern.js';
import ReDataSGroupData from './redatasgroupdata.modern.js';
import { LayerMap } from './generalEnumTypes.modern.js';
import ReObject from './reobject.modern.js';
import { Scale } from '../../../domain/helpers/scale.modern.js';
import '../../../domain/helpers/functionalGroupsProvider.modern.js';
import '../../../domain/helpers/saltsAndSolventsProvider.modern.js';
import '../../../domain/constants/generics.modern.js';
import '../../../domain/helpers/attachmentPointCalculations.modern.js';
import draw from '../draw.modern.js';
import util from '../util.modern.js';
import { toFixed } from '../../../utilities/toFixed.modern.js';
import '../../../utilities/runAsyncAction.modern.js';
import '../../../utilities/KetcherLogger.modern.js';
import '../../../utilities/SettingsManager.modern.js';
import '../../../utilities/keynorm.modern.js';
import 'react-device-detect';
import '../../../utilities/clipboardUtils.modern.js';
import BracketParams from '../bracket-params.modern.js';
import paperjs from 'paper';

function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var SUPERATOM_CLASS_TEXT = _defineProperty(_defineProperty(_defineProperty({}, SUPERATOM_CLASS.BASE, 'Base'), SUPERATOM_CLASS.SUGAR, 'Sugar'), SUPERATOM_CLASS.PHOSPHATE, 'Phosphate');
function paperPathFromSVGElement(element) {
  var tagName = element.tagName;
  var path;
  if (tagName === 'circle') {
    var _element$getAttribute, _element$getAttribute2, _element$getAttribute3;
    var cx = parseFloat((_element$getAttribute = element.getAttribute('cx')) !== null && _element$getAttribute !== void 0 ? _element$getAttribute : '0');
    var cy = parseFloat((_element$getAttribute2 = element.getAttribute('cy')) !== null && _element$getAttribute2 !== void 0 ? _element$getAttribute2 : '0');
    var r = parseFloat((_element$getAttribute3 = element.getAttribute('r')) !== null && _element$getAttribute3 !== void 0 ? _element$getAttribute3 : '0');
    path = new paperjs.Path.Circle(new paperjs.Point(cx, cy), r);
  } else if (tagName === 'rect') {
    var _element$getAttribute4, _element$getAttribute5, _element$getAttribute6, _element$getAttribute7;
    var x = parseFloat((_element$getAttribute4 = element.getAttribute('x')) !== null && _element$getAttribute4 !== void 0 ? _element$getAttribute4 : '0');
    var y = parseFloat((_element$getAttribute5 = element.getAttribute('y')) !== null && _element$getAttribute5 !== void 0 ? _element$getAttribute5 : '0');
    var width = parseFloat((_element$getAttribute6 = element.getAttribute('width')) !== null && _element$getAttribute6 !== void 0 ? _element$getAttribute6 : '0');
    var height = parseFloat((_element$getAttribute7 = element.getAttribute('height')) !== null && _element$getAttribute7 !== void 0 ? _element$getAttribute7 : '0');
    path = new paperjs.Path.Rectangle(new paperjs.Rectangle(x, y, width, height), new paperjs.Size(parseFloat(element.getAttribute('rx') || '0'), parseFloat(element.getAttribute('ry') || '0')));
  } else if (tagName === 'path') {
    var d = element.getAttribute('d');
    path = d ? new paperjs.CompoundPath(d) : undefined;
  }
  return path;
}
var ReSGroup = function (_ReObject) {
  _inherits(ReSGroup, _ReObject);
  function ReSGroup(sgroup) {
    var _this;
    _classCallCheck(this, ReSGroup);
    _this = _callSuper(this, ReSGroup, ['sgroup']);
    _defineProperty(_assertThisInitialized(_this), "item", void 0);
    _defineProperty(_assertThisInitialized(_this), "render", void 0);
    _defineProperty(_assertThisInitialized(_this), "expandedMonomerAttachmentPoints", void 0);
    _this.item = sgroup;
    return _this;
  }
  _createClass(ReSGroup, [{
    key: "draw",
    value:
    function draw(remol, sgroup) {
      this.render = remol.render;
      var set = this.render.paper.set();
      SGroup.bracketPos(sgroup, remol.molecule, remol, this.render);
      var bracketBox = sgroup.bracketBox;
      if (!bracketBox) {
        return set;
      }
      var direction = sgroup.bracketDirection;
      sgroup.areas = [bracketBox];
      if (sgroup.isExpanded()) {
        var SGroupdrawBracketsOptions = {
          set: set,
          render: this.render,
          sgroup: sgroup,
          bracketBox: bracketBox,
          direction: direction
        };
        switch (sgroup.type) {
          case 'MUL':
            {
              SGroupdrawBracketsOptions.lowerIndexText = String(sgroup.data.mul);
              break;
            }
          case 'SRU':
            {
              var connectivity = sgroup.data.connectivity || 'eu';
              if (connectivity === 'ht') connectivity = '';
              var subscript = sgroup.data.subscript || 'n';
              SGroupdrawBracketsOptions.lowerIndexText = subscript;
              SGroupdrawBracketsOptions.upperIndexText = connectivity;
              break;
            }
          case 'COP':
            {
              var _connectivity = sgroup.data.connectivity || 'eu';
              SGroupdrawBracketsOptions.upperIndexText = _connectivity;
              var subtype = sgroup.data.subtype;
              if (sgroup.data.subtype) {
                SGroupdrawBracketsOptions.lowerIndexText = subtype;
              }
              break;
            }
          case 'SUP':
            {
              var superatomClass = sgroup.data["class"];
              SGroupdrawBracketsOptions.lowerIndexText = sgroup.data.name || (superatomClass ? SUPERATOM_CLASS_TEXT[superatomClass] : '');
              SGroupdrawBracketsOptions.upperIndexText = null;
              SGroupdrawBracketsOptions.indexAttribute = {
                'font-style': 'italic'
              };
              SGroupdrawBracketsOptions.superatomClass = superatomClass;
              if (sgroup instanceof MonomerMicromolecule) {
                set.push(drawExpandedMonomerLabel(remol, sgroup, bracketBox));
              }
              break;
            }
          case 'DAT':
            {
              set = drawGroupDat(remol, sgroup);
              break;
            }
        }
        var sgroupTypesWithBrackets = ['MUL', 'SRU', 'SUP', 'GEN', 'COP', 'queryComponent'];
        if (sgroupTypesWithBrackets.includes(sgroup.type) && !sgroup.isSuperatomWithoutLabel && !(sgroup instanceof MonomerMicromolecule)) {
          SGroupdrawBrackets(SGroupdrawBracketsOptions);
        }
      }
      return set;
    }
  }, {
    key: "getTextHighlightDimensions",
    value: function getTextHighlightDimensions(render) {
      var padding = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      var startX = 0;
      var startY = 0;
      var width = 0;
      var height = 0;
      var sGroup = this.item;
      if (sGroup) {
        if (sGroup !== null && sGroup !== void 0 && sGroup.isContracted()) {
          var _sGroup$getContracted = sGroup.getContractedPosition(render.ctab.molecule),
            atomId = _sGroup$getContracted.atomId;
          var reSGroupAtom = render.ctab.atoms.get(atomId);
          var sGroupTextBoundingBox = (reSGroupAtom === null || reSGroupAtom === void 0 ? void 0 : reSGroupAtom.visel.boundingBox) || (reSGroupAtom === null || reSGroupAtom === void 0 ? void 0 : reSGroupAtom.visel.oldBoundingBox);
          if (sGroupTextBoundingBox) {
            var p0 = sGroupTextBoundingBox.p0,
              p1 = sGroupTextBoundingBox.p1;
            width = p1.x - p0.x + padding * 2;
            height = p1.y - p0.y + padding * 2;
            startX = p0.x - padding;
            startY = p0.y - padding;
          }
        }
      }
      return {
        startX: startX,
        startY: startY,
        width: width,
        height: height
      };
    }
  }, {
    key: "getContractedSelectionContour",
    value: function getContractedSelectionContour(render) {
      var paper = render.paper,
        options = render.options;
      var fontszInPx = options.fontszInPx,
        radiusScaleFactor = options.radiusScaleFactor;
      var radius = fontszInPx * radiusScaleFactor * 2;
      var _this$getTextHighligh = this.getTextHighlightDimensions(render, fontszInPx / 2),
        startX = _this$getTextHighligh.startX,
        startY = _this$getTextHighligh.startY,
        width = _this$getTextHighligh.width,
        height = _this$getTextHighligh.height;
      return paper.rect(startX, startY, width, height, radius);
    }
  }, {
    key: "makeSelectionPlate",
    value: function makeSelectionPlate(restruct, _paper, options) {
      var sgroup = this.item;
      var functionalGroups = restruct.molecule.functionalGroups;
      var render = restruct.render;
      if (FunctionalGroup.isContractedFunctionalGroup(sgroup === null || sgroup === void 0 ? void 0 : sgroup.id, functionalGroups)) {
        return this.getContractedSelectionContour(render).attr(options.selectionStyle);
      }
    }
  }, {
    key: "drawHover",
    value: function drawHover(render) {
      var options = render.options;
      var paper = render.paper;
      var sGroupItem = this.item;
      if (sGroupItem) {
        var _getHighlighPathInfo = getHighlighPathInfo(sGroupItem, render),
          a0 = _getHighlighPathInfo.a0,
          a1 = _getHighlighPathInfo.a1,
          b0 = _getHighlighPathInfo.b0,
          b1 = _getHighlighPathInfo.b1;
        var functionalGroups = render.ctab.molecule.functionalGroups;
        var hoversToCombine = [];
        var otherHovers = paper.set();
        if (FunctionalGroup.isContractedFunctionalGroup(sGroupItem.id, functionalGroups)) {
          sGroupItem.hovering = this.getContractedSelectionContour(render).attr(options.hoverStyle);
          hoversToCombine.push(sGroupItem.hovering);
        } else if (!this.selected) {
          sGroupItem.hovering = paper.path('M{0},{1}L{2},{3}L{4},{5}L{6},{7}L{0},{1}', toFixed(a0.x), toFixed(a0.y), toFixed(a1.x), toFixed(a1.y), toFixed(b1.x), toFixed(b1.y), toFixed(b0.x), toFixed(b0.y)).attr(options.hoverStyle);
          otherHovers.push(sGroupItem.hovering);
        }
        SGroup.getAtoms(render.ctab.molecule, sGroupItem).forEach(function (aid) {
          var _render$ctab;
          var atom = render === null || render === void 0 || (_render$ctab = render.ctab) === null || _render$ctab === void 0 || (_render$ctab = _render$ctab.atoms) === null || _render$ctab === void 0 ? void 0 : _render$ctab.get(aid);
          hoversToCombine.push(atom === null || atom === void 0 ? void 0 : atom.makeHoverPlate(render));
        }, this);
        SGroup.getBonds(render.ctab.molecule, sGroupItem).forEach(function (bid) {
          var _render$ctab2;
          hoversToCombine.push(render === null || render === void 0 || (_render$ctab2 = render.ctab) === null || _render$ctab2 === void 0 || (_render$ctab2 = _render$ctab2.bonds) === null || _render$ctab2 === void 0 || (_render$ctab2 = _render$ctab2.get(bid)) === null || _render$ctab2 === void 0 ? void 0 : _render$ctab2.makeHoverPlate(render));
        }, this);
        var elements = [];
        hoversToCombine.forEach(function (item) {
          if (item !== null && item !== void 0 && item.node) {
            elements.push(item.node);
            item.node.remove();
          }
        });
        paperjs.setup(document.createElement('canvas'));
        var combinedPath;
        elements.forEach(function (el) {
          var paperPath = paperPathFromSVGElement(el);
          if (!paperPath) {
            return;
          }
          if (!paperPath.closed) {
            paperPath.closePath();
          }
          if (!combinedPath) {
            combinedPath = paperPath;
          } else {
            combinedPath = combinedPath.unite(paperPath);
          }
        });
        if (!combinedPath) {
          return;
        }
        var combinedPathD = combinedPath.pathData;
        render.ctab.addReObjectPath(LayerMap.hovering, this.visel, paper.path(combinedPathD).attr(options.hoverStyle));
        render.ctab.addReObjectPath(LayerMap.hovering, this.visel, otherHovers);
      }
    }
  }, {
    key: "setHover",
    value: function setHover(hover, render) {
      var _this$expandedMonomer2, _this$expandedMonomer3;
      _get(_getPrototypeOf(ReSGroup.prototype), "setHover", this).call(this, hover, render);
      if (!hover || this.selected) {
        var _this$expandedMonomer;
        (_this$expandedMonomer = this.expandedMonomerAttachmentPoints) === null || _this$expandedMonomer === void 0 || _this$expandedMonomer.hide();
        return;
      }
      if (!((_this$expandedMonomer2 = this.expandedMonomerAttachmentPoints) !== null && _this$expandedMonomer2 !== void 0 && _this$expandedMonomer2.length) || (_this$expandedMonomer3 = this.expandedMonomerAttachmentPoints) !== null && _this$expandedMonomer3 !== void 0 && (_this$expandedMonomer3 = _this$expandedMonomer3[0]) !== null && _this$expandedMonomer3 !== void 0 && _this$expandedMonomer3.removed) {
        this.expandedMonomerAttachmentPoints = undefined;
      }
      if (this.expandedMonomerAttachmentPoints) {
        this.expandedMonomerAttachmentPoints.show();
      } else {
        var paper = render.paper;
        var sGroupItem = this.item;
        if (!sGroupItem) {
          return;
        }
        var set = paper.set();
        render.paper.setStart();
        SGroup.getAtoms(render.ctab.molecule, sGroupItem).forEach(function (aid) {
          var _render$ctab3;
          var atom = render === null || render === void 0 || (_render$ctab3 = render.ctab) === null || _render$ctab3 === void 0 || (_render$ctab3 = _render$ctab3.atoms) === null || _render$ctab3 === void 0 ? void 0 : _render$ctab3.get(aid);
          set.push(atom === null || atom === void 0 ? void 0 : atom.makeMonomerAttachmentPointHighlightPlate(render));
        }, this);
        render.ctab.addReObjectPath(LayerMap.atom, this.visel, set);
        this.expandedMonomerAttachmentPoints = render.paper.setFinish();
      }
    }
  }, {
    key: "show",
    value: function show(restruct) {
      var render = restruct.render;
      var sgroup = this.item;
      if (sgroup && sgroup.data.fieldName !== 'MRV_IMPLICIT_H') {
        var remol = render.ctab;
        var path = this.draw(remol, sgroup);
        var includeInBoundingBox = !(sgroup instanceof MonomerMicromolecule && sgroup.isExpanded());
        restruct.addReObjectPath(LayerMap.data, this.visel, path, null, includeInBoundingBox);
        this.setHover(this.hover, render);
      }
    }
  }], [{
    key: "isSelectable",
    value: function isSelectable() {
      return false;
    }
  }]);
  return ReSGroup;
}(ReObject);
function SGroupdrawBrackets(_ref) {
  var set = _ref.set,
    render = _ref.render,
    bracketBox = _ref.bracketBox,
    direction = _ref.direction,
    lowerIndexText = _ref.lowerIndexText,
    upperIndexText = _ref.upperIndexText,
    indexAttribute = _ref.indexAttribute,
    superatomClass = _ref.superatomClass;
  var brackets = getBracketParameters(bracketBox, direction);
  var rightBracketIndex = -1;
  for (var i = 0; i < brackets.length; ++i) {
    var bracket = brackets[i];
    var path = draw.bracket(render.paper, Scale.modelToCanvas(bracket.bracketAngleDirection, render.options), Scale.modelToCanvas(bracket.bracketDirection, render.options), Scale.modelToCanvas(bracket.center, render.options), bracket.width, bracket.height, render.options);
    set.push(path);
    if (rightBracketIndex < 0 || brackets[rightBracketIndex].bracketAngleDirection.x < bracket.bracketAngleDirection.x || brackets[rightBracketIndex].bracketAngleDirection.x === bracket.bracketAngleDirection.x && brackets[rightBracketIndex].bracketAngleDirection.y > bracket.bracketAngleDirection.y) {
      rightBracketIndex = i;
    }
  }
  var bracketR = brackets[rightBracketIndex];
  function renderIndex(text) {
    var isLowerText = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    var superatomClass = arguments.length > 2 ? arguments[2] : undefined;
    var path;
    var lowerPath;
    var bracketPoint1 = new Vec2(set[rightBracketIndex].getPath()[1][1], set[rightBracketIndex].getPath()[1][2], 0);
    var bracketPoint2 = new Vec2(set[rightBracketIndex].getPath()[2][1], set[rightBracketIndex].getPath()[2][2], 0);
    if (bracketPoint2.y === bracketPoint1.y) {
      lowerPath = bracketPoint2.x > bracketPoint1.x ? bracketPoint1 : bracketPoint2;
    } else {
      lowerPath = bracketPoint2.y > bracketPoint1.y ? bracketPoint2 : bracketPoint1;
    }
    if (isLowerText) {
      path = lowerPath;
    } else {
      path = lowerPath.x === bracketPoint1.x && lowerPath.y === bracketPoint1.y ? bracketPoint2 : bracketPoint1;
    }
    var indexPos = new Vec2(path.x, path.y);
    var iconSize = superatomClass === SUPERATOM_CLASS.BASE ? 14 : 12;
    var iconOffsetFromBracket = 8;
    var textOffsetFromBracket = 2;
    var icon;
    if (superatomClass === SUPERATOM_CLASS.SUGAR) {
      icon = render.paper.rect(indexPos.x + iconOffsetFromBracket, indexPos.y - iconSize / 2, iconSize, iconSize, 2);
    } else if (superatomClass === SUPERATOM_CLASS.PHOSPHATE) {
      icon = render.paper.circle(indexPos.x + iconSize / 2 + iconOffsetFromBracket, indexPos.y, iconSize / 2);
    } else if (superatomClass === SUPERATOM_CLASS.BASE) {
      var rhombusPath = "M".concat(indexPos.x + iconSize / 2 + iconOffsetFromBracket, ",").concat(indexPos.y - iconSize / 2, "\n                         L").concat(indexPos.x + iconSize + iconOffsetFromBracket, ",").concat(indexPos.y, "\n                         L").concat(indexPos.x + iconSize / 2 + iconOffsetFromBracket, ",").concat(indexPos.y + iconSize / 2, "\n                         L").concat(indexPos.x + iconOffsetFromBracket, ",").concat(indexPos.y, " Z");
      icon = render.paper.path(rhombusPath);
    }
    if (icon && indexAttribute) {
      icon.attr({
        stroke: '#B4B9D6',
        strokeWidth: '1.4'
      });
      set.push(icon);
    }
    var textPosition = new Vec2(indexPos.x, indexPos.y);
    var indexPath = render.paper.text(textPosition.x, textPosition.y, text).attr({
      font: render.options.font,
      'font-size': render.options.fontszsubInPx
    });
    if (isLowerText) {
      var _indexPath$node, _indexPath$node2;
      (_indexPath$node = indexPath.node) === null || _indexPath$node === void 0 || _indexPath$node.setAttribute('data-testid', 's-group-label');
      (_indexPath$node2 = indexPath.node) === null || _indexPath$node2 === void 0 || _indexPath$node2.setAttribute('data-label-text', text);
    }
    if (indexAttribute) indexPath.attr(indexAttribute);
    var indexBox = Box2Abs.fromRelBox(util.relBox(indexPath.getBBox()));
    var t = Math.max(util.shiftRayBox(indexPos, bracketR.bracketAngleDirection.negated(), indexBox), 3) + (icon ? iconOffsetFromBracket : textOffsetFromBracket);
    indexPath.translateAbs(t * bracketR.bracketAngleDirection.x + (icon ? iconSize + iconOffsetFromBracket / 2 : 0), t * bracketR.bracketAngleDirection.y);
    set.push(indexPath);
  }
  if (lowerIndexText) {
    renderIndex(lowerIndexText, true, superatomClass);
  }
  if (upperIndexText) renderIndex(upperIndexText);
}
function showValue(paper, pos, sgroup, options) {
  var _text$node, _text$node2;
  var value = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : sgroup.data.fieldValue;
  var text = paper.text(pos === null || pos === void 0 ? void 0 : pos.x, pos === null || pos === void 0 ? void 0 : pos.y, value).attr({
    font: options.font,
    'font-size': options.fontszsubInPx
  });
  (_text$node = text.node) === null || _text$node === void 0 || _text$node.setAttribute('data-testid', 's-group-label');
  (_text$node2 = text.node) === null || _text$node2 === void 0 || _text$node2.setAttribute('data-label-text', value);
  var box = text.getBBox();
  var rect = paper.rect(box.x - 1, box.y - 1, box.width + 2, box.height + 2, 3, 3);
  rect = sgroup.selected ? rect.attr(options.selectionStyle) : rect.attr({
    fill: '#fff',
    stroke: '#fff'
  });
  var set = paper.set();
  set.push(rect, text.toFront());
  return set;
}
function drawExpandedMonomerLabel(restruct, sgroup, monomerBBox) {
  var render = restruct.render;
  var labelPosition = monomerBBox.p1.add(new Vec2(0, 0.3)).scaled(render.options.microModeScale);
  var label = showValue(render.paper, labelPosition, sgroup, render.options, sgroup.data.name || '?');
  var labelBBox = util.relBox(label.getBBox());
  label.translateAbs(0.5 * labelBBox.width, -0.5 * labelBBox.height);
  return label;
}
function drawGroupDat(restruct, sgroup) {
  if (sgroup.pp === null) sgroup.calculatePP(restruct.molecule);
  return sgroup.data.attached ? drawAttachedDat(restruct, sgroup) : drawAbsoluteDat(restruct, sgroup);
}
function drawAbsoluteDat(restruct, sgroup) {
  var _sgroup$pp;
  var render = restruct.render;
  var options = render.options;
  var paper = render.paper;
  var set = paper.set();
  var ps = sgroup === null || sgroup === void 0 || (_sgroup$pp = sgroup.pp) === null || _sgroup$pp === void 0 ? void 0 : _sgroup$pp.scaled(options.microModeScale);
  var name = showValue(paper, ps, sgroup, options);
  if (sgroup.data.context !== SgContexts.Bond) {
    var box = util.relBox(name.getBBox());
    name.translateAbs(0.5 * box.width, -0.5 * box.height);
  }
  set.push(name);
  var sbox = Box2Abs.fromRelBox(util.relBox(name.getBBox()));
  sgroup.dataArea = sbox.transform(Scale.canvasToModel, render.options);
  if (!restruct.sgroupData.has(sgroup.id)) {
    restruct.sgroupData.set(sgroup.id, new ReDataSGroupData(sgroup));
  }
  return set;
}
function drawAttachedDat(restruct, sgroup) {
  var render = restruct.render;
  var options = render.options;
  var paper = render.paper;
  var set = paper.set();
  SGroup.getAtoms(restruct.molecule, sgroup).forEach(function (aid) {
    var atom = restruct.atoms.get(aid);
    if (atom) {
      var p = Scale.modelToCanvas(atom.a.pp, options);
      var bb = atom.visel.boundingBox;
      if (bb !== null) p.x = Math.max(p.x, bb.p1.x);
      p.x += options.lineWidth;
      var nameI = showValue(paper, p, sgroup, options);
      var boxI = util.relBox(nameI.getBBox());
      nameI.translateAbs(0.5 * boxI.width, -0.3 * boxI.height);
      set.push(nameI);
      var sboxI = Box2Abs.fromRelBox(util.relBox(nameI.getBBox()));
      sboxI = sboxI.transform(Scale.canvasToModel, render.options);
      sgroup.areas.push(sboxI);
    }
  });
  return set;
}
function getBracketParameters(bracketBox, direction) {
  var brackets = [];
  var bracketDirection = direction.rotateSC(1, 0);
  var bracketWidth = Math.min(0.25, bracketBox.sz().x * 0.3);
  var leftCenter = Vec2.lc2(direction, bracketBox.p0.x, bracketDirection, 0.5 * (bracketBox.p0.y + bracketBox.p1.y));
  var rightCenter = Vec2.lc2(direction, bracketBox.p1.x, bracketDirection, 0.5 * (bracketBox.p0.y + bracketBox.p1.y));
  var bracketHeight = bracketBox.sz().y;
  brackets.push(new BracketParams(leftCenter, direction.negated(), bracketWidth, bracketHeight), new BracketParams(rightCenter, direction, bracketWidth, bracketHeight));
  return brackets;
}
function getHighlighPathInfo(sgroup, render) {
  var options = render.options;
  var sGroupBracketBox = sgroup.bracketBox;
  if (!sGroupBracketBox) {
    throw new Error('SGroup bracket box is not defined');
  }
  var bracketBox = sGroupBracketBox.transform(Scale.modelToCanvas, options);
  var lineWidth = options.lineWidth;
  var vext = new Vec2(lineWidth * 4, lineWidth * 6);
  bracketBox = bracketBox.extend(vext, vext);
  var direction = sgroup.bracketDirection;
  var bracketDirection = direction.rotateSC(1, 0);
  var a0 = Vec2.lc2(direction, bracketBox.p0.x, bracketDirection, bracketBox.p0.y);
  var a1 = Vec2.lc2(direction, bracketBox.p0.x, bracketDirection, bracketBox.p1.y);
  var b0 = Vec2.lc2(direction, bracketBox.p1.x, bracketDirection, bracketBox.p0.y);
  var b1 = Vec2.lc2(direction, bracketBox.p1.x, bracketDirection, bracketBox.p1.y);
  var size = options.contractedFunctionalGroupSize;
  var startX = (b0.x + a0.x) / 2 - size / 2;
  var startY = (a1.y + a0.y) / 2 - size / 2;
  var _sgroup$getContracted = sgroup.getContractedPosition(render.ctab.molecule),
    contractedPosition = _sgroup$getContracted.position;
  if (contractedPosition) {
    var shift = new Vec2(size / 2, size / 2, 0);
    var hoverPp = Vec2.diff(contractedPosition.scaled(40), shift);
    startX = hoverPp.x;
    startY = hoverPp.y;
  }
  return {
    a0: a0,
    a1: a1,
    b0: b0,
    b1: b1,
    startX: startX,
    startY: startY,
    size: size
  };
}

export { SUPERATOM_CLASS_TEXT, ReSGroup as default, paperPathFromSVGElement };
//# sourceMappingURL=resgroup.modern.js.map
