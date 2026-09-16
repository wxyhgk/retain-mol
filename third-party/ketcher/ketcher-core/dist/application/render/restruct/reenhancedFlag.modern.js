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
import _defineProperty from '@babel/runtime/helpers/defineProperty';
import _classCallCheck from '@babel/runtime/helpers/classCallCheck';
import _createClass from '@babel/runtime/helpers/createClass';
import _possibleConstructorReturn from '@babel/runtime/helpers/possibleConstructorReturn';
import _getPrototypeOf from '@babel/runtime/helpers/getPrototypeOf';
import _assertThisInitialized from '@babel/runtime/helpers/assertThisInitialized';
import _inherits from '@babel/runtime/helpers/inherits';
import _classPrivateFieldSet from '@babel/runtime/helpers/classPrivateFieldSet';
import _classPrivateFieldGet from '@babel/runtime/helpers/classPrivateFieldGet';
import { Box2Abs } from '../../../domain/entities/box2Abs.modern.js';
import { Fragment, StereoFlag } from '../../../domain/entities/fragment.modern.js';
import { LayerMap } from './generalEnumTypes.modern.js';
import ReObject from './reobject.modern.js';
import { Scale } from '../../../domain/helpers/scale.modern.js';
import '../../../domain/helpers/functionalGroupsProvider.modern.js';
import '../../../domain/helpers/saltsAndSolventsProvider.modern.js';
import '../../../domain/constants/generics.modern.js';
import '../../../domain/helpers/attachmentPointCalculations.modern.js';

function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
function _classPrivateFieldInitSpec(e, t, a) { _checkPrivateRedeclaration(e, t), t.set(e, a); }
function _checkPrivateRedeclaration(e, t) { if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object"); }
var _path = new WeakMap();
var ReEnhancedFlag = function (_ReObject) {
  _inherits(ReEnhancedFlag, _ReObject);
  function ReEnhancedFlag() {
    var _this;
    _classCallCheck(this, ReEnhancedFlag);
    _this = _callSuper(this, ReEnhancedFlag, ['enhancedFlag']);
    _classPrivateFieldInitSpec(_assertThisInitialized(_this), _path, {
      writable: true,
      value: void 0
    });
    return _this;
  }
  _createClass(ReEnhancedFlag, [{
    key: "hoverPath",
    value: function hoverPath(render) {
      var box = Box2Abs.fromRelBox(_classPrivateFieldGet(this, _path).getBBox());
      var sz = box.p1.sub(box.p0);
      var p0 = box.p0.sub(render.options.offset);
      return render.paper.rect(p0.x, p0.y, sz.x, sz.y);
    }
  }, {
    key: "drawHover",
    value: function drawHover(render) {
      var _classPrivateFieldGet2;
      if (!((_classPrivateFieldGet2 = _classPrivateFieldGet(this, _path)) !== null && _classPrivateFieldGet2 !== void 0 && _classPrivateFieldGet2.attrs)) return null;
      var ret = this.hoverPath(render).attr(render.options.hoverStyle);
      render.ctab.addReObjectPath(LayerMap.hovering, this.visel, ret);
      return ret;
    }
  }, {
    key: "makeSelectionPlate",
    value: function makeSelectionPlate(restruct, _paper, options) {
      var _classPrivateFieldGet3;
      if (!((_classPrivateFieldGet3 = _classPrivateFieldGet(this, _path)) !== null && _classPrivateFieldGet3 !== void 0 && _classPrivateFieldGet3.attrs)) return null;
      return this.hoverPath(restruct.render).attr(options.selectionStyle);
    }
  }, {
    key: "show",
    value: function show(restruct, fragmentId, options) {
      var render = restruct.render;
      var fragment = restruct.molecule.frags.get(fragmentId);
      if (!(fragment !== null && fragment !== void 0 && fragment.enhancedStereoFlag)) {
        return;
      }
      var position = fragment.stereoFlagPosition || Fragment.getDefaultStereoFlagPosition(restruct.molecule, fragmentId);
      if (!position) {
        return;
      }
      var paper = render.paper;
      var ps = Scale.modelToCanvas(position, options);
      var stereoFlagMap = _defineProperty(_defineProperty(_defineProperty(_defineProperty({}, StereoFlag.Abs, options.absFlagLabel), StereoFlag.And, options.andFlagLabel), StereoFlag.Mixed, options.mixedFlagLabel), StereoFlag.Or, options.orFlagLabel);
      if (options.showStereoFlags && !options.ignoreChiralFlag) {
        _classPrivateFieldSet(this, _path, paper.text(ps.x, ps.y, fragment.enhancedStereoFlag ? stereoFlagMap[fragment.enhancedStereoFlag] : '').attr({
          font: options.font,
          'font-size': options.fontszInPx,
          fill: '#000'
        }));
      }
      render.ctab.addReObjectPath(LayerMap.data, this.visel, _classPrivateFieldGet(this, _path), null, true);
    }
  }], [{
    key: "isSelectable",
    value: function isSelectable() {
      return true;
    }
  }]);
  return ReEnhancedFlag;
}(ReObject);

export { ReEnhancedFlag as default };
//# sourceMappingURL=reenhancedFlag.modern.js.map
