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
var BondType;
(function (BondType) {
  BondType[BondType["None"] = 0] = "None";
  BondType[BondType["Single"] = 1] = "Single";
  BondType[BondType["Double"] = 2] = "Double";
  BondType[BondType["Triple"] = 3] = "Triple";
  BondType[BondType["Aromatic"] = 4] = "Aromatic";
  BondType[BondType["SingleDouble"] = 5] = "SingleDouble";
  BondType[BondType["SingleAromatic"] = 6] = "SingleAromatic";
  BondType[BondType["DoubleAromatic"] = 7] = "DoubleAromatic";
  BondType[BondType["Any"] = 8] = "Any";
  BondType[BondType["Dative"] = 9] = "Dative";
  BondType[BondType["Hydrogen"] = 10] = "Hydrogen";
})(BondType || (BondType = {}));
var BondStereo;
(function (BondStereo) {
  BondStereo[BondStereo["None"] = 0] = "None";
  BondStereo[BondStereo["Up"] = 1] = "Up";
  BondStereo[BondStereo["Either"] = 4] = "Either";
  BondStereo[BondStereo["Down"] = 6] = "Down";
  BondStereo[BondStereo["CisTrans"] = 3] = "CisTrans";
})(BondStereo || (BondStereo = {}));
var Bond = function (_DrawingEntity) {
  _inherits(Bond, _DrawingEntity);
  function Bond(firstAtom, secondAtom, bondIdInMicroMode) {
    var _this;
    var type = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : BondType.Single;
    var stereo = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : BondStereo.None;
    var cip = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : null;
    _classCallCheck(this, Bond);
    _this = _callSuper(this, Bond, [firstAtom.position]);
    _defineProperty(_assertThisInitialized(_this), "firstAtom", void 0);
    _defineProperty(_assertThisInitialized(_this), "secondAtom", void 0);
    _defineProperty(_assertThisInitialized(_this), "bondIdInMicroMode", void 0);
    _defineProperty(_assertThisInitialized(_this), "type", void 0);
    _defineProperty(_assertThisInitialized(_this), "stereo", void 0);
    _defineProperty(_assertThisInitialized(_this), "cip", void 0);
    _defineProperty(_assertThisInitialized(_this), "endPosition", new Vec2());
    _defineProperty(_assertThisInitialized(_this), "renderer", undefined);
    _this.firstAtom = firstAtom;
    _this.secondAtom = secondAtom;
    _this.bondIdInMicroMode = bondIdInMicroMode;
    _this.type = type;
    _this.stereo = stereo;
    _this.cip = cip;
    _this.endPosition = secondAtom.position;
    return _this;
  }
  _createClass(Bond, [{
    key: "setRenderer",
    value: function setRenderer(renderer) {
      _get(_getPrototypeOf(Bond.prototype), "setBaseRenderer", this).call(this, renderer);
      this.renderer = renderer;
    }
  }, {
    key: "startPosition",
    get: function get() {
      return this.position;
    }
  }, {
    key: "center",
    get: function get() {
      return Vec2.centre(this.startPosition, this.endPosition);
    }
  }, {
    key: "moveBondStartAbsolute",
    value: function moveBondStartAbsolute(x, y) {
      this.moveAbsolute(new Vec2(x, y));
    }
  }, {
    key: "moveBondEndAbsolute",
    value: function moveBondEndAbsolute(x, y) {
      this.endPosition = new Vec2(x, y);
    }
  }, {
    key: "moveToLinkedAtoms",
    value: function moveToLinkedAtoms() {
      var firstAtomCenter = this.firstAtom.position;
      var secondAtomCenter = this.secondAtom.position;
      this.moveBondStartAbsolute(firstAtomCenter.x, firstAtomCenter.y);
      if (secondAtomCenter) {
        this.moveBondEndAbsolute(secondAtomCenter.x, secondAtomCenter.y);
      }
    }
  }, {
    key: "moveToLinkedEntities",
    value: function moveToLinkedEntities() {
      this.moveToLinkedAtoms();
    }
  }]);
  return Bond;
}(DrawingEntity);

export { Bond, BondStereo, BondType };
//# sourceMappingURL=CoreBond.modern.js.map
