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
import _defineProperty from '@babel/runtime/helpers/defineProperty';
import { Molfile } from './molfile.modern.js';
import '../../../utilities/runAsyncAction.modern.js';
import { KetcherLogger } from '../../../utilities/KetcherLogger.modern.js';
import '../../../utilities/SettingsManager.modern.js';
import '../../../utilities/keynorm.modern.js';
import 'react-device-detect';
import '../../../utilities/clipboardUtils.modern.js';
import { KetSerializer } from '../ket/ketSerializer.modern.js';

function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
var MolSerializer = function () {
  function MolSerializer(options) {
    _classCallCheck(this, MolSerializer);
    _defineProperty(this, "options", void 0);
    this.options = _objectSpread(_objectSpread({}, MolSerializer.DefaultOptions), options);
  }
  _createClass(MolSerializer, [{
    key: "deserialize",
    value: function deserialize(content) {
      var molfile = new Molfile();
      var lines = content === null || content === void 0 ? void 0 : content.split(/\r\n|[\n\r]/g);
      var parseCTFileParams = {
        molfileLines: lines,
        shouldReactionRelayout: this.options.reactionRelayout,
        ignoreChiralFlag: this.options.ignoreChiralFlag
      };
      try {
        return molfile.parseCTFile(parseCTFileParams);
      } catch (e) {
        KetcherLogger.error('molSerializer::MolSerializer::deserialize', e);
        if (this.options.badHeaderRecover) {
          try {
            return molfile.parseCTFile(_objectSpread(_objectSpread({}, parseCTFileParams), {}, {
              molfileLines: lines.slice(1)
            }));
          } catch (e1) {
            KetcherLogger.error('molSerializer::MolSerializer::deserialize', e1);
          }
          try {
            return molfile.parseCTFile(_objectSpread(_objectSpread({}, parseCTFileParams), {}, {
              molfileLines: [''].concat(lines)
            }));
          } catch (e2) {
            KetcherLogger.error('molSerializer::MolSerializer::deserialize', e2);
          }
        }
        throw e;
      }
    }
  }, {
    key: "serialize",
    value: function serialize(_struct) {
      var struct = KetSerializer.removeLeavingGroupsFromConnectedAtoms(_struct);
      return new Molfile().saveMolecule(struct, this.options.ignoreErrors, this.options.noRgroups, this.options.preserveIndigoDesc);
    }
  }]);
  return MolSerializer;
}();
_defineProperty(MolSerializer, "DefaultOptions", {
  badHeaderRecover: false,
  ignoreErrors: false,
  noRgroups: false,
  preserveIndigoDesc: false,
  reactionRelayout: false
});

export { MolSerializer };
//# sourceMappingURL=molSerializer.modern.js.map
