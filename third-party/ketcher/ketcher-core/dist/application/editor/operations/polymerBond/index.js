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

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);

var PolymerBondAddOperation = function () {
  function PolymerBondAddOperation(addPolymerBondChangeModel, deletePolymerBondChangeModel) {
    _classCallCheck__default["default"](this, PolymerBondAddOperation);
    _defineProperty__default["default"](this, "addPolymerBondChangeModel", void 0);
    _defineProperty__default["default"](this, "deletePolymerBondChangeModel", void 0);
    _defineProperty__default["default"](this, "polymerBond", void 0);
    _defineProperty__default["default"](this, "priority", 1);
    this.addPolymerBondChangeModel = addPolymerBondChangeModel;
    this.deletePolymerBondChangeModel = deletePolymerBondChangeModel;
    this.polymerBond = this.addPolymerBondChangeModel();
  }
  _createClass__default["default"](PolymerBondAddOperation, [{
    key: "execute",
    value: function execute(renderersManager) {
      this.polymerBond = this.addPolymerBondChangeModel(this.polymerBond);
      renderersManager.addPolymerBond(this.polymerBond);
    }
  }, {
    key: "invert",
    value: function invert(renderersManager) {
      this.deletePolymerBondChangeModel(this.polymerBond);
      renderersManager.deletePolymerBond(this.polymerBond);
    }
  }]);
  return PolymerBondAddOperation;
}();
var PolymerBondDeleteOperation = function () {
  function PolymerBondDeleteOperation(polymerBond, deletePolymerBondChangeModel, finishPolymerBondCreationModelChange) {
    _classCallCheck__default["default"](this, PolymerBondDeleteOperation);
    _defineProperty__default["default"](this, "polymerBond", void 0);
    _defineProperty__default["default"](this, "deletePolymerBondChangeModel", void 0);
    _defineProperty__default["default"](this, "finishPolymerBondCreationModelChange", void 0);
    _defineProperty__default["default"](this, "priority", -1);
    this.polymerBond = polymerBond;
    this.deletePolymerBondChangeModel = deletePolymerBondChangeModel;
    this.finishPolymerBondCreationModelChange = finishPolymerBondCreationModelChange;
    this.deletePolymerBondChangeModel();
  }
  _createClass__default["default"](PolymerBondDeleteOperation, [{
    key: "execute",
    value: function execute(renderersManager) {
      this.deletePolymerBondChangeModel();
      renderersManager.deletePolymerBond(this.polymerBond);
    }
  }, {
    key: "invert",
    value: function invert(renderersManager) {
      this.polymerBond = this.finishPolymerBondCreationModelChange(this.polymerBond);
      renderersManager.addPolymerBond(this.polymerBond);
    }
  }]);
  return PolymerBondDeleteOperation;
}();
var PolymerBondMoveOperation = function () {
  function PolymerBondMoveOperation(polymerBond) {
    _classCallCheck__default["default"](this, PolymerBondMoveOperation);
    _defineProperty__default["default"](this, "polymerBond", void 0);
    this.polymerBond = polymerBond;
  }
  _createClass__default["default"](PolymerBondMoveOperation, [{
    key: "execute",
    value: function execute(renderersManager) {
      renderersManager.movePolymerBond(this.polymerBond);
    }
  }, {
    key: "invert",
    value: function invert() {
    }
  }]);
  return PolymerBondMoveOperation;
}();
var PolymerBondSnapToMonomersOperation = function () {
  function PolymerBondSnapToMonomersOperation(polymerBond) {
    _classCallCheck__default["default"](this, PolymerBondSnapToMonomersOperation);
    _defineProperty__default["default"](this, "polymerBond", void 0);
    this.polymerBond = polymerBond;
  }
  _createClass__default["default"](PolymerBondSnapToMonomersOperation, [{
    key: "snap",
    value: function snap(renderersManager) {
      this.polymerBond.moveToLinkedEntities();
      renderersManager.movePolymerBond(this.polymerBond);
    }
  }, {
    key: "execute",
    value: function execute(renderersManager) {
      this.snap(renderersManager);
    }
  }, {
    key: "invert",
    value: function invert(renderersManager) {
      this.snap(renderersManager);
    }
  }]);
  return PolymerBondSnapToMonomersOperation;
}();
var PolymerBondShowInfoOperation = function () {
  function PolymerBondShowInfoOperation(polymerBond) {
    _classCallCheck__default["default"](this, PolymerBondShowInfoOperation);
    _defineProperty__default["default"](this, "polymerBond", void 0);
    this.polymerBond = polymerBond;
  }
  _createClass__default["default"](PolymerBondShowInfoOperation, [{
    key: "execute",
    value: function execute(renderersManager) {
      renderersManager.showPolymerBondInformation(this.polymerBond);
    }
  }, {
    key: "invert",
    value: function invert() {
    }
  }]);
  return PolymerBondShowInfoOperation;
}();
var PolymerBondCancelCreationOperation = function () {
  function PolymerBondCancelCreationOperation(polymerBond, secondMonomer) {
    _classCallCheck__default["default"](this, PolymerBondCancelCreationOperation);
    _defineProperty__default["default"](this, "polymerBond", void 0);
    _defineProperty__default["default"](this, "secondMonomer", void 0);
    this.polymerBond = polymerBond;
    this.secondMonomer = secondMonomer;
  }
  _createClass__default["default"](PolymerBondCancelCreationOperation, [{
    key: "execute",
    value: function execute(renderersManager) {
      renderersManager.cancelPolymerBondCreation(this.polymerBond, this.secondMonomer);
    }
  }, {
    key: "invert",
    value: function invert() {
    }
  }]);
  return PolymerBondCancelCreationOperation;
}();
var PolymerBondFinishCreationOperation = function () {
  function PolymerBondFinishCreationOperation(finishPolymerBondCreationModelChange, deletePolymerBondCreationModelChange) {
    _classCallCheck__default["default"](this, PolymerBondFinishCreationOperation);
    _defineProperty__default["default"](this, "finishPolymerBondCreationModelChange", void 0);
    _defineProperty__default["default"](this, "deletePolymerBondCreationModelChange", void 0);
    _defineProperty__default["default"](this, "polymerBond", void 0);
    _defineProperty__default["default"](this, "priority", 1);
    this.finishPolymerBondCreationModelChange = finishPolymerBondCreationModelChange;
    this.deletePolymerBondCreationModelChange = deletePolymerBondCreationModelChange;
    this.polymerBond = this.finishPolymerBondCreationModelChange();
  }
  _createClass__default["default"](PolymerBondFinishCreationOperation, [{
    key: "execute",
    value: function execute(renderersManager) {
      this.polymerBond = this.finishPolymerBondCreationModelChange(this.polymerBond);
      renderersManager.finishPolymerBondCreation(this.polymerBond);
    }
  }, {
    key: "invert",
    value: function invert(renderersManager) {
      this.deletePolymerBondCreationModelChange(this.polymerBond);
      renderersManager.deletePolymerBond(this.polymerBond);
    }
  }]);
  return PolymerBondFinishCreationOperation;
}();
var SelectLayoutModeOperation = function () {
  function SelectLayoutModeOperation(_onExecute, _onInvert, mode, prevMode) {
    _classCallCheck__default["default"](this, SelectLayoutModeOperation);
    _defineProperty__default["default"](this, "_onExecute", void 0);
    _defineProperty__default["default"](this, "_onInvert", void 0);
    _defineProperty__default["default"](this, "mode", void 0);
    _defineProperty__default["default"](this, "prevMode", void 0);
    _defineProperty__default["default"](this, "onExecute", void 0);
    _defineProperty__default["default"](this, "onInvert", void 0);
    this._onExecute = _onExecute;
    this._onInvert = _onInvert;
    this.mode = mode;
    this.prevMode = prevMode;
    this.onExecute = _onExecute;
    this.onInvert = _onInvert;
  }
  _createClass__default["default"](SelectLayoutModeOperation, [{
    key: "execute",
    value: function execute() {
      this.onExecute();
    }
  }, {
    key: "invert",
    value: function invert() {
      this.onInvert();
    }
  }]);
  return SelectLayoutModeOperation;
}();
var ReconnectPolymerBondOperation = function () {
  function ReconnectPolymerBondOperation(reconnectPolymerBondModelChange, revertReconnectPolymerBondModelChange) {
    _classCallCheck__default["default"](this, ReconnectPolymerBondOperation);
    _defineProperty__default["default"](this, "reconnectPolymerBondModelChange", void 0);
    _defineProperty__default["default"](this, "revertReconnectPolymerBondModelChange", void 0);
    _defineProperty__default["default"](this, "polymerBond", void 0);
    this.reconnectPolymerBondModelChange = reconnectPolymerBondModelChange;
    this.revertReconnectPolymerBondModelChange = revertReconnectPolymerBondModelChange;
  }
  _createClass__default["default"](ReconnectPolymerBondOperation, [{
    key: "execute",
    value: function execute(renderersManager) {
      this.polymerBond = this.reconnectPolymerBondModelChange();
      renderersManager.redrawDrawingEntity(this.polymerBond, false, true);
    }
  }, {
    key: "invert",
    value: function invert(renderersManager) {
      this.polymerBond = this.revertReconnectPolymerBondModelChange();
      renderersManager.redrawDrawingEntity(this.polymerBond, false, true);
    }
  }]);
  return ReconnectPolymerBondOperation;
}();

exports.PolymerBondAddOperation = PolymerBondAddOperation;
exports.PolymerBondCancelCreationOperation = PolymerBondCancelCreationOperation;
exports.PolymerBondDeleteOperation = PolymerBondDeleteOperation;
exports.PolymerBondFinishCreationOperation = PolymerBondFinishCreationOperation;
exports.PolymerBondMoveOperation = PolymerBondMoveOperation;
exports.PolymerBondShowInfoOperation = PolymerBondShowInfoOperation;
exports.PolymerBondSnapToMonomersOperation = PolymerBondSnapToMonomersOperation;
exports.ReconnectPolymerBondOperation = ReconnectPolymerBondOperation;
exports.SelectLayoutModeOperation = SelectLayoutModeOperation;
//# sourceMappingURL=index.js.map
