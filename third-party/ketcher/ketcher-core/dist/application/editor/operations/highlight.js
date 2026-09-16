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
var _possibleConstructorReturn = require('@babel/runtime/helpers/possibleConstructorReturn');
var _getPrototypeOf = require('@babel/runtime/helpers/getPrototypeOf');
var _assertThisInitialized = require('@babel/runtime/helpers/assertThisInitialized');
var _inherits = require('@babel/runtime/helpers/inherits');
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var highlight = require('../../../domain/entities/highlight.js');
var BaseOperation = require('./BaseOperation.js');
var OperationType = require('./OperationType.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _toConsumableArray__default = /*#__PURE__*/_interopDefaultLegacy(_toConsumableArray);
var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _possibleConstructorReturn__default = /*#__PURE__*/_interopDefaultLegacy(_possibleConstructorReturn);
var _getPrototypeOf__default = /*#__PURE__*/_interopDefaultLegacy(_getPrototypeOf);
var _assertThisInitialized__default = /*#__PURE__*/_interopDefaultLegacy(_assertThisInitialized);
var _inherits__default = /*#__PURE__*/_interopDefaultLegacy(_inherits);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);

function _callSuper(t, o, e) { return o = _getPrototypeOf__default["default"](o), _possibleConstructorReturn__default["default"](t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf__default["default"](t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var HighlightAdd = function (_BaseOperation) {
  _inherits__default["default"](HighlightAdd, _BaseOperation);
  function HighlightAdd(atoms, bonds, rgroupAttachmentPoints, color, highlightId, outline) {
    var _this;
    _classCallCheck__default["default"](this, HighlightAdd);
    _this = _callSuper(this, HighlightAdd, [OperationType.OperationType.ADD_HIGHLIGHT]);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "data", void 0);
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
  _createClass__default["default"](HighlightAdd, [{
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
      var highlight$1 = new highlight.Highlight({
        atoms: atoms,
        bonds: bonds,
        rgroupAttachmentPoints: rgroupAttachmentPoints,
        color: color,
        outline: outline
      });
      if (typeof this.data.highlightId !== 'number') {
        this.data.highlightId = struct.highlights.add(highlight$1);
      } else {
        struct.highlights.set(this.data.highlightId, highlight$1);
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
}(BaseOperation.BaseOperation);
var HighlightDelete = function (_BaseOperation2) {
  _inherits__default["default"](HighlightDelete, _BaseOperation2);
  function HighlightDelete(highlightId, atoms, bonds, rgroupAttachmentPoints, color) {
    var _this2;
    _classCallCheck__default["default"](this, HighlightDelete);
    _this2 = _callSuper(this, HighlightDelete, [OperationType.OperationType.REMOVE_HIGHLIGHT, 5]);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this2), "data", void 0);
    _this2.data = {
      highlightId: highlightId,
      atoms: atoms !== null && atoms !== void 0 ? atoms : [],
      bonds: bonds !== null && bonds !== void 0 ? bonds : [],
      rgroupAttachmentPoints: rgroupAttachmentPoints !== null && rgroupAttachmentPoints !== void 0 ? rgroupAttachmentPoints : [],
      color: color !== null && color !== void 0 ? color : 'white'
    };
    return _this2;
  }
  _createClass__default["default"](HighlightDelete, [{
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
}(BaseOperation.BaseOperation);
(function (_BaseOperation3) {
  _inherits__default["default"](HighlightUpdate, _BaseOperation3);
  function HighlightUpdate(highlightId, atoms, bonds, rgroupAttachmentPoints, color) {
    var _this3;
    _classCallCheck__default["default"](this, HighlightUpdate);
    _this3 = _callSuper(this, HighlightUpdate, [OperationType.OperationType.UPDATE_HIGHLIGHT]);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this3), "newData", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this3), "oldData", void 0);
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
  _createClass__default["default"](HighlightUpdate, [{
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
        var updatedHighlight = new highlight.Highlight({
          atoms: atoms,
          bonds: bonds,
          rgroupAttachmentPoints: rgroupAttachmentPoints,
          color: color
        });
        struct.highlights.set(this.newData.highlightId, updatedHighlight);
        notifyChanged(restruct, [].concat(_toConsumableArray__default["default"](atoms), _toConsumableArray__default["default"](oldAtoms)), [].concat(_toConsumableArray__default["default"](bonds), _toConsumableArray__default["default"](oldBonds)));
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
})(BaseOperation.BaseOperation);
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

exports.HighlightAdd = HighlightAdd;
exports.HighlightDelete = HighlightDelete;
//# sourceMappingURL=highlight.js.map
