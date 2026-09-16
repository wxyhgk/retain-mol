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

var PolymerBondAddOperation = function () {
  function PolymerBondAddOperation(addPolymerBondChangeModel, deletePolymerBondChangeModel) {
    _classCallCheck(this, PolymerBondAddOperation);
    _defineProperty(this, "addPolymerBondChangeModel", void 0);
    _defineProperty(this, "deletePolymerBondChangeModel", void 0);
    _defineProperty(this, "polymerBond", void 0);
    _defineProperty(this, "priority", 1);
    this.addPolymerBondChangeModel = addPolymerBondChangeModel;
    this.deletePolymerBondChangeModel = deletePolymerBondChangeModel;
    this.polymerBond = this.addPolymerBondChangeModel();
  }
  _createClass(PolymerBondAddOperation, [{
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
    _classCallCheck(this, PolymerBondDeleteOperation);
    _defineProperty(this, "polymerBond", void 0);
    _defineProperty(this, "deletePolymerBondChangeModel", void 0);
    _defineProperty(this, "finishPolymerBondCreationModelChange", void 0);
    _defineProperty(this, "priority", -1);
    this.polymerBond = polymerBond;
    this.deletePolymerBondChangeModel = deletePolymerBondChangeModel;
    this.finishPolymerBondCreationModelChange = finishPolymerBondCreationModelChange;
    this.deletePolymerBondChangeModel();
  }
  _createClass(PolymerBondDeleteOperation, [{
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
    _classCallCheck(this, PolymerBondMoveOperation);
    _defineProperty(this, "polymerBond", void 0);
    this.polymerBond = polymerBond;
  }
  _createClass(PolymerBondMoveOperation, [{
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
    _classCallCheck(this, PolymerBondSnapToMonomersOperation);
    _defineProperty(this, "polymerBond", void 0);
    this.polymerBond = polymerBond;
  }
  _createClass(PolymerBondSnapToMonomersOperation, [{
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
    _classCallCheck(this, PolymerBondShowInfoOperation);
    _defineProperty(this, "polymerBond", void 0);
    this.polymerBond = polymerBond;
  }
  _createClass(PolymerBondShowInfoOperation, [{
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
    _classCallCheck(this, PolymerBondCancelCreationOperation);
    _defineProperty(this, "polymerBond", void 0);
    _defineProperty(this, "secondMonomer", void 0);
    this.polymerBond = polymerBond;
    this.secondMonomer = secondMonomer;
  }
  _createClass(PolymerBondCancelCreationOperation, [{
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
    _classCallCheck(this, PolymerBondFinishCreationOperation);
    _defineProperty(this, "finishPolymerBondCreationModelChange", void 0);
    _defineProperty(this, "deletePolymerBondCreationModelChange", void 0);
    _defineProperty(this, "polymerBond", void 0);
    _defineProperty(this, "priority", 1);
    this.finishPolymerBondCreationModelChange = finishPolymerBondCreationModelChange;
    this.deletePolymerBondCreationModelChange = deletePolymerBondCreationModelChange;
    this.polymerBond = this.finishPolymerBondCreationModelChange();
  }
  _createClass(PolymerBondFinishCreationOperation, [{
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
    _classCallCheck(this, SelectLayoutModeOperation);
    _defineProperty(this, "_onExecute", void 0);
    _defineProperty(this, "_onInvert", void 0);
    _defineProperty(this, "mode", void 0);
    _defineProperty(this, "prevMode", void 0);
    _defineProperty(this, "onExecute", void 0);
    _defineProperty(this, "onInvert", void 0);
    this._onExecute = _onExecute;
    this._onInvert = _onInvert;
    this.mode = mode;
    this.prevMode = prevMode;
    this.onExecute = _onExecute;
    this.onInvert = _onInvert;
  }
  _createClass(SelectLayoutModeOperation, [{
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
    _classCallCheck(this, ReconnectPolymerBondOperation);
    _defineProperty(this, "reconnectPolymerBondModelChange", void 0);
    _defineProperty(this, "revertReconnectPolymerBondModelChange", void 0);
    _defineProperty(this, "polymerBond", void 0);
    this.reconnectPolymerBondModelChange = reconnectPolymerBondModelChange;
    this.revertReconnectPolymerBondModelChange = revertReconnectPolymerBondModelChange;
  }
  _createClass(ReconnectPolymerBondOperation, [{
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

export { PolymerBondAddOperation, PolymerBondCancelCreationOperation, PolymerBondDeleteOperation, PolymerBondFinishCreationOperation, PolymerBondMoveOperation, PolymerBondShowInfoOperation, PolymerBondSnapToMonomersOperation, ReconnectPolymerBondOperation, SelectLayoutModeOperation };
//# sourceMappingURL=index.modern.js.map
