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
import _toConsumableArray from '@babel/runtime/helpers/toConsumableArray';
import _classCallCheck from '@babel/runtime/helpers/classCallCheck';
import _createClass from '@babel/runtime/helpers/createClass';
import _defineProperty from '@babel/runtime/helpers/defineProperty';
import _classPrivateFieldSet from '@babel/runtime/helpers/classPrivateFieldSet';
import _classPrivateFieldGet from '@babel/runtime/helpers/classPrivateFieldGet';
import { Vec2 } from './vec2.modern.js';
import { Bond } from './bond.modern.js';
import { StereoLabel } from './atom.modern.js';

function _classPrivateFieldInitSpec(e, t, a) { _checkPrivateRedeclaration(e, t), t.set(e, a); }
function _checkPrivateRedeclaration(e, t) { if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object"); }
var StereoFlag;
(function (StereoFlag) {
  StereoFlag["Mixed"] = "MIXED";
  StereoFlag["Abs"] = "ABS";
  StereoFlag["And"] = "AND";
  StereoFlag["Or"] = "OR";
})(StereoFlag || (StereoFlag = {}));
function calcStereoFlag(struct, stereoAids) {
  if (!stereoAids || stereoAids.length === 0) return undefined;
  var filteredStereoAtoms = stereoAids.map(function (aid) {
    return struct.atoms.get(aid);
  }).filter(function (atom) {
    return atom === null || atom === void 0 ? void 0 : atom.stereoLabel;
  });
  if (!filteredStereoAtoms.length) return undefined;
  var atom = filteredStereoAtoms[0];
  var stereoLabel = atom.stereoLabel;
  var hasAnotherLabel = filteredStereoAtoms.some(function (atom) {
    return (atom === null || atom === void 0 ? void 0 : atom.stereoLabel) !== stereoLabel;
  });
  var stereoFlag;
  if (hasAnotherLabel) {
    stereoFlag = StereoFlag.Mixed;
  } else {
    var _stereoLabel$match;
    var label = (_stereoLabel$match = stereoLabel.match(/\D+/g)) === null || _stereoLabel$match === void 0 ? void 0 : _stereoLabel$match[0];
    switch (label) {
      case StereoLabel.Abs:
        {
          stereoFlag = StereoFlag.Abs;
          break;
        }
      case StereoLabel.And:
        {
          stereoFlag = StereoFlag.And;
          break;
        }
      case StereoLabel.Or:
        {
          stereoFlag = StereoFlag.Or;
          break;
        }
      default:
        {
          throw new Error("Unsupported stereo label: ".concat(label, "."));
        }
    }
  }
  return stereoFlag;
}
var _enhancedStereoFlag = new WeakMap();
var _stereoAtoms = new WeakMap();
var Fragment = function () {
  function Fragment() {
    var stereoAtoms = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    var stereoFlagPosition = arguments.length > 1 ? arguments[1] : undefined;
    var properties = arguments.length > 2 ? arguments[2] : undefined;
    _classCallCheck(this, Fragment);
    _classPrivateFieldInitSpec(this, _enhancedStereoFlag, {
      writable: true,
      value: void 0
    });
    _defineProperty(this, "stereoFlagPosition", void 0);
    _defineProperty(this, "properties", void 0);
    _classPrivateFieldInitSpec(this, _stereoAtoms, {
      writable: true,
      value: void 0
    });
    if (stereoFlagPosition) {
      this.stereoFlagPosition = new Vec2(stereoFlagPosition);
    }
    if (properties) {
      this.properties = properties;
    }
    _classPrivateFieldSet(this, _stereoAtoms, stereoAtoms);
  }
  _createClass(Fragment, [{
    key: "stereoAtoms",
    get: function get() {
      return _toConsumableArray(_classPrivateFieldGet(this, _stereoAtoms));
    }
  }, {
    key: "enhancedStereoFlag",
    get: function get() {
      return _classPrivateFieldGet(this, _enhancedStereoFlag);
    }
  }, {
    key: "clone",
    value: function clone(aidMap) {
      var stereoAtoms = _classPrivateFieldGet(this, _stereoAtoms).map(function (aid) {
        return aidMap.get(aid);
      });
      var fr = new Fragment(stereoAtoms, this.stereoFlagPosition, this.properties);
      _classPrivateFieldSet(fr, _enhancedStereoFlag, _classPrivateFieldGet(this, _enhancedStereoFlag));
      return fr;
    }
  }, {
    key: "updateStereoFlag",
    value: function updateStereoFlag(struct) {
      _classPrivateFieldSet(this, _enhancedStereoFlag, calcStereoFlag(struct, this.stereoAtoms));
      return _classPrivateFieldGet(this, _enhancedStereoFlag);
    }
  }, {
    key: "updateStereoAtom",
    value: function updateStereoAtom(struct, aid, frId, isAdd) {
      var _struct$atoms$get;
      if (isAdd && !_classPrivateFieldGet(this, _stereoAtoms).includes(aid)) _classPrivateFieldGet(this, _stereoAtoms).push(aid);
      if (!isAdd && (((_struct$atoms$get = struct.atoms.get(aid)) === null || _struct$atoms$get === void 0 ? void 0 : _struct$atoms$get.fragment) !== frId || !Array.from(struct.bonds.values()).filter(function (bond) {
        return bond.stereo && bond.type !== Bond.PATTERN.TYPE.DOUBLE;
      }).some(function (bond) {
        return bond.begin === aid;
      }))) {
        _classPrivateFieldSet(this, _stereoAtoms, this.stereoAtoms.filter(function (item) {
          return item !== aid;
        }));
      }
      _classPrivateFieldSet(this, _enhancedStereoFlag, calcStereoFlag(struct, this.stereoAtoms));
    }
  }, {
    key: "addStereoAtom",
    value: function addStereoAtom(atomId) {
      if (!_classPrivateFieldGet(this, _stereoAtoms).includes(atomId)) {
        this.stereoAtoms.push(atomId);
        return true;
      }
      return false;
    }
  }, {
    key: "deleteStereoAtom",
    value: function deleteStereoAtom(struct, fragmentId, atomId) {
      var _struct$atoms$get2;
      if (((_struct$atoms$get2 = struct.atoms.get(atomId)) === null || _struct$atoms$get2 === void 0 ? void 0 : _struct$atoms$get2.fragment) !== fragmentId || !Array.from(struct.bonds.values()).filter(function (bond) {
        return bond.stereo && bond.type !== Bond.PATTERN.TYPE.DOUBLE;
      }).some(function (bond) {
        return bond.begin === atomId;
      })) {
        _classPrivateFieldSet(this, _stereoAtoms, _classPrivateFieldGet(this, _stereoAtoms).filter(function (item) {
          return item !== atomId;
        }));
        return true;
      }
      return false;
    }
  }], [{
    key: "getDefaultStereoFlagPosition",
    value: function getDefaultStereoFlagPosition(struct, fragmentId) {
      var fragmentAtomIds = struct.getFragmentIds(fragmentId);
      if (fragmentAtomIds.size === 0) return undefined;
      var bb = struct.getCoordBoundingBox(fragmentAtomIds);
      return new Vec2(bb.max.x, bb.min.y - 1);
    }
  }]);
  return Fragment;
}();

export { Fragment, StereoFlag };
//# sourceMappingURL=fragment.modern.js.map
