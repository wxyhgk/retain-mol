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
var sgroup = require('../../../entities/sgroup.js');
var struct = require('../../../entities/struct.js');
var sGroupAttachmentPoint = require('../../../entities/sGroupAttachmentPoint.js');
var rgroupAttachmentPoint = require('../../../entities/rgroupAttachmentPoint.js');
var ifDef = require('../../../../utilities/ifDef.js');
require('../../../../utilities/runAsyncAction.js');
require('../../../../utilities/KetcherLogger.js');
require('../../../../utilities/SettingsManager.js');
require('../../../../utilities/keynorm.js');
require('react-device-detect');
require('../../../../utilities/clipboardUtils.js');
var mergeFragmentsToStruct = require('./mergeFragmentsToStruct.js');
var atomBondToStruct = require('./atomBondToStruct.js');

function toRlabel(values) {
  var res = 0;
  values.forEach(function (val) {
    var rgi = val - 1;
    res |= 1 << rgi;
  });
  return res;
}
function moleculeToStruct(ketItem) {
  var struct$1 = mergeFragmentsToStruct.mergeFragmentsToStruct(ketItem, new struct.Struct());
  if (ketItem.atoms) {
    ketItem.atoms.forEach(function (atom) {
      var atomId = null;
      if (atom.type === 'rg-label') {
        atomId = struct$1.atoms.add(rglabelToStruct(atom));
      }
      if (!atom.type || atom.type === 'atom-list') {
        atomId = struct$1.atoms.add(atomBondToStruct.atomToStruct(atom));
      }
      if (atomId !== null) {
        addRGroupAttachmentPointsToStruct(struct$1, atomId, atom.attachmentPoints, atom.selected);
      }
    });
  }
  if (ketItem.bonds) {
    ketItem.bonds.forEach(function (bond) {
      return struct$1.bonds.add(atomBondToStruct.bondToStruct(bond));
    });
  }
  if (ketItem.sgroups) {
    ketItem.sgroups.forEach(function (sgroupData) {
      var sgroup = sgroupToStruct(sgroupData);
      var hadAtoms = sgroup.atoms.length > 0;
      sgroup.atoms = sgroup.atoms.filter(function (atomId) {
        return struct$1.atoms.has(atomId);
      });
      if (hadAtoms && sgroup.atoms.length === 0) {
        return;
      }
      var id = struct$1.sgroups.add(sgroup);
      sgroup.id = id;
    });
  }
  struct$1.initHalfBonds();
  struct$1.initNeighbors();
  struct$1.markFragments(ketItem.properties);
  struct$1.bindSGroupsToFunctionalGroups();
  return struct$1;
}
function rglabelToStruct(source) {
  var params = {};
  params.label = 'R#';
  ifDef.ifDef(params, 'pp', {
    x: source.location[0],
    y: -source.location[1],
    z: source.location[2] || 0.0
  });
  ifDef.ifDef(params, 'attachmentPoints', source.attachmentPoints);
  var rglabel = toRlabel(source.$refs.map(function (el) {
    return parseInt(el.slice(3));
  }));
  ifDef.ifDef(params, 'rglabel', rglabel);
  var newAtom = new atom.Atom(params);
  newAtom.setInitiallySelected(source.selected);
  return newAtom;
}
function addRGroupAttachmentPointsToStruct(struct, attachedAtomId, attachmentPoints, initiallySelected) {
  var rgroupAttachmentPoints = [];
  if (attachmentPoints === atom.AttachmentPoints.FirstSideOnly) {
    rgroupAttachmentPoints.push(new rgroupAttachmentPoint.RGroupAttachmentPoint(attachedAtomId, 'primary', initiallySelected));
  } else if (attachmentPoints === atom.AttachmentPoints.SecondSideOnly) {
    rgroupAttachmentPoints.push(new rgroupAttachmentPoint.RGroupAttachmentPoint(attachedAtomId, 'secondary', initiallySelected));
  } else if (attachmentPoints === atom.AttachmentPoints.BothSides) {
    rgroupAttachmentPoints.push(new rgroupAttachmentPoint.RGroupAttachmentPoint(attachedAtomId, 'primary', initiallySelected));
    rgroupAttachmentPoints.push(new rgroupAttachmentPoint.RGroupAttachmentPoint(attachedAtomId, 'secondary', initiallySelected));
  }
  rgroupAttachmentPoints.forEach(function (rgroupAttachmentPoint) {
    struct.rgroupAttachmentPoints.add(rgroupAttachmentPoint);
  });
}
function sgroupToStruct(source) {
  var sgroup$1 = new sgroup.SGroup(source.type);
  ifDef.ifDef(sgroup$1, 'atoms', source.atoms);
  switch (source.type) {
    case 'MUL':
      {
        ifDef.ifDef(sgroup$1.data, 'mul', source.mul);
        break;
      }
    case 'SRU':
      {
        ifDef.ifDef(sgroup$1.data, 'subscript', source.subscript);
        ifDef.ifDef(sgroup$1.data, 'connectivity', source.connectivity.toLowerCase());
        break;
      }
    case 'COP':
      {
        ifDef.ifDef(sgroup$1.data, 'subtype', source.subtype);
        ifDef.ifDef(sgroup$1.data, 'connectivity', source.connectivity.toLowerCase());
        break;
      }
    case 'SUP':
      {
        var _source$attachmentPoi;
        ifDef.ifDef(sgroup$1.data, 'name', source.name);
        ifDef.ifDef(sgroup$1.data, 'expanded', source.expanded);
        ifDef.ifDef(sgroup$1.data, 'class', source["class"]);
        ifDef.ifDef(sgroup$1, 'id', source.id);
        (_source$attachmentPoi = source.attachmentPoints) === null || _source$attachmentPoi === void 0 || _source$attachmentPoi.forEach(function (sourceAttachmentPoint, sourceAttachmentPointIndex) {
          sgroup$1.addAttachmentPoint(sgroupAttachmentPointToStruct(sourceAttachmentPoint, sourceAttachmentPointIndex + 1));
        });
        break;
      }
    case 'DAT':
      {
        ifDef.ifDef(sgroup$1.data, 'absolute', source.placement);
        ifDef.ifDef(sgroup$1.data, 'attached', source.display);
        ifDef.ifDef(sgroup$1.data, 'context', source.context);
        ifDef.ifDef(sgroup$1.data, 'fieldName', source.fieldName);
        ifDef.ifDef(sgroup$1.data, 'fieldValue', source.fieldData);
        break;
      }
  }
  return sgroup$1;
}
function sgroupAttachmentPointToStruct(source, attachmentPointNumber) {
  var atomId = source.attachmentAtom;
  var leavingAtomId = source.leavingAtom;
  var attachmentId = source.attachmentId;
  return new sGroupAttachmentPoint.SGroupAttachmentPoint(atomId, leavingAtomId, attachmentId, attachmentId && !isNaN(Number(attachmentId)) ? Number(attachmentId) : attachmentPointNumber);
}

exports.moleculeToStruct = moleculeToStruct;
exports.rglabelToStruct = rglabelToStruct;
exports.sgroupToStruct = sgroupToStruct;
exports.toRlabel = toRlabel;
//# sourceMappingURL=moleculeToStruct.js.map
