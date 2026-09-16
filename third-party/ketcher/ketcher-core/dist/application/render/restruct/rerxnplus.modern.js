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
var ReRxnPlus = function (_ReObject) {
  _inherits(ReRxnPlus, _ReObject);
  function ReRxnPlus(plus) {
    var _this;
    _classCallCheck(this, ReRxnPlus);
    _this = _callSuper(this, ReRxnPlus, ['rxnPlus']);
    _defineProperty(_assertThisInitialized(_this), "item", void 0);
    _this.item = plus;
    return _this;
  }
  _createClass(ReRxnPlus, [{
    key: "hoverPath",
    value: function hoverPath(render) {
      var p = Scale.modelToCanvas(this.item.pp, render.options);
      var s = render.options.microModeScale;
      return render.paper.rect(p.x - s / 4, p.y - s / 4, s / 2, s / 2, s / 8);
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
  }, {
    key: "show",
    value: function show(restruct, _id, options) {
      var _path$node;
      var render = restruct.render;
      var centre = Scale.modelToCanvas(this.item.pp, options);
      var path = draw.plus(render.paper, centre, options);
      var offset = options.offset;
      if (offset != null) path.translateAbs(offset.x, offset.y);
      this.visel.add(path, Box2Abs.fromRelBox(util.relBox(path.getBBox())));
      (_path$node = path.node) === null || _path$node === void 0 || _path$node.setAttribute('data-testid', 'rxn-plus');
    }
  }], [{
    key: "isSelectable",
    value: function isSelectable() {
      return true;
    }
  }]);
  return ReRxnPlus;
}(ReObject);

export { ReRxnPlus as default };
//# sourceMappingURL=rerxnplus.modern.js.map
