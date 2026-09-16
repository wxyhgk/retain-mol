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
import _possibleConstructorReturn from '@babel/runtime/helpers/possibleConstructorReturn';
import _getPrototypeOf from '@babel/runtime/helpers/getPrototypeOf';
import _assertThisInitialized from '@babel/runtime/helpers/assertThisInitialized';
import _inherits from '@babel/runtime/helpers/inherits';
import _defineProperty from '@babel/runtime/helpers/defineProperty';
import { Highlight } from '../../../domain/entities/highlight.modern.js';
import { BaseOperation } from './BaseOperation.modern.js';
import { OperationType } from './OperationType.modern.js';

function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var HighlightAdd = function (_BaseOperation) {
  _inherits(HighlightAdd, _BaseOperation);
  function HighlightAdd(atoms, bonds, rgroupAttachmentPoints, color, highlightId, outline) {
    var _this;
    _classCallCheck(this, HighlightAdd);
    _this = _callSuper(this, HighlightAdd, [OperationType.ADD_HIGHLIGHT]);
    _defineProperty(_assertThisInitialized(_this), "data", void 0);
    _this.data = {
      atoms: atoms,
      bonds: bonds,
      rgroupAttachmentPoints: rgroupAttachmentPoints,
      color: color,
      highlightId: highlightId,
      outline: outline
    };
    return _this;
  }
  _createClass(HighlightAdd, [{
    key: "execute",
    value: function execute(restruct) {
      var _this$data = this.data,
        atoms = _this$data.atoms,
        bonds = _this$data.bonds,
        rgroupAttachmentPoints = _this$data.rgroupAttachmentPoints,
        color = _this$data.color,
        outline = _this$data.outline;
      if (!color) {
        return;
      }
      var struct = restruct.molecule;
      var highlight = new Highlight({
        atoms: atoms,
        bonds: bonds,
        rgroupAttachmentPoints: rgroupAttachmentPoints,
        color: color,
        outline: outline
      });
      if (typeof this.data.highlightId !== 'number') {
        this.data.highlightId = struct.highlights.add(highlight);
      } else {
        struct.highlights.set(this.data.highlightId, highlight);
      }
      notifyChanged(restruct, atoms, bonds, rgroupAttachmentPoints);
    }
  }, {
    key: "invert",
    value: function invert() {
      var _this$data2 = this.data,
        atoms = _this$data2.atoms,
        bonds = _this$data2.bonds,
        rgroupAttachmentPoints = _this$data2.rgroupAttachmentPoints,
        color = _this$data2.color,
        highlightId = _this$data2.highlightId;
      var inverted = new HighlightDelete(highlightId, atoms, bonds, rgroupAttachmentPoints, color);
      return inverted;
    }
  }]);
  return HighlightAdd;
}(BaseOperation);
var HighlightDelete = function (_BaseOperation2) {
  _inherits(HighlightDelete, _BaseOperation2);
  function HighlightDelete(highlightId, atoms, bonds, rgroupAttachmentPoints, color) {
    var _this2;
    _classCallCheck(this, HighlightDelete);
    _this2 = _callSuper(this, HighlightDelete, [OperationType.REMOVE_HIGHLIGHT, 5]);
    _defineProperty(_assertThisInitialized(_this2), "data", void 0);
    _this2.data = {
      highlightId: highlightId,
      atoms: atoms !== null && atoms !== void 0 ? atoms : [],
      bonds: bonds !== null && bonds !== void 0 ? bonds : [],
      rgroupAttachmentPoints: rgroupAttachmentPoints !== null && rgroupAttachmentPoints !== void 0 ? rgroupAttachmentPoints : [],
      color: color !== null && color !== void 0 ? color : 'white'
    };
    return _this2;
  }
  _createClass(HighlightDelete, [{
    key: "execute",
    value: function execute(restruct) {
      if (typeof this.data.highlightId === 'number') {
        var struct = restruct.molecule;
        var highlightToRemove = struct.highlights.get(this.data.highlightId);
        if (typeof highlightToRemove === 'undefined') {
          return;
        }
        var atoms = highlightToRemove.atoms,
          bonds = highlightToRemove.bonds,
          color = highlightToRemove.color;
        this.data.atoms = atoms;
        this.data.bonds = bonds;
        this.data.color = color;
        struct.highlights["delete"](this.data.highlightId);
        notifyChanged(restruct, atoms, bonds);
      }
    }
  }, {
    key: "invert",
    value: function invert() {
      var _this$data3 = this.data,
        atoms = _this$data3.atoms,
        bonds = _this$data3.bonds,
        rgroupAttachmentPoints = _this$data3.rgroupAttachmentPoints,
        color = _this$data3.color,
        highlightId = _this$data3.highlightId;
      var inverted = new HighlightAdd(atoms, bonds, rgroupAttachmentPoints, color, highlightId);
      inverted.data = this.data;
      return inverted;
    }
  }]);
  return HighlightDelete;
}(BaseOperation);
(function (_BaseOperation3) {
  _inherits(HighlightUpdate, _BaseOperation3);
  function HighlightUpdate(highlightId, atoms, bonds, rgroupAttachmentPoints, color) {
    var _this3;
    _classCallCheck(this, HighlightUpdate);
    _this3 = _callSuper(this, HighlightUpdate, [OperationType.UPDATE_HIGHLIGHT]);
    _defineProperty(_assertThisInitialized(_this3), "newData", void 0);
    _defineProperty(_assertThisInitialized(_this3), "oldData", void 0);
    _this3.newData = {
      atoms: atoms,
      bonds: bonds,
      rgroupAttachmentPoints: rgroupAttachmentPoints,
      color: color,
      highlightId: highlightId
    };
    _this3.oldData = {
      atoms: atoms,
      bonds: bonds,
      rgroupAttachmentPoints: rgroupAttachmentPoints,
      color: color,
      highlightId: highlightId
    };
    return _this3;
  }
  _createClass(HighlightUpdate, [{
    key: "execute",
    value: function execute(restruct) {
      var _this$newData = this.newData,
        atoms = _this$newData.atoms,
        bonds = _this$newData.bonds,
        rgroupAttachmentPoints = _this$newData.rgroupAttachmentPoints,
        color = _this$newData.color;
      if (!color) {
        return;
      }
      var highlightId = this.newData.highlightId;
      var struct = restruct.molecule;
      var highlightToUpdate = struct.highlights.get(highlightId);
      if (highlightToUpdate) {
        var oldAtoms = highlightToUpdate.atoms,
          oldBonds = highlightToUpdate.bonds,
          oldRgroupAttachmentPoints = highlightToUpdate.rgroupAttachmentPoints,
          oldColor = highlightToUpdate.color;
        this.oldData = {
          atoms: oldAtoms,
          bonds: oldBonds,
          rgroupAttachmentPoints: oldRgroupAttachmentPoints,
          color: oldColor,
          highlightId: highlightId
        };
        var updatedHighlight = new Highlight({
          atoms: atoms,
          bonds: bonds,
          rgroupAttachmentPoints: rgroupAttachmentPoints,
          color: color
        });
        struct.highlights.set(this.newData.highlightId, updatedHighlight);
        notifyChanged(restruct, [].concat(_toConsumableArray(atoms), _toConsumableArray(oldAtoms)), [].concat(_toConsumableArray(bonds), _toConsumableArray(oldBonds)));
      }
    }
  }, {
    key: "invert",
    value: function invert() {
      var _this$oldData = this.oldData,
        atoms = _this$oldData.atoms,
        bonds = _this$oldData.bonds,
        rgroupAttachmentPoints = _this$oldData.rgroupAttachmentPoints,
        color = _this$oldData.color;
      var inverted = new HighlightUpdate(this.newData.highlightId, atoms, bonds, rgroupAttachmentPoints, color);
      return inverted;
    }
  }, {
    key: "isDummy",
    value: function isDummy(restruct) {
      var _this4 = this;
      if (!restruct) return false;
      var highlight = restruct.molecule.highlights.get(this.newData.highlightId);
      if (!highlight) return false;
      return highlight.color === this.newData.color && highlight.atoms.length === this.newData.atoms.length && highlight.bonds.length === this.newData.bonds.length && highlight.atoms.every(function (id, i) {
        return _this4.newData.atoms[i] === id;
      }) && highlight.bonds.every(function (id, i) {
        return _this4.newData.bonds[i] === id;
      });
    }
  }]);
  return HighlightUpdate;
})(BaseOperation);
function notifyChanged(restruct, atoms, bonds, rgroupAttachmentPoints) {
  var reAtoms = restruct.atoms;
  var reBonds = restruct.bonds;
  var reRgroupAttachmentPoints = restruct.rgroupAttachmentPoints;
  if (atoms) {
    atoms.forEach(function (atomId) {
      if (typeof reAtoms.get(atomId) !== 'undefined') {
        restruct.markAtom(atomId, 1);
      }
    });
  }
  if (bonds) {
    bonds.forEach(function (bondId) {
      if (typeof reBonds.get(bondId) !== 'undefined') {
        restruct.markBond(bondId, 1);
      }
    });
  }
  if (rgroupAttachmentPoints) {
    rgroupAttachmentPoints.forEach(function (rgroupAPid) {
      if (typeof reRgroupAttachmentPoints.get(rgroupAPid) !== 'undefined') {
        restruct.markRgroupAttachmentPoint(rgroupAPid, 1);
      }
    });
  }
}

export { HighlightAdd, HighlightDelete };
//# sourceMappingURL=highlight.modern.js.map
