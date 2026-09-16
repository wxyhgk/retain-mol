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
import { SGroup } from '../../../entities/sgroup.modern.js';
import { Vec2 } from '../../../entities/vec2.modern.js';
import { switchIntoChemistryCoordSystem } from '../helpers.modern.js';
import { ifDef } from '../../../../utilities/ifDef.modern.js';
import '../../../../utilities/runAsyncAction.modern.js';
import '../../../../utilities/KetcherLogger.modern.js';
import '../../../../utilities/SettingsManager.modern.js';
import '../../../../utilities/keynorm.modern.js';
import 'react-device-detect';
import '../../../../utilities/clipboardUtils.modern.js';
import { getAttachmentPointLabelWithBinaryShift } from '../../../helpers/attachmentPointCalculations.modern.js';
import { isNumber } from 'lodash';

function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function fromRlabel(rg) {
  var res = [];
  var rgi;
  var val;
  for (rgi = 0; rgi < 32; rgi++) {
    if (rg & 1 << rgi) {
      val = rgi + 1;
      res.push(val);
    }
  }
  return res;
}
function moleculeToKet(struct, monomer) {
  var body = {
    atoms: Array.from(struct.atoms.values()).map(function (atom) {
      if (atom.label === 'R#' && !monomer) return rglabelToKet(atom);
      return atomToKet(atom, monomer);
    })
  };
  if (struct.bonds.size !== 0) {
    body.bonds = Array.from(struct.bonds.values()).map(bondToKet);
  }
  if (struct.sgroups.size !== 0) {
    body.sgroups = Array.from(struct.sgroups.values()).map(function (sGroup) {
      return sgroupToKet(struct, sGroup);
    });
  }
  var fragment = struct.frags.get(0);
  if (fragment) {
    ifDef(body, 'stereoFlagPosition', fragment.stereoFlagPosition, null);
    if (fragment.properties) {
      body.properties = fragment.properties;
    }
  }
  return _objectSpread({
    type: 'molecule'
  }, body);
}
function atomToKet(source, monomer) {
  var result = {};
  if (source.label !== 'L#') {
    var _monomer$monomerItem$, _source$rglabel;
    ifDef(result, 'label', source.label === 'R#' && monomer ? (_monomer$monomerItem$ = monomer.monomerItem.props.MonomerCaps) === null || _monomer$monomerItem$ === void 0 ? void 0 : _monomer$monomerItem$[getAttachmentPointLabelWithBinaryShift((_source$rglabel = source.rglabel) !== null && _source$rglabel !== void 0 ? _source$rglabel : 0)] : source.label);
    ifDef(result, 'mapping', source.aam, 0);
  } else if (source.atomList) {
    result.type = 'atom-list';
    ifDef(result, 'elements', source.atomList.labelList());
    ifDef(result, 'notList', source.atomList.notList, false);
  }
  ifDef(result, 'alias', source.alias);
  var position = switchIntoChemistryCoordSystem(new Vec2(source.pp.x, source.pp.y, source.pp.z));
  ifDef(result, 'location', [position.x, position.y, position.z]);
  ifDef(result, 'charge', source.charge);
  ifDef(result, 'explicitValence', source.explicitValence, -1);
  ifDef(result, 'isotope', source.isotope);
  ifDef(result, 'radical', source.radical, 0);
  ifDef(result, 'attachmentPoints', source.attachmentPoints, 0);
  ifDef(result, 'cip', source.cip, '');
  ifDef(result, 'selected', source.getInitiallySelected());
  ifDef(result, 'stereoLabel', source.stereoLabel, null);
  ifDef(result, 'stereoParity', source.stereoParity, 0);
  ifDef(result, 'ringBondCount', source.ringBondCount, 0);
  ifDef(result, 'substitutionCount', source.substitutionCount, 0);
  ifDef(result, 'unsaturatedAtom', !!source.unsaturatedAtom, false);
  ifDef(result, 'hCount', source.hCount, 0);
  if (Object.values(source.queryProperties).some(function (property) {
    return property !== null;
  })) {
    result.queryProperties = {};
    var queryProperties = result.queryProperties;
    Object.keys(source.queryProperties).forEach(function (name) {
      ifDef(queryProperties, name, source.queryProperties[name]);
    });
  }
  ifDef(result, 'invRet', source.invRet, 0);
  ifDef(result, 'exactChangeFlag', !!source.exactChangeFlag, false);
  ifDef(result, 'implicitHCount', source.implicitHCount);
  return result;
}
function rglabelToKet(source) {
  var _source$rglabel2;
  var result = {
    type: 'rg-label'
  };
  var position = switchIntoChemistryCoordSystem(new Vec2(source.pp.x, source.pp.y, source.pp.z));
  ifDef(result, 'location', [position.x, position.y, position.z]);
  ifDef(result, 'attachmentPoints', source.attachmentPoints, 0);
  var refsToRGroups = fromRlabel((_source$rglabel2 = source.rglabel) !== null && _source$rglabel2 !== void 0 ? _source$rglabel2 : 0).map(function (rgnumber) {
    return "rg-".concat(rgnumber);
  });
  ifDef(result, '$refs', refsToRGroups);
  ifDef(result, 'selected', source.getInitiallySelected());
  return result;
}
function bondToKet(source) {
  var result = {};
  if (source.customQuery) {
    ifDef(result, 'atoms', [source.begin, source.end]);
    ifDef(result, 'customQuery', source.customQuery);
  } else {
    ifDef(result, 'type', source.type);
    ifDef(result, 'atoms', [source.begin, source.end]);
    ifDef(result, 'stereo', source.stereo, 0);
    ifDef(result, 'topology', source.topology, 0);
    ifDef(result, 'center', source.reactingCenterStatus, 0);
    ifDef(result, 'cip', source.cip, '');
  }
  ifDef(result, 'selected', source.getInitiallySelected());
  return result;
}
function sgroupToKet(struct, source) {
  var result = {};
  ifDef(result, 'type', source.type);
  ifDef(result, 'atoms', source.atoms);
  switch (source.type) {
    case 'MUL':
      {
        ifDef(result, 'mul', source.data.mul || 1);
        break;
      }
    case 'SRU':
      {
        ifDef(result, 'subscript', source.data.subscript || 'n');
        ifDef(result, 'connectivity', source.data.connectivity.toUpperCase() || 'HT');
        break;
      }
    case 'COP':
      {
        ifDef(result, 'subtype', source.data.subtype ? source.data.subtype.toUpperCase() : null);
        ifDef(result, 'connectivity', source.data.connectivity.toUpperCase() || 'HT');
        break;
      }
    case 'SUP':
      {
        ifDef(result, 'name', source.data.name || '');
        ifDef(result, 'expanded', source.data.expanded);
        ifDef(result, 'id', source.id);
        ifDef(result, 'class', source.data["class"]);
        ifDef(result, 'attachmentPoints', source.getAttachmentPoints().map(sgroupAttachmentPointToKet), []);
        break;
      }
    case 'DAT':
      {
        var data = source.data;
        ifDef(result, 'placement', data.absolute, true);
        ifDef(result, 'display', data.attached, false);
        ifDef(result, 'context', data.context);
        ifDef(result, 'fieldName', data.fieldName);
        ifDef(result, 'fieldData', data.fieldValue);
        ifDef(result, 'bonds', SGroup.getBonds(struct, source));
        break;
      }
  }
  return result;
}
function sgroupAttachmentPointToKet(source) {
  var result = {};
  ifDef(result, 'attachmentAtom', source.atomId);
  ifDef(result, 'leavingAtom', source.leaveAtomId);
  ifDef(result, 'attachmentId', isNumber(source.attachmentPointNumber) ? source.attachmentPointNumber.toString() : source.attachmentId);
  return result;
}

export { moleculeToKet };
//# sourceMappingURL=moleculeToKet.modern.js.map
