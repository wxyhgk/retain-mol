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

var _toConsumableArray = require('@babel/runtime/helpers/toConsumableArray');
var _classCallCheck = require('@babel/runtime/helpers/classCallCheck');
var _createClass = require('@babel/runtime/helpers/createClass');
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var _classPrivateFieldSet = require('@babel/runtime/helpers/classPrivateFieldSet');
var _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet');
var vec2 = require('./vec2.js');
var bond = require('./bond.js');
var atom = require('./atom.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _toConsumableArray__default = /*#__PURE__*/_interopDefaultLegacy(_toConsumableArray);
var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);
var _classPrivateFieldSet__default = /*#__PURE__*/_interopDefaultLegacy(_classPrivateFieldSet);
var _classPrivateFieldGet__default = /*#__PURE__*/_interopDefaultLegacy(_classPrivateFieldGet);

function _classPrivateFieldInitSpec(e, t, a) { _checkPrivateRedeclaration(e, t), t.set(e, a); }
function _checkPrivateRedeclaration(e, t) { if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object"); }
exports.StereoFlag = void 0;
(function (StereoFlag) {
  StereoFlag["Mixed"] = "MIXED";
  StereoFlag["Abs"] = "ABS";
  StereoFlag["And"] = "AND";
  StereoFlag["Or"] = "OR";
})(exports.StereoFlag || (exports.StereoFlag = {}));
function calcStereoFlag(struct, stereoAids) {
  if (!stereoAids || stereoAids.length === 0) return undefined;
  var filteredStereoAtoms = stereoAids.map(function (aid) {
    return struct.atoms.get(aid);
  }).filter(function (atom) {
    return atom === null || atom === void 0 ? void 0 : atom.stereoLabel;
  });
  if (!filteredStereoAtoms.length) return undefined;
  var atom$1 = filteredStereoAtoms[0];
  var stereoLabel = atom$1.stereoLabel;
  var hasAnotherLabel = filteredStereoAtoms.some(function (atom) {
    return (atom === null || atom === void 0 ? void 0 : atom.stereoLabel) !== stereoLabel;
  });
  var stereoFlag;
  if (hasAnotherLabel) {
    stereoFlag = exports.StereoFlag.Mixed;
  } else {
    var _stereoLabel$match;
    var label = (_stereoLabel$match = stereoLabel.match(/\D+/g)) === null || _stereoLabel$match === void 0 ? void 0 : _stereoLabel$match[0];
    switch (label) {
      case atom.StereoLabel.Abs:
        {
          stereoFlag = exports.StereoFlag.Abs;
          break;
        }
      case atom.StereoLabel.And:
        {
          stereoFlag = exports.StereoFlag.And;
          break;
        }
      case atom.StereoLabel.Or:
        {
          stereoFlag = exports.StereoFlag.Or;
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
    _classCallCheck__default["default"](this, Fragment);
    _classPrivateFieldInitSpec(this, _enhancedStereoFlag, {
      writable: true,
      value: void 0
    });
    _defineProperty__default["default"](this, "stereoFlagPosition", void 0);
    _defineProperty__default["default"](this, "properties", void 0);
    _classPrivateFieldInitSpec(this, _stereoAtoms, {
      writable: true,
      value: void 0
    });
    if (stereoFlagPosition) {
      this.stereoFlagPosition = new vec2.Vec2(stereoFlagPosition);
    }
    if (properties) {
      this.properties = properties;
    }
    _classPrivateFieldSet__default["default"](this, _stereoAtoms, stereoAtoms);
  }
  _createClass__default["default"](Fragment, [{
    key: "stereoAtoms",
    get: function get() {
      return _toConsumableArray__default["default"](_classPrivateFieldGet__default["default"](this, _stereoAtoms));
    }
  }, {
    key: "enhancedStereoFlag",
    get: function get() {
      return _classPrivateFieldGet__default["default"](this, _enhancedStereoFlag);
    }
  }, {
    key: "clone",
    value: function clone(aidMap) {
      var stereoAtoms = _classPrivateFieldGet__default["default"](this, _stereoAtoms).map(function (aid) {
        return aidMap.get(aid);
      });
      var fr = new Fragment(stereoAtoms, this.stereoFlagPosition, this.properties);
      _classPrivateFieldSet__default["default"](fr, _enhancedStereoFlag, _classPrivateFieldGet__default["default"](this, _enhancedStereoFlag));
      return fr;
    }
  }, {
    key: "updateStereoFlag",
    value: function updateStereoFlag(struct) {
      _classPrivateFieldSet__default["default"](this, _enhancedStereoFlag, calcStereoFlag(struct, this.stereoAtoms));
      return _classPrivateFieldGet__default["default"](this, _enhancedStereoFlag);
    }
  }, {
    key: "updateStereoAtom",
    value: function updateStereoAtom(struct, aid, frId, isAdd) {
      var _struct$atoms$get;
      if (isAdd && !_classPrivateFieldGet__default["default"](this, _stereoAtoms).includes(aid)) _classPrivateFieldGet__default["default"](this, _stereoAtoms).push(aid);
      if (!isAdd && (((_struct$atoms$get = struct.atoms.get(aid)) === null || _struct$atoms$get === void 0 ? void 0 : _struct$atoms$get.fragment) !== frId || !Array.from(struct.bonds.values()).filter(function (bond$1) {
        return bond$1.stereo && bond$1.type !== bond.Bond.PATTERN.TYPE.DOUBLE;
      }).some(function (bond) {
        return bond.begin === aid;
      }))) {
        _classPrivateFieldSet__default["default"](this, _stereoAtoms, this.stereoAtoms.filter(function (item) {
          return item !== aid;
        }));
      }
      _classPrivateFieldSet__default["default"](this, _enhancedStereoFlag, calcStereoFlag(struct, this.stereoAtoms));
    }
  }, {
    key: "addStereoAtom",
    value: function addStereoAtom(atomId) {
      if (!_classPrivateFieldGet__default["default"](this, _stereoAtoms).includes(atomId)) {
        this.stereoAtoms.push(atomId);
        return true;
      }
      return false;
    }
  }, {
    key: "deleteStereoAtom",
    value: function deleteStereoAtom(struct, fragmentId, atomId) {
      var _struct$atoms$get2;
      if (((_struct$atoms$get2 = struct.atoms.get(atomId)) === null || _struct$atoms$get2 === void 0 ? void 0 : _struct$atoms$get2.fragment) !== fragmentId || !Array.from(struct.bonds.values()).filter(function (bond$1) {
        return bond$1.stereo && bond$1.type !== bond.Bond.PATTERN.TYPE.DOUBLE;
      }).some(function (bond) {
        return bond.begin === atomId;
      })) {
        _classPrivateFieldSet__default["default"](this, _stereoAtoms, _classPrivateFieldGet__default["default"](this, _stereoAtoms).filter(function (item) {
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
      return new vec2.Vec2(bb.max.x, bb.min.y - 1);
    }
  }]);
  return Fragment;
}();

exports.Fragment = Fragment;
//# sourceMappingURL=fragment.js.map
