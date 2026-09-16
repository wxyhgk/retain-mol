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
import { ifDef } from '../../../../utilities/ifDef.modern.js';
import '../../../../utilities/runAsyncAction.modern.js';
import '../../../../utilities/KetcherLogger.modern.js';
import '../../../../utilities/SettingsManager.modern.js';
import '../../../../utilities/keynorm.modern.js';
import 'react-device-detect';
import '../../../../utilities/clipboardUtils.modern.js';
import { moleculeToKet } from './moleculeToKet.modern.js';

function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function rgroupToKet(struct, data) {
  var body = _objectSpread({
    rlogic: rgroupLogicToKet(data.rgnumber, data.rgroup)
  }, moleculeToKet(struct));
  return _objectSpread(_objectSpread({}, body), {}, {
    type: 'rgroup'
  });
}
function rgroupLogicToKet(rgnumber, rglogic) {
  var result = {};
  ifDef(result, 'number', rgnumber);
  ifDef(result, 'range', rglogic.range, '');
  ifDef(result, 'resth', rglogic.resth, false);
  ifDef(result, 'ifthen', rglogic.ifthen, 0);
  return result;
}

export { rgroupToKet };
//# sourceMappingURL=rgroupToKet.modern.js.map
