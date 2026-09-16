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
var EditorHistory = require('../EditorHistory.js');
var coordinates = require('../shared/coordinates.js');
require('../editor.types.js');
require('./select/SelectBase.js');
require('./select/SelectRectangle.js');
require('./select/SelectLasso.js');
require('./select/SelectFragment.js');
var BaseMonomerRenderer = require('../../render/renderers/BaseMonomerRenderer.js');
require('../../../utilities/runAsyncAction.js');
require('../../../utilities/KetcherLogger.js');
require('../../../utilities/SettingsManager.js');
require('../../../utilities/keynorm.js');
require('react-device-detect');
require('../../../utilities/clipboardUtils.js');
var assert = require('../../../utilities/assert.js');
var AttachmentPoint = require('../../../domain/AttachmentPoint.js');
var Command = require('../../../domain/entities/Command.js');
var monomers = require('../../../domain/types/monomers.js');
require('../../../domain/types/entities.js');
var types = require('./types.js');
var MonomerToAtomBond = require('../../../domain/entities/MonomerToAtomBond.js');
var HydrogenBond = require('../../../domain/entities/HydrogenBond.js');
var bondConnectionHelpers = require('./bondConnectionHelpers.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);

var PolymerBond = function () {
  function PolymerBond(editor) {
    var _this = this;
    _classCallCheck__default["default"](this, PolymerBond);
    _defineProperty__default["default"](this, "editor", void 0);
    _defineProperty__default["default"](this, "bondRenderer", void 0);
    _defineProperty__default["default"](this, "isBondConnectionModalOpen", false);
    _defineProperty__default["default"](this, "history", void 0);
    _defineProperty__default["default"](this, "bondType", void 0);
    _defineProperty__default["default"](this, "handleBondCreation", function (payload) {
      assert.assert(_this.bondRenderer);
      var secondMonomer = payload.secondMonomer,
        firstSelectedAttachmentPoint = payload.firstSelectedAttachmentPoint,
        secondSelectedAttachmentPoint = payload.secondSelectedAttachmentPoint;
      var modelChanges = _this.editor.drawingEntitiesManager.finishPolymerBondCreation(_this.bondRenderer.polymerBond, secondMonomer, firstSelectedAttachmentPoint, secondSelectedAttachmentPoint);
      _this.history.update(modelChanges);
      _this.editor.renderersContainer.update(modelChanges);
      if (firstSelectedAttachmentPoint === secondSelectedAttachmentPoint) {
        _this.editor.events.error.dispatch('You have connected monomers with attachment points of the same group');
      }
      _this.isBondConnectionModalOpen = false;
      _this.editor.renderersContainer.deletePolymerBond(_this.bondRenderer.polymerBond);
      _this.bondRenderer = undefined;
    });
    _defineProperty__default["default"](this, "handleBondCreationCancellation", function (secondMonomer) {
      if (!_this.bondRenderer) {
        return;
      }
      var modelChanges = _this.editor.drawingEntitiesManager.cancelPolymerBondCreation(_this.bondRenderer.polymerBond, secondMonomer);
      _this.editor.renderersContainer.update(modelChanges);
      _this.isBondConnectionModalOpen = false;
      _this.bondRenderer = undefined;
    });
    this.editor = editor;
    for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }
    var options = args[0];
    this.editor = editor;
    this.history = EditorHistory.EditorHistory.getInstance(this.editor);
    this.bondType = options.toolName === types.ToolName.bondSingle ? types.MACROMOLECULES_BOND_TYPES.SINGLE : types.MACROMOLECULES_BOND_TYPES.HYDROGEN;
  }
  _createClass__default["default"](PolymerBond, [{
    key: "isHydrogenBond",
    get: function get() {
      return this.bondType === types.MACROMOLECULES_BOND_TYPES.HYDROGEN;
    }
  }, {
    key: "mouseDownAttachmentPoint",
    value: function mouseDownAttachmentPoint(event) {
      var _event$target;
      if (this.isHydrogenBond) {
        return;
      }
      var selectedRenderer = (_event$target = event.target) === null || _event$target === void 0 ? void 0 : _event$target.__data__;
      if (selectedRenderer instanceof AttachmentPoint.AttachmentPoint && !selectedRenderer.monomer.isAttachmentPointUsed(event.attachmentPointName)) {
        selectedRenderer.monomer.setChosenFirstAttachmentPoint(event.attachmentPointName);
      }
    }
  }, {
    key: "removeBond",
    value: function removeBond() {
      if (this.bondRenderer) {
        var modelChanges = this.editor.drawingEntitiesManager.cancelPolymerBondCreation(this.bondRenderer.polymerBond);
        this.bondRenderer = undefined;
        return modelChanges;
      } else {
        return new Command.Command();
      }
    }
  }, {
    key: "mousedown",
    value: function mousedown(event) {
      var _event$target2;
      var selectedRenderer = (_event$target2 = event.target) === null || _event$target2 === void 0 ? void 0 : _event$target2.__data__;
      if (selectedRenderer instanceof BaseMonomerRenderer.BaseMonomerRenderer || selectedRenderer instanceof AttachmentPoint.AttachmentPoint) {
        var startAttachmentPoint = selectedRenderer.monomer.startBondAttachmentPoint;
        if (!startAttachmentPoint && !this.isHydrogenBond) {
          this.editor.events.error.dispatch("Selected monomer doesn't have any free attachment points");
          return;
        }
        var _this$editor$drawingE = this.editor.drawingEntitiesManager.startPolymerBondCreation(selectedRenderer.monomer, selectedRenderer.monomer.position, coordinates.Coordinates.canvasToModel(this.editor.lastCursorPositionOfCanvas), this.bondType),
          polymerBond = _this$editor$drawingE.polymerBond,
          modelChanges = _this$editor$drawingE.command;
        this.editor.renderersContainer.update(modelChanges);
        this.bondRenderer = polymerBond.renderer;
      }
    }
  }, {
    key: "mousemove",
    value: function mousemove() {
      if (this.bondRenderer) {
        var modelChanges = this.editor.drawingEntitiesManager.movePolymerBond(this.bondRenderer.polymerBond, coordinates.Coordinates.canvasToModel(this.editor.lastCursorPositionOfCanvas));
        this.editor.renderersContainer.update(modelChanges);
      }
    }
  }, {
    key: "mouseLeavePolymerBond",
    value: function mouseLeavePolymerBond(event) {
      var _event$target3;
      var renderer = (_event$target3 = event.target) === null || _event$target3 === void 0 ? void 0 : _event$target3.__data__;
      if (this.bondRenderer || !(renderer !== null && renderer !== void 0 && renderer.polymerBond)) return;
      var modelChanges = this.editor.drawingEntitiesManager.hidePolymerBondInformation(renderer.polymerBond);
      this.editor.renderersContainer.update(modelChanges);
    }
  }, {
    key: "mouseOverPolymerBond",
    value: function mouseOverPolymerBond(event) {
      var _event$target4;
      if (this.bondRenderer) return;
      var renderer = (_event$target4 = event.target) === null || _event$target4 === void 0 ? void 0 : _event$target4.__data__;
      if (!renderer) return;
      var modelChanges = this.editor.drawingEntitiesManager.showPolymerBondInformation(renderer.polymerBond);
      this.editor.renderersContainer.update(modelChanges);
    }
  }, {
    key: "mouseOverMonomer",
    value: function mouseOverMonomer(event) {
      var _event$target5;
      var renderer = (_event$target5 = event.target) === null || _event$target5 === void 0 ? void 0 : _event$target5.__data__;
      if (!renderer) return;
      var modelChanges;
      if (this.bondRenderer) {
        var _this$bondRenderer, _this$bondRenderer2, _this$bondRenderer3;
        if (((_this$bondRenderer = this.bondRenderer) === null || _this$bondRenderer === void 0 ? void 0 : _this$bondRenderer.polymerBond.firstMonomer) === renderer.monomer) {
          return;
        }
        var shouldCalculateBonds = !this.shouldInvokeModal((_this$bondRenderer2 = this.bondRenderer) === null || _this$bondRenderer2 === void 0 ? void 0 : _this$bondRenderer2.polymerBond.firstMonomer, renderer.monomer, false);
        modelChanges = this.editor.drawingEntitiesManager.intendToFinishBondCreation(renderer.monomer, (_this$bondRenderer3 = this.bondRenderer) === null || _this$bondRenderer3 === void 0 ? void 0 : _this$bondRenderer3.polymerBond, this.isHydrogenBond ? false : shouldCalculateBonds);
      } else {
        modelChanges = this.editor.drawingEntitiesManager.intendToStartBondCreation(renderer.monomer);
      }
      this.editor.renderersContainer.update(modelChanges);
    }
  }, {
    key: "mouseOverAttachmentPoint",
    value: function mouseOverAttachmentPoint(event) {
      var _event$target6;
      if (this.isHydrogenBond) {
        return;
      }
      var renderer = (_event$target6 = event.target) === null || _event$target6 === void 0 ? void 0 : _event$target6.__data__;
      var modelChanges;
      if (renderer.monomer.isAttachmentPointUsed(event.attachmentPointName)) {
        return;
      }
      if (this.bondRenderer) {
        var _this$bondRenderer4, _this$bondRenderer5, _this$bondRenderer6;
        if (((_this$bondRenderer4 = this.bondRenderer) === null || _this$bondRenderer4 === void 0 ? void 0 : _this$bondRenderer4.polymerBond.firstMonomer) === renderer.monomer) {
          return;
        }
        var shouldCalculateBonds = !this.shouldInvokeModal((_this$bondRenderer5 = this.bondRenderer) === null || _this$bondRenderer5 === void 0 ? void 0 : _this$bondRenderer5.polymerBond.firstMonomer, renderer.monomer, false);
        modelChanges = this.editor.drawingEntitiesManager.intendToFinishAttachmenPointBondCreation(renderer.monomer, (_this$bondRenderer6 = this.bondRenderer) === null || _this$bondRenderer6 === void 0 ? void 0 : _this$bondRenderer6.polymerBond, event.attachmentPointName, shouldCalculateBonds);
      } else {
        modelChanges = this.editor.drawingEntitiesManager.intendToStartAttachmenPointBondCreation(renderer.monomer, event.attachmentPointName);
      }
      this.editor.renderersContainer.update(modelChanges);
    }
  }, {
    key: "mouseLeaveMonomer",
    value: function mouseLeaveMonomer(event) {
      var _event$relatedTarget, _event$target7, _event$target8, _this$bondRenderer7;
      var eventToElementData = (_event$relatedTarget = event.relatedTarget) === null || _event$relatedTarget === void 0 ? void 0 : _event$relatedTarget.__data__;
      var eventFromElementData = (_event$target7 = event.target) === null || _event$target7 === void 0 ? void 0 : _event$target7.__data__;
      if (eventToElementData instanceof AttachmentPoint.AttachmentPoint && eventToElementData.monomer === (eventFromElementData === null || eventFromElementData === void 0 ? void 0 : eventFromElementData.monomer)) {
        eventToElementData.monomer.removePotentialBonds();
        return;
      }
      var renderer = (_event$target8 = event.target) === null || _event$target8 === void 0 ? void 0 : _event$target8.__data__;
      if (!renderer) return;
      if (renderer !== ((_this$bondRenderer7 = this.bondRenderer) === null || _this$bondRenderer7 === void 0 || (_this$bondRenderer7 = _this$bondRenderer7.polymerBond) === null || _this$bondRenderer7 === void 0 || (_this$bondRenderer7 = _this$bondRenderer7.firstMonomer) === null || _this$bondRenderer7 === void 0 ? void 0 : _this$bondRenderer7.renderer) && !this.isBondConnectionModalOpen) {
        var _this$bondRenderer8;
        var modelChanges = this.editor.drawingEntitiesManager.cancelIntentionToFinishBondCreation(renderer.monomer, (_this$bondRenderer8 = this.bondRenderer) === null || _this$bondRenderer8 === void 0 ? void 0 : _this$bondRenderer8.polymerBond);
        this.editor.renderersContainer.update(modelChanges);
      }
    }
  }, {
    key: "mouseLeaveAttachmentPoint",
    value: function mouseLeaveAttachmentPoint(event) {
      var _event$target9, _this$bondRenderer9;
      if (this.isBondConnectionModalOpen) {
        return;
      }
      var attachmentPointRenderer = (_event$target9 = event.target) === null || _event$target9 === void 0 ? void 0 : _event$target9.__data__;
      if (!attachmentPointRenderer) return;
      if (attachmentPointRenderer.monomer.renderer !== ((_this$bondRenderer9 = this.bondRenderer) === null || _this$bondRenderer9 === void 0 || (_this$bondRenderer9 = _this$bondRenderer9.polymerBond) === null || _this$bondRenderer9 === void 0 || (_this$bondRenderer9 = _this$bondRenderer9.firstMonomer) === null || _this$bondRenderer9 === void 0 ? void 0 : _this$bondRenderer9.renderer)) {
        var _this$bondRenderer0;
        var modelChanges = this.editor.drawingEntitiesManager.cancelIntentionToFinishBondCreation(attachmentPointRenderer.monomer, (_this$bondRenderer0 = this.bondRenderer) === null || _this$bondRenderer0 === void 0 ? void 0 : _this$bondRenderer0.polymerBond);
        this.editor.renderersContainer.update(modelChanges);
      }
    }
  }, {
    key: "mouseUpAttachmentPoint",
    value: function mouseUpAttachmentPoint(event) {
      var _event$target0, _this$bondRenderer1;
      var renderer = (_event$target0 = event.target) === null || _event$target0 === void 0 ? void 0 : _event$target0.__data__;
      if (!renderer) return;
      var isFirstMonomerHovered = renderer.monomer.renderer === ((_this$bondRenderer1 = this.bondRenderer) === null || _this$bondRenderer1 === void 0 || (_this$bondRenderer1 = _this$bondRenderer1.polymerBond) === null || _this$bondRenderer1 === void 0 || (_this$bondRenderer1 = _this$bondRenderer1.firstMonomer) === null || _this$bondRenderer1 === void 0 ? void 0 : _this$bondRenderer1.renderer);
      if (this.bondRenderer && !isFirstMonomerHovered) {
        var _this$bondRenderer10, _modelChanges$operati;
        var firstMonomer = (_this$bondRenderer10 = this.bondRenderer) === null || _this$bondRenderer10 === void 0 || (_this$bondRenderer10 = _this$bondRenderer10.polymerBond) === null || _this$bondRenderer10 === void 0 ? void 0 : _this$bondRenderer10.firstMonomer;
        var secondMonomer = renderer.monomer;
        if (secondMonomer.isAttachmentPointUsed(event.attachmentPointName)) {
          this.mouseup();
          return;
        }
        for (var attachmentPoint in secondMonomer.attachmentPointsToBonds) {
          var bond = secondMonomer.attachmentPointsToBonds[attachmentPoint];
          if (!bond) {
            continue;
          }
          var alreadyHasBond = bond.firstMonomer === firstMonomer && bond.secondMonomer === secondMonomer || bond.firstMonomer === secondMonomer && bond.secondMonomer === firstMonomer;
          if (alreadyHasBond) {
            var existingBondIsSingleBond = !(bond instanceof HydrogenBond.HydrogenBond);
            if (existingBondIsSingleBond && this.isHydrogenBond) {
              this.editor.events.error.dispatch('Unable to establish a hydrogen bond between two monomers connected with a single bond');
            } else {
              this.editor.events.error.dispatch("There can't be more than 1 bond between the first and the second monomer");
            }
            return;
          }
        }
        secondMonomer.setChosenSecondAttachmentPoint(event.attachmentPointName);
        var showModal = this.shouldInvokeModal(firstMonomer, secondMonomer);
        if (showModal) {
          this.isBondConnectionModalOpen = true;
          this.editor.events.openMonomerConnectionModal.dispatch({
            firstMonomer: firstMonomer,
            secondMonomer: secondMonomer
          });
          return;
        }
        var modelChanges = this.finishBondCreation(renderer.monomer);
        this.history.update(modelChanges);
        if ((_modelChanges$operati = modelChanges.operations[0]) !== null && _modelChanges$operati !== void 0 && _modelChanges$operati.polymerBond) {
          this.editor.drawingEntitiesManager.detectBondsOverlappedByMonomers([modelChanges.operations[0].polymerBond]);
        }
        this.editor.renderersContainer.update(modelChanges);
        this.editor.renderersContainer.deletePolymerBond(this.bondRenderer.polymerBond);
        this.bondRenderer = undefined;
        event.stopPropagation();
      }
    }
  }, {
    key: "finishBondCreation",
    value: function finishBondCreation(secondMonomer) {
      var _this$bondRenderer11;
      assert.assert(this.bondRenderer);
      if (!this.isHydrogenBond && !secondMonomer.hasFreeAttachmentPoint) {
        this.editor.events.error.dispatch("Monomers don't have any connection point available");
        return this.editor.drawingEntitiesManager.cancelPolymerBondCreation(this.bondRenderer.polymerBond);
      }
      if (this.isHydrogenBond && secondMonomer.hasHydrogenBondWithMonomer((_this$bondRenderer11 = this.bondRenderer) === null || _this$bondRenderer11 === void 0 ? void 0 : _this$bondRenderer11.polymerBond.firstMonomer)) {
        this.editor.events.error.dispatch('Unable to establish multiple hydrogen bonds between two monomers');
        return this.editor.drawingEntitiesManager.cancelPolymerBondCreation(this.bondRenderer.polymerBond);
      }
      var firstMonomerAttachmentPoint = this.isHydrogenBond ? monomers.AttachmentPointName.HYDROGEN : this.bondRenderer.polymerBond.firstMonomer.getPotentialAttachmentPointByBond(this.bondRenderer.polymerBond);
      var secondMonomerAttachmentPoint = this.isHydrogenBond ? monomers.AttachmentPointName.HYDROGEN : secondMonomer.getPotentialAttachmentPointByBond(this.bondRenderer.polymerBond);
      assert.assert(firstMonomerAttachmentPoint);
      assert.assert(secondMonomerAttachmentPoint);
      if (firstMonomerAttachmentPoint === secondMonomerAttachmentPoint && !this.isHydrogenBond) {
        this.editor.events.error.dispatch('You have connected monomers with attachment points of the same group');
      }
      return this.editor.drawingEntitiesManager.finishPolymerBondCreation(this.bondRenderer.polymerBond, secondMonomer, firstMonomerAttachmentPoint, this.isHydrogenBond ? monomers.AttachmentPointName.HYDROGEN : secondMonomerAttachmentPoint, this.bondType);
    }
  }, {
    key: "mouseup",
    value: function mouseup() {
      if (this.isBondConnectionModalOpen) {
        return;
      }
      var modelChanges = this.removeBond();
      this.editor.renderersContainer.update(modelChanges);
    }
  }, {
    key: "mouseUpMonomer",
    value: function mouseUpMonomer(event) {
      var _event$target1, _this$bondRenderer12;
      var renderer = (_event$target1 = event.target) === null || _event$target1 === void 0 ? void 0 : _event$target1.__data__;
      var isFirstMonomerHovered = renderer === ((_this$bondRenderer12 = this.bondRenderer) === null || _this$bondRenderer12 === void 0 || (_this$bondRenderer12 = _this$bondRenderer12.polymerBond) === null || _this$bondRenderer12 === void 0 || (_this$bondRenderer12 = _this$bondRenderer12.firstMonomer) === null || _this$bondRenderer12 === void 0 ? void 0 : _this$bondRenderer12.renderer);
      if (this.bondRenderer && renderer !== null && renderer !== void 0 && renderer.monomer && !isFirstMonomerHovered) {
        var _this$bondRenderer13, _modelChanges$operati2;
        var firstMonomer = (_this$bondRenderer13 = this.bondRenderer) === null || _this$bondRenderer13 === void 0 || (_this$bondRenderer13 = _this$bondRenderer13.polymerBond) === null || _this$bondRenderer13 === void 0 ? void 0 : _this$bondRenderer13.firstMonomer;
        var secondMonomer = renderer === null || renderer === void 0 ? void 0 : renderer.monomer;
        for (var attachmentPoint in secondMonomer === null || secondMonomer === void 0 ? void 0 : secondMonomer.attachmentPointsToBonds) {
          var bond = secondMonomer.attachmentPointsToBonds[attachmentPoint];
          if (!bond) {
            continue;
          }
          var alreadyHasBond = bond.firstMonomer === firstMonomer && bond.secondMonomer === secondMonomer || bond.firstMonomer === secondMonomer && bond.secondMonomer === firstMonomer;
          if (alreadyHasBond) {
            var existingBondIsSingleBond = !(bond instanceof HydrogenBond.HydrogenBond);
            if (existingBondIsSingleBond && this.isHydrogenBond) {
              this.editor.events.error.dispatch('Unable to establish a hydrogen bond between two monomers connected with a single bond');
            } else {
              this.editor.events.error.dispatch("There can't be more than 1 bond between the first and the second monomer");
            }
            return;
          }
        }
        var showModal = this.shouldInvokeModal(firstMonomer, secondMonomer);
        if (showModal) {
          this.isBondConnectionModalOpen = true;
          this.editor.events.openMonomerConnectionModal.dispatch({
            firstMonomer: firstMonomer,
            secondMonomer: secondMonomer
          });
          return;
        }
        var modelChanges = this.finishBondCreation(renderer.monomer);
        if ((_modelChanges$operati2 = modelChanges.operations[0]) !== null && _modelChanges$operati2 !== void 0 && _modelChanges$operati2.polymerBond) {
          this.editor.drawingEntitiesManager.detectBondsOverlappedByMonomers([modelChanges.operations[0].polymerBond]);
        }
        this.editor.renderersContainer.update(modelChanges);
        this.editor.renderersContainer.deletePolymerBond(this.bondRenderer.polymerBond);
        this.bondRenderer = undefined;
        this.history.update(modelChanges);
        event.stopPropagation();
      }
    }
  }, {
    key: "mouseUpAtom",
    value: function mouseUpAtom(event) {
      var _event$target10, _this$bondRenderer14, _monomer$getPotential, _this$bondRenderer15, _this$bondRenderer18, _this$bondRenderer19;
      if (!this.bondRenderer || this.isHydrogenBond) {
        return;
      }
      var atomRenderer = (_event$target10 = event.target) === null || _event$target10 === void 0 ? void 0 : _event$target10.__data__;
      if (!atomRenderer) return;
      var monomer = (_this$bondRenderer14 = this.bondRenderer) === null || _this$bondRenderer14 === void 0 ? void 0 : _this$bondRenderer14.polymerBond.firstMonomer;
      if (!this.isHydrogenBond && !monomer.chosenFirstAttachmentPointForBond) {
        this.editor.events.error.dispatch('Monomer to Atom supports only attachment points for bond creation');
        return;
      }
      var attachmentPoint = (_monomer$getPotential = monomer.getPotentialAttachmentPointByBond((_this$bondRenderer15 = this.bondRenderer) === null || _this$bondRenderer15 === void 0 ? void 0 : _this$bondRenderer15.polymerBond)) !== null && _monomer$getPotential !== void 0 ? _monomer$getPotential : monomer === null || monomer === void 0 ? void 0 : monomer.getValidSourcePoint();
      var atom = atomRenderer.atom;
      var existingBondWithMonomer = atom.bonds.find(function (bond) {
        return bond instanceof MonomerToAtomBond.MonomerToAtomBond && bond.monomer === monomer;
      });
      if (existingBondWithMonomer) {
        var _this$bondRenderer16, _this$bondRenderer17;
        this.editor.events.error.dispatch('Only one connection between monomer and atom is allowed');
        this.editor.drawingEntitiesManager.deletePolymerBond((_this$bondRenderer16 = this.bondRenderer) === null || _this$bondRenderer16 === void 0 ? void 0 : _this$bondRenderer16.polymerBond);
        (_this$bondRenderer17 = this.bondRenderer) === null || _this$bondRenderer17 === void 0 || _this$bondRenderer17.remove();
        this.bondRenderer = undefined;
        monomer.setChosenFirstAttachmentPoint(null);
        return;
      }
      this.editor.drawingEntitiesManager.deletePolymerBond((_this$bondRenderer18 = this.bondRenderer) === null || _this$bondRenderer18 === void 0 ? void 0 : _this$bondRenderer18.polymerBond);
      (_this$bondRenderer19 = this.bondRenderer) === null || _this$bondRenderer19 === void 0 || _this$bondRenderer19.remove();
      this.bondRenderer = undefined;
      monomer.setChosenFirstAttachmentPoint(null);
      if (!attachmentPoint) {
        return;
      }
      var modelChanges = this.editor.drawingEntitiesManager.addMonomerToAtomBond(monomer, atomRenderer.atom, attachmentPoint);
      this.editor.renderersContainer.update(modelChanges);
      this.history.update(modelChanges);
    }
  }, {
    key: "destroy",
    value: function destroy() {
      var modelChanges = this.removeBond();
      modelChanges.merge(this.editor.drawingEntitiesManager.removeHoverForAllMonomers());
      this.editor.renderersContainer.update(modelChanges);
    }
  }, {
    key: "shouldInvokeModal",
    value: function shouldInvokeModal(firstMonomer, secondMonomer) {
      var checkForPotentialBonds = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
      return bondConnectionHelpers.shouldInvokeConnectionModal(firstMonomer, secondMonomer, checkForPotentialBonds, this.isHydrogenBond);
    }
  }]);
  return PolymerBond;
}();

exports.PolymerBond = PolymerBond;
//# sourceMappingURL=Bond.js.map
