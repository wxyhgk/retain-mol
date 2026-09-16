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
import { Atom } from '../../../entities/atom.modern.js';
import { Bond } from '../../../entities/bond.modern.js';
import { Elements } from '../../../constants/elements.modern.js';
import '../../../constants/element.types.modern.js';
import '../../../constants/generics.modern.js';
import '../../../constants/chains.modern.js';
import '../../../constants/monomers.modern.js';
import { ifDef } from '../../../../utilities/ifDef.modern.js';
import '../../../../utilities/runAsyncAction.modern.js';
import '../../../../utilities/KetcherLogger.modern.js';
import '../../../../utilities/SettingsManager.modern.js';
import '../../../../utilities/keynorm.modern.js';
import 'react-device-detect';
import '../../../../utilities/clipboardUtils.modern.js';

function atomToStruct(source) {
  var _params$queryProperti;
  var params = {};
  var queryAttribute = ['aromaticity', 'ringMembership', 'connectivity', 'ringSize', 'chirality', 'customQuery'];
  if (source.type === 'atom-list') {
    params.label = 'L#';
    var ids = source.elements.map(function (el) {
      var _Elements$get;
      return (_Elements$get = Elements.get(el)) === null || _Elements$get === void 0 ? void 0 : _Elements$get.number;
    }).filter(function (id) {
      return id;
    });
    ifDef(params, 'atomList', {
      ids: ids,
      notList: source.notList
    });
  } else {
    ifDef(params, 'label', source.label);
    ifDef(params, 'aam', source.mapping);
  }
  ifDef(params, 'alias', source.alias);
  ifDef(params, 'pp', {
    x: source.location[0],
    y: -source.location[1],
    z: source.location[2] || 0.0
  });
  ifDef(params, 'charge', source.charge);
  ifDef(params, 'explicitValence', source.explicitValence);
  ifDef(params, 'isotope', source.isotope);
  ifDef(params, 'radical', source.radical);
  ifDef(params, 'cip', source.cip);
  ifDef(params, 'attachmentPoints', source.attachmentPoints);
  ifDef(params, 'stereoLabel', source.stereoLabel);
  ifDef(params, 'stereoParity', source.stereoParity);
  ifDef(params, 'weight', source.weight);
  ifDef(params, 'ringBondCount', source.ringBondCount);
  ifDef(params, 'substitutionCount', source.substitutionCount);
  ifDef(params, 'unsaturatedAtom', Number(Boolean(source.unsaturatedAtom)));
  ifDef(params, 'hCount', source.hCount);
  if (source.queryProperties && Object.values(source.queryProperties).some(function (property) {
    return property !== null;
  })) {
    params.queryProperties = {};
    var queryProperties = params.queryProperties;
    queryAttribute.forEach(function (attributeName) {
      ifDef(queryProperties, attributeName, source.queryProperties[attributeName]);
    });
  }
  if ((_params$queryProperti = params.queryProperties) !== null && _params$queryProperti !== void 0 && _params$queryProperti.customQuery) {
    params.label = 'A';
  }
  ifDef(params, 'invRet', source.invRet);
  ifDef(params, 'exactChangeFlag', Number(Boolean(source.exactChangeFlag)));
  ifDef(params, 'implicitHCount', source.implicitHCount);
  var newAtom = new Atom(params);
  newAtom.setInitiallySelected(source.selected);
  return newAtom;
}
function bondToStruct(source) {
  var atomOffset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  var params = {};
  ifDef(params, 'type', source.type);
  ifDef(params, 'topology', source.topology);
  ifDef(params, 'reactingCenterStatus', source.center);
  ifDef(params, 'stereo', source.stereo);
  ifDef(params, 'cip', source.cip);
  ifDef(params, 'customQuery', source.customQuery);
  ifDef(params, 'begin', source.atoms[0] + atomOffset);
  ifDef(params, 'end', source.atoms[1] + atomOffset);
  ifDef(params, 'initiallySelected', source.selected);
  var newBond = new Bond(params);
  newBond.setInitiallySelected(source.selected);
  return newBond;
}

export { atomToStruct, bondToStruct };
//# sourceMappingURL=atomBondToStruct.modern.js.map
