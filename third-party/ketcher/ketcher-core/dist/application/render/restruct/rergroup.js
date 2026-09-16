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
var box2Abs = require('../../../domain/entities/box2Abs.js');
var vec2 = require('../../../domain/entities/vec2.js');
var generalEnumTypes = require('./generalEnumTypes.js');
var reobject = require('./reobject.js');
var scale = require('../../../domain/helpers/scale.js');
require('../../../domain/helpers/functionalGroupsProvider.js');
require('../../../domain/helpers/saltsAndSolventsProvider.js');
require('../../../domain/constants/generics.js');
require('../../../domain/helpers/attachmentPointCalculations.js');
var draw = require('../draw.js');
var util = require('../util.js');

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
var BORDER_EXT = new vec2.Vec2(0.05 * 3, 0.05 * 3);
var PADDING_VECTOR = new vec2.Vec2(0.2, 0.4);
var ReRGroup = function (_ReObject) {
  _inherits__default["default"](ReRGroup, _ReObject);
  function ReRGroup(rgroup) {
    var _this;
    _classCallCheck__default["default"](this, ReRGroup);
    _this = _callSuper(this, ReRGroup, ['rgroup']);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "labelBox", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "item", void 0);
    _this.labelBox = null;
    _this.item = rgroup;
    return _this;
  }
  _createClass__default["default"](ReRGroup, [{
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
          rGroupBoundingBox = rGroupBoundingBox ? box2Abs.Box2Abs.union(rGroupBoundingBox, fragBox) : fragBox;
        }
      });
      var rGroupAttachmentPointsVBox = render.ctab.getRGroupAttachmentPointsVBoxByAtomIds(this.getAtoms(render));
      if (rGroupBoundingBox && rGroupAttachmentPointsVBox) {
        rGroupBoundingBox = box2Abs.Box2Abs.union(rGroupBoundingBox, rGroupAttachmentPointsVBox);
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
      var p0 = scale.Scale.modelToCanvas(bb.p0, options);
      var p1 = scale.Scale.modelToCanvas(bb.p1, options);
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
      var labelBox = util["default"].relBox(label.getBBox());
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
        var logicBox = util["default"].relBox(logicPath.getBBox());
        shift += logicBox.height / 2;
        logicPath.translateAbs(-logicBox.width / 2 - 6 * options.lineWidth, shift);
        shift += logicBox.height / 2 + options.lineWidth / 2;
        ret.data.push(logicPath);
        labelSet.push(logicPath);
      }
      ret.data.push(label);
      this.labelBox = box2Abs.Box2Abs.fromRelBox(labelSet.getBBox()).transform(scale.Scale.canvasToModel, render.options);
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
      var p0 = scale.Scale.modelToCanvas(bb.p0, render.options);
      var p1 = scale.Scale.modelToCanvas(bb.p1, render.options);
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
      render.ctab.addReObjectPath(generalEnumTypes.LayerMap.hovering, this.visel, ret);
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
        restruct.addReObjectPath(generalEnumTypes.LayerMap.data, this.visel, data.shift(), null, true);
      }
    }
  }], [{
    key: "isSelectable",
    value: function isSelectable() {
      return false;
    }
  }]);
  return ReRGroup;
}(reobject["default"]);
function rGroupdrawBrackets(set, render, bb, d) {
  var direction = scale.Scale.modelToCanvas(d !== null && d !== void 0 ? d : new vec2.Vec2(1, 0), render.options);
  var bracketWidth = Math.min(0.25, bb.sz().x * 0.3);
  var bracketHeight = bb.p1.y - bb.p0.y;
  var cy = 0.5 * (bb.p1.y + bb.p0.y);
  var leftBracket = draw["default"].bracket(render.paper, direction.negated(), direction.negated().rotateSC(1, 0), scale.Scale.modelToCanvas(new vec2.Vec2(bb.p0.x, cy), render.options), bracketWidth, bracketHeight, render.options);
  var rightBracket = draw["default"].bracket(render.paper, direction, direction.rotateSC(1, 0), scale.Scale.modelToCanvas(new vec2.Vec2(bb.p1.x, cy), render.options), bracketWidth, bracketHeight, render.options);
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

exports["default"] = ReRGroup;
//# sourceMappingURL=rergroup.js.map
