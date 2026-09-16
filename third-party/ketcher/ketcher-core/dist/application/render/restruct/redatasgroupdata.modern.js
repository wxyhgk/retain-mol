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
import { LayerMap } from './generalEnumTypes.modern.js';
import ReObject from './reobject.modern.js';
import { Scale } from '../../../domain/helpers/scale.modern.js';
import '../../../domain/helpers/functionalGroupsProvider.modern.js';
import '../../../domain/helpers/saltsAndSolventsProvider.modern.js';
import '../../../domain/constants/generics.modern.js';
import '../../../domain/helpers/attachmentPointCalculations.modern.js';

function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var ReDataSGroupData = function (_ReObject) {
  _inherits(ReDataSGroupData, _ReObject);
  function ReDataSGroupData(sgroup) {
    var _this;
    _classCallCheck(this, ReDataSGroupData);
    _this = _callSuper(this, ReDataSGroupData, ['sgroupData']);
    _defineProperty(_assertThisInitialized(_this), "sgroup", void 0);
    _this.sgroup = sgroup;
    return _this;
  }
  _createClass(ReDataSGroupData, [{
    key: "hoverPath",
    value: function hoverPath(render) {
      var box = this.sgroup.dataArea;
      if (!box) {
        return render.paper.rect(0, 0, 0, 0);
      }
      var p0 = Scale.modelToCanvas(box.p0, render.options);
      var sz = Scale.modelToCanvas(box.p1, render.options).sub(p0);
      return render.paper.rect(p0.x, p0.y, sz.x, sz.y);
    }
  }, {
    key: "drawHover",
    value: function drawHover(render) {
      var ret = this.hoverPath(render).attr(render.options.hoverStyle);
      render.ctab.addReObjectPath(LayerMap.hovering, this.visel, ret);
      return ret;
    }
  }, {
    key: "makeSelectionPlate",
    value: function makeSelectionPlate(restruct, _paper, styles) {
      return this.hoverPath(restruct.render).attr(styles.selectionStyle);
    }
  }], [{
    key: "isSelectable",
    value: function isSelectable() {
      return true;
    }
  }]);
  return ReDataSGroupData;
}(ReObject);

export { ReDataSGroupData as default };
//# sourceMappingURL=redatasgroupdata.modern.js.map
