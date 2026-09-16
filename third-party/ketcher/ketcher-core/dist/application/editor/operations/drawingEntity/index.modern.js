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
import { BaseBond } from '../../../../domain/entities/BaseBond.modern.js';
import { RxnArrow } from '../../../../domain/entities/CoreRxnArrow.modern.js';
import { MultitailArrow } from '../../../../domain/entities/CoreMultitailArrow.modern.js';
import { RxnPlus } from '../../../../domain/entities/CoreRxnPlus.modern.js';
import { CoreStereoFlag } from '../../../../domain/entities/CoreStereoFlag.modern.js';
import { Atom } from '../../../../domain/entities/CoreAtom.modern.js';
import { Bond } from '../../../../domain/entities/CoreBond.modern.js';

var DrawingEntityHoverOperation = function () {
  function DrawingEntityHoverOperation(drawingEntity) {
    _classCallCheck(this, DrawingEntityHoverOperation);
    _defineProperty(this, "drawingEntity", void 0);
    this.drawingEntity = drawingEntity;
  }
  _createClass(DrawingEntityHoverOperation, [{
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
    _classCallCheck(this, DrawingEntitySelectOperation);
    _defineProperty(this, "drawingEntity", void 0);
    _defineProperty(this, "selectDrawingEntitiesModelChange", void 0);
    this.drawingEntity = drawingEntity;
    this.selectDrawingEntitiesModelChange = selectDrawingEntitiesModelChange;
  }
  _createClass(DrawingEntitySelectOperation, [{
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
    _classCallCheck(this, DrawingEntityMoveOperation);
    _defineProperty(this, "moveDrawingEntityChangeModel", void 0);
    _defineProperty(this, "invertMoveDrawingEntityChangeModel", void 0);
    _defineProperty(this, "redoDrawingEntityChangeModel", void 0);
    _defineProperty(this, "drawingEntity", void 0);
    _defineProperty(this, "wasInverted", false);
    this.moveDrawingEntityChangeModel = moveDrawingEntityChangeModel;
    this.invertMoveDrawingEntityChangeModel = invertMoveDrawingEntityChangeModel;
    this.redoDrawingEntityChangeModel = redoDrawingEntityChangeModel;
    this.drawingEntity = drawingEntity;
  }
  _createClass(DrawingEntityMoveOperation, [{
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
      if (this.drawingEntity instanceof BaseBond || this.drawingEntity instanceof RxnArrow || this.drawingEntity instanceof MultitailArrow || this.drawingEntity instanceof RxnPlus || this.drawingEntity instanceof CoreStereoFlag) {
        renderersManager.redrawDrawingEntity(this.drawingEntity);
      } else {
        renderersManager.moveDrawingEntity(this.drawingEntity);
      }
      if (this.drawingEntity instanceof Atom || this.drawingEntity instanceof Bond) {
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
    _classCallCheck(this, DrawingEntityRedrawOperation);
    _defineProperty(this, "drawingEntityRedrawModelChange", void 0);
    _defineProperty(this, "invertDrawingEntityRedrawModelChange", void 0);
    this.drawingEntityRedrawModelChange = drawingEntityRedrawModelChange;
    this.invertDrawingEntityRedrawModelChange = invertDrawingEntityRedrawModelChange;
  }
  _createClass(DrawingEntityRedrawOperation, [{
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

export { DrawingEntityHoverOperation, DrawingEntityMoveOperation, DrawingEntityRedrawOperation, DrawingEntitySelectOperation };
//# sourceMappingURL=index.modern.js.map
