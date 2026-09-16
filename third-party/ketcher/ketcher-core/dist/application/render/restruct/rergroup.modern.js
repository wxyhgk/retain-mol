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
import { Box2Abs } from '../../../domain/entities/box2Abs.modern.js';
import { Vec2 } from '../../../domain/entities/vec2.modern.js';
import { LayerMap } from './generalEnumTypes.modern.js';
import ReObject from './reobject.modern.js';
import { Scale } from '../../../domain/helpers/scale.modern.js';
import '../../../domain/helpers/functionalGroupsProvider.modern.js';
import '../../../domain/helpers/saltsAndSolventsProvider.modern.js';
import '../../../domain/constants/generics.modern.js';
import '../../../domain/helpers/attachmentPointCalculations.modern.js';
import draw from '../draw.modern.js';
import util from '../util.modern.js';

function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var BORDER_EXT = new Vec2(0.05 * 3, 0.05 * 3);
var PADDING_VECTOR = new Vec2(0.2, 0.4);
var ReRGroup = function (_ReObject) {
  _inherits(ReRGroup, _ReObject);
  function ReRGroup(rgroup) {
    var _this;
    _classCallCheck(this, ReRGroup);
    _this = _callSuper(this, ReRGroup, ['rgroup']);
    _defineProperty(_assertThisInitialized(_this), "labelBox", void 0);
    _defineProperty(_assertThisInitialized(_this), "item", void 0);
    _this.labelBox = null;
    _this.item = rgroup;
    return _this;
  }
  _createClass(ReRGroup, [{
    key: "getAtoms",
    value: function getAtoms(render) {
      var ret = [];
      this.item.frags.forEach(function (fid) {
        var frag = render.ctab.frags.get(fid);
        if (frag) {
          ret = ret.concat(frag.fragGetAtoms(render.ctab, fid));
        }
      });
      return ret;
    }
  }, {
    key: "getBonds",
    value: function getBonds(render) {
      var ret = [];
      this.item.frags.forEach(function (fid) {
        var frag = render.ctab.frags.get(fid);
        if (frag) {
          ret = ret.concat(frag.fragGetBonds(render.ctab, fid));
        }
      });
      return ret;
    }
  }, {
    key: "calcBBox",
    value: function calcBBox(render) {
      var rGroupBoundingBox = null;
      this.item.frags.forEach(function (fid) {
        var frag = render.ctab.frags.get(fid);
        var fragBox = frag === null || frag === void 0 ? void 0 : frag.calcBBox(render.ctab, fid, render);
        if (fragBox) {
          rGroupBoundingBox = rGroupBoundingBox ? Box2Abs.union(rGroupBoundingBox, fragBox) : fragBox;
        }
      });
      var rGroupAttachmentPointsVBox = render.ctab.getRGroupAttachmentPointsVBoxByAtomIds(this.getAtoms(render));
      if (rGroupBoundingBox && rGroupAttachmentPointsVBox) {
        rGroupBoundingBox = Box2Abs.union(rGroupBoundingBox, rGroupAttachmentPointsVBox);
      }
      rGroupBoundingBox = rGroupBoundingBox ? rGroupBoundingBox.extend(BORDER_EXT, BORDER_EXT) : rGroupBoundingBox;
      return rGroupBoundingBox;
    }
  }, {
    key: "draw",
    value: function draw(render, options) {
      var bb = this.calcBBox(render);
      if (!bb) {
        return {
          data: []
        };
      } else {
        bb = bb.extend(PADDING_VECTOR, PADDING_VECTOR);
      }
      var ret = {
        data: []
      };
      var p0 = Scale.modelToCanvas(bb.p0, options);
      var p1 = Scale.modelToCanvas(bb.p1, options);
      var brackets = render.paper.set();
      rGroupdrawBrackets(brackets, render, bb);
      ret.data.push(brackets);
      var key = render.ctab.rgroups.keyOf(this);
      var labelSet = render.paper.set();
      var label = render.paper.text(p0.x, (p0.y + p1.y) / 2, 'R' + key + '=').attr({
        font: options.font,
        'font-size': options.fontRLabel,
        fill: 'black'
      });
      var labelBox = util.relBox(label.getBBox());
      label.translateAbs(-labelBox.width / 2 - options.lineWidth, 0);
      labelSet.push(label);
      var logicStyle = {
        font: options.font,
        'font-size': options.fontRLogic,
        fill: 'black'
      };
      var logic = [rLogicToString(key, this.item)];
      var shift = labelBox.height / 2 + options.lineWidth / 2;
      for (var _i = 0, _logic = logic; _i < _logic.length; _i++) {
        var logicItem = _logic[_i];
        var logicPath = render.paper.text(p0.x, (p0.y + p1.y) / 2, logicItem).attr(logicStyle);
        var logicBox = util.relBox(logicPath.getBBox());
        shift += logicBox.height / 2;
        logicPath.translateAbs(-logicBox.width / 2 - 6 * options.lineWidth, shift);
        shift += logicBox.height / 2 + options.lineWidth / 2;
        ret.data.push(logicPath);
        labelSet.push(logicPath);
      }
      ret.data.push(label);
      this.labelBox = Box2Abs.fromRelBox(labelSet.getBBox()).transform(Scale.canvasToModel, render.options);
      return ret;
    }
  }, {
    key: "_draw",
    value: function _draw(render, _rgid, attrs) {
      var vbox = this.getVBoxObj(render);
      if (!vbox) {
        return null;
      }
      var bb = vbox.extend(BORDER_EXT, BORDER_EXT);
      if (!bb) {
        return null;
      }
      var p0 = Scale.modelToCanvas(bb.p0, render.options);
      var p1 = Scale.modelToCanvas(bb.p1, render.options);
      return render.paper.rect(p0.x, p0.y, p1.x - p0.x, p1.y - p0.y, 0).attr(attrs);
    }
  }, {
    key: "drawHover",
    value: function drawHover(render) {
      var rgid = render.ctab.rgroups.keyOf(this);
      if (!rgid) {
        return null;
      }
      var ret = this._draw(render, rgid, render.options.hoverStyle);
      render.ctab.addReObjectPath(LayerMap.hovering, this.visel, ret);
      this.item.frags.forEach(function (_fnum, fid) {
        var _render$ctab$frags$ge;
        (_render$ctab$frags$ge = render.ctab.frags.get(fid)) === null || _render$ctab$frags$ge === void 0 || _render$ctab$frags$ge.drawHover(render);
      });
      return ret;
    }
  }, {
    key: "show",
    value: function show(restruct, _id, options) {
      var _this$draw = this.draw(restruct.render, options),
        data = _this$draw.data;
      while (data.length > 0) {
        restruct.addReObjectPath(LayerMap.data, this.visel, data.shift(), null, true);
      }
    }
  }], [{
    key: "isSelectable",
    value: function isSelectable() {
      return false;
    }
  }]);
  return ReRGroup;
}(ReObject);
function rGroupdrawBrackets(set, render, bb, d) {
  var direction = Scale.modelToCanvas(d !== null && d !== void 0 ? d : new Vec2(1, 0), render.options);
  var bracketWidth = Math.min(0.25, bb.sz().x * 0.3);
  var bracketHeight = bb.p1.y - bb.p0.y;
  var cy = 0.5 * (bb.p1.y + bb.p0.y);
  var leftBracket = draw.bracket(render.paper, direction.negated(), direction.negated().rotateSC(1, 0), Scale.modelToCanvas(new Vec2(bb.p0.x, cy), render.options), bracketWidth, bracketHeight, render.options);
  var rightBracket = draw.bracket(render.paper, direction, direction.rotateSC(1, 0), Scale.modelToCanvas(new Vec2(bb.p1.x, cy), render.options), bracketWidth, bracketHeight, render.options);
  set.push(leftBracket, rightBracket);
}
function rLogicToString(id, rLogic) {
  var ifThen = rLogic.ifthen > 0 ? 'IF ' : '';
  var rangeExists = rLogic.range.startsWith('>') || rLogic.range.startsWith('<') || rLogic.range.startsWith('=');
  var range;
  if (rLogic.range.length > 0) {
    range = rangeExists ? rLogic.range : '=' + rLogic.range;
  } else {
    range = '>0';
  }
  var restH = rLogic.resth ? ' (RestH)' : '';
  var nextRg = rLogic.ifthen > 0 ? '\nTHEN R' + rLogic.ifthen.toString() : '';
  return "".concat(ifThen, "R").concat(String(id)).concat(range).concat(restH).concat(nextRg);
}

export { ReRGroup as default };
//# sourceMappingURL=rergroup.modern.js.map
