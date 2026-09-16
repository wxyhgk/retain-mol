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
import _possibleConstructorReturn from '@babel/runtime/helpers/possibleConstructorReturn';
import _getPrototypeOf from '@babel/runtime/helpers/getPrototypeOf';
import _assertThisInitialized from '@babel/runtime/helpers/assertThisInitialized';
import _inherits from '@babel/runtime/helpers/inherits';
import _defineProperty from '@babel/runtime/helpers/defineProperty';
import { BaseOperation } from '../BaseOperation.modern.js';
import { OperationType, OperationPriority } from '../OperationType.modern.js';

function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var BondDelete = function (_BaseOperation) {
  _inherits(BondDelete, _BaseOperation);
  function BondDelete(bondId) {
    var _this;
    _classCallCheck(this, BondDelete);
    _this = _callSuper(this, BondDelete, [OperationType.BOND_DELETE, OperationPriority.BOND_DELETE]);
    _defineProperty(_assertThisInitialized(_this), "data", void 0);
    _this.data = {
      bid: bondId !== null && bondId !== void 0 ? bondId : null,
      bond: null,
      begin: null,
      end: null,
      needInvalidateAtoms: true
    };
    return _this;
  }
  _createClass(BondDelete, [{
    key: "execute",
    value: function execute(restruct) {
      var bid = this.data.bid;
      if (bid === null) return;
      var struct = restruct.molecule;
      if (!this.data.bond) {
        var bondFromStruct = struct.bonds.get(bid);
        if (!bondFromStruct) return;
        this.data.bond = bondFromStruct;
        this.data.begin = bondFromStruct.begin;
        this.data.end = bondFromStruct.end;
      }
      BaseOperation.invalidateBond(restruct, bid);
      var rebond = restruct.bonds.get(bid);
      if (!rebond) return;
      [rebond.b.hb1, rebond.b.hb2].forEach(function (hbid) {
        if (hbid === undefined) return;
        var halfBond = restruct.molecule.halfBonds.get(hbid);
        if (halfBond && halfBond.loop >= 0) {
          restruct.loopRemove(halfBond.loop);
        }
      }, restruct);
      restruct.clearVisel(rebond.visel);
      restruct.bonds["delete"](bid);
      restruct.markItemRemoved();
      var structBond = struct.bonds.get(bid);
      if (!structBond) return;
      [structBond.hb1, structBond.hb2].forEach(function (hbid) {
        if (hbid === undefined) return;
        var halfBond = struct.halfBonds.get(hbid);
        if (!halfBond) {
          return;
        }
        var atom = struct.atoms.get(halfBond.begin);
        if (!atom) return;
        var pos = atom.neighbors.indexOf(hbid);
        var prev = (pos + atom.neighbors.length - 1) % atom.neighbors.length;
        var next = (pos + 1) % atom.neighbors.length;
        struct.setHbNext(atom.neighbors[prev], atom.neighbors[next]);
        atom.neighbors.splice(pos, 1);
      });
      if (structBond.hb1 !== undefined) struct.halfBonds["delete"](structBond.hb1);
      if (structBond.hb2 !== undefined) struct.halfBonds["delete"](structBond.hb2);
      struct.bonds["delete"](bid);
    }
  }]);
  return BondDelete;
}(BaseOperation);

export { BondDelete };
//# sourceMappingURL=BondDelete.modern.js.map
