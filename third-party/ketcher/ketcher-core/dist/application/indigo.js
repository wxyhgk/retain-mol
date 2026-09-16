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
var _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet');
var _classPrivateFieldSet = require('@babel/runtime/helpers/classPrivateFieldSet');
var structService_types = require('../domain/services/struct/structService.types.js');
var ketSerializer = require('../domain/serializers/ket/ketSerializer.js');
require('../domain/entities/vec2.js');
require('lodash');
require('./editor/operations/atom/index.js');
require('./editor/operations/bond/index.js');
require('./editor/operations/CanvasLoad.js');
require('./editor/operations/descriptors.js');
require('./editor/operations/EnhancedFlagMove.js');
require('./editor/operations/EnhancedFlagClear.js');
require('./editor/operations/ifThen.js');
require('./editor/operations/fragment.js');
require('./editor/operations/fragmentStereoAtom.js');
require('./editor/operations/FragmentStereoFlag.js');
require('./editor/operations/calcimplicitH.js');
require('./editor/operations/LoopMove.js');
require('./editor/operations/OperationType.js');
require('./editor/operations/image/imageMove.js');
require('./editor/operations/image/imageResize.js');
require('./editor/operations/image/imageUpsertDelete.js');
require('./editor/operations/multitailArrow/multitailArrowAddRemoveTail.js');
require('./editor/operations/multitailArrow/multitailArrowMove.js');
require('./editor/operations/multitailArrow/multitailArrowMoveHeadTail.js');
require('./editor/operations/multitailArrow/multitailArrowResizeTailHead.js');
require('./editor/operations/multitailArrow/multitailArrowUpsertDelete.js');
require('./editor/operations/rgroup/RGroupAttr.js');
require('./editor/operations/rgroup/RGroupFragment.js');
require('./editor/operations/rgroupAttachmentPoint/index.js');
require('./editor/operations/rxn/index.js');
require('./editor/operations/simpleObject.js');
require('./editor/operations/sgroup/index.js');
require('./editor/operations/Text/TextCreateDelete.js');
require('./editor/operations/Text/TextUpdate.js');
require('./editor/operations/Text/TextMove.js');
require('./editor/operations/monomer/AttachmentPointHoverOperation.js');
require('./editor/operations/monomer/FlipMonomerOperation.js');
require('./editor/operations/monomer/MonomerAddOperation.js');
require('./editor/operations/monomer/MonomerDeleteOperation.js');
require('../domain/entities/AmbiguousMonomer.js');
require('../domain/helpers/monomers.js');
require('./render/renderers/AmbiguousMonomerRenderer.js');
require('@babel/runtime/helpers/slicedToArray');
require('@babel/runtime/helpers/toConsumableArray');
require('../domain/entities/atom.js');
require('../domain/entities/atomList.js');
require('../domain/entities/bond.js');
require('../domain/entities/fixedPrecision.js');
require('../domain/entities/fragment.js');
require('../domain/entities/functionalGroup.js');
require('../domain/entities/halfBond.js');
require('../domain/entities/loop.js');
require('../domain/entities/rgroup.js');
require('../domain/entities/rgroupAttachmentPoint.js');
require('../domain/entities/rxnArrow.js');
require('../domain/entities/rxnPlus.js');
require('../domain/entities/sgroup.js');
require('../domain/entities/sgroupForest.js');
require('../domain/entities/simpleObject.js');
require('../domain/entities/struct.js');
require('../domain/entities/text.js');
require('../domain/entities/pile.js');
require('../domain/entities/box2Abs.js');
require('../domain/entities/pool.js');
require('../domain/entities/image.js');
require('../domain/entities/multitailArrow.js');
require('../domain/entities/highlight.js');
require('../domain/entities/sGroupAttachmentPoint.js');
require('../domain/entities/monomerMicromolecule.js');
require('../domain/entities/Peptide.js');
require('../domain/entities/BaseMonomer.js');
require('../domain/entities/Chem.js');
require('../domain/entities/Sugar.js');
require('../domain/entities/RNABase.js');
require('../domain/entities/Phosphate.js');
require('../domain/entities/Axis.js');
require('../domain/entities/Nucleoside.js');
require('../domain/entities/Nucleotide.js');
require('../domain/entities/monomer-chains/types.js');
require('../domain/entities/monomer-chains/Chain.js');
require('../domain/entities/monomer-chains/ChainsCollection.js');
require('../domain/entities/MonomerSequenceNode.js');
require('../domain/entities/EmptySequenceNode.js');
require('../domain/entities/LinkerSequenceNode.js');
require('../domain/entities/UnresolvedMonomer.js');
require('../domain/entities/UnsplitNucleotide.js');
require('../domain/entities/PolymerBond.js');
require('../domain/entities/MonomerToAtomBond.js');
require('../domain/entities/HydrogenBond.js');
require('../domain/entities/SGroupDrawingEntity.js');
require('../domain/entities/BackBoneSequenceNode.js');
require('../domain/entities/Command.js');
require('../utilities/runAsyncAction.js');
require('../utilities/KetcherLogger.js');
require('../utilities/SettingsManager.js');
require('../utilities/keynorm.js');
require('react-device-detect');
require('../utilities/clipboardUtils.js');
require('../domain/entities/CoreAtom.js');
require('../domain/entities/CoreStereoFlag.js');
require('@babel/runtime/helpers/defineProperty');
require('@babel/runtime/helpers/typeof');
require('../domain/constants/elements.js');
require('../domain/constants/element.types.js');
require('../domain/constants/generics.js');
require('../domain/constants/chains.js');
require('../domain/constants/monomers.js');
require('./render/renderers/ChemRenderer.js');
require('./render/renderers/PeptideRenderer.js');
require('./render/renderers/PhosphateRenderer.js');
require('./render/renderers/RNABaseRenderer.js');
require('./render/renderers/SugarRenderer.js');
require('./render/renderers/UnresolvedMonomerRenderer.js');
require('./render/renderers/UnsplitNucleotideRenderer.js');
require('./editor/operations/monomer/MonomerHoverOperation.js');
require('./editor/operations/monomer/MonomerItemModifyOperation.js');
require('./editor/operations/monomer/MonomerMoveOperation.js');
require('./editor/operations/monomer/RotateMonomerOperation.js');
require('./editor/operations/monomer/ShiftMonomerOperation.js');
require('./editor/operations/modes/index.js');
require('./editor/operations/monomerCreation/AssignAttachmentAtomOperation.js');
require('./editor/operations/monomerCreation/AssignLeavingGroupAtomOperation.js');
require('./editor/operations/monomerCreation/MarkAsRnaComponentOperation.js');
require('./editor/operations/monomerCreation/ReassignAttachmentPointOperation.js');
require('./editor/operations/monomerCreation/ReassignLeavingAtomOperation.js');
require('./editor/actions/action.js');
require('./editor/actions/actionTransaction.js');
require('./editor/actions/utils.js');
require('../domain/helpers/functionalGroupsProvider.js');
require('../domain/helpers/saltsAndSolventsProvider.js');
require('../domain/helpers/attachmentPointCalculations.js');
require('lodash/fp');
require('./editor/operations/sgroup/sgroupAttachmentPoints.js');
var constants = require('./editor/shared/constants.js');
require('./editor/actions/bond.js');
require('./editor/operations/highlight.js');
require('./editor/shared/coordinates.js');
require('./editor/editor.types.js');
require('./editor/Editor.js');
require('./editor/EditorHistory.js');
require('./editor/modes/FlexMode.js');
require('./editor/modes/SequenceMode.js');
require('./editor/modes/SnakeMode.js');
require('./editor/editorEvents.js');
require('./editor/tools/index.js');
require('./editor/MacromoleculesConverter.js');
require('./editor/MoleculeEditPlanExecutor.js');
require('./editor/tools/types.js');
require('./editor/previewPosition.js');
require('./recognition/recognizedMolecule.js');
var ImagoRecognitionAdapter = require('./recognition/ImagoRecognitionAdapter.js');
require('./recognition/OpenAICompatibleRecognitionAdapter.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _classPrivateFieldGet__default = /*#__PURE__*/_interopDefaultLegacy(_classPrivateFieldGet);
var _classPrivateFieldSet__default = /*#__PURE__*/_interopDefaultLegacy(_classPrivateFieldSet);

function _classPrivateFieldInitSpec(e, t, a) { _checkPrivateRedeclaration(e, t), t.set(e, a); }
function _checkPrivateRedeclaration(e, t) { if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object"); }
var defaultTypes = ['radicals', 'pseudoatoms', 'stereo', 'query', 'overlapping_atoms', 'overlapping_bonds', 'rgroups', 'chiral', '3d'];
var defaultCalcProps = ['molecular-weight', 'most-abundant-mass', 'monoisotopic-mass', 'gross', 'mass-composition'];
function convertStructToString(struct, serializer) {
  if (typeof struct !== 'string') {
    var aidMap = new Map();
    var result = struct.clone(null, null, false, aidMap);
    return serializer.serialize(result);
  }
  return struct;
}
var _structService = new WeakMap();
var _ketSerializer = new WeakMap();
var Indigo = function () {
  function Indigo(structService) {
    _classCallCheck__default["default"](this, Indigo);
    _classPrivateFieldInitSpec(this, _structService, {
      writable: true,
      value: void 0
    });
    _classPrivateFieldInitSpec(this, _ketSerializer, {
      writable: true,
      value: void 0
    });
    _classPrivateFieldSet__default["default"](this, _structService, structService);
    _classPrivateFieldSet__default["default"](this, _ketSerializer, new ketSerializer.KetSerializer());
  }
  _createClass__default["default"](Indigo, [{
    key: "info",
    value: function info() {
      return _classPrivateFieldGet__default["default"](this, _structService).info();
    }
  }, {
    key: "convert",
    value: function convert(struct, options) {
      var _options$outputFormat;
      var outputFormat = (_options$outputFormat = options === null || options === void 0 ? void 0 : options.outputFormat) !== null && _options$outputFormat !== void 0 ? _options$outputFormat : structService_types.ChemicalMimeType.KET;
      var inputFormat = options === null || options === void 0 ? void 0 : options.inputFormat;
      var outputContentType = options === null || options === void 0 ? void 0 : options.outputContentType;
      return _classPrivateFieldGet__default["default"](this, _structService).convert({
        struct: convertStructToString(struct, _classPrivateFieldGet__default["default"](this, _ketSerializer)),
        output_format: outputFormat,
        input_format: inputFormat
      }, {
        'sequence-type': options === null || options === void 0 ? void 0 : options.sequenceType,
        'output-content-type': outputContentType,
        'monomer-library-saving-mode': options === null || options === void 0 ? void 0 : options.monomerLibrarySavingMode,
        'molfile-saving-skip-date': options === null || options === void 0 ? void 0 : options.molfileSavingSkipDate
      });
    }
  }, {
    key: "layout",
    value: function layout(struct, options) {
      var _this = this;
      return _classPrivateFieldGet__default["default"](this, _structService).layout({
        struct: convertStructToString(struct, _classPrivateFieldGet__default["default"](this, _ketSerializer)),
        output_format: structService_types.ChemicalMimeType.KET
      }, options).then(function (data) {
        return _classPrivateFieldGet__default["default"](_this, _ketSerializer).deserialize(data.struct);
      });
    }
  }, {
    key: "clean",
    value: function clean(struct) {
      var _this2 = this;
      return _classPrivateFieldGet__default["default"](this, _structService).clean({
        struct: convertStructToString(struct, _classPrivateFieldGet__default["default"](this, _ketSerializer)),
        output_format: structService_types.ChemicalMimeType.KET
      }).then(function (data) {
        return _classPrivateFieldGet__default["default"](_this2, _ketSerializer).deserialize(data.struct);
      });
    }
  }, {
    key: "aromatize",
    value: function aromatize(struct) {
      var _this3 = this;
      return _classPrivateFieldGet__default["default"](this, _structService).aromatize({
        struct: convertStructToString(struct, _classPrivateFieldGet__default["default"](this, _ketSerializer)),
        output_format: structService_types.ChemicalMimeType.KET
      }).then(function (data) {
        return _classPrivateFieldGet__default["default"](_this3, _ketSerializer).deserialize(data.struct);
      });
    }
  }, {
    key: "dearomatize",
    value: function dearomatize(struct) {
      var _this4 = this;
      return _classPrivateFieldGet__default["default"](this, _structService).dearomatize({
        struct: convertStructToString(struct, _classPrivateFieldGet__default["default"](this, _ketSerializer)),
        output_format: structService_types.ChemicalMimeType.KET
      }).then(function (data) {
        return _classPrivateFieldGet__default["default"](_this4, _ketSerializer).deserialize(data.struct);
      });
    }
  }, {
    key: "calculateCip",
    value: function calculateCip(struct) {
      var _this5 = this;
      return _classPrivateFieldGet__default["default"](this, _structService).calculateCip({
        struct: convertStructToString(struct, _classPrivateFieldGet__default["default"](this, _ketSerializer)),
        output_format: structService_types.ChemicalMimeType.KET
      }).then(function (data) {
        return _classPrivateFieldGet__default["default"](_this5, _ketSerializer).deserialize(data.struct);
      });
    }
  }, {
    key: "automap",
    value: function automap(struct, options) {
      var _options$mode,
        _this6 = this;
      var mode = (_options$mode = options === null || options === void 0 ? void 0 : options.mode) !== null && _options$mode !== void 0 ? _options$mode : 'discard';
      return _classPrivateFieldGet__default["default"](this, _structService).automap({
        struct: convertStructToString(struct, _classPrivateFieldGet__default["default"](this, _ketSerializer)),
        output_format: structService_types.ChemicalMimeType.KET,
        mode: mode
      }).then(function (data) {
        return _classPrivateFieldGet__default["default"](_this6, _ketSerializer).deserialize(data.struct);
      });
    }
  }, {
    key: "check",
    value: function check(struct, options) {
      var _options$types;
      var types = (_options$types = options === null || options === void 0 ? void 0 : options.types) !== null && _options$types !== void 0 ? _options$types : defaultTypes;
      return _classPrivateFieldGet__default["default"](this, _structService).check({
        struct: convertStructToString(struct, _classPrivateFieldGet__default["default"](this, _ketSerializer)),
        types: types
      });
    }
  }, {
    key: "calculate",
    value: function calculate(struct, options) {
      var _options$properties;
      var properties = (_options$properties = options === null || options === void 0 ? void 0 : options.properties) !== null && _options$properties !== void 0 ? _options$properties : defaultCalcProps;
      return _classPrivateFieldGet__default["default"](this, _structService).calculate({
        struct: convertStructToString(struct, _classPrivateFieldGet__default["default"](this, _ketSerializer)),
        properties: properties
      });
    }
  }, {
    key: "recognize",
    value: function recognize(image, options) {
      var _options$version;
      var version = (_options$version = options === null || options === void 0 ? void 0 : options.version) !== null && _options$version !== void 0 ? _options$version : '';
      var adapter = new ImagoRecognitionAdapter.ImagoRecognitionAdapter(_classPrivateFieldGet__default["default"](this, _structService).recognize.bind(_classPrivateFieldGet__default["default"](this, _structService)));
      return adapter.recognize({
        image: image,
        version: version
      }).then(function (_ref) {
        var structure = _ref.structure;
        return structure;
      });
    }
  }, {
    key: "generateImageAsBase64",
    value: function generateImageAsBase64(struct, options) {
      var _options$outputFormat2, _options$backgroundCo, _options$bondThicknes;
      var outputFormat = (_options$outputFormat2 = options === null || options === void 0 ? void 0 : options.outputFormat) !== null && _options$outputFormat2 !== void 0 ? _options$outputFormat2 : 'png';
      var backgroundColor = (_options$backgroundCo = options === null || options === void 0 ? void 0 : options.backgroundColor) !== null && _options$backgroundCo !== void 0 ? _options$backgroundCo : '';
      var bondThickness = (_options$bondThicknes = options === null || options === void 0 ? void 0 : options.bondThickness) !== null && _options$bondThicknes !== void 0 ? _options$bondThicknes : constants.defaultBondThickness;
      return _classPrivateFieldGet__default["default"](this, _structService).generateImageAsBase64(convertStructToString(struct, _classPrivateFieldGet__default["default"](this, _ketSerializer)), {
        outputFormat: outputFormat,
        backgroundColor: backgroundColor,
        bondThickness: bondThickness
      });
    }
  }, {
    key: "toggleExplicitHydrogens",
    value: function toggleExplicitHydrogens(struct) {
      var _this7 = this;
      return _classPrivateFieldGet__default["default"](this, _structService).toggleExplicitHydrogens({
        struct: convertStructToString(struct, _classPrivateFieldGet__default["default"](this, _ketSerializer)),
        output_format: structService_types.ChemicalMimeType.KET
      }).then(function (data) {
        return _classPrivateFieldGet__default["default"](_this7, _ketSerializer).deserialize(data.struct);
      });
    }
  }, {
    key: "calculateMacromoleculeProperties",
    value: function calculateMacromoleculeProperties(struct) {
      return _classPrivateFieldGet__default["default"](this, _structService).calculateMacromoleculeProperties({
        struct: struct
      });
    }
  }]);
  return Indigo;
}();

exports.Indigo = Indigo;
//# sourceMappingURL=indigo.js.map
