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
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var rgroup = require('../../../entities/rgroup.js');
var ifDef = require('../../../../utilities/ifDef.js');
require('../../../../utilities/runAsyncAction.js');
require('../../../../utilities/KetcherLogger.js');
require('../../../../utilities/SettingsManager.js');
require('../../../../utilities/keynorm.js');
require('react-device-detect');
require('../../../../utilities/clipboardUtils.js');
var moleculeToStruct = require('./moleculeToStruct.js');

function rgroupToStruct(ketItem) {
  var struct = moleculeToStruct.moleculeToStruct(ketItem);
  var rgroup = rgroupLogicToStruct(ketItem.rlogic);
  struct.frags.forEach(function (_value, key) {
    rgroup.frags.add(key);
  });
  if (ketItem.rlogic) struct.rgroups.set(ketItem.rlogic.number, rgroup);
  return struct;
}
function rgroupLogicToStruct(rglogic) {
  var params = {};
  ifDef.ifDef(params, 'range', rglogic.range);
  ifDef.ifDef(params, 'resth', rglogic.resth);
  ifDef.ifDef(params, 'ifthen', rglogic.ifthen);
  return new rgroup.RGroup(params);
}

exports.rgroupLogicToStruct = rgroupLogicToStruct;
exports.rgroupToStruct = rgroupToStruct;
//# sourceMappingURL=rgroupToStruct.js.map
