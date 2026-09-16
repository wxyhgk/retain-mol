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

var _classCallCheck = require('@babel/runtime/helpers/classCallCheck');
var _createClass = require('@babel/runtime/helpers/createClass');
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var generalEnumTypes = require('../../render/restruct/generalEnumTypes.js');
require('../../../utilities/runAsyncAction.js');
var KetcherLogger = require('../../../utilities/KetcherLogger.js');
require('../../../utilities/SettingsManager.js');
require('../../../utilities/keynorm.js');
require('react-device-detect');
require('../../../utilities/clipboardUtils.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);

var BaseOperation = function () {
  function BaseOperation(type) {
    var priority = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    _classCallCheck__default["default"](this, BaseOperation);
    _defineProperty__default["default"](this, "_inverted", void 0);
    _defineProperty__default["default"](this, "type", void 0);
    _defineProperty__default["default"](this, "priority", void 0);
    _defineProperty__default["default"](this, "data", void 0);
    this.type = type;
    this.priority = priority;
  }
  _createClass__default["default"](BaseOperation, [{
    key: "execute",
    value: function execute(_restruct) {
      throw new Error('Operation.execute() is not implemented');
    }
  }, {
    key: "perform",
    value: function perform(restruct) {
      this.execute(restruct);
      if (!this._inverted) {
        this._inverted = this.invert();
        this._inverted._inverted = this;
      }
      return this._inverted;
    }
  }, {
    key: "invert",
    value: function invert() {
      var InverseConstructor = this.constructor.InverseConstructor;
      if (!InverseConstructor) {
        KetcherLogger.KetcherLogger.error('Operation.invert() is not implemented');
        return this;
      }
      var inverted = new InverseConstructor();
      inverted.data = this.data;
      return inverted;
    }
  }, {
    key: "isDummy",
    value: function isDummy(_restruct) {
      return false;
    }
  }], [{
    key: "invalidateAtom",
    value: function invalidateAtom(restruct, atomId) {
      var level = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
      var atom = restruct.atoms.get(atomId);
      if (!atom) {
        return;
      }
      restruct.markAtom(atomId, level ? 1 : 0);
      var halfBonds = restruct.molecule.halfBonds;
      atom.a.neighbors.forEach(function (halfBondId) {
        if (!halfBonds.has(halfBondId)) {
          return;
        }
        var halfBond = halfBonds.get(halfBondId);
        if (!halfBond) {
          return;
        }
        restruct.markBond(halfBond.bid, 1);
        restruct.markAtom(halfBond.end, 0);
        if (level) {
          BaseOperation.invalidateLoop(restruct, halfBond.bid);
        }
      });
      var fragment = atom.a.fragment;
      var stereoLabelStyle = restruct.render.options.stereoLabelStyle;
      restruct.atoms.forEach(function (atom, atomId) {
        if (stereoLabelStyle === generalEnumTypes.StereoLabelStyleType.IUPAC || stereoLabelStyle === generalEnumTypes.StereoLabelStyleType.Classic) {
          if (atom.a.fragment === fragment) restruct.markAtom(atomId, 0);
        }
      });
    }
  }, {
    key: "invalidateLoop",
    value: function invalidateLoop(restruct, bondId) {
      var bond = restruct.bonds.get(bondId);
      if (!(bond !== null && bond !== void 0 && bond.b.hb1) || !bond.b.hb2) {
        return;
      }
      var halfBond1 = restruct.molecule.halfBonds.get(bond.b.hb1);
      var halfBond2 = restruct.molecule.halfBonds.get(bond.b.hb2);
      var halfBond1Loop = halfBond1 === null || halfBond1 === void 0 ? void 0 : halfBond1.loop;
      if (halfBond1Loop !== undefined && halfBond1Loop >= 0) {
        restruct.loopRemove(halfBond1Loop);
      }
      var halfBond2Loop = halfBond2 === null || halfBond2 === void 0 ? void 0 : halfBond2.loop;
      if (halfBond2Loop !== undefined && halfBond2Loop >= 0) {
        restruct.loopRemove(halfBond2Loop);
      }
    }
  }, {
    key: "invalidateBond",
    value: function invalidateBond(restruct, bondId) {
      BaseOperation.invalidateLoop(restruct, bondId);
      var bond = restruct.bonds.get(bondId);
      if (!bond) {
        return;
      }
      BaseOperation.invalidateAtom(restruct, bond.b.begin, 0);
      BaseOperation.invalidateAtom(restruct, bond.b.end, 0);
    }
  }, {
    key: "invalidateItem",
    value: function invalidateItem(restruct, mapName, id) {
      var level = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
      if (mapName === 'atoms') {
        BaseOperation.invalidateAtom(restruct, id, level);
        return;
      }
      if (mapName === 'bonds') {
        BaseOperation.invalidateBond(restruct, id);
        if (level > 0) {
          BaseOperation.invalidateLoop(restruct, id);
        }
        return;
      }
      restruct.markItem(mapName, id, level);
    }
  }, {
    key: "invalidateEnhancedFlag",
    value: function invalidateEnhancedFlag(restruct, fragmentId) {
      BaseOperation.invalidateItem(restruct, 'enhancedFlags', fragmentId, 1);
    }
  }]);
  return BaseOperation;
}();
_defineProperty__default["default"](BaseOperation, "InverseConstructor", void 0);

exports.BaseOperation = BaseOperation;
exports["default"] = BaseOperation;
//# sourceMappingURL=BaseOperation.js.map
