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
import _asyncToGenerator from '@babel/runtime/helpers/asyncToGenerator';
import _slicedToArray from '@babel/runtime/helpers/slicedToArray';
import _classPrivateFieldSet from '@babel/runtime/helpers/classPrivateFieldSet';
import _classPrivateFieldGet from '@babel/runtime/helpers/classPrivateFieldGet';
import _toConsumableArray from '@babel/runtime/helpers/toConsumableArray';
import _createClass from '@babel/runtime/helpers/createClass';
import _classCallCheck from '@babel/runtime/helpers/classCallCheck';
import _possibleConstructorReturn from '@babel/runtime/helpers/possibleConstructorReturn';
import _getPrototypeOf from '@babel/runtime/helpers/getPrototypeOf';
import _assertThisInitialized from '@babel/runtime/helpers/assertThisInitialized';
import _inherits from '@babel/runtime/helpers/inherits';
import _wrapNativeSuper from '@babel/runtime/helpers/wrapNativeSuper';
import _defineProperty from '@babel/runtime/helpers/defineProperty';
import _regeneratorRuntime from '@babel/runtime/regenerator';
import '../../domain/entities/atom.modern.js';
import '../../domain/entities/atomList.modern.js';
import '../../domain/entities/bond.modern.js';
import '../../domain/entities/fixedPrecision.modern.js';
import '../../domain/entities/fragment.modern.js';
import '../../domain/entities/functionalGroup.modern.js';
import '../../domain/entities/halfBond.modern.js';
import '../../domain/entities/loop.modern.js';
import '../../domain/entities/rgroup.modern.js';
import '../../domain/entities/rgroupAttachmentPoint.modern.js';
import '../../domain/entities/rxnArrow.modern.js';
import '../../domain/entities/rxnPlus.modern.js';
import '../../domain/entities/sgroup.modern.js';
import '../../domain/entities/sgroupForest.modern.js';
import '../../domain/entities/simpleObject.modern.js';
import '../../domain/entities/struct.modern.js';
import '../../domain/entities/text.modern.js';
import '../../domain/entities/pile.modern.js';
import { Vec2 } from '../../domain/entities/vec2.modern.js';
import '../../domain/entities/box2Abs.modern.js';
import '../../domain/entities/pool.modern.js';
import '../../domain/entities/image.modern.js';
import '../../domain/entities/multitailArrow.modern.js';
import '../../domain/entities/highlight.modern.js';
import '../../domain/entities/sGroupAttachmentPoint.modern.js';
import '../../domain/entities/monomerMicromolecule.modern.js';
import '../../domain/entities/Peptide.modern.js';
import '../../domain/entities/BaseMonomer.modern.js';
import '../../domain/entities/Chem.modern.js';
import '../../domain/entities/Sugar.modern.js';
import '../../domain/entities/RNABase.modern.js';
import '../../domain/entities/Phosphate.modern.js';
import '../../domain/entities/Axis.modern.js';
import '../../domain/entities/Nucleoside.modern.js';
import '../../domain/entities/Nucleotide.modern.js';
import '../../domain/entities/monomer-chains/types.modern.js';
import '../../domain/entities/monomer-chains/Chain.modern.js';
import '../../domain/entities/monomer-chains/ChainsCollection.modern.js';
import '../../domain/entities/MonomerSequenceNode.modern.js';
import '../../domain/entities/EmptySequenceNode.modern.js';
import '../../domain/entities/LinkerSequenceNode.modern.js';
import '../../domain/entities/UnresolvedMonomer.modern.js';
import '../../domain/entities/UnsplitNucleotide.modern.js';
import '../../domain/entities/PolymerBond.modern.js';
import '../../domain/entities/AmbiguousMonomer.modern.js';
import '../../domain/entities/MonomerToAtomBond.modern.js';
import '../../domain/entities/HydrogenBond.modern.js';
import '../../domain/entities/SGroupDrawingEntity.modern.js';
import '../../domain/entities/BackBoneSequenceNode.modern.js';
import '../../domain/entities/Command.modern.js';
import '../../utilities/runAsyncAction.modern.js';
import '../../utilities/KetcherLogger.modern.js';
import '../../utilities/SettingsManager.modern.js';
import '../../utilities/keynorm.modern.js';
import 'react-device-detect';
import '../../utilities/clipboardUtils.modern.js';
import '../../domain/entities/CoreAtom.modern.js';
import '../../domain/entities/CoreStereoFlag.modern.js';
import '@babel/runtime/helpers/typeof';
import '../../domain/constants/elements.modern.js';
import '../../domain/constants/element.types.modern.js';
import '../../domain/constants/generics.modern.js';
import '../../domain/constants/chains.modern.js';
import '../../domain/constants/monomers.modern.js';
import './actions/action.modern.js';
import { ActionTransaction } from './actions/actionTransaction.modern.js';
import { fromAtomAddition } from './actions/atom.modern.js';
import './operations/atom/index.modern.js';
import './operations/bond/index.modern.js';
import './operations/CanvasLoad.modern.js';
import './operations/descriptors.modern.js';
import './operations/EnhancedFlagMove.modern.js';
import './operations/EnhancedFlagClear.modern.js';
import './operations/ifThen.modern.js';
import './operations/fragment.modern.js';
import './operations/fragmentStereoAtom.modern.js';
import './operations/FragmentStereoFlag.modern.js';
import './operations/calcimplicitH.modern.js';
import './operations/LoopMove.modern.js';
import './operations/OperationType.modern.js';
import './operations/image/imageMove.modern.js';
import './operations/image/imageResize.modern.js';
import './operations/image/imageUpsertDelete.modern.js';
import './operations/multitailArrow/multitailArrowAddRemoveTail.modern.js';
import './operations/multitailArrow/multitailArrowMove.modern.js';
import './operations/multitailArrow/multitailArrowMoveHeadTail.modern.js';
import './operations/multitailArrow/multitailArrowResizeTailHead.modern.js';
import './operations/multitailArrow/multitailArrowUpsertDelete.modern.js';
import './operations/rgroup/RGroupAttr.modern.js';
import './operations/rgroup/RGroupFragment.modern.js';
import './operations/rgroupAttachmentPoint/index.modern.js';
import './operations/rxn/index.modern.js';
import './operations/simpleObject.modern.js';
import './operations/sgroup/index.modern.js';
import './operations/Text/TextCreateDelete.modern.js';
import './operations/Text/TextUpdate.modern.js';
import './operations/Text/TextMove.modern.js';
import './operations/monomer/AttachmentPointHoverOperation.modern.js';
import './operations/monomer/FlipMonomerOperation.modern.js';
import './operations/monomer/MonomerAddOperation.modern.js';
import './operations/monomer/MonomerDeleteOperation.modern.js';
import '../../domain/helpers/monomers.modern.js';
import '../render/renderers/AmbiguousMonomerRenderer.modern.js';
import '../render/renderers/ChemRenderer.modern.js';
import '../render/renderers/PeptideRenderer.modern.js';
import '../render/renderers/PhosphateRenderer.modern.js';
import '../render/renderers/RNABaseRenderer.modern.js';
import '../render/renderers/SugarRenderer.modern.js';
import '../render/renderers/UnresolvedMonomerRenderer.modern.js';
import '../render/renderers/UnsplitNucleotideRenderer.modern.js';
import './operations/monomer/MonomerHoverOperation.modern.js';
import './operations/monomer/MonomerItemModifyOperation.modern.js';
import './operations/monomer/MonomerMoveOperation.modern.js';
import './operations/monomer/RotateMonomerOperation.modern.js';
import './operations/monomer/ShiftMonomerOperation.modern.js';
import './operations/modes/index.modern.js';
import './operations/monomerCreation/AssignAttachmentAtomOperation.modern.js';
import './operations/monomerCreation/AssignLeavingGroupAtomOperation.modern.js';
import './operations/monomerCreation/MarkAsRnaComponentOperation.modern.js';
import './operations/monomerCreation/ReassignAttachmentPointOperation.modern.js';
import './operations/monomerCreation/ReassignLeavingAtomOperation.modern.js';
import './operations/sgroup/sgroupAttachmentPoints.modern.js';
import './actions/utils.modern.js';
import './shared/constants.modern.js';
import 'lodash/fp';
import 'lodash';
import '../../domain/helpers/attachmentPointCalculations.modern.js';
import '../../domain/helpers/functionalGroupsProvider.modern.js';
import '../../domain/helpers/saltsAndSolventsProvider.modern.js';
import { fromBondAddition } from './actions/bond.modern.js';
import './operations/highlight.modern.js';

function _classPrivateFieldInitSpec(e, t, a) { _checkPrivateRedeclaration(e, t), t.set(e, a); }
function _checkPrivateRedeclaration(e, t) { if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object"); }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var SUPPORTED_MOLECULE_EDIT_PLAN_SCHEMA = 'retainmol.molecule-edit-plan.v1';
var MoleculeEditPlanError = function (_Error) {
  _inherits(MoleculeEditPlanError, _Error);
  function MoleculeEditPlanError(code, message) {
    var _this;
    _classCallCheck(this, MoleculeEditPlanError);
    _this = _callSuper(this, MoleculeEditPlanError, [message]);
    _defineProperty(_assertThisInitialized(_this), "code", void 0);
    _this.code = code;
    _this.name = 'MoleculeEditPlanError';
    return _this;
  }
  return _createClass(MoleculeEditPlanError);
}(_wrapNativeSuper(Error));
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
  if (atomRefs.size !== plan.atomCount || bondRefs.size !== plan.bondCount || declaredAtomRefs.size !== plan.atomCount || declaredBondRefs.size !== plan.bondCount || _toConsumableArray(atomRefs).some(function (ref) {
    return !declaredAtomRefs.has(ref);
  }) || _toConsumableArray(bondRefs).some(function (ref) {
    return !declaredBondRefs.has(ref);
  })) {
    fail('count-mismatch', 'Molecule edit plan counts or declarations do not match its commands');
  }
}
function newPoolId(before, after, kind) {
  var added = _toConsumableArray(after).filter(function (id) {
    return !before.has(id);
  });
  if (added.length !== 1) {
    fail('count-mismatch', "Expected one new ".concat(kind, ", received ").concat(added.length));
  }
  return added[0];
}
function offsetPosition(position, offset) {
  return new Vec2(position.x + offset.x, position.y + offset.y);
}
var _nextStepIndex = new WeakMap();
var _playing = new WeakMap();
var MoleculeEditPlanExecutor = function () {
  function MoleculeEditPlanExecutor(context, plan) {
    var positionOffset = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {
      x: 0,
      y: 0
    };
    _classCallCheck(this, MoleculeEditPlanExecutor);
    _defineProperty(this, "context", void 0);
    _defineProperty(this, "plan", void 0);
    _defineProperty(this, "positionOffset", void 0);
    _defineProperty(this, "atomIds", new Map());
    _defineProperty(this, "bondIds", new Map());
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
  _createClass(MoleculeEditPlanExecutor, [{
    key: "nextStepIndex",
    get: function get() {
      return _classPrivateFieldGet(this, _nextStepIndex);
    }
  }, {
    key: "isComplete",
    get: function get() {
      return _classPrivateFieldGet(this, _nextStepIndex) >= this.plan.steps.length;
    }
  }, {
    key: "applyNextStep",
    value: function applyNextStep() {
      var _this2 = this;
      if (this.isComplete) return null;
      var stepIndex = _classPrivateFieldGet(this, _nextStepIndex);
      var step = this.plan.steps[stepIndex];
      var atomCommand = step.commands.find(isAddAtom);
      var bondCommand = step.commands.find(isAddBond);
      var transaction = new ActionTransaction(this.context.render.ctab);
      var previousAtomIds = new Map(this.atomIds);
      var previousBondIds = new Map(this.bondIds);
      var updateAttempted = false;
      try {
        var rollback;
        if (atomCommand && !bondCommand) {
          var before = new Set(this.context.render.ctab.molecule.atoms.keys());
          rollback = fromAtomAddition(this.context.render.ctab, offsetPosition(atomCommand.atom.position, this.positionOffset), {
            label: atomCommand.atom.element,
            charge: atomCommand.atom.charge,
            isotope: atomCommand.atom.isotope
          });
          transaction.capture(rollback);
          this.atomIds.set(atomCommand.atom.ref, newPoolId(before, this.context.render.ctab.molecule.atoms.keys(), 'atom'));
        } else if (atomCommand && bondCommand) {
          var atom = atomCommand.atom;
          var bond = bondCommand.bond;
          var newAtomIsBegin = bond.begin === atom.ref;
          var existingRef = newAtomIsBegin ? bond.end : bond.begin;
          var existingId = this.atomIds.get(existingRef);
          if (existingId === undefined) {
            fail('missing-reference', "Atom ".concat(existingRef, " is not available at ").concat(step.id));
          }
          var atomAttributes = {
            label: atom.element,
            charge: atom.charge,
            isotope: atom.isotope
          };
          var position = offsetPosition(atom.position, this.positionOffset);
          var _ref3 = newAtomIsBegin ? fromBondAddition(this.context.render.ctab, {
              type: bond.order,
              stereo: bond.stereo
            }, atomAttributes, existingId, position) : fromBondAddition(this.context.render.ctab, {
              type: bond.order,
              stereo: bond.stereo
            }, existingId, atomAttributes, undefined, position),
            _ref4 = _slicedToArray(_ref3, 4),
            action = _ref4[0],
            beginId = _ref4[1],
            endId = _ref4[2],
            bondId = _ref4[3];
          rollback = action;
          transaction.capture(rollback);
          this.atomIds.set(atom.ref, newAtomIsBegin ? beginId : endId);
          this.bondIds.set(bond.ref, bondId);
        } else if (bondCommand) {
          var _bond = bondCommand.bond;
          var _beginId = this.atomIds.get(_bond.begin);
          var _endId = this.atomIds.get(_bond.end);
          if (_beginId === undefined || _endId === undefined) {
            fail('missing-reference', "Bond ".concat(_bond.ref, " references an unavailable atom"));
          }
          var _fromBondAddition = fromBondAddition(this.context.render.ctab, {
              type: _bond.order,
              stereo: _bond.stereo
            }, _beginId, _endId),
            _fromBondAddition2 = _slicedToArray(_fromBondAddition, 4),
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
        _classPrivateFieldSet(this, _nextStepIndex, _classPrivateFieldGet(this, _nextStepIndex) + 1);
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
      var _play = _asyncToGenerator(_regeneratorRuntime.mark(function _callee() {
        var _options$delayMs, _options$wait;
        var options,
          delayMs,
          wait,
          _options$signal,
          _options$onStep,
          _options$signal2,
          result,
          _args = arguments;
        return _regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              options = _args.length > 0 && _args[0] !== undefined ? _args[0] : {};
              if (_classPrivateFieldGet(this, _playing)) {
                fail('playback-in-progress', 'Molecule edit plan playback is already running');
              }
              _classPrivateFieldSet(this, _playing, true);
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
              _classPrivateFieldSet(this, _playing, false);
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

export { MoleculeEditPlanError, MoleculeEditPlanExecutor, validateMoleculeEditPlan };
//# sourceMappingURL=MoleculeEditPlanExecutor.modern.js.map
