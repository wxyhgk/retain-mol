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
var reobject = require('./reobject.js');
var scale = require('../../../domain/helpers/scale.js');
require('../../../domain/helpers/functionalGroupsProvider.js');
require('../../../domain/helpers/saltsAndSolventsProvider.js');
require('../../../domain/constants/generics.js');
require('../../../domain/helpers/attachmentPointCalculations.js');

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
var ReFrag = function (_ReObject) {
  _inherits__default["default"](ReFrag, _ReObject);
  function ReFrag(frag) {
    var _this;
    _classCallCheck__default["default"](this, ReFrag);
    _this = _callSuper(this, ReFrag, ['frag']);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "item", void 0);
    _this.item = frag;
    return _this;
  }
  _createClass__default["default"](ReFrag, [{
    key: "fragGetAtoms",
    value: function fragGetAtoms(restruct, fid) {
      return Array.from(restruct.atoms.keys()).filter(function (aid) {
        var _restruct$atoms$get;
        return ((_restruct$atoms$get = restruct.atoms.get(aid)) === null || _restruct$atoms$get === void 0 ? void 0 : _restruct$atoms$get.a.fragment) === fid;
      });
    }
  }, {
    key: "fragGetBonds",
    value: function fragGetBonds(restruct, fid) {
      return Array.from(restruct.bonds.keys()).filter(function (bid) {
        var _restruct$bonds$get, _restruct$atoms$get2, _restruct$atoms$get3;
        var bond = (_restruct$bonds$get = restruct.bonds.get(bid)) === null || _restruct$bonds$get === void 0 ? void 0 : _restruct$bonds$get.b;
        if (!bond) {
          return false;
        }
        var firstFrag = (_restruct$atoms$get2 = restruct.atoms.get(bond.begin)) === null || _restruct$atoms$get2 === void 0 ? void 0 : _restruct$atoms$get2.a.fragment;
        var secondFrag = (_restruct$atoms$get3 = restruct.atoms.get(bond.end)) === null || _restruct$atoms$get3 === void 0 ? void 0 : _restruct$atoms$get3.a.fragment;
        return firstFrag === fid && secondFrag === fid;
      });
    }
  }, {
    key: "calcBBox",
    value: function calcBBox(restruct, fid, render) {
      var ret;
      restruct.atoms.forEach(function (atom) {
        if (atom.a.fragment !== fid) {
          return;
        }
        var bba = atom.visel.boundingBox;
        if (!bba) {
          bba = new box2Abs.Box2Abs(atom.a.pp, atom.a.pp);
          var ext = new vec2.Vec2(0.05 * 3, 0.05 * 3);
          bba = bba.extend(ext, ext);
        } else {
          if (!render) {
            render = global._ui_editor;
          }
          bba = bba.translate((render.options.offset || new vec2.Vec2()).negated()).transform(scale.Scale.canvasToModel, render.options);
        }
        ret = ret ? box2Abs.Box2Abs.union(ret, bba) : bba;
      });
      return ret;
    }
  }, {
    key: "_draw",
    value: function _draw(render, fid, attrs) {
      var bb = this.calcBBox(render.ctab, fid, render);
      if (bb) {
        var p0 = scale.Scale.modelToCanvas(new vec2.Vec2(bb.p0.x, bb.p0.y), render.options);
        var p1 = scale.Scale.modelToCanvas(new vec2.Vec2(bb.p1.x, bb.p1.y), render.options);
        return render.paper.rect(p0.x, p0.y, p1.x - p0.x, p1.y - p0.y, 0).attr(attrs);
      }
    }
  }, {
    key: "draw",
    value: function draw(_render) {
      return null;
    }
  }, {
    key: "drawHover",
    value: function drawHover(_render) {
    }
  }, {
    key: "setHover",
    value: function setHover(hover, render) {
      var fid = render.ctab.frags.keyOf(this);
      if (!fid && fid !== 0) {
        return;
      }
      fid = parseInt(String(fid), 10);
      render.ctab.atoms.forEach(function (atom) {
        if (atom.a.fragment === fid) {
          atom.setHover(hover, render);
        }
      });
      render.ctab.bonds.forEach(function (bond) {
        var _render$ctab$atoms$ge;
        if (((_render$ctab$atoms$ge = render.ctab.atoms.get(bond.b.begin)) === null || _render$ctab$atoms$ge === void 0 ? void 0 : _render$ctab$atoms$ge.a.fragment) === fid) {
          bond.setHover(hover, render);
        }
      });
    }
  }], [{
    key: "isSelectable",
    value: function isSelectable() {
      return false;
    }
  }]);
  return ReFrag;
}(reobject["default"]);

exports["default"] = ReFrag;
//# sourceMappingURL=refrag.js.map
