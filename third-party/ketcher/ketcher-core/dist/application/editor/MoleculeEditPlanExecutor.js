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

var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
var _slicedToArray = require('@babel/runtime/helpers/slicedToArray');
var _classPrivateFieldSet = require('@babel/runtime/helpers/classPrivateFieldSet');
var _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet');
var _toConsumableArray = require('@babel/runtime/helpers/toConsumableArray');
var _createClass = require('@babel/runtime/helpers/createClass');
var _classCallCheck = require('@babel/runtime/helpers/classCallCheck');
var _possibleConstructorReturn = require('@babel/runtime/helpers/possibleConstructorReturn');
var _getPrototypeOf = require('@babel/runtime/helpers/getPrototypeOf');
var _assertThisInitialized = require('@babel/runtime/helpers/assertThisInitialized');
var _inherits = require('@babel/runtime/helpers/inherits');
var _wrapNativeSuper = require('@babel/runtime/helpers/wrapNativeSuper');
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var _regeneratorRuntime = require('@babel/runtime/regenerator');
require('../../domain/entities/atom.js');
require('../../domain/entities/atomList.js');
require('../../domain/entities/bond.js');
require('../../domain/entities/fixedPrecision.js');
require('../../domain/entities/fragment.js');
require('../../domain/entities/functionalGroup.js');
require('../../domain/entities/halfBond.js');
require('../../domain/entities/loop.js');
require('../../domain/entities/rgroup.js');
require('../../domain/entities/rgroupAttachmentPoint.js');
require('../../domain/entities/rxnArrow.js');
require('../../domain/entities/rxnPlus.js');
require('../../domain/entities/sgroup.js');
require('../../domain/entities/sgroupForest.js');
require('../../domain/entities/simpleObject.js');
require('../../domain/entities/struct.js');
require('../../domain/entities/text.js');
require('../../domain/entities/pile.js');
var vec2 = require('../../domain/entities/vec2.js');
require('../../domain/entities/box2Abs.js');
require('../../domain/entities/pool.js');
require('../../domain/entities/image.js');
require('../../domain/entities/multitailArrow.js');
require('../../domain/entities/highlight.js');
require('../../domain/entities/sGroupAttachmentPoint.js');
require('../../domain/entities/monomerMicromolecule.js');
require('../../domain/entities/Peptide.js');
require('../../domain/entities/BaseMonomer.js');
require('../../domain/entities/Chem.js');
require('../../domain/entities/Sugar.js');
require('../../domain/entities/RNABase.js');
require('../../domain/entities/Phosphate.js');
require('../../domain/entities/Axis.js');
require('../../domain/entities/Nucleoside.js');
require('../../domain/entities/Nucleotide.js');
require('../../domain/entities/monomer-chains/types.js');
require('../../domain/entities/monomer-chains/Chain.js');
require('../../domain/entities/monomer-chains/ChainsCollection.js');
require('../../domain/entities/MonomerSequenceNode.js');
require('../../domain/entities/EmptySequenceNode.js');
require('../../domain/entities/LinkerSequenceNode.js');
require('../../domain/entities/UnresolvedMonomer.js');
require('../../domain/entities/UnsplitNucleotide.js');
require('../../domain/entities/PolymerBond.js');
require('../../domain/entities/AmbiguousMonomer.js');
require('../../domain/entities/MonomerToAtomBond.js');
require('../../domain/entities/HydrogenBond.js');
require('../../domain/entities/SGroupDrawingEntity.js');
require('../../domain/entities/BackBoneSequenceNode.js');
require('../../domain/entities/Command.js');
require('../../utilities/runAsyncAction.js');
require('../../utilities/KetcherLogger.js');
require('../../utilities/SettingsManager.js');
require('../../utilities/keynorm.js');
require('react-device-detect');
require('../../utilities/clipboardUtils.js');
require('../../domain/entities/CoreAtom.js');
require('../../domain/entities/CoreStereoFlag.js');
require('@babel/runtime/helpers/typeof');
require('../../domain/constants/elements.js');
require('../../domain/constants/element.types.js');
require('../../domain/constants/generics.js');
require('../../domain/constants/chains.js');
require('../../domain/constants/monomers.js');
require('./actions/action.js');
var actionTransaction = require('./actions/actionTransaction.js');
var atom = require('./actions/atom.js');
require('./operations/atom/index.js');
require('./operations/bond/index.js');
require('./operations/CanvasLoad.js');
require('./operations/descriptors.js');
require('./operations/EnhancedFlagMove.js');
require('./operations/EnhancedFlagClear.js');
require('./operations/ifThen.js');
require('./operations/fragment.js');
require('./operations/fragmentStereoAtom.js');
require('./operations/FragmentStereoFlag.js');
require('./operations/calcimplicitH.js');
require('./operations/LoopMove.js');
require('./operations/OperationType.js');
require('./operations/image/imageMove.js');
require('./operations/image/imageResize.js');
require('./operations/image/imageUpsertDelete.js');
require('./operations/multitailArrow/multitailArrowAddRemoveTail.js');
require('./operations/multitailArrow/multitailArrowMove.js');
require('./operations/multitailArrow/multitailArrowMoveHeadTail.js');
require('./operations/multitailArrow/multitailArrowResizeTailHead.js');
require('./operations/multitailArrow/multitailArrowUpsertDelete.js');
require('./operations/rgroup/RGroupAttr.js');
require('./operations/rgroup/RGroupFragment.js');
require('./operations/rgroupAttachmentPoint/index.js');
require('./operations/rxn/index.js');
require('./operations/simpleObject.js');
require('./operations/sgroup/index.js');
require('./operations/Text/TextCreateDelete.js');
require('./operations/Text/TextUpdate.js');
require('./operations/Text/TextMove.js');
require('./operations/monomer/AttachmentPointHoverOperation.js');
require('./operations/monomer/FlipMonomerOperation.js');
require('./operations/monomer/MonomerAddOperation.js');
require('./operations/monomer/MonomerDeleteOperation.js');
require('../../domain/helpers/monomers.js');
require('../render/renderers/AmbiguousMonomerRenderer.js');
require('../render/renderers/ChemRenderer.js');
require('../render/renderers/PeptideRenderer.js');
require('../render/renderers/PhosphateRenderer.js');
require('../render/renderers/RNABaseRenderer.js');
require('../render/renderers/SugarRenderer.js');
require('../render/renderers/UnresolvedMonomerRenderer.js');
require('../render/renderers/UnsplitNucleotideRenderer.js');
require('./operations/monomer/MonomerHoverOperation.js');
require('./operations/monomer/MonomerItemModifyOperation.js');
require('./operations/monomer/MonomerMoveOperation.js');
require('./operations/monomer/RotateMonomerOperation.js');
require('./operations/monomer/ShiftMonomerOperation.js');
require('./operations/modes/index.js');
require('./operations/monomerCreation/AssignAttachmentAtomOperation.js');
require('./operations/monomerCreation/AssignLeavingGroupAtomOperation.js');
require('./operations/monomerCreation/MarkAsRnaComponentOperation.js');
require('./operations/monomerCreation/ReassignAttachmentPointOperation.js');
require('./operations/monomerCreation/ReassignLeavingAtomOperation.js');
require('./operations/sgroup/sgroupAttachmentPoints.js');
require('./actions/utils.js');
require('./shared/constants.js');
require('lodash/fp');
require('lodash');
require('../../domain/helpers/attachmentPointCalculations.js');
require('../../domain/helpers/functionalGroupsProvider.js');
require('../../domain/helpers/saltsAndSolventsProvider.js');
var bond = require('./actions/bond.js');
require('./operations/highlight.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _asyncToGenerator__default = /*#__PURE__*/_interopDefaultLegacy(_asyncToGenerator);
var _slicedToArray__default = /*#__PURE__*/_interopDefaultLegacy(_slicedToArray);
var _classPrivateFieldSet__default = /*#__PURE__*/_interopDefaultLegacy(_classPrivateFieldSet);
var _classPrivateFieldGet__default = /*#__PURE__*/_interopDefaultLegacy(_classPrivateFieldGet);
var _toConsumableArray__default = /*#__PURE__*/_interopDefaultLegacy(_toConsumableArray);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _possibleConstructorReturn__default = /*#__PURE__*/_interopDefaultLegacy(_possibleConstructorReturn);
var _getPrototypeOf__default = /*#__PURE__*/_interopDefaultLegacy(_getPrototypeOf);
var _assertThisInitialized__default = /*#__PURE__*/_interopDefaultLegacy(_assertThisInitialized);
var _inherits__default = /*#__PURE__*/_interopDefaultLegacy(_inherits);
var _wrapNativeSuper__default = /*#__PURE__*/_interopDefaultLegacy(_wrapNativeSuper);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);
var _regeneratorRuntime__default = /*#__PURE__*/_interopDefaultLegacy(_regeneratorRuntime);

function _classPrivateFieldInitSpec(e, t, a) { _checkPrivateRedeclaration(e, t), t.set(e, a); }
function _checkPrivateRedeclaration(e, t) { if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object"); }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _callSuper(t, o, e) { return o = _getPrototypeOf__default["default"](o), _possibleConstructorReturn__default["default"](t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf__default["default"](t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var SUPPORTED_MOLECULE_EDIT_PLAN_SCHEMA = 'retainmol.molecule-edit-plan.v1';
var MoleculeEditPlanError = function (_Error) {
  _inherits__default["default"](MoleculeEditPlanError, _Error);
  function MoleculeEditPlanError(code, message) {
    var _this;
    _classCallCheck__default["default"](this, MoleculeEditPlanError);
    _this = _callSuper(this, MoleculeEditPlanError, [message]);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "code", void 0);
    _this.code = code;
    _this.name = 'MoleculeEditPlanError';
    return _this;
  }
  return _createClass__default["default"](MoleculeEditPlanError);
}(_wrapNativeSuper__default["default"](Error));
function fail(code, message) {
  throw new MoleculeEditPlanError(code, message);
}
function isAddAtom(command) {
  return command.type === 'addAtom';
}
function isAddBond(command) {
  return command.type === 'addBond';
}
function validateMoleculeEditPlan(plan) {
  if (plan.schema !== SUPPORTED_MOLECULE_EDIT_PLAN_SCHEMA) {
    fail('schema-mismatch', "Unsupported molecule edit plan: ".concat(plan.schema));
  }
  var atomRefs = new Set();
  var bondRefs = new Set();
  var stepIds = new Set();
  var _iterator = _createForOfIteratorHelper(plan.steps),
    _step;
  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var step = _step.value;
      if (!step.id || stepIds.has(step.id)) {
        fail('duplicate-reference', "Duplicate or empty step reference: ".concat(step.id));
      }
      stepIds.add(step.id);
      var atomCommands = step.commands.filter(isAddAtom);
      var bondCommands = step.commands.filter(isAddBond);
      var supportedShape = atomCommands.length === 1 && bondCommands.length === 0 && step.commands.length === 1 || atomCommands.length === 1 && bondCommands.length === 1 && step.commands.length === 2 || atomCommands.length === 0 && bondCommands.length === 1 && step.commands.length === 1;
      if (!supportedShape) {
        fail('unsupported-step-shape', "Step ".concat(step.id, " must place one atom, extend one atom and bond, or add one closing bond"));
      }
      var _iterator2 = _createForOfIteratorHelper(atomCommands),
        _step2;
      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var _atom$element;
          var command = _step2.value;
          var atom = command.atom;
          if (!atom.ref || atomRefs.has(atom.ref)) {
            fail('duplicate-reference', "Duplicate or empty atom reference: ".concat(atom.ref));
          }
          if (!((_atom$element = atom.element) !== null && _atom$element !== void 0 && _atom$element.trim()) || !Number.isFinite(atom.position.x) || !Number.isFinite(atom.position.y)) {
            fail('invalid-coordinate', "Atom ".concat(atom.ref, " is missing a valid element or position"));
          }
          atomRefs.add(atom.ref);
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
      var _iterator3 = _createForOfIteratorHelper(bondCommands),
        _step3;
      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          var _command = _step3.value;
          var bond = _command.bond;
          if (!bond.ref || bondRefs.has(bond.ref)) {
            fail('duplicate-reference', "Duplicate or empty bond reference: ".concat(bond.ref));
          }
          if (bond.begin === bond.end || !Number.isInteger(bond.order) || bond.order < 1 || !atomRefs.has(bond.begin) || !atomRefs.has(bond.end)) {
            fail('invalid-bond', "Bond ".concat(bond.ref, " has invalid endpoints or order"));
          }
          bondRefs.add(bond.ref);
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
  var declaredAtomRefs = new Set(plan.atoms.map(function (_ref) {
    var ref = _ref.ref;
    return ref;
  }));
  var declaredBondRefs = new Set(plan.bonds.map(function (_ref2) {
    var ref = _ref2.ref;
    return ref;
  }));
  if (atomRefs.size !== plan.atomCount || bondRefs.size !== plan.bondCount || declaredAtomRefs.size !== plan.atomCount || declaredBondRefs.size !== plan.bondCount || _toConsumableArray__default["default"](atomRefs).some(function (ref) {
    return !declaredAtomRefs.has(ref);
  }) || _toConsumableArray__default["default"](bondRefs).some(function (ref) {
    return !declaredBondRefs.has(ref);
  })) {
    fail('count-mismatch', 'Molecule edit plan counts or declarations do not match its commands');
  }
}
function newPoolId(before, after, kind) {
  var added = _toConsumableArray__default["default"](after).filter(function (id) {
    return !before.has(id);
  });
  if (added.length !== 1) {
    fail('count-mismatch', "Expected one new ".concat(kind, ", received ").concat(added.length));
  }
  return added[0];
}
function offsetPosition(position, offset) {
  return new vec2.Vec2(position.x + offset.x, position.y + offset.y);
}
var _nextStepIndex = new WeakMap();
var _playing = new WeakMap();
var MoleculeEditPlanExecutor = function () {
  function MoleculeEditPlanExecutor(context, plan) {
    var positionOffset = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {
      x: 0,
      y: 0
    };
    _classCallCheck__default["default"](this, MoleculeEditPlanExecutor);
    _defineProperty__default["default"](this, "context", void 0);
    _defineProperty__default["default"](this, "plan", void 0);
    _defineProperty__default["default"](this, "positionOffset", void 0);
    _defineProperty__default["default"](this, "atomIds", new Map());
    _defineProperty__default["default"](this, "bondIds", new Map());
    _classPrivateFieldInitSpec(this, _nextStepIndex, {
      writable: true,
      value: 0
    });
    _classPrivateFieldInitSpec(this, _playing, {
      writable: true,
      value: false
    });
    this.context = context;
    this.plan = plan;
    this.positionOffset = positionOffset;
    validateMoleculeEditPlan(plan);
  }
  _createClass__default["default"](MoleculeEditPlanExecutor, [{
    key: "nextStepIndex",
    get: function get() {
      return _classPrivateFieldGet__default["default"](this, _nextStepIndex);
    }
  }, {
    key: "isComplete",
    get: function get() {
      return _classPrivateFieldGet__default["default"](this, _nextStepIndex) >= this.plan.steps.length;
    }
  }, {
    key: "applyNextStep",
    value: function applyNextStep() {
      var _this2 = this;
      if (this.isComplete) return null;
      var stepIndex = _classPrivateFieldGet__default["default"](this, _nextStepIndex);
      var step = this.plan.steps[stepIndex];
      var atomCommand = step.commands.find(isAddAtom);
      var bondCommand = step.commands.find(isAddBond);
      var transaction = new actionTransaction.ActionTransaction(this.context.render.ctab);
      var previousAtomIds = new Map(this.atomIds);
      var previousBondIds = new Map(this.bondIds);
      var updateAttempted = false;
      try {
        var rollback;
        if (atomCommand && !bondCommand) {
          var before = new Set(this.context.render.ctab.molecule.atoms.keys());
          rollback = atom.fromAtomAddition(this.context.render.ctab, offsetPosition(atomCommand.atom.position, this.positionOffset), {
            label: atomCommand.atom.element,
            charge: atomCommand.atom.charge,
            isotope: atomCommand.atom.isotope
          });
          transaction.capture(rollback);
          this.atomIds.set(atomCommand.atom.ref, newPoolId(before, this.context.render.ctab.molecule.atoms.keys(), 'atom'));
        } else if (atomCommand && bondCommand) {
          var atom$1 = atomCommand.atom;
          var bond$1 = bondCommand.bond;
          var newAtomIsBegin = bond$1.begin === atom$1.ref;
          var existingRef = newAtomIsBegin ? bond$1.end : bond$1.begin;
          var existingId = this.atomIds.get(existingRef);
          if (existingId === undefined) {
            fail('missing-reference', "Atom ".concat(existingRef, " is not available at ").concat(step.id));
          }
          var atomAttributes = {
            label: atom$1.element,
            charge: atom$1.charge,
            isotope: atom$1.isotope
          };
          var position = offsetPosition(atom$1.position, this.positionOffset);
          var _ref3 = newAtomIsBegin ? bond.fromBondAddition(this.context.render.ctab, {
              type: bond$1.order,
              stereo: bond$1.stereo
            }, atomAttributes, existingId, position) : bond.fromBondAddition(this.context.render.ctab, {
              type: bond$1.order,
              stereo: bond$1.stereo
            }, existingId, atomAttributes, undefined, position),
            _ref4 = _slicedToArray__default["default"](_ref3, 4),
            action = _ref4[0],
            beginId = _ref4[1],
            endId = _ref4[2],
            bondId = _ref4[3];
          rollback = action;
          transaction.capture(rollback);
          this.atomIds.set(atom$1.ref, newAtomIsBegin ? beginId : endId);
          this.bondIds.set(bond$1.ref, bondId);
        } else if (bondCommand) {
          var _bond = bondCommand.bond;
          var _beginId = this.atomIds.get(_bond.begin);
          var _endId = this.atomIds.get(_bond.end);
          if (_beginId === undefined || _endId === undefined) {
            fail('missing-reference', "Bond ".concat(_bond.ref, " references an unavailable atom"));
          }
          var _fromBondAddition = bond.fromBondAddition(this.context.render.ctab, {
              type: _bond.order,
              stereo: _bond.stereo
            }, _beginId, _endId),
            _fromBondAddition2 = _slicedToArray__default["default"](_fromBondAddition, 4),
            _action = _fromBondAddition2[0],
            _bondId = _fromBondAddition2[3];
          rollback = _action;
          transaction.capture(rollback);
          this.bondIds.set(_bond.ref, _bondId);
        } else {
          fail('unsupported-step-shape', "Step ".concat(step.id, " has no executable command"));
        }
        updateAttempted = true;
        this.context.update(rollback);
        _classPrivateFieldSet__default["default"](this, _nextStepIndex, _classPrivateFieldGet__default["default"](this, _nextStepIndex) + 1);
        transaction.commit();
        return {
          step: step,
          stepIndex: stepIndex,
          atomIds: new Map(this.atomIds),
          bondIds: new Map(this.bondIds)
        };
      } catch (cause) {
        this.atomIds.clear();
        previousAtomIds.forEach(function (id, ref) {
          return _this2.atomIds.set(ref, id);
        });
        this.bondIds.clear();
        previousBondIds.forEach(function (id, ref) {
          return _this2.bondIds.set(ref, id);
        });
        try {
          return transaction.rollback(cause);
        } finally {
          var _this$context$notifyD, _this$context;
          if (updateAttempted) (_this$context$notifyD = (_this$context = this.context).notifyDocumentChange) === null || _this$context$notifyD === void 0 || _this$context$notifyD.call(_this$context, 'untracked');
        }
      }
    }
  }, {
    key: "play",
    value: function () {
      var _play = _asyncToGenerator__default["default"](_regeneratorRuntime__default["default"].mark(function _callee() {
        var _options$delayMs, _options$wait;
        var options,
          delayMs,
          wait,
          _options$signal,
          _options$onStep,
          _options$signal2,
          result,
          _args = arguments;
        return _regeneratorRuntime__default["default"].wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              options = _args.length > 0 && _args[0] !== undefined ? _args[0] : {};
              if (_classPrivateFieldGet__default["default"](this, _playing)) {
                fail('playback-in-progress', 'Molecule edit plan playback is already running');
              }
              _classPrivateFieldSet__default["default"](this, _playing, true);
              delayMs = Math.max(0, (_options$delayMs = options.delayMs) !== null && _options$delayMs !== void 0 ? _options$delayMs : 500);
              wait = (_options$wait = options.wait) !== null && _options$wait !== void 0 ? _options$wait : function (duration) {
                return new Promise(function (resolve) {
                  return setTimeout(resolve, duration);
                });
              };
              _context.prev = 5;
            case 6:
              if (!(!this.isComplete && !((_options$signal = options.signal) !== null && _options$signal !== void 0 && _options$signal.aborted))) {
                _context.next = 14;
                break;
              }
              result = this.applyNextStep();
              if (result) (_options$onStep = options.onStep) === null || _options$onStep === void 0 || _options$onStep.call(options, result);
              if (!(!this.isComplete && delayMs > 0 && !((_options$signal2 = options.signal) !== null && _options$signal2 !== void 0 && _options$signal2.aborted))) {
                _context.next = 12;
                break;
              }
              _context.next = 12;
              return wait(delayMs);
            case 12:
              _context.next = 6;
              break;
            case 14:
              _context.prev = 14;
              _classPrivateFieldSet__default["default"](this, _playing, false);
              return _context.finish(14);
            case 17:
            case "end":
              return _context.stop();
          }
        }, _callee, this, [[5,, 14, 17]]);
      }));
      function play() {
        return _play.apply(this, arguments);
      }
      return play;
    }()
  }]);
  return MoleculeEditPlanExecutor;
}();

exports.MoleculeEditPlanError = MoleculeEditPlanError;
exports.MoleculeEditPlanExecutor = MoleculeEditPlanExecutor;
exports.validateMoleculeEditPlan = validateMoleculeEditPlan;
//# sourceMappingURL=MoleculeEditPlanExecutor.js.map
