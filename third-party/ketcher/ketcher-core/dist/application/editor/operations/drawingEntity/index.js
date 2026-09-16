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
var BaseBond = require('../../../../domain/entities/BaseBond.js');
var CoreRxnArrow = require('../../../../domain/entities/CoreRxnArrow.js');
var CoreMultitailArrow = require('../../../../domain/entities/CoreMultitailArrow.js');
var CoreRxnPlus = require('../../../../domain/entities/CoreRxnPlus.js');
var CoreStereoFlag = require('../../../../domain/entities/CoreStereoFlag.js');
var CoreAtom = require('../../../../domain/entities/CoreAtom.js');
var CoreBond = require('../../../../domain/entities/CoreBond.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);

var DrawingEntityHoverOperation = function () {
  function DrawingEntityHoverOperation(drawingEntity) {
    _classCallCheck__default["default"](this, DrawingEntityHoverOperation);
    _defineProperty__default["default"](this, "drawingEntity", void 0);
    this.drawingEntity = drawingEntity;
  }
  _createClass__default["default"](DrawingEntityHoverOperation, [{
    key: "execute",
    value: function execute(renderersManager) {
      renderersManager.hoverDrawingEntity(this.drawingEntity);
    }
  }, {
    key: "invert",
    value: function invert() {
    }
  }]);
  return DrawingEntityHoverOperation;
}();
var DrawingEntitySelectOperation = function () {
  function DrawingEntitySelectOperation(drawingEntity, selectDrawingEntitiesModelChange) {
    _classCallCheck__default["default"](this, DrawingEntitySelectOperation);
    _defineProperty__default["default"](this, "drawingEntity", void 0);
    _defineProperty__default["default"](this, "selectDrawingEntitiesModelChange", void 0);
    this.drawingEntity = drawingEntity;
    this.selectDrawingEntitiesModelChange = selectDrawingEntitiesModelChange;
  }
  _createClass__default["default"](DrawingEntitySelectOperation, [{
    key: "execute",
    value: function execute() {
      if (this.selectDrawingEntitiesModelChange) {
        this.selectDrawingEntitiesModelChange();
      }
    }
  }, {
    key: "executeAfterAllOperations",
    value: function executeAfterAllOperations(renderersManager) {
      renderersManager.selectDrawingEntity(this.drawingEntity);
    }
  }, {
    key: "invert",
    value: function invert() {
    }
  }]);
  return DrawingEntitySelectOperation;
}();
var DrawingEntityMoveOperation = function () {
  function DrawingEntityMoveOperation(moveDrawingEntityChangeModel, invertMoveDrawingEntityChangeModel, redoDrawingEntityChangeModel, drawingEntity) {
    _classCallCheck__default["default"](this, DrawingEntityMoveOperation);
    _defineProperty__default["default"](this, "moveDrawingEntityChangeModel", void 0);
    _defineProperty__default["default"](this, "invertMoveDrawingEntityChangeModel", void 0);
    _defineProperty__default["default"](this, "redoDrawingEntityChangeModel", void 0);
    _defineProperty__default["default"](this, "drawingEntity", void 0);
    _defineProperty__default["default"](this, "wasInverted", false);
    this.moveDrawingEntityChangeModel = moveDrawingEntityChangeModel;
    this.invertMoveDrawingEntityChangeModel = invertMoveDrawingEntityChangeModel;
    this.redoDrawingEntityChangeModel = redoDrawingEntityChangeModel;
    this.drawingEntity = drawingEntity;
  }
  _createClass__default["default"](DrawingEntityMoveOperation, [{
    key: "execute",
    value: function execute() {
      if (this.wasInverted) {
        this.redoDrawingEntityChangeModel();
      } else {
        this.moveDrawingEntityChangeModel();
      }
    }
  }, {
    key: "invert",
    value: function invert() {
      this.invertMoveDrawingEntityChangeModel();
      this.wasInverted = true;
    }
  }, {
    key: "executeAfterAllOperations",
    value: function executeAfterAllOperations(renderersManager) {
      if (this.drawingEntity instanceof BaseBond.BaseBond || this.drawingEntity instanceof CoreRxnArrow.RxnArrow || this.drawingEntity instanceof CoreMultitailArrow.MultitailArrow || this.drawingEntity instanceof CoreRxnPlus.RxnPlus || this.drawingEntity instanceof CoreStereoFlag.CoreStereoFlag) {
        renderersManager.redrawDrawingEntity(this.drawingEntity);
      } else {
        renderersManager.moveDrawingEntity(this.drawingEntity);
      }
      if (this.drawingEntity instanceof CoreAtom.Atom || this.drawingEntity instanceof CoreBond.Bond) {
        renderersManager.rerenderSGroups();
      }
    }
  }, {
    key: "invertAfterAllOperations",
    value: function invertAfterAllOperations(renderersManager) {
      this.executeAfterAllOperations(renderersManager);
    }
  }]);
  return DrawingEntityMoveOperation;
}();
var DrawingEntityRedrawOperation = function () {
  function DrawingEntityRedrawOperation(drawingEntityRedrawModelChange, invertDrawingEntityRedrawModelChange) {
    _classCallCheck__default["default"](this, DrawingEntityRedrawOperation);
    _defineProperty__default["default"](this, "drawingEntityRedrawModelChange", void 0);
    _defineProperty__default["default"](this, "invertDrawingEntityRedrawModelChange", void 0);
    this.drawingEntityRedrawModelChange = drawingEntityRedrawModelChange;
    this.invertDrawingEntityRedrawModelChange = invertDrawingEntityRedrawModelChange;
  }
  _createClass__default["default"](DrawingEntityRedrawOperation, [{
    key: "execute",
    value: function execute(renderersManager) {
      var drawingEntity = this.drawingEntityRedrawModelChange();
      renderersManager.redrawDrawingEntity(drawingEntity, true);
    }
  }, {
    key: "invert",
    value: function invert(renderersManager) {
      var drawingEntity = this.invertDrawingEntityRedrawModelChange();
      renderersManager.redrawDrawingEntity(drawingEntity, true);
    }
  }]);
  return DrawingEntityRedrawOperation;
}();

exports.DrawingEntityHoverOperation = DrawingEntityHoverOperation;
exports.DrawingEntityMoveOperation = DrawingEntityMoveOperation;
exports.DrawingEntityRedrawOperation = DrawingEntityRedrawOperation;
exports.DrawingEntitySelectOperation = DrawingEntitySelectOperation;
//# sourceMappingURL=index.js.map
