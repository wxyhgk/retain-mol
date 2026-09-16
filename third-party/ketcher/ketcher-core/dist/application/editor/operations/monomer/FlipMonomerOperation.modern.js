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
import { BaseOperation } from '../BaseOperation.modern.js';
import { OperationType } from '../OperationType.modern.js';
import { MonomerMicromolecule } from '../../../../domain/entities/monomerMicromolecule.modern.js';

function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var FlipMonomerOperation = function (_BaseOperation) {
  _inherits(FlipMonomerOperation, _BaseOperation);
  function FlipMonomerOperation(data) {
    var _this;
    _classCallCheck(this, FlipMonomerOperation);
    _this = _callSuper(this, FlipMonomerOperation, [OperationType.FLIP_MONOMER]);
    _defineProperty(_assertThisInitialized(_this), "data", void 0);
    _defineProperty(_assertThisInitialized(_this), "previousValue", null);
    _defineProperty(_assertThisInitialized(_this), "previousRotate", void 0);
    _this.data = data;
    return _this;
  }
  _createClass(FlipMonomerOperation, [{
    key: "execute",
    value: function execute(_restruct) {
      var _monomerSGroup$monome, _monomerTransformatio;
      var monomerSGroup = _restruct.molecule.sgroups.get(this.data.id);
      if (!monomerSGroup || !(monomerSGroup instanceof MonomerMicromolecule)) {
        return;
      }
      var monomerTransformation = (_monomerSGroup$monome = monomerSGroup.monomer.monomerItem).transformation || (_monomerSGroup$monome.transformation = {});
      this.previousValue = (_monomerTransformatio = monomerTransformation.flip) !== null && _monomerTransformatio !== void 0 ? _monomerTransformatio : null;
      this.previousRotate = monomerTransformation.rotate;
      if (this.data.value === null) {
        delete monomerTransformation.flip;
        return;
      }
      var previousFlip = monomerTransformation.flip;
      var newFlip = this.data.value;
      if (previousFlip && previousFlip !== newFlip) {
        var _this$previousRotate;
        monomerTransformation.rotate = ((_this$previousRotate = this.previousRotate) !== null && _this$previousRotate !== void 0 ? _this$previousRotate : 0) + Math.PI;
        delete monomerTransformation.flip;
        return;
      }
      monomerTransformation.flip = this.data.value;
      if (this.data.rotate) {
        var _this$previousRotate2;
        monomerTransformation.rotate = ((_this$previousRotate2 = this.previousRotate) !== null && _this$previousRotate2 !== void 0 ? _this$previousRotate2 : 0) + this.data.rotate;
      }
    }
  }, {
    key: "invert",
    value: function invert() {
      return new FlipMonomerOperation({
        id: this.data.id,
        value: this.previousValue,
        rotate: this.previousRotate ? -this.previousRotate : undefined
      });
    }
  }]);
  return FlipMonomerOperation;
}(BaseOperation);

export { FlipMonomerOperation };
//# sourceMappingURL=FlipMonomerOperation.modern.js.map
