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
import ReObject from './reobject.modern.js';
import { Scale } from '../../../domain/helpers/scale.modern.js';
import '../../../domain/helpers/functionalGroupsProvider.modern.js';
import '../../../domain/helpers/saltsAndSolventsProvider.modern.js';
import '../../../domain/constants/generics.modern.js';
import '../../../domain/helpers/attachmentPointCalculations.modern.js';

function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var ReFrag = function (_ReObject) {
  _inherits(ReFrag, _ReObject);
  function ReFrag(frag) {
    var _this;
    _classCallCheck(this, ReFrag);
    _this = _callSuper(this, ReFrag, ['frag']);
    _defineProperty(_assertThisInitialized(_this), "item", void 0);
    _this.item = frag;
    return _this;
  }
  _createClass(ReFrag, [{
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
          bba = new Box2Abs(atom.a.pp, atom.a.pp);
          var ext = new Vec2(0.05 * 3, 0.05 * 3);
          bba = bba.extend(ext, ext);
        } else {
          if (!render) {
            render = global._ui_editor;
          }
          bba = bba.translate((render.options.offset || new Vec2()).negated()).transform(Scale.canvasToModel, render.options);
        }
        ret = ret ? Box2Abs.union(ret, bba) : bba;
      });
      return ret;
    }
  }, {
    key: "_draw",
    value: function _draw(render, fid, attrs) {
      var bb = this.calcBBox(render.ctab, fid, render);
      if (bb) {
        var p0 = Scale.modelToCanvas(new Vec2(bb.p0.x, bb.p0.y), render.options);
        var p1 = Scale.modelToCanvas(new Vec2(bb.p1.x, bb.p1.y), render.options);
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
}(ReObject);

export { ReFrag as default };
//# sourceMappingURL=refrag.modern.js.map
