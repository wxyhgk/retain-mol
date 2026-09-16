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
import { Atom, AttachmentPoints } from '../../../entities/atom.modern.js';
import { SGroup } from '../../../entities/sgroup.modern.js';
import { Struct } from '../../../entities/struct.modern.js';
import { SGroupAttachmentPoint } from '../../../entities/sGroupAttachmentPoint.modern.js';
import { RGroupAttachmentPoint } from '../../../entities/rgroupAttachmentPoint.modern.js';
import { ifDef } from '../../../../utilities/ifDef.modern.js';
import '../../../../utilities/runAsyncAction.modern.js';
import '../../../../utilities/KetcherLogger.modern.js';
import '../../../../utilities/SettingsManager.modern.js';
import '../../../../utilities/keynorm.modern.js';
import 'react-device-detect';
import '../../../../utilities/clipboardUtils.modern.js';
import { mergeFragmentsToStruct } from './mergeFragmentsToStruct.modern.js';
import { atomToStruct, bondToStruct } from './atomBondToStruct.modern.js';

function toRlabel(values) {
  var res = 0;
  values.forEach(function (val) {
    var rgi = val - 1;
    res |= 1 << rgi;
  });
  return res;
}
function moleculeToStruct(ketItem) {
  var struct = mergeFragmentsToStruct(ketItem, new Struct());
  if (ketItem.atoms) {
    ketItem.atoms.forEach(function (atom) {
      var atomId = null;
      if (atom.type === 'rg-label') {
        atomId = struct.atoms.add(rglabelToStruct(atom));
      }
      if (!atom.type || atom.type === 'atom-list') {
        atomId = struct.atoms.add(atomToStruct(atom));
      }
      if (atomId !== null) {
        addRGroupAttachmentPointsToStruct(struct, atomId, atom.attachmentPoints, atom.selected);
      }
    });
  }
  if (ketItem.bonds) {
    ketItem.bonds.forEach(function (bond) {
      return struct.bonds.add(bondToStruct(bond));
    });
  }
  if (ketItem.sgroups) {
    ketItem.sgroups.forEach(function (sgroupData) {
      var sgroup = sgroupToStruct(sgroupData);
      var hadAtoms = sgroup.atoms.length > 0;
      sgroup.atoms = sgroup.atoms.filter(function (atomId) {
        return struct.atoms.has(atomId);
      });
      if (hadAtoms && sgroup.atoms.length === 0) {
        return;
      }
      var id = struct.sgroups.add(sgroup);
      sgroup.id = id;
    });
  }
  struct.initHalfBonds();
  struct.initNeighbors();
  struct.markFragments(ketItem.properties);
  struct.bindSGroupsToFunctionalGroups();
  return struct;
}
function rglabelToStruct(source) {
  var params = {};
  params.label = 'R#';
  ifDef(params, 'pp', {
    x: source.location[0],
    y: -source.location[1],
    z: source.location[2] || 0.0
  });
  ifDef(params, 'attachmentPoints', source.attachmentPoints);
  var rglabel = toRlabel(source.$refs.map(function (el) {
    return parseInt(el.slice(3));
  }));
  ifDef(params, 'rglabel', rglabel);
  var newAtom = new Atom(params);
  newAtom.setInitiallySelected(source.selected);
  return newAtom;
}
function addRGroupAttachmentPointsToStruct(struct, attachedAtomId, attachmentPoints, initiallySelected) {
  var rgroupAttachmentPoints = [];
  if (attachmentPoints === AttachmentPoints.FirstSideOnly) {
    rgroupAttachmentPoints.push(new RGroupAttachmentPoint(attachedAtomId, 'primary', initiallySelected));
  } else if (attachmentPoints === AttachmentPoints.SecondSideOnly) {
    rgroupAttachmentPoints.push(new RGroupAttachmentPoint(attachedAtomId, 'secondary', initiallySelected));
  } else if (attachmentPoints === AttachmentPoints.BothSides) {
    rgroupAttachmentPoints.push(new RGroupAttachmentPoint(attachedAtomId, 'primary', initiallySelected));
    rgroupAttachmentPoints.push(new RGroupAttachmentPoint(attachedAtomId, 'secondary', initiallySelected));
  }
  rgroupAttachmentPoints.forEach(function (rgroupAttachmentPoint) {
    struct.rgroupAttachmentPoints.add(rgroupAttachmentPoint);
  });
}
function sgroupToStruct(source) {
  var sgroup = new SGroup(source.type);
  ifDef(sgroup, 'atoms', source.atoms);
  switch (source.type) {
    case 'MUL':
      {
        ifDef(sgroup.data, 'mul', source.mul);
        break;
      }
    case 'SRU':
      {
        ifDef(sgroup.data, 'subscript', source.subscript);
        ifDef(sgroup.data, 'connectivity', source.connectivity.toLowerCase());
        break;
      }
    case 'COP':
      {
        ifDef(sgroup.data, 'subtype', source.subtype);
        ifDef(sgroup.data, 'connectivity', source.connectivity.toLowerCase());
        break;
      }
    case 'SUP':
      {
        var _source$attachmentPoi;
        ifDef(sgroup.data, 'name', source.name);
        ifDef(sgroup.data, 'expanded', source.expanded);
        ifDef(sgroup.data, 'class', source["class"]);
        ifDef(sgroup, 'id', source.id);
        (_source$attachmentPoi = source.attachmentPoints) === null || _source$attachmentPoi === void 0 || _source$attachmentPoi.forEach(function (sourceAttachmentPoint, sourceAttachmentPointIndex) {
          sgroup.addAttachmentPoint(sgroupAttachmentPointToStruct(sourceAttachmentPoint, sourceAttachmentPointIndex + 1));
        });
        break;
      }
    case 'DAT':
      {
        ifDef(sgroup.data, 'absolute', source.placement);
        ifDef(sgroup.data, 'attached', source.display);
        ifDef(sgroup.data, 'context', source.context);
        ifDef(sgroup.data, 'fieldName', source.fieldName);
        ifDef(sgroup.data, 'fieldValue', source.fieldData);
        break;
      }
  }
  return sgroup;
}
function sgroupAttachmentPointToStruct(source, attachmentPointNumber) {
  var atomId = source.attachmentAtom;
  var leavingAtomId = source.leavingAtom;
  var attachmentId = source.attachmentId;
  return new SGroupAttachmentPoint(atomId, leavingAtomId, attachmentId, attachmentId && !isNaN(Number(attachmentId)) ? Number(attachmentId) : attachmentPointNumber);
}

export { moleculeToStruct, rglabelToStruct, sgroupToStruct, toRlabel };
//# sourceMappingURL=moleculeToStruct.modern.js.map
