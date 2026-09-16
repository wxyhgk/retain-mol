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
import { RGroup } from '../../../entities/rgroup.modern.js';
import { ifDef } from '../../../../utilities/ifDef.modern.js';
import '../../../../utilities/runAsyncAction.modern.js';
import '../../../../utilities/KetcherLogger.modern.js';
import '../../../../utilities/SettingsManager.modern.js';
import '../../../../utilities/keynorm.modern.js';
import 'react-device-detect';
import '../../../../utilities/clipboardUtils.modern.js';
import { moleculeToStruct } from './moleculeToStruct.modern.js';

function rgroupToStruct(ketItem) {
  var struct = moleculeToStruct(ketItem);
  var rgroup = rgroupLogicToStruct(ketItem.rlogic);
  struct.frags.forEach(function (_value, key) {
    rgroup.frags.add(key);
  });
  if (ketItem.rlogic) struct.rgroups.set(ketItem.rlogic.number, rgroup);
  return struct;
}
function rgroupLogicToStruct(rglogic) {
  var params = {};
  ifDef(params, 'range', rglogic.range);
  ifDef(params, 'resth', rglogic.resth);
  ifDef(params, 'ifthen', rglogic.ifthen);
  return new RGroup(params);
}

export { rgroupLogicToStruct, rgroupToStruct };
//# sourceMappingURL=rgroupToStruct.modern.js.map
