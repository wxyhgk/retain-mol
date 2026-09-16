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
import { Bond } from '../../../domain/entities/bond.modern.js';
import { FunctionalGroup } from '../../../domain/entities/functionalGroup.modern.js';
import { Vec2 } from '../../../domain/entities/vec2.modern.js';
import { LayerMap, StereoColoringType } from './generalEnumTypes.modern.js';
import { getColorFromStereoLabel } from './reatom.modern.js';
import ReObject from './reobject.modern.js';
import { Scale } from '../../../domain/helpers/scale.modern.js';
import '../../../domain/helpers/functionalGroupsProvider.modern.js';
import '../../../domain/helpers/saltsAndSolventsProvider.modern.js';
import '../../../domain/constants/generics.modern.js';
import '../../../domain/helpers/attachmentPointCalculations.modern.js';
import draw from '../draw.modern.js';
import util from '../util.modern.js';
import { MonomerMicromolecule } from '../../../domain/entities/monomerMicromolecule.modern.js';
import { isNumber } from 'lodash';
import Visel from './visel.modern.js';
import { Coordinates } from '../../editor/shared/coordinates.modern.js';

function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var ReBond = function (_ReObject) {
  _inherits(ReBond, _ReObject);
  function ReBond(_bond) {
    var _this;
    _classCallCheck(this, ReBond);
    _this = _callSuper(this, ReBond, ['bond']);
    _defineProperty(_assertThisInitialized(_this), "b", void 0);
    _defineProperty(_assertThisInitialized(_this), "doubleBondShift", void 0);
    _defineProperty(_assertThisInitialized(_this), "path", void 0);
    _defineProperty(_assertThisInitialized(_this), "neihbid1", -1);
    _defineProperty(_assertThisInitialized(_this), "neihbid2", -1);
    _defineProperty(_assertThisInitialized(_this), "boldStereo", void 0);
    _defineProperty(_assertThisInitialized(_this), "rbb", void 0);
    _defineProperty(_assertThisInitialized(_this), "cip", void 0);
    _defineProperty(_assertThisInitialized(_this), "isPlateShouldBeHidden", function (restruct, options) {
      ReBond.bondRecalc(_assertThisInitialized(_this), restruct, options);
      var bond = _this.b;
      var sgroups = restruct.render.ctab.sgroups;
      var functionalGroups = restruct.render.ctab.molecule.functionalGroups;
      if (bond.type === Bond.PATTERN.TYPE.HYDROGEN) {
        var beginSgroup = restruct.molecule.getGroupFromAtomId(bond.begin);
        var endSgroup = restruct.molecule.getGroupFromAtomId(bond.end);
        if (beginSgroup instanceof MonomerMicromolecule && beginSgroup.monomer.monomerItem.expanded) {
          return true;
        }
        if (endSgroup instanceof MonomerMicromolecule && endSgroup.monomer.monomerItem.expanded) {
          return true;
        }
      }
      return FunctionalGroup.isBondInContractedFunctionalGroup(bond, sgroups, functionalGroups) || Bond.isBondToHiddenLeavingGroup(restruct.molecule, bond);
    });
    _this.b = _bond;
    _this.doubleBondShift = 0;
    return _this;
  }
  _createClass(ReBond, [{
    key: "drawHover",
    value: function drawHover(render) {
      var drawOutline = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
      var ret = this.makeHoverPlate(render, drawOutline);
      render.ctab.addReObjectPath(LayerMap.hovering, this.visel, ret);
      return ret;
    }
  }, {
    key: "getSelectionPoints",
    value: function getSelectionPoints(render) {
      var _restruct$molecule$ha, _restruct$molecule$ha2;
      var isHighlight = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var bond = this.b;
      var restruct = render.ctab,
        options = render.options;
      var bondThickness = options.bondThickness,
        bondSpacingInPx = options.bondSpacingInPx,
        stereoBondWidth = options.stereoBondWidth;
      var regularSelectionThikness = bondSpacingInPx + bondThickness;
      var halfBondStart = bond.hb1 !== undefined ? (_restruct$molecule$ha = restruct.molecule.halfBonds.get(bond.hb1)) === null || _restruct$molecule$ha === void 0 ? void 0 : _restruct$molecule$ha.p : undefined;
      var halfBondEnd = bond.hb2 !== undefined ? (_restruct$molecule$ha2 = restruct.molecule.halfBonds.get(bond.hb2)) === null || _restruct$molecule$ha2 === void 0 ? void 0 : _restruct$molecule$ha2.p : undefined;
      if (!halfBondStart || !halfBondEnd) return [];
      var isStereoBond = bond.stereo !== Bond.PATTERN.STEREO.NONE && bond.stereo !== Bond.PATTERN.STEREO.CIS_TRANS;
      var highlightPadding = isHighlight ? -1 : 0;
      var stereoPadding = isStereoBond ? 0 : -2;
      var addPadding = highlightPadding + stereoPadding;
      var contourStart = Vec2.getLinePoint(halfBondEnd, halfBondStart, addPadding);
      var contourEnd = Vec2.getLinePoint(halfBondStart, halfBondEnd, addPadding);
      var stereoBondStartHeightCoef = 0.5;
      var bondPadding = 0.5;
      var highlightBondPadding = isHighlight ? 0 : 2;
      var addStart = (isStereoBond ? stereoBondWidth * stereoBondStartHeightCoef : regularSelectionThikness + bondPadding) + highlightBondPadding;
      var stereoBondEndHeightCoef = 1;
      var addEnd = (isStereoBond ? stereoBondWidth + regularSelectionThikness * stereoBondEndHeightCoef / stereoBondWidth : regularSelectionThikness + bondPadding) + highlightBondPadding;
      var contourPaddedStart = Vec2.getLinePoint(contourStart, contourEnd, addEnd);
      var contourPaddedEnd = Vec2.getLinePoint(contourEnd, contourStart, addStart);
      var startPoint = contourStart.add(new Vec2(addEnd, 0));
      var endPoint = contourEnd.add(new Vec2(addStart, 0));
      var padStartPoint = contourPaddedStart.add(new Vec2(addEnd, 0));
      var padEndPoint = contourPaddedEnd.add(new Vec2(addStart, 0));
      var angle = bond.angle;
      var startTop = startPoint.rotateAroundOrigin(angle + 90, new Vec2(contourStart.x, contourStart.y));
      var startBottom = startPoint.rotateAroundOrigin(angle - 90, new Vec2(contourStart.x, contourStart.y));
      var startPadTop = padStartPoint.rotateAroundOrigin(angle + 90, contourPaddedStart);
      var startPadBottom = padStartPoint.rotateAroundOrigin(angle - 90, contourPaddedStart);
      var endTop = endPoint.rotateAroundOrigin(angle + 90, contourEnd);
      var endBottom = endPoint.rotateAroundOrigin(angle - 90, contourEnd);
      var endPadTop = padEndPoint.rotateAroundOrigin(angle + 90, contourPaddedEnd);
      var endPadBottom = padEndPoint.rotateAroundOrigin(angle - 90, contourPaddedEnd);
      return [startPadTop, startTop, endTop, endPadTop, endPadBottom, endBottom, startPadBottom, startBottom];
    }
  }, {
    key: "getSelectionContour",
    value: function getSelectionContour(render, isHighlight) {
      var paper = render.paper;
      var selectionPoints = this.getSelectionPoints(render, isHighlight);
      if (!selectionPoints.length) return null;
      var _selectionPoints = _slicedToArray(selectionPoints, 8),
        startPadTop = _selectionPoints[0],
        startTop = _selectionPoints[1],
        endTop = _selectionPoints[2],
        endPadTop = _selectionPoints[3],
        endPadBottom = _selectionPoints[4],
        endBottom = _selectionPoints[5],
        startPadBottom = _selectionPoints[6],
        startBottom = _selectionPoints[7];
      var pathString = "\n      M ".concat(startTop.x, " ").concat(startTop.y, "\n      L ").concat(endTop.x, " ").concat(endTop.y, "\n      C ").concat(endPadTop.x, " ").concat(endPadTop.y, ", ").concat(endPadBottom.x, " ").concat(endPadBottom.y, ", ").concat(endBottom.x, " ").concat(endBottom.y, "\n      L ").concat(startBottom.x, " ").concat(startBottom.y, "\n      C ").concat(startPadBottom.x, " ").concat(startPadBottom.y, ", ").concat(startPadTop.x, " ").concat(startPadTop.y, ", ").concat(startTop.x, " ").concat(startTop.y, "\n    ");
      return paper.path(pathString);
    }
  }, {
    key: "makeHoverPlate",
    value: function makeHoverPlate(render) {
      var drawOutline = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
      var restruct = render.ctab;
      var options = render.options;
      if (this.isPlateShouldBeHidden(restruct, options)) {
        return null;
      }
      var rect = this.getSelectionContour(render, false);
      if (!rect) return null;
      return rect.attr(drawOutline ? _objectSpread({}, options.hoverStyle) : {
        fill: options.hoverStyle.fill,
        stroke: 'none'
      });
    }
  }, {
    key: "makeSelectionPlate",
    value: function makeSelectionPlate(restruct, _paper, options) {
      if (this.isPlateShouldBeHidden(restruct, options)) {
        return null;
      }
      var rect = this.getSelectionContour(restruct.render, false);
      if (!rect) return null;
      return rect.attr(options.selectionStyle);
    }
  }, {
    key: "makeHighlitePlate",
    value: function makeHighlitePlate(restruct, highlightStyle) {
      var options = restruct.render.options;
      if (this.isPlateShouldBeHidden(restruct, options)) {
        return null;
      }
      var rect = this.getSelectionContour(restruct.render, true);
      if (!rect) return null;
      return rect.attr(highlightStyle);
    }
  }, {
    key: "show",
    value: function show(restruct, bid, options) {
      var render = restruct.render;
      var struct = restruct.molecule;
      var bond = restruct.molecule.bonds.get(bid);
      if (!bond) return;
      var sgroups = restruct.molecule.sgroups;
      var functionalGroups = restruct.molecule.functionalGroups;
      if (Bond.isBondToHiddenLeavingGroup(struct, bond)) {
        return;
      }
      if (FunctionalGroup.isBondInContractedFunctionalGroup(bond, sgroups, functionalGroups)) {
        return;
      }
      if (bond.type === Bond.PATTERN.TYPE.HYDROGEN && Bond.isBondToExpandedMonomer(struct, bond)) {
        return;
      }
      var paper = render.paper;
      var hb1Id = this.b.hb1;
      var hb2Id = this.b.hb2;
      var hb1 = hb1Id !== undefined ? struct.halfBonds.get(hb1Id) : null;
      var hb2 = hb2Id !== undefined ? struct.halfBonds.get(hb2Id) : null;
      checkStereoBold(bid, this, restruct);
      ReBond.bondRecalc(this, restruct, options);
      setDoubleBondShift(this, struct);
      if (hb1Id === undefined || hb2Id === undefined || !hb1 || !hb2) return;
      var isSnapping = restruct.isSnappingBond(bid);
      this.path = getBondPath(restruct, this, hb1, hb2, isSnapping);
      this.rbb = util.relBox(this.path.getBBox());
      restruct.addReObjectPath(LayerMap.bondSkeleton, this.visel, this.path, null, true);
      var reactingCenter = {
        path: null
      };
      reactingCenter.path = getReactingCenterPath(render, this, hb1, hb2);
      if (reactingCenter.path) {
        reactingCenter.rbb = util.relBox(reactingCenter.path.getBBox());
        restruct.addReObjectPath(LayerMap.data, this.visel, reactingCenter.path, null, true);
      }
      var topology = {
        path: null
      };
      topology.path = getBondMark(render, this, hb1, hb2);
      if (topology.path) {
        topology.rbb = util.relBox(topology.path.getBBox());
        restruct.addReObjectPath(LayerMap.data, this.visel, topology.path, null, true);
      }
      this.setHover(this.hover, render);
      var ipath = null;
      var bondIdxOff = options.subFontSize * 0.6;
      if (options.showBondIds) {
        ipath = getIdsPath(bid, paper, hb1, hb2, bondIdxOff, 0.5, 0.5, hb1.norm);
        restruct.addReObjectPath(LayerMap.indices, this.visel, ipath);
      }
      if (options.showHalfBondIds) {
        ipath = getIdsPath(hb1Id, paper, hb1, hb2, bondIdxOff, 0.8, 0.2, hb1.norm);
        restruct.addReObjectPath(LayerMap.indices, this.visel, ipath);
        ipath = getIdsPath(hb2Id, paper, hb1, hb2, bondIdxOff, 0.2, 0.8, hb2.norm);
        restruct.addReObjectPath(LayerMap.indices, this.visel, ipath);
      }
      if (options.showLoopIds && !options.showBondIds) {
        ipath = getIdsPath(hb1.loop, paper, hb1, hb2, bondIdxOff, 0.5, 0.5, hb2.norm);
        restruct.addReObjectPath(LayerMap.indices, this.visel, ipath);
        ipath = getIdsPath(hb2.loop, paper, hb1, hb2, bondIdxOff, 0.5, 0.5, hb1.norm);
        restruct.addReObjectPath(LayerMap.indices, this.visel, ipath);
      }
      var highlights = restruct.molecule.highlights;
      var isHighlighted = false;
      var highlightColor = '';
      var highlightOutline = false;
      highlights.forEach(function (highlight) {
        var _highlight$bonds;
        var hasCurrentHighlight = (_highlight$bonds = highlight.bonds) === null || _highlight$bonds === void 0 ? void 0 : _highlight$bonds.includes(bid);
        isHighlighted = isHighlighted || hasCurrentHighlight;
        if (hasCurrentHighlight) {
          highlightColor = highlight.color;
          highlightOutline = highlight.outline;
        }
      });
      if (isHighlighted && !highlightOutline) {
        var style = {
          fill: highlightColor,
          stroke: 'none'
        };
        var ret = this.makeHighlitePlate(restruct, style);
        render.ctab.addReObjectPath(LayerMap.hovering, this.visel, ret);
      }
      if (bond.cip) {
        this.cip = util.drawCIPLabel({
          atomOrBond: bond,
          position: bond.center,
          restruct: render.ctab,
          visel: this.visel
        });
      }
      this.addTestIds(restruct.molecule, bond);
    }
  }, {
    key: "addTestIds",
    value: function addTestIds(struct, bond) {
      var bondPathElement = this.path.items ? this.path.items[0].node : this.path.node;
      if (!bondPathElement) {
        return;
      }
      bondPathElement.setAttribute('data-testid', 'bond');
      bondPathElement.setAttribute('data-bondid', struct.bonds.keyOf(bond));
      bondPathElement.setAttribute('data-bondtype', bond.type + (bond.stereo ? 10 + 2 * bond.stereo : 0));
      bondPathElement.setAttribute('data-bondstereo', bond.stereo);
      bondPathElement.setAttribute('data-fromatomid', bond.begin);
      bondPathElement.setAttribute('data-toatomid', bond.end);
      bondPathElement.setAttribute('data-topology', bond.topology);
      bondPathElement.setAttribute('data-reacting-center', bond.reactingCenterStatus);
      var beginSGroupId = struct.getGroupIdFromAtomId(bond.begin);
      var endSGroupId = struct.getGroupIdFromAtomId(bond.end);
      if (beginSGroupId === endSGroupId) {
        return;
      }
      if (isNumber(beginSGroupId)) {
        bondPathElement.setAttribute('data-fromsgroupid', beginSGroupId);
        if (struct.sgroups.get(beginSGroupId) instanceof MonomerMicromolecule) {
          bondPathElement.setAttribute('data-frommonomerid', beginSGroupId);
        }
      }
      if (isNumber(endSGroupId)) {
        bondPathElement.setAttribute('data-tosgroupid', endSGroupId);
        if (struct.sgroups.get(endSGroupId) instanceof MonomerMicromolecule) {
          bondPathElement.setAttribute('data-tomonomerid', endSGroupId);
        }
      }
    }
  }, {
    key: "drawFragmentSelectionPreview",
    value: function drawFragmentSelectionPreview(render, atomIdToDrawArrows, options) {
      var _this$hovering;
      (_this$hovering = this.hovering) === null || _this$hovering === void 0 || (_this$hovering = _this$hovering.node) === null || _this$hovering === void 0 || _this$hovering.remove();
      var halfBond1 = this.b.hb1 && render.ctab.molecule.halfBonds.get(this.b.hb1);
      var halfBond2 = this.b.hb2 && render.ctab.molecule.halfBonds.get(this.b.hb2);
      var atom1 = render.ctab.molecule.atoms.get(this.b.begin);
      var atom2 = render.ctab.molecule.atoms.get(this.b.end);
      if (!halfBond1 || !halfBond2 || !atom1 || !atom2) {
        return null;
      }
      var contourBorderRadius = 10;
      var arrowsOffsetFromContour = 5;
      var atom1Position = Coordinates.modelToCanvas(atom1.pp);
      var atom2Position = Coordinates.modelToCanvas(atom2.pp);
      var bondDirection = halfBond1.p.sub(halfBond2.p).normalized();
      var bondLength = Vec2.dist(atom2Position, atom1Position);
      var arrowsDirection = this.b.begin === atomIdToDrawArrows ? bondDirection : bondDirection.scaled(-1);
      var arrowStart = atomIdToDrawArrows === this.b.begin ? atom1Position : atom2Position;
      var arrowsOffset = 2;
      var arrowHeadLength = 4;
      var offsets = [0, -5, -10];
      var contourSize = new Vec2(bondLength, 20);
      var backgroundStart = new Vec2(atomIdToDrawArrows === this.b.begin ? atom1Position.x : atom1Position.x + bondLength / 2, atom1Position.y - contourSize.y / 2);
      var newVisel = new Visel('fragment-selection-bond-preview');
      var backgroundRect = render.paper.rect(backgroundStart.x, backgroundStart.y, contourSize.x / 2, contourSize.y, contourBorderRadius).attr({
        fill: '#fff',
        stroke: 'none',
        'stroke-width': 0
      });
      render.ctab.addReObjectPath(LayerMap.additionalInfo, newVisel, backgroundRect);
      backgroundRect.rotate(this.b.angle, atom1Position.x, atom1Position.y);
      var strokeColor = options !== null && options !== void 0 && options.disabled ? '#9ab5b8' : '#365CFF';
      var contour = render.paper.rect(atom1Position.x, atom1Position.y - contourSize.y / 2, contourSize.x, contourSize.y, contourBorderRadius).attr({
        fill: 'none',
        stroke: strokeColor,
        'stroke-width': 0.7
      });
      render.ctab.addReObjectPath(LayerMap.additionalInfo, newVisel, contour);
      render.ctab.movePathOnTopOfLayer(this.visel.paths[0], LayerMap.bondSkeleton);
      contour.rotate(this.b.angle, atom1Position.x, atom1Position.y);
      var arrowsSet = render.paper.set();
      offsets.forEach(function (delta) {
        var start = new Vec2(arrowStart.x - arrowsOffsetFromContour * arrowsDirection.x + delta * arrowsDirection.x, arrowStart.y - arrowsOffsetFromContour * arrowsDirection.y + delta * arrowsDirection.y);
        var path = render.paper.path("M ".concat(start.x - arrowsOffset * arrowsDirection.x + arrowHeadLength * arrowsDirection.y, " ").concat(start.y - arrowsOffset * arrowsDirection.y - arrowHeadLength * arrowsDirection.x) + " L ".concat(start.x, " ").concat(start.y) + " L ".concat(start.x - arrowsOffset * arrowsDirection.x - arrowHeadLength * arrowsDirection.y, " ").concat(start.y - arrowsOffset * arrowsDirection.y + arrowHeadLength * arrowsDirection.x)).attr({
          stroke: strokeColor,
          'stroke-width': 2
        });
        arrowsSet.push(path);
      });
      render.ctab.addReObjectPath(LayerMap.additionalInfo, newVisel, arrowsSet);
      return newVisel;
    }
  }], [{
    key: "isSelectable",
    value: function isSelectable() {
      return true;
    }
  }, {
    key: "getAtomPositionForBond",
    value: function getAtomPositionForBond(struct, atomId, sgroup) {
      return sgroup !== null && sgroup !== void 0 && sgroup.isContracted() ? sgroup === null || sgroup === void 0 ? void 0 : sgroup.getContractedPosition(struct).atomId : atomId;
    }
  }, {
    key: "bondRecalc",
    value: function bondRecalc(bond, restruct, options) {
      var render = restruct.render;
      var sgroup1 = restruct.molecule.getGroupFromAtomId(bond.b.begin);
      var sgroup2 = restruct.molecule.getGroupFromAtomId(bond.b.end);
      var beginAtom = restruct.atoms.get(ReBond.getAtomPositionForBond(restruct.molecule, bond.b.begin, sgroup1));
      var endAtom = restruct.atoms.get(ReBond.getAtomPositionForBond(restruct.molecule, bond.b.end, sgroup2));
      if (!beginAtom || !endAtom || bond.b.hb1 === undefined || bond.b.hb2 === undefined) {
        return;
      }
      var p1;
      var p2;
      if (sgroup1 !== null && sgroup1 !== void 0 && sgroup1.isContracted() && sgroup1 !== sgroup2) {
        p1 = sgroup1.getContractedPosition(restruct.molecule).position;
      } else {
        p1 = beginAtom.a.pp;
      }
      if (sgroup2 !== null && sgroup2 !== void 0 && sgroup2.isContracted() && sgroup1 !== sgroup2) {
        p2 = sgroup2.getContractedPosition(restruct.molecule).position;
      } else {
        p2 = endAtom.a.pp;
      }
      var hb1 = restruct.molecule.halfBonds.get(bond.b.hb1);
      var hb2 = restruct.molecule.halfBonds.get(bond.b.hb2);
      if (!(hb1 !== null && hb1 !== void 0 && hb1.dir) || !(hb2 !== null && hb2 !== void 0 && hb2.dir)) return;
      bond.b.center = Vec2.lc2(p1, 0.5, p2, 0.5);
      bond.b.len = Vec2.dist(Scale.modelToCanvas(p1, render.options), Scale.modelToCanvas(p2, render.options));
      hb1.p = beginAtom.getShiftedSegmentPosition(options, hb1.dir, p1, bond.b.len);
      hb2.p = endAtom.getShiftedSegmentPosition(options, hb2.dir, p2, bond.b.len);
      bond.b.sb = options.lineWidth * 5;
      bond.b.sa = Math.max(bond.b.sb, bond.b.len / 2 - options.lineWidth * 2);
      bond.b.angle = Math.atan2(hb1.dir.y, hb1.dir.x) * 180 / Math.PI;
    }
  }]);
  return ReBond;
}(ReObject);
function findIncomingStereoUpBond(atom, bid0, includeBoldStereoBond, restruct) {
  return atom.neighbors.findIndex(function (hbid) {
    var hb = restruct.molecule.halfBonds.get(hbid);
    if (!hb || hb.bid === bid0) return false;
    var neibond = restruct.bonds.get(hb.bid);
    if (!neibond) return false;
    var singleUp = neibond.b.type === Bond.PATTERN.TYPE.SINGLE && neibond.b.stereo === Bond.PATTERN.STEREO.UP;
    if (singleUp) {
      if (Bond.isBondToHiddenLeavingGroup(restruct.molecule, neibond.b)) {
        return false;
      }
      return neibond.b.end === hb.begin || neibond.boldStereo && includeBoldStereoBond;
    }
    if (neibond.b.type === Bond.PATTERN.TYPE.DOUBLE && neibond.b.stereo === Bond.PATTERN.STEREO.NONE && includeBoldStereoBond && neibond.boldStereo) {
      return !Bond.isBondToHiddenLeavingGroup(restruct.molecule, neibond.b);
    }
    return false;
  });
}
function findIncomingUpBonds(bid0, bond, restruct) {
  var _restruct$atoms$get, _restruct$atoms$get2;
  var halfbonds = [bond.b.begin, bond.b.end].map(function (aid) {
    var atom = restruct.molecule.atoms.get(aid);
    if (!atom) return -1;
    var pos = findIncomingStereoUpBond(atom, bid0, true, restruct);
    return pos < 0 ? -1 : atom.neighbors[pos];
  });
  bond.neihbid1 = (_restruct$atoms$get = restruct.atoms.get(bond.b.begin)) !== null && _restruct$atoms$get !== void 0 && _restruct$atoms$get.showLabel && !bond.boldStereo ? -1 : halfbonds[0];
  bond.neihbid2 = (_restruct$atoms$get2 = restruct.atoms.get(bond.b.end)) !== null && _restruct$atoms$get2 !== void 0 && _restruct$atoms$get2.showLabel && !bond.boldStereo ? -1 : halfbonds[1];
}
function checkStereoBold(bid0, bond, restruct) {
  var halfbonds = [bond.b.begin, bond.b.end].map(function (aid) {
    var atom = restruct.molecule.atoms.get(aid);
    if (!atom) return -1;
    var pos = findIncomingStereoUpBond(atom, bid0, false, restruct);
    return pos < 0 ? -1 : atom.neighbors[pos];
  });
  bond.boldStereo = halfbonds[0] >= 0 && halfbonds[1] >= 0;
}
function getBondPath(restruct, bond, hb1, hb2, isSnapping) {
  var _restruct$atoms$get3, _restruct$atoms$get4;
  var path = null;
  var render = restruct.render;
  var struct = restruct.molecule;
  var shiftA = !((_restruct$atoms$get3 = restruct.atoms.get(hb1.begin)) !== null && _restruct$atoms$get3 !== void 0 && _restruct$atoms$get3.showLabel);
  var shiftB = !((_restruct$atoms$get4 = restruct.atoms.get(hb2.begin)) !== null && _restruct$atoms$get4 !== void 0 && _restruct$atoms$get4.showLabel);
  var newHalfBonds;
  var xShiftMinus1 = -1;
  var xShiftPlus1 = 1;
  switch (bond.b.type) {
    case Bond.PATTERN.TYPE.SINGLE:
      switch (bond.b.stereo) {
        case Bond.PATTERN.STEREO.UP:
          findIncomingUpBonds(hb1.bid, bond, restruct);
          if (bond.boldStereo && bond.neihbid1 >= 0 && bond.neihbid2 >= 0) {
            path = getBondSingleStereoBoldPath(render, hb1, hb2, bond, struct, isSnapping);
          } else path = getBondSingleUpPath(render, hb1, hb2, bond, struct, isSnapping);
          break;
        case Bond.PATTERN.STEREO.DOWN:
          path = getBondSingleDownPath(render, hb1, hb2, bond, struct, isSnapping);
          break;
        case Bond.PATTERN.STEREO.EITHER:
          path = getBondSingleEitherPath(render, hb1, hb2, bond, struct, isSnapping);
          break;
        default:
          path = draw.bondSingle(render.paper, hb1, hb2, render.options, isSnapping, getStereoBondColor(render.options, bond, struct));
          break;
      }
      break;
    case Bond.PATTERN.TYPE.DOUBLE:
      findIncomingUpBonds(hb1.bid, bond, restruct);
      if (bond.b.stereo === Bond.PATTERN.STEREO.NONE && bond.boldStereo && bond.neihbid1 >= 0 && bond.neihbid2 >= 0) {
        path = getBondDoubleStereoBoldPath(render, hb1, hb2, bond, struct, shiftA, shiftB, isSnapping);
      } else path = getBondDoublePath(render, hb1, hb2, bond, shiftA, shiftB, isSnapping);
      break;
    case Bond.PATTERN.TYPE.TRIPLE:
      path = draw.bondTriple(render.paper, hb1, hb2, render.options, isSnapping);
      break;
    case Bond.PATTERN.TYPE.AROMATIC:
      {
        var _struct$loops$get, _struct$loops$get2;
        var inAromaticLoop = hb1.loop >= 0 && ((_struct$loops$get = struct.loops.get(hb1.loop)) === null || _struct$loops$get === void 0 ? void 0 : _struct$loops$get.aromatic) || hb2.loop >= 0 && ((_struct$loops$get2 = struct.loops.get(hb2.loop)) === null || _struct$loops$get2 === void 0 ? void 0 : _struct$loops$get2.aromatic);
        path = inAromaticLoop ? draw.bondSingle(render.paper, hb1, hb2, render.options, isSnapping) : getBondAromaticPath(render, hb1, hb2, bond, shiftA, shiftB, isSnapping);
        break;
      }
    case Bond.PATTERN.TYPE.SINGLE_OR_DOUBLE:
      newHalfBonds = util.updateHalfBondCoordinates(hb1, hb2, xShiftPlus1);
      path = getSingleOrDoublePath(render, newHalfBonds[0], newHalfBonds[1], isSnapping);
      break;
    case Bond.PATTERN.TYPE.SINGLE_OR_AROMATIC:
      path = getBondAromaticPath(render, hb1, hb2, bond, shiftA, shiftB, isSnapping);
      break;
    case Bond.PATTERN.TYPE.DOUBLE_OR_AROMATIC:
      newHalfBonds = util.updateHalfBondCoordinates(hb1, hb2, xShiftMinus1);
      path = getBondAromaticPath(render, newHalfBonds[0], newHalfBonds[1], bond, shiftA, shiftB, isSnapping);
      break;
    case Bond.PATTERN.TYPE.ANY:
      newHalfBonds = util.updateHalfBondCoordinates(hb1, hb2, xShiftMinus1);
      path = draw.bondAny(render.paper, newHalfBonds[0], newHalfBonds[1], render.options, isSnapping);
      break;
    case Bond.PATTERN.TYPE.HYDROGEN:
      newHalfBonds = util.updateHalfBondCoordinates(hb1, hb2, xShiftPlus1);
      path = draw.bondHydrogen(render.paper, newHalfBonds[0], newHalfBonds[1], render.options, isSnapping);
      break;
    case Bond.PATTERN.TYPE.DATIVE:
      path = draw.bondDative(render.paper, hb1, hb2, render.options, isSnapping);
      break;
    default:
      throw new Error('Bond type ' + bond.b.type + ' not supported');
  }
  if (path) {
    var previewOpacity = render.options.previewOpacity;
    path.attr({
      opacity: bond.b.isPreview ? previewOpacity : 1
    });
  }
  return path;
}
function getBondSingleUpPath(render, hb1, hb2, bond, struct, isSnapping) {
  var a = hb1.p;
  var b = hb2.p;
  var options = render.options;
  var DEGENERATE_LENGTH = 1e-4;
  var n = hb1.norm;
  if (!n || n.length() < DEGENERATE_LENGTH) {
    var renderedDir = b.sub(a);
    if (renderedDir.length() < DEGENERATE_LENGTH) {
      return null;
    }
    n = renderedDir.normalized().rotateSC(1, 0);
  }
  var bsp = 0.7 * options.stereoBond;
  var b2 = b.addScaled(n, bsp);
  var b3 = b.addScaled(n, -bsp);
  if (bond.neihbid2 >= 0) {
    var coords = stereoUpBondGetCoordinates(hb2, bond.neihbid2, options.stereoBond, struct);
    b2 = coords[0];
    b3 = coords[1];
  }
  return draw.bondSingleUp(render.paper, a, b2, b3, options, isSnapping, getStereoBondColor(options, bond, struct));
}
function getStereoBondColor(options, bond, struct) {
  var _struct$atoms$get, _struct$atoms$get2, _getColorFromStereoLa;
  var defaultColor = '#000';
  if (bond.b.stereo === 0) return defaultColor;
  var beginAtomStereoLabel = (_struct$atoms$get = struct.atoms.get(bond.b.begin)) === null || _struct$atoms$get === void 0 ? void 0 : _struct$atoms$get.stereoLabel;
  var endAtomStereoLabel = (_struct$atoms$get2 = struct.atoms.get(bond.b.end)) === null || _struct$atoms$get2 === void 0 ? void 0 : _struct$atoms$get2.stereoLabel;
  var stereoLabel = '';
  if (beginAtomStereoLabel && !endAtomStereoLabel) {
    stereoLabel = beginAtomStereoLabel;
  } else if (!beginAtomStereoLabel && endAtomStereoLabel) {
    stereoLabel = endAtomStereoLabel;
  }
  if (
  !stereoLabel || options.colorStereogenicCenters === StereoColoringType.Off || options.colorStereogenicCenters === StereoColoringType.LabelsOnly) {
    return defaultColor;
  }
  return (_getColorFromStereoLa = getColorFromStereoLabel(options, stereoLabel)) !== null && _getColorFromStereoLa !== void 0 ? _getColorFromStereoLa : defaultColor;
}
function getBondSingleStereoBoldPath(render, hb1, hb2, bond, struct, isSnapping) {
  var options = render.options;
  var coords1 = stereoUpBondGetCoordinates(hb1, bond.neihbid1, options.stereoBond, struct);
  var coords2 = stereoUpBondGetCoordinates(hb2, bond.neihbid2, options.stereoBond, struct);
  var a1 = coords1[0];
  var a2 = coords1[1];
  var a3 = coords2[0];
  var a4 = coords2[1];
  return draw.bondSingleStereoBold(render.paper, a1, a2, a3, a4, options, isSnapping, getStereoBondColor(options, bond, struct));
}
function getBondDoubleStereoBoldPath(render, hb1, hb2, bond, struct, shiftA, shiftB, isSnapping) {
  var a = hb1.p;
  var b = hb2.p;
  var n = hb1.norm;
  var shift = bond.doubleBondShift;
  var bsp = 1.5 * render.options.stereoBond;
  var b1 = a.addScaled(n, bsp * shift);
  var b2 = b.addScaled(n, bsp * shift);
  if (shift > 0) {
    if (shiftA) {
      b1 = b1.addScaled(hb1.dir, bsp * getBondLineShift(hb1.rightCos, hb1.rightSin));
    }
    if (shiftB) {
      b2 = b2.addScaled(hb1.dir, -bsp * getBondLineShift(hb2.leftCos, hb2.leftSin));
    }
  } else if (shift < 0) {
    if (shiftA) {
      b1 = b1.addScaled(hb1.dir, bsp * getBondLineShift(hb1.leftCos, hb1.leftSin));
    }
    if (shiftB) {
      b2 = b2.addScaled(hb1.dir, -bsp * getBondLineShift(hb2.rightCos, hb2.rightSin));
    }
  }
  var sgBondPath = getBondSingleStereoBoldPath(render, hb1, hb2, bond, struct, isSnapping);
  return draw.bondDoubleStereoBold(render.paper, sgBondPath, b1, b2, render.options, isSnapping, getStereoBondColor(render.options, bond, struct));
}
function getBondLineShift(cos, sin) {
  if (sin < 0 || Math.abs(cos) > 0.9) return 0;
  return sin / (1 - cos);
}
function stereoUpBondGetCoordinates(hb, neihbid, bondSpace, struct) {
  var neihb = struct.halfBonds.get(neihbid);
  if (!neihb) return [hb.p, hb.p];
  var cos = Vec2.dot(hb.dir, neihb.dir);
  var sin = Vec2.cross(hb.dir, neihb.dir);
  var cosHalf = Math.sqrt(0.5 * (1 - cos));
  var biss = neihb.dir.rotateSC((sin >= 0 ? -1 : 1) * cosHalf, Math.sqrt(0.5 * (1 + cos)));
  var denomAdd = 0.3;
  var scale = 0.7;
  var a1 = hb.p.addScaled(biss, scale * bondSpace / (cosHalf + denomAdd));
  var a2 = hb.p.addScaled(biss.negated(), scale * bondSpace / (cosHalf + denomAdd));
  return sin > 0 ? [a1, a2] : [a2, a1];
}
function calculateLines(length, lineWidth, interval) {
  var usableLength = length - lineWidth;
  var linesCount = Math.max(Math.floor(usableLength / (lineWidth + interval)), 0);
  return linesCount + 2;
}
function getBondSingleDownPath(render, hb1, hb2, bond, struct, isSnapping) {
  var _options$hashSpacingI;
  var MIN_LINES = 4;
  var DEFAULT_HASH_SPACING_IN_PX = 1.2;
  var a = hb1.p;
  var b = hb2.p;
  var options = render.options;
  var d = b.sub(a);
  var len = d.length() + 0.2;
  d = d.normalized();
  var hashSpacingInPx = (_options$hashSpacingI = options.hashSpacingInPx) !== null && _options$hashSpacingI !== void 0 ? _options$hashSpacingI : DEFAULT_HASH_SPACING_IN_PX;
  var interval = hashSpacingInPx * options.lineWidth;
  var gaps = MIN_LINES - 1;
  var isHashSpacingTooLarge = interval >= len / gaps;
  var nlines = calculateLines(len, options.lineWidth, interval);
  if (isHashSpacingTooLarge && nlines < MIN_LINES) {
    var averageSpacing = (len - options.lineWidth) / gaps;
    hashSpacingInPx = averageSpacing / options.lineWidth;
  }
  var intervalAdjusted = hashSpacingInPx * options.lineWidth;
  var finalLines = calculateLines(len, options.lineWidth, intervalAdjusted);
  var step = len / (finalLines - 1);
  return draw.bondSingleDown(render.paper, hb1, d, finalLines, step, options, isSnapping, getStereoBondColor(options, bond, struct));
}
function getBondSingleEitherPath(render, hb1, hb2, bond, struct, isSnapping) {
  var a = hb1.p;
  var b = hb2.p;
  var options = render.options;
  var d = b.sub(a);
  var len = d.length();
  d = d.normalized();
  var interval = 0.6 * options.lineWidth;
  var nlines = Math.max(Math.floor((len - options.lineWidth) / (options.lineWidth + interval)), 0) + 2;
  var step = len / (nlines - 0.5);
  return draw.bondSingleEither(render.paper, hb1, d, nlines, step, options, isSnapping, getStereoBondColor(options, bond, struct));
}
function getBondDoublePath(render, hb1, hb2, bond, shiftA, shiftB, isSnapping) {
  var cisTrans = bond.b.stereo === Bond.PATTERN.STEREO.CIS_TRANS;
  var a = hb1.p;
  var b = hb2.p;
  var n = hb1.norm;
  var shift = cisTrans ? 0 : bond.doubleBondShift;
  var options = render.options;
  var bsp = options.bondSpace / 2;
  var s1 = bsp + shift * bsp;
  var s2 = -bsp + shift * bsp;
  var a1 = a.addScaled(n, s1);
  var b1 = b.addScaled(n, s1);
  var a2 = a.addScaled(n, s2);
  var b2 = b.addScaled(n, s2);
  if (shift > 0) {
    if (shiftA) {
      a1 = a1.addScaled(hb1.dir, options.bondSpace * getBondLineShift(hb1.rightCos, hb1.rightSin));
    }
    if (shiftB) {
      b1 = b1.addScaled(hb1.dir, -options.bondSpace * getBondLineShift(hb2.leftCos, hb2.leftSin));
    }
  } else if (shift < 0) {
    if (shiftA) {
      a2 = a2.addScaled(hb1.dir, options.bondSpace * getBondLineShift(hb1.leftCos, hb1.leftSin));
    }
    if (shiftB) {
      b2 = b2.addScaled(hb1.dir, -options.bondSpace * getBondLineShift(hb2.rightCos, hb2.rightSin));
    }
  }
  return draw.bondDouble(render.paper, a1, a2, b1, b2, cisTrans, options, isSnapping);
}
function getSingleOrDoublePath(render, hb1, hb2, isSnapping) {
  var a = hb1.p;
  var b = hb2.p;
  var options = render.options;
  var nSect = Vec2.dist(a, b) / Number((options.bondSpace + options.lineWidth).toFixed());
  if (!(nSect & 1)) nSect += 1;
  return draw.bondSingleOrDouble(render.paper, hb1, hb2, nSect, options, isSnapping);
}
function getBondAromaticPath(render, hb1, hb2, bond, shiftA, shiftB, isSnapping) {
  var dashdotPattern = [0.125, 0.125, 0.005, 0.125];
  var mask = 0;
  var dash = null;
  var options = render.options;
  var bondShift = bond.doubleBondShift;
  if (bond.b.type === Bond.PATTERN.TYPE.SINGLE_OR_AROMATIC) {
    mask = bondShift > 0 ? 1 : 2;
    dash = dashdotPattern.map(function (v) {
      return v * options.microModeScale;
    });
  }
  if (bond.b.type === Bond.PATTERN.TYPE.DOUBLE_OR_AROMATIC) {
    mask = 3;
    dash = dashdotPattern.map(function (v) {
      return v * options.microModeScale;
    });
  }
  var paths = getAromaticBondPaths(hb1, hb2, bondShift, shiftA, shiftB, options.bondSpace, mask, dash);
  return draw.bondAromatic(render.paper, paths, bondShift, options, isSnapping);
}
function getAromaticBondPaths(hb1, hb2, shift, shiftA, shiftB, bondSpace, mask, dash) {
  var a = hb1.p;
  var b = hb2.p;
  var n = hb1.norm;
  var bsp = bondSpace / 2;
  var s1 = bsp + shift * bsp;
  var s2 = -bsp + shift * bsp;
  var a2 = a.addScaled(n, s1);
  var b2 = b.addScaled(n, s1);
  var a3 = a.addScaled(n, s2);
  var b3 = b.addScaled(n, s2);
  if (shift > 0) {
    if (shiftA) {
      a2 = a2.addScaled(hb1.dir, bondSpace * getBondLineShift(hb1.rightCos, hb1.rightSin));
    }
    if (shiftB) {
      b2 = b2.addScaled(hb1.dir, -bondSpace * getBondLineShift(hb2.leftCos, hb2.leftSin));
    }
  } else if (shift < 0) {
    if (shiftA) {
      a3 = a3.addScaled(hb1.dir, bondSpace * getBondLineShift(hb1.leftCos, hb1.leftSin));
    }
    if (shiftB) {
      b3 = b3.addScaled(hb1.dir, -bondSpace * getBondLineShift(hb2.rightCos, hb2.rightSin));
    }
  }
  return draw.aromaticBondPaths(a2, a3, b2, b3, mask, dash);
}
function getReactingCenterPath(render, bond, hb1, hb2) {
  var a = hb1.p;
  var b = hb2.p;
  var c = b.add(a).scaled(0.5);
  var d = b.sub(a).normalized();
  var n = d.rotateSC(1, 0);
  var p = [];
  var lw = render.options.lineWidth;
  var bs = render.options.bondSpace / 2;
  var alongIntRc = lw;
  var alongIntMadeBroken = 2 * lw;
  var alongSz = 1.5 * bs;
  var acrossInt = 1.5 * bs;
  var acrossSz = 3.0 * bs;
  var tiltTan = 0.2;
  switch (bond.b.reactingCenterStatus) {
    case Bond.PATTERN.REACTING_CENTER.NOT_CENTER:
      p.push(c.addScaled(n, acrossSz).addScaled(d, tiltTan * acrossSz));
      p.push(c.addScaled(n, -acrossSz).addScaled(d, -tiltTan * acrossSz));
      p.push(c.addScaled(n, acrossSz).addScaled(d, -tiltTan * acrossSz));
      p.push(c.addScaled(n, -acrossSz).addScaled(d, tiltTan * acrossSz));
      break;
    case Bond.PATTERN.REACTING_CENTER.CENTER:
      p.push(c.addScaled(n, acrossSz).addScaled(d, tiltTan * acrossSz).addScaled(d, alongIntRc));
      p.push(c.addScaled(n, -acrossSz).addScaled(d, -tiltTan * acrossSz).addScaled(d, alongIntRc));
      p.push(c.addScaled(n, acrossSz).addScaled(d, tiltTan * acrossSz).addScaled(d, -alongIntRc));
      p.push(c.addScaled(n, -acrossSz).addScaled(d, -tiltTan * acrossSz).addScaled(d, -alongIntRc));
      p.push(c.addScaled(d, alongSz).addScaled(n, acrossInt));
      p.push(c.addScaled(d, -alongSz).addScaled(n, acrossInt));
      p.push(c.addScaled(d, alongSz).addScaled(n, -acrossInt));
      p.push(c.addScaled(d, -alongSz).addScaled(n, -acrossInt));
      break;
    case Bond.PATTERN.REACTING_CENTER.MADE_OR_BROKEN:
      p.push(c.addScaled(n, acrossSz).addScaled(d, alongIntMadeBroken));
      p.push(c.addScaled(n, -acrossSz).addScaled(d, alongIntMadeBroken));
      p.push(c.addScaled(n, acrossSz).addScaled(d, -alongIntMadeBroken));
      p.push(c.addScaled(n, -acrossSz).addScaled(d, -alongIntMadeBroken));
      break;
    case Bond.PATTERN.REACTING_CENTER.ORDER_CHANGED:
      p.push(c.addScaled(n, acrossSz));
      p.push(c.addScaled(n, -acrossSz));
      break;
    case Bond.PATTERN.REACTING_CENTER.MADE_OR_BROKEN_AND_CHANGED:
      p.push(c.addScaled(n, acrossSz).addScaled(d, alongIntMadeBroken));
      p.push(c.addScaled(n, -acrossSz).addScaled(d, alongIntMadeBroken));
      p.push(c.addScaled(n, acrossSz).addScaled(d, -alongIntMadeBroken));
      p.push(c.addScaled(n, -acrossSz).addScaled(d, -alongIntMadeBroken));
      p.push(c.addScaled(n, acrossSz));
      p.push(c.addScaled(n, -acrossSz));
      break;
    default:
      return null;
  }
  return draw.reactingCenter(render.paper, p, render.options);
}
function getBondMark(render, bond, hb1, hb2) {
  var options = render.options;
  var mark = null;
  var tooltip = null;
  if (bond.b.customQuery) {
    mark = bond.b.customQuery;
    if (bond.b.customQuery.length > 8) {
      tooltip = bond.b.customQuery;
      mark = "".concat(bond.b.customQuery.substring(0, 8), "...");
    }
  } else if (bond.b.topology === Bond.PATTERN.TOPOLOGY.RING) {
    mark = 'rng';
  } else if (bond.b.topology === Bond.PATTERN.TOPOLOGY.CHAIN) {
    mark = 'chn';
  } else {
    return null;
  }
  var a = hb1.p;
  var b = hb2.p;
  var c = b.add(a).scaled(0.5);
  var d = b.sub(a).normalized();
  var n = d.rotateSC(1, 0);
  var fixed = options.lineWidth;
  if (bond.doubleBondShift > 0) n = n.scaled(-bond.doubleBondShift);else if (bond.doubleBondShift === 0) fixed += options.bondSpace / 2;
  var s = new Vec2(2, 1).scaled(options.bondSpace);
  if (bond.b.type === Bond.PATTERN.TYPE.TRIPLE) fixed += options.bondSpace;
  var p = c.add(new Vec2(n.x * (s.x + fixed), n.y * (s.y + fixed)));
  var path = draw.bondMark(render.paper, p, mark, options);
  if (tooltip) {
    path.node.childNodes[0].setAttribute('data-tooltip', util.escapeHtml(tooltip));
  }
  return path;
}
function getIdsPath(bid, paper, hb1, hb2, bondIdxOff, param1, param2, norm) {
  var pb = Vec2.lc(hb1.p, param1, hb2.p, param2, norm, bondIdxOff);
  var ipath = paper.text(pb.x, pb.y, bid.toString());
  var irbb = util.relBox(ipath.getBBox());
  draw.recenterText(ipath, irbb);
  return ipath;
}
function setDoubleBondShift(bond, struct) {
  var hb1 = bond.b.hb1;
  var hb2 = bond.b.hb2;
  if (hb1 === undefined || hb2 === undefined) {
    bond.doubleBondShift = selectDoubleBondShiftChain(struct, bond);
    return;
  }
  var halfBond1 = struct.halfBonds.get(hb1);
  var halfBond2 = struct.halfBonds.get(hb2);
  if (!halfBond1 || !halfBond2) {
    bond.doubleBondShift = selectDoubleBondShiftChain(struct, bond);
    return;
  }
  var loop1 = halfBond1.loop;
  var loop2 = halfBond2.loop;
  if (loop1 >= 0 && loop2 >= 0) {
    var loopData1 = struct.loops.get(loop1);
    var loopData2 = struct.loops.get(loop2);
    if (!loopData1 || !loopData2) {
      bond.doubleBondShift = selectDoubleBondShiftChain(struct, bond);
      return;
    }
    var d1 = loopData1.dblBonds;
    var d2 = loopData2.dblBonds;
    var n1 = loopData1.hbs.length;
    var n2 = loopData2.hbs.length;
    bond.doubleBondShift = selectDoubleBondShift(n1, n2, d1, d2);
  } else if (loop1 >= 0) {
    bond.doubleBondShift = -1;
  } else if (loop2 >= 0) {
    bond.doubleBondShift = 1;
  } else {
    bond.doubleBondShift = selectDoubleBondShiftChain(struct, bond);
  }
}
function selectDoubleBondShift(n1, n2, d1, d2) {
  if (n1 === 6 && n2 !== 6 && (d1 > 1 || d2 === 1)) return -1;
  if (n2 === 6 && n1 !== 6 && (d2 > 1 || d1 === 1)) return 1;
  if (n2 * d1 > n1 * d2) return -1;
  if (n2 * d1 < n1 * d2) return 1;
  if (n2 > n1) return -1;
  return 1;
}
function selectDoubleBondShiftChain(struct, bond) {
  if (!bond.b.hb1 && bond.b.hb1 !== 0 || !bond.b.hb2 && bond.b.hb2 !== 0) {
    return 0;
  }
  var hb1 = struct.halfBonds.get(bond.b.hb1);
  var hb2 = struct.halfBonds.get(bond.b.hb2);
  if (!hb1 || !hb2) return 0;
  var nLeft = (hb1.leftSin > 0.3 ? 1 : 0) + (hb2.rightSin > 0.3 ? 1 : 0);
  var nRight = (hb2.leftSin > 0.3 ? 1 : 0) + (hb1.rightSin > 0.3 ? 1 : 0);
  if (nLeft > nRight) return -1;
  if (nLeft < nRight) return 1;
  if ((hb1.leftSin > 0.3 ? 1 : 0) + (hb1.rightSin > 0.3 ? 1 : 0) === 1) return 1;
  return 0;
}

export { ReBond as default, getBondLineShift };
//# sourceMappingURL=rebond.modern.js.map
