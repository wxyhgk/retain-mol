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
import { DrawingEntity } from './DrawingEntity.modern.js';
import { Vec2 } from './vec2.modern.js';

function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var SGroupDrawingEntity = function (_DrawingEntity) {
  _inherits(SGroupDrawingEntity, _DrawingEntity);
  function SGroupDrawingEntity(sgroup, monomer, sgroupIdInMicroMode) {
    var _this;
    _classCallCheck(this, SGroupDrawingEntity);
    _this = _callSuper(this, SGroupDrawingEntity, [SGroupDrawingEntity.getCenter(sgroup, monomer)]);
    _defineProperty(_assertThisInitialized(_this), "sgroup", void 0);
    _defineProperty(_assertThisInitialized(_this), "monomer", void 0);
    _defineProperty(_assertThisInitialized(_this), "sgroupIdInMicroMode", void 0);
    _defineProperty(_assertThisInitialized(_this), "renderer", void 0);
    _this.sgroup = sgroup;
    _this.monomer = monomer;
    _this.sgroupIdInMicroMode = sgroupIdInMicroMode;
    return _this;
  }
  _createClass(SGroupDrawingEntity, [{
    key: "center",
    get: function get() {
      return SGroupDrawingEntity.getCenter(this.sgroup, this.monomer);
    }
  }, {
    key: "setRenderer",
    value: function setRenderer(renderer) {
      _get(_getPrototypeOf(SGroupDrawingEntity.prototype), "setBaseRenderer", this).call(this, renderer);
      this.renderer = renderer;
    }
  }], [{
    key: "getCenter",
    value: function getCenter(sgroup, monomer) {
      var atoms = sgroup.atoms.map(function (atomId) {
        var _monomer$monomerItem$;
        return (_monomer$monomerItem$ = monomer.monomerItem.struct.atoms.get(atomId)) === null || _monomer$monomerItem$ === void 0 ? void 0 : _monomer$monomerItem$.pp;
      }).filter(function (position) {
        return position instanceof Vec2;
      });
      if (atoms.length === 0) {
        return monomer.position;
      }
      var atomWeight = 1 / atoms.length;
      return atoms.reduce(function (center, position) {
        return center.addScaled(position, atomWeight);
      }, new Vec2());
    }
  }]);
  return SGroupDrawingEntity;
}(DrawingEntity);

export { SGroupDrawingEntity };
//# sourceMappingURL=SGroupDrawingEntity.modern.js.map
