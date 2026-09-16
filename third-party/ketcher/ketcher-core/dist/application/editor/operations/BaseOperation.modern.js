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
import _classCallCheck from '@babel/runtime/helpers/classCallCheck';
import _createClass from '@babel/runtime/helpers/createClass';
import _defineProperty from '@babel/runtime/helpers/defineProperty';
import { StereoLabelStyleType } from '../../render/restruct/generalEnumTypes.modern.js';
import '../../../utilities/runAsyncAction.modern.js';
import { KetcherLogger } from '../../../utilities/KetcherLogger.modern.js';
import '../../../utilities/SettingsManager.modern.js';
import '../../../utilities/keynorm.modern.js';
import 'react-device-detect';
import '../../../utilities/clipboardUtils.modern.js';

var BaseOperation = function () {
  function BaseOperation(type) {
    var priority = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    _classCallCheck(this, BaseOperation);
    _defineProperty(this, "_inverted", void 0);
    _defineProperty(this, "type", void 0);
    _defineProperty(this, "priority", void 0);
    _defineProperty(this, "data", void 0);
    this.type = type;
    this.priority = priority;
  }
  _createClass(BaseOperation, [{
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
        KetcherLogger.error('Operation.invert() is not implemented');
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
        if (stereoLabelStyle === StereoLabelStyleType.IUPAC || stereoLabelStyle === StereoLabelStyleType.Classic) {
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
_defineProperty(BaseOperation, "InverseConstructor", void 0);

export { BaseOperation, BaseOperation as default };
//# sourceMappingURL=BaseOperation.modern.js.map
