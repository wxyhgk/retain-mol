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

var atom = require('../../../domain/entities/atom.js');
var bond = require('../../../domain/entities/bond.js');
var vec2 = require('../../../domain/entities/vec2.js');
require('../../../utilities/runAsyncAction.js');
var KetcherLogger = require('../../../utilities/KetcherLogger.js');
require('../../../utilities/SettingsManager.js');
require('../../../utilities/keynorm.js');
require('react-device-detect');
require('../../../utilities/clipboardUtils.js');
var closest = require('../shared/closest.js');
var constants = require('../shared/constants.js');

var DEFAULT_BOND_TYPE = bond.Bond.PATTERN.TYPE.SINGLE;
var findClosestAtom = closest["default"].atom;
function throwLoggedError(message) {
  KetcherLogger.KetcherLogger.error(message);
  throw new Error(message);
}
function getReAtom(restruct, atomId) {
  var atom = restruct.atoms.get(atomId);
  if (!atom) {
    throwLoggedError("Atom ".concat(atomId, " not found in restruct"));
  }
  return atom;
}
function getAtom(restruct, atomId) {
  var atom = restruct.molecule.atoms.get(atomId);
  if (!atom) {
    throwLoggedError("Atom ".concat(atomId, " not found in struct"));
  }
  return atom;
}
function getAtomNeighbors(struct, atomId) {
  var neighbors = struct.atomGetNeighbors(atomId);
  if (!neighbors) {
    throwLoggedError("Atom ".concat(atomId, " not found in struct"));
  }
  return neighbors;
}
function getBondAngle(struct, bondId) {
  if (bondId === null) {
    throwLoggedError('Previous bond is required');
  }
  var bond = struct.bonds.get(bondId);
  if (!bond) {
    throwLoggedError("Bond ".concat(bondId, " not found in struct"));
  }
  return bond.angle;
}
function ensureAtomId(atom) {
  if (typeof atom !== 'number') {
    throwLoggedError('Expected atom id (number), but received atom attributes');
  }
  return atom;
}
function atomGetAttr(restruct, aid, name) {
  var atom = restruct.molecule.atoms.get(aid);
  if (!atom) return null;
  return atom[name];
}
function atomGetDegree(restruct, aid) {
  return getReAtom(restruct, aid).a.neighbors.length;
}
function atomGetSGroups(restruct, atomId) {
  return Array.from(getReAtom(restruct, atomId).a.sgs);
}
function atomGetPos(restruct, id) {
  return getAtom(restruct, id).pp;
}
function findStereoAtoms(struct, atomIds) {
  var monomerAtoms = 0;
  if (struct.sgroups && struct.sgroups.size > 0) {
    struct.sgroups.forEach(function (sgroup) {
      monomerAtoms += sgroup.atoms.length;
    });
  }
  if (!atomIds || struct.atoms.size === monomerAtoms) {
    return [];
  }
  return atomIds.filter(function (atomId) {
    var atom$1 = struct.atoms.get(atomId);
    if ((atom$1 === null || atom$1 === void 0 ? void 0 : atom$1.stereoLabel) !== null) {
      return true;
    }
    var connectedBonds = atom.Atom.getConnectedBondIds(struct, atomId);
    var connectedWithStereoBond = connectedBonds.some(function (bondId) {
      var bond = struct.bonds.get(bondId);
      return (bond === null || bond === void 0 ? void 0 : bond.begin) === atomId && (bond === null || bond === void 0 ? void 0 : bond.stereo);
    });
    return connectedWithStereoBond;
  });
}
function structSelection(struct) {
  return constants.selectionKeys.reduce(function (res, key) {
    res[key] = Array.from(struct[key].keys());
    return res;
  }, {});
}
function getSelectionFromStruct(struct) {
  var selection = {};
  constants.selectionKeys.forEach(function (entityType) {
    if (struct !== null && struct !== void 0 && struct[entityType]) {
      var selected = [];
      struct[entityType].forEach(function (value, key) {
        if (typeof value.getInitiallySelected === 'function' && value.getInitiallySelected()) {
          selected.push(key);
        }
      });
      if (selected.length > 0) {
        selection[entityType] = selected;
      }
    }
  });
  return selection;
}
function formatSelection(selection) {
  return constants.selectionKeys.reduce(function (res, key) {
    res[key] = selection[key] || [];
    return res;
  }, {});
}
function atomForNewBond(restruct, atom, bond$1) {
  var id = ensureAtomId(atom);
  var neighbours = [];
  var pos = atomGetPos(restruct, id);
  var atomNeighbours = getAtomNeighbors(restruct.molecule, id);
  var prevBondId = atomNeighbours.length ? restruct.molecule.findBondId(id, atomNeighbours[0].aid) : null;
  var prevBond = prevBondId === null ? undefined : restruct.molecule.bonds.get(prevBondId);
  var prevBondType = DEFAULT_BOND_TYPE;
  if (prevBond) {
    prevBondType = prevBond.type;
  } else if (bond$1) {
    var _bond$type;
    prevBondType = (_bond$type = bond$1.type) !== null && _bond$type !== void 0 ? _bond$type : DEFAULT_BOND_TYPE;
  }
  getAtomNeighbors(restruct.molecule, id).forEach(function (nei) {
    var neiPos = atomGetPos(restruct, nei.aid);
    if (vec2.Vec2.dist(pos, neiPos) < 0.1) return;
    neighbours.push({
      id: nei.aid,
      v: vec2.Vec2.diff(neiPos, pos)
    });
  });
  neighbours.sort(function (nei1, nei2) {
    return Math.atan2(nei1.v.y, nei1.v.x) - Math.atan2(nei2.v.y, nei2.v.x);
  });
  var i;
  var maxI = 0;
  var angle;
  var maxAngle = 0;
  for (i = 0; i < neighbours.length; i++) {
    angle = vec2.Vec2.angle(neighbours[i].v, neighbours[(i + 1) % neighbours.length].v);
    if (angle < 0) angle += 2 * Math.PI;
    if (angle > maxAngle) {
      maxI = i;
      maxAngle = angle;
    }
  }
  var v = new vec2.Vec2(1, 0);
  if (neighbours.length > 0) {
    if (neighbours.length === 1) {
      maxAngle = -(4 * Math.PI / 3);
      var nei = getAtomNeighbors(restruct.molecule, id)[0];
      if (atomGetDegree(restruct, nei.aid) > 1) {
        var neiNeighborAngles = [];
        var neiPos = atomGetPos(restruct, nei.aid);
        var neiV = vec2.Vec2.diff(pos, neiPos);
        var neiAngle = Math.atan2(neiV.y, neiV.x);
        getAtomNeighbors(restruct.molecule, nei.aid).forEach(function (neiNei) {
          var neiNeiPos = atomGetPos(restruct, neiNei.aid);
          if (neiNei.bid === nei.bid || vec2.Vec2.dist(neiPos, neiNeiPos) < 0.1) {
            return;
          }
          var vDiff = vec2.Vec2.diff(neiNeiPos, neiPos);
          var ang = Math.atan2(vDiff.y, vDiff.x) - neiAngle;
          if (ang < 0) ang += 2 * Math.PI;
          neiNeighborAngles.push(ang);
        });
        neiNeighborAngles.sort(function (nei1, nei2) {
          return nei1 - nei2;
        });
        if (neiNeighborAngles[0] <= Math.PI * 1.01 && neiNeighborAngles[neiNeighborAngles.length - 1] <= 1.01 * Math.PI) {
          maxAngle *= -1;
        }
      }
    }
    var shallBe180DegToPrevBond = neighbours.length === 1 && (prevBondType === (bond$1 === null || bond$1 === void 0 ? void 0 : bond$1.type) && ((bond$1 === null || bond$1 === void 0 ? void 0 : bond$1.type) === bond.Bond.PATTERN.TYPE.DOUBLE || (bond$1 === null || bond$1 === void 0 ? void 0 : bond$1.type) === bond.Bond.PATTERN.TYPE.TRIPLE) || prevBondType === bond.Bond.PATTERN.TYPE.SINGLE && (bond$1 === null || bond$1 === void 0 ? void 0 : bond$1.type) === bond.Bond.PATTERN.TYPE.TRIPLE || prevBondType === bond.Bond.PATTERN.TYPE.TRIPLE && (bond$1 === null || bond$1 === void 0 ? void 0 : bond$1.type) === bond.Bond.PATTERN.TYPE.SINGLE);
    if (shallBe180DegToPrevBond) {
      var prevBondAngle = getBondAngle(restruct.molecule, prevBondId);
      if (prevBondAngle > -90 && prevBondAngle < 90 && neighbours[0].v.x > 0) {
        angle = prevBondAngle * Math.PI / 180 + Math.PI;
      } else {
        angle = prevBondAngle * Math.PI / 180;
      }
    } else {
      angle = maxAngle / 2 + Math.atan2(neighbours[maxI].v.y, neighbours[maxI].v.x);
    }
    v = v.rotate(angle);
  }
  v.add_(pos);
  var closestAtom = findClosestAtom(restruct, v, null, 0.1);
  var a = closestAtom === null ? {
    label: 'C'
  } : closestAtom.id;
  return {
    atom: a,
    pos: v
  };
}
function getRelSGroupsBySelection(struct, selectedAtoms) {
  var sgroups = new Set();
  selectedAtoms.forEach(function (atom) {
    var _struct$atoms$get;
    (_struct$atoms$get = struct.atoms.get(atom)) === null || _struct$atoms$get === void 0 || _struct$atoms$get.sgs.forEach(function (sgid) {
      var sgroup = struct.sgroups.get(sgid);
      if (sgroup && !sgroup.data.attached && !sgroup.data.absolute) {
        sgroups.add(sgroup);
      }
    });
  });
  return sgroups;
}
function isAttachmentBond(_ref, selection) {
  var begin = _ref.begin,
    end = _ref.end;
  if (!selection.atoms) {
    return false;
  }
  var isBondStartsInSelectionAndEndsOutside = selection.atoms.includes(begin) && !selection.atoms.includes(end);
  var isBondEndsInSelectionAndStartsOutside = selection.atoms.includes(end) && !selection.atoms.includes(begin);
  return isBondStartsInSelectionAndEndsOutside || isBondEndsInSelectionAndStartsOutside;
}

exports.atomForNewBond = atomForNewBond;
exports.atomGetAttr = atomGetAttr;
exports.atomGetDegree = atomGetDegree;
exports.atomGetPos = atomGetPos;
exports.atomGetSGroups = atomGetSGroups;
exports.findStereoAtoms = findStereoAtoms;
exports.formatSelection = formatSelection;
exports.getRelSGroupsBySelection = getRelSGroupsBySelection;
exports.getSelectionFromStruct = getSelectionFromStruct;
exports.isAttachmentBond = isAttachmentBond;
exports.structSelection = structSelection;
//# sourceMappingURL=utils.js.map
