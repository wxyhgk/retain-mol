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

var atom = require('../../../entities/atom.js');
var bond = require('../../../entities/bond.js');
var elements = require('../../../constants/elements.js');
require('../../../constants/element.types.js');
require('../../../constants/generics.js');
require('../../../constants/chains.js');
require('../../../constants/monomers.js');
var ifDef = require('../../../../utilities/ifDef.js');
require('../../../../utilities/runAsyncAction.js');
require('../../../../utilities/KetcherLogger.js');
require('../../../../utilities/SettingsManager.js');
require('../../../../utilities/keynorm.js');
require('react-device-detect');
require('../../../../utilities/clipboardUtils.js');

function atomToStruct(source) {
  var _params$queryProperti;
  var params = {};
  var queryAttribute = ['aromaticity', 'ringMembership', 'connectivity', 'ringSize', 'chirality', 'customQuery'];
  if (source.type === 'atom-list') {
    params.label = 'L#';
    var ids = source.elements.map(function (el) {
      var _Elements$get;
      return (_Elements$get = elements.Elements.get(el)) === null || _Elements$get === void 0 ? void 0 : _Elements$get.number;
    }).filter(function (id) {
      return id;
    });
    ifDef.ifDef(params, 'atomList', {
      ids: ids,
      notList: source.notList
    });
  } else {
    ifDef.ifDef(params, 'label', source.label);
    ifDef.ifDef(params, 'aam', source.mapping);
  }
  ifDef.ifDef(params, 'alias', source.alias);
  ifDef.ifDef(params, 'pp', {
    x: source.location[0],
    y: -source.location[1],
    z: source.location[2] || 0.0
  });
  ifDef.ifDef(params, 'charge', source.charge);
  ifDef.ifDef(params, 'explicitValence', source.explicitValence);
  ifDef.ifDef(params, 'isotope', source.isotope);
  ifDef.ifDef(params, 'radical', source.radical);
  ifDef.ifDef(params, 'cip', source.cip);
  ifDef.ifDef(params, 'attachmentPoints', source.attachmentPoints);
  ifDef.ifDef(params, 'stereoLabel', source.stereoLabel);
  ifDef.ifDef(params, 'stereoParity', source.stereoParity);
  ifDef.ifDef(params, 'weight', source.weight);
  ifDef.ifDef(params, 'ringBondCount', source.ringBondCount);
  ifDef.ifDef(params, 'substitutionCount', source.substitutionCount);
  ifDef.ifDef(params, 'unsaturatedAtom', Number(Boolean(source.unsaturatedAtom)));
  ifDef.ifDef(params, 'hCount', source.hCount);
  if (source.queryProperties && Object.values(source.queryProperties).some(function (property) {
    return property !== null;
  })) {
    params.queryProperties = {};
    var queryProperties = params.queryProperties;
    queryAttribute.forEach(function (attributeName) {
      ifDef.ifDef(queryProperties, attributeName, source.queryProperties[attributeName]);
    });
  }
  if ((_params$queryProperti = params.queryProperties) !== null && _params$queryProperti !== void 0 && _params$queryProperti.customQuery) {
    params.label = 'A';
  }
  ifDef.ifDef(params, 'invRet', source.invRet);
  ifDef.ifDef(params, 'exactChangeFlag', Number(Boolean(source.exactChangeFlag)));
  ifDef.ifDef(params, 'implicitHCount', source.implicitHCount);
  var newAtom = new atom.Atom(params);
  newAtom.setInitiallySelected(source.selected);
  return newAtom;
}
function bondToStruct(source) {
  var atomOffset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  var params = {};
  ifDef.ifDef(params, 'type', source.type);
  ifDef.ifDef(params, 'topology', source.topology);
  ifDef.ifDef(params, 'reactingCenterStatus', source.center);
  ifDef.ifDef(params, 'stereo', source.stereo);
  ifDef.ifDef(params, 'cip', source.cip);
  ifDef.ifDef(params, 'customQuery', source.customQuery);
  ifDef.ifDef(params, 'begin', source.atoms[0] + atomOffset);
  ifDef.ifDef(params, 'end', source.atoms[1] + atomOffset);
  ifDef.ifDef(params, 'initiallySelected', source.selected);
  var newBond = new bond.Bond(params);
  newBond.setInitiallySelected(source.selected);
  return newBond;
}

exports.atomToStruct = atomToStruct;
exports.bondToStruct = bondToStruct;
//# sourceMappingURL=atomBondToStruct.js.map
