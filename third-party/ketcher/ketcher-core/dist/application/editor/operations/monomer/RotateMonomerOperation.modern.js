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
var RotateMonomerOperation = function (_BaseOperation) {
  _inherits(RotateMonomerOperation, _BaseOperation);
  function RotateMonomerOperation(data) {
    var _this;
    _classCallCheck(this, RotateMonomerOperation);
    _this = _callSuper(this, RotateMonomerOperation, [OperationType.ROTATE_MONOMER]);
    _defineProperty(_assertThisInitialized(_this), "data", void 0);
    _defineProperty(_assertThisInitialized(_this), "previousValue", null);
    _this.data = data;
    return _this;
  }
  _createClass(RotateMonomerOperation, [{
    key: "execute",
    value: function execute(restruct) {
      var _monomerSGroup$monome, _monomerTransformatio;
      var monomerSGroup = restruct.molecule.sgroups.get(this.data.id);
      if (!monomerSGroup || !(monomerSGroup instanceof MonomerMicromolecule)) {
        return;
      }
      var monomerTransformation = (_monomerSGroup$monome = monomerSGroup.monomer.monomerItem).transformation || (_monomerSGroup$monome.transformation = {});
      this.previousValue = (_monomerTransformatio = monomerTransformation.rotate) !== null && _monomerTransformatio !== void 0 ? _monomerTransformatio : 0;
      if (this.data.value === null) {
        delete monomerTransformation.rotate;
        return;
      }
      monomerTransformation.rotate = this.previousValue + this.data.value;
    }
  }, {
    key: "invert",
    value: function invert() {
      return new RotateMonomerOperation({
        id: this.data.id,
        value: this.data.value === null ? this.previousValue : -this.data.value
      });
    }
  }, {
    key: "isDummy",
    value: function isDummy() {
      return this.data.value === 0;
    }
  }]);
  return RotateMonomerOperation;
}(BaseOperation);

export { RotateMonomerOperation };
//# sourceMappingURL=RotateMonomerOperation.modern.js.map
