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
import { BaseOperation } from './BaseOperation.modern.js';
import { OperationType } from './OperationType.modern.js';
import '../../../utilities/runAsyncAction.modern.js';
import { KetcherLogger } from '../../../utilities/KetcherLogger.modern.js';
import '../../../utilities/SettingsManager.modern.js';
import '../../../utilities/keynorm.modern.js';
import 'react-device-detect';
import '../../../utilities/clipboardUtils.modern.js';

function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var CanvasLoad = function (_BaseOperation) {
  _inherits(CanvasLoad, _BaseOperation);
  function CanvasLoad(struct) {
    var _this;
    _classCallCheck(this, CanvasLoad);
    _this = _callSuper(this, CanvasLoad, [OperationType.CANVAS_LOAD]);
    _defineProperty(_assertThisInitialized(_this), "data", void 0);
    _this.data = {
      struct: struct
    };
    return _this;
  }
  _createClass(CanvasLoad, [{
    key: "execute",
    value: function execute(restruct) {
      KetcherLogger.log('CanvasLoad.execute(), start');
      if (restruct.molecule === this.data.struct) throw new Error("Unexpected data.struct loaded is equal to the restruct.molecule current");
      restruct.clearVisels();
      var oldStruct = restruct.molecule;
      if (this.data.struct) {
        restruct.render.setMolecule(this.data.struct, true);
      }
      this.data.struct = oldStruct;
      KetcherLogger.log('CanvasLoad.execute(), end');
    }
  }, {
    key: "invert",
    value: function invert() {
      var inverted = new CanvasLoad();
      inverted.data = this.data;
      return inverted;
    }
  }]);
  return CanvasLoad;
}(BaseOperation);

export { CanvasLoad };
//# sourceMappingURL=CanvasLoad.modern.js.map
