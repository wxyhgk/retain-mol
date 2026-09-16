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
import _classPrivateFieldGet from '@babel/runtime/helpers/classPrivateFieldGet';
import _classPrivateFieldSet from '@babel/runtime/helpers/classPrivateFieldSet';
import { ChemicalMimeType } from '../domain/services/struct/structService.types.modern.js';
import { KetSerializer } from '../domain/serializers/ket/ketSerializer.modern.js';
import '../domain/entities/vec2.modern.js';
import 'lodash';
import './editor/operations/atom/index.modern.js';
import './editor/operations/bond/index.modern.js';
import './editor/operations/CanvasLoad.modern.js';
import './editor/operations/descriptors.modern.js';
import './editor/operations/EnhancedFlagMove.modern.js';
import './editor/operations/EnhancedFlagClear.modern.js';
import './editor/operations/ifThen.modern.js';
import './editor/operations/fragment.modern.js';
import './editor/operations/fragmentStereoAtom.modern.js';
import './editor/operations/FragmentStereoFlag.modern.js';
import './editor/operations/calcimplicitH.modern.js';
import './editor/operations/LoopMove.modern.js';
import './editor/operations/OperationType.modern.js';
import './editor/operations/image/imageMove.modern.js';
import './editor/operations/image/imageResize.modern.js';
import './editor/operations/image/imageUpsertDelete.modern.js';
import './editor/operations/multitailArrow/multitailArrowAddRemoveTail.modern.js';
import './editor/operations/multitailArrow/multitailArrowMove.modern.js';
import './editor/operations/multitailArrow/multitailArrowMoveHeadTail.modern.js';
import './editor/operations/multitailArrow/multitailArrowResizeTailHead.modern.js';
import './editor/operations/multitailArrow/multitailArrowUpsertDelete.modern.js';
import './editor/operations/rgroup/RGroupAttr.modern.js';
import './editor/operations/rgroup/RGroupFragment.modern.js';
import './editor/operations/rgroupAttachmentPoint/index.modern.js';
import './editor/operations/rxn/index.modern.js';
import './editor/operations/simpleObject.modern.js';
import './editor/operations/sgroup/index.modern.js';
import './editor/operations/Text/TextCreateDelete.modern.js';
import './editor/operations/Text/TextUpdate.modern.js';
import './editor/operations/Text/TextMove.modern.js';
import './editor/operations/monomer/AttachmentPointHoverOperation.modern.js';
import './editor/operations/monomer/FlipMonomerOperation.modern.js';
import './editor/operations/monomer/MonomerAddOperation.modern.js';
import './editor/operations/monomer/MonomerDeleteOperation.modern.js';
import '../domain/entities/AmbiguousMonomer.modern.js';
import '../domain/helpers/monomers.modern.js';
import './render/renderers/AmbiguousMonomerRenderer.modern.js';
import '@babel/runtime/helpers/slicedToArray';
import '@babel/runtime/helpers/toConsumableArray';
import '../domain/entities/atom.modern.js';
import '../domain/entities/atomList.modern.js';
import '../domain/entities/bond.modern.js';
import '../domain/entities/fixedPrecision.modern.js';
import '../domain/entities/fragment.modern.js';
import '../domain/entities/functionalGroup.modern.js';
import '../domain/entities/halfBond.modern.js';
import '../domain/entities/loop.modern.js';
import '../domain/entities/rgroup.modern.js';
import '../domain/entities/rgroupAttachmentPoint.modern.js';
import '../domain/entities/rxnArrow.modern.js';
import '../domain/entities/rxnPlus.modern.js';
import '../domain/entities/sgroup.modern.js';
import '../domain/entities/sgroupForest.modern.js';
import '../domain/entities/simpleObject.modern.js';
import '../domain/entities/struct.modern.js';
import '../domain/entities/text.modern.js';
import '../domain/entities/pile.modern.js';
import '../domain/entities/box2Abs.modern.js';
import '../domain/entities/pool.modern.js';
import '../domain/entities/image.modern.js';
import '../domain/entities/multitailArrow.modern.js';
import '../domain/entities/highlight.modern.js';
import '../domain/entities/sGroupAttachmentPoint.modern.js';
import '../domain/entities/monomerMicromolecule.modern.js';
import '../domain/entities/Peptide.modern.js';
import '../domain/entities/BaseMonomer.modern.js';
import '../domain/entities/Chem.modern.js';
import '../domain/entities/Sugar.modern.js';
import '../domain/entities/RNABase.modern.js';
import '../domain/entities/Phosphate.modern.js';
import '../domain/entities/Axis.modern.js';
import '../domain/entities/Nucleoside.modern.js';
import '../domain/entities/Nucleotide.modern.js';
import '../domain/entities/monomer-chains/types.modern.js';
import '../domain/entities/monomer-chains/Chain.modern.js';
import '../domain/entities/monomer-chains/ChainsCollection.modern.js';
import '../domain/entities/MonomerSequenceNode.modern.js';
import '../domain/entities/EmptySequenceNode.modern.js';
import '../domain/entities/LinkerSequenceNode.modern.js';
import '../domain/entities/UnresolvedMonomer.modern.js';
import '../domain/entities/UnsplitNucleotide.modern.js';
import '../domain/entities/PolymerBond.modern.js';
import '../domain/entities/MonomerToAtomBond.modern.js';
import '../domain/entities/HydrogenBond.modern.js';
import '../domain/entities/SGroupDrawingEntity.modern.js';
import '../domain/entities/BackBoneSequenceNode.modern.js';
import '../domain/entities/Command.modern.js';
import '../utilities/runAsyncAction.modern.js';
import '../utilities/KetcherLogger.modern.js';
import '../utilities/SettingsManager.modern.js';
import '../utilities/keynorm.modern.js';
import 'react-device-detect';
import '../utilities/clipboardUtils.modern.js';
import '../domain/entities/CoreAtom.modern.js';
import '../domain/entities/CoreStereoFlag.modern.js';
import '@babel/runtime/helpers/defineProperty';
import '@babel/runtime/helpers/typeof';
import '../domain/constants/elements.modern.js';
import '../domain/constants/element.types.modern.js';
import '../domain/constants/generics.modern.js';
import '../domain/constants/chains.modern.js';
import '../domain/constants/monomers.modern.js';
import './render/renderers/ChemRenderer.modern.js';
import './render/renderers/PeptideRenderer.modern.js';
import './render/renderers/PhosphateRenderer.modern.js';
import './render/renderers/RNABaseRenderer.modern.js';
import './render/renderers/SugarRenderer.modern.js';
import './render/renderers/UnresolvedMonomerRenderer.modern.js';
import './render/renderers/UnsplitNucleotideRenderer.modern.js';
import './editor/operations/monomer/MonomerHoverOperation.modern.js';
import './editor/operations/monomer/MonomerItemModifyOperation.modern.js';
import './editor/operations/monomer/MonomerMoveOperation.modern.js';
import './editor/operations/monomer/RotateMonomerOperation.modern.js';
import './editor/operations/monomer/ShiftMonomerOperation.modern.js';
import './editor/operations/modes/index.modern.js';
import './editor/operations/monomerCreation/AssignAttachmentAtomOperation.modern.js';
import './editor/operations/monomerCreation/AssignLeavingGroupAtomOperation.modern.js';
import './editor/operations/monomerCreation/MarkAsRnaComponentOperation.modern.js';
import './editor/operations/monomerCreation/ReassignAttachmentPointOperation.modern.js';
import './editor/operations/monomerCreation/ReassignLeavingAtomOperation.modern.js';
import './editor/actions/action.modern.js';
import './editor/actions/actionTransaction.modern.js';
import './editor/actions/utils.modern.js';
import '../domain/helpers/functionalGroupsProvider.modern.js';
import '../domain/helpers/saltsAndSolventsProvider.modern.js';
import '../domain/helpers/attachmentPointCalculations.modern.js';
import 'lodash/fp';
import './editor/operations/sgroup/sgroupAttachmentPoints.modern.js';
import { defaultBondThickness } from './editor/shared/constants.modern.js';
import './editor/actions/bond.modern.js';
import './editor/operations/highlight.modern.js';
import './editor/shared/coordinates.modern.js';
import './editor/editor.types.modern.js';
import './editor/Editor.modern.js';
import './editor/EditorHistory.modern.js';
import './editor/modes/FlexMode.modern.js';
import './editor/modes/SequenceMode.modern.js';
import './editor/modes/SnakeMode.modern.js';
import './editor/editorEvents.modern.js';
import './editor/tools/index.modern.js';
import './editor/MacromoleculesConverter.modern.js';
import './editor/MoleculeEditPlanExecutor.modern.js';
import './editor/tools/types.modern.js';
import './editor/previewPosition.modern.js';
import './recognition/recognizedMolecule.modern.js';
import { ImagoRecognitionAdapter } from './recognition/ImagoRecognitionAdapter.modern.js';
import './recognition/OpenAICompatibleRecognitionAdapter.modern.js';

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
    _classCallCheck(this, Indigo);
    _classPrivateFieldInitSpec(this, _structService, {
      writable: true,
      value: void 0
    });
    _classPrivateFieldInitSpec(this, _ketSerializer, {
      writable: true,
      value: void 0
    });
    _classPrivateFieldSet(this, _structService, structService);
    _classPrivateFieldSet(this, _ketSerializer, new KetSerializer());
  }
  _createClass(Indigo, [{
    key: "info",
    value: function info() {
      return _classPrivateFieldGet(this, _structService).info();
    }
  }, {
    key: "convert",
    value: function convert(struct, options) {
      var _options$outputFormat;
      var outputFormat = (_options$outputFormat = options === null || options === void 0 ? void 0 : options.outputFormat) !== null && _options$outputFormat !== void 0 ? _options$outputFormat : ChemicalMimeType.KET;
      var inputFormat = options === null || options === void 0 ? void 0 : options.inputFormat;
      var outputContentType = options === null || options === void 0 ? void 0 : options.outputContentType;
      return _classPrivateFieldGet(this, _structService).convert({
        struct: convertStructToString(struct, _classPrivateFieldGet(this, _ketSerializer)),
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
      return _classPrivateFieldGet(this, _structService).layout({
        struct: convertStructToString(struct, _classPrivateFieldGet(this, _ketSerializer)),
        output_format: ChemicalMimeType.KET
      }, options).then(function (data) {
        return _classPrivateFieldGet(_this, _ketSerializer).deserialize(data.struct);
      });
    }
  }, {
    key: "clean",
    value: function clean(struct) {
      var _this2 = this;
      return _classPrivateFieldGet(this, _structService).clean({
        struct: convertStructToString(struct, _classPrivateFieldGet(this, _ketSerializer)),
        output_format: ChemicalMimeType.KET
      }).then(function (data) {
        return _classPrivateFieldGet(_this2, _ketSerializer).deserialize(data.struct);
      });
    }
  }, {
    key: "aromatize",
    value: function aromatize(struct) {
      var _this3 = this;
      return _classPrivateFieldGet(this, _structService).aromatize({
        struct: convertStructToString(struct, _classPrivateFieldGet(this, _ketSerializer)),
        output_format: ChemicalMimeType.KET
      }).then(function (data) {
        return _classPrivateFieldGet(_this3, _ketSerializer).deserialize(data.struct);
      });
    }
  }, {
    key: "dearomatize",
    value: function dearomatize(struct) {
      var _this4 = this;
      return _classPrivateFieldGet(this, _structService).dearomatize({
        struct: convertStructToString(struct, _classPrivateFieldGet(this, _ketSerializer)),
        output_format: ChemicalMimeType.KET
      }).then(function (data) {
        return _classPrivateFieldGet(_this4, _ketSerializer).deserialize(data.struct);
      });
    }
  }, {
    key: "calculateCip",
    value: function calculateCip(struct) {
      var _this5 = this;
      return _classPrivateFieldGet(this, _structService).calculateCip({
        struct: convertStructToString(struct, _classPrivateFieldGet(this, _ketSerializer)),
        output_format: ChemicalMimeType.KET
      }).then(function (data) {
        return _classPrivateFieldGet(_this5, _ketSerializer).deserialize(data.struct);
      });
    }
  }, {
    key: "automap",
    value: function automap(struct, options) {
      var _options$mode,
        _this6 = this;
      var mode = (_options$mode = options === null || options === void 0 ? void 0 : options.mode) !== null && _options$mode !== void 0 ? _options$mode : 'discard';
      return _classPrivateFieldGet(this, _structService).automap({
        struct: convertStructToString(struct, _classPrivateFieldGet(this, _ketSerializer)),
        output_format: ChemicalMimeType.KET,
        mode: mode
      }).then(function (data) {
        return _classPrivateFieldGet(_this6, _ketSerializer).deserialize(data.struct);
      });
    }
  }, {
    key: "check",
    value: function check(struct, options) {
      var _options$types;
      var types = (_options$types = options === null || options === void 0 ? void 0 : options.types) !== null && _options$types !== void 0 ? _options$types : defaultTypes;
      return _classPrivateFieldGet(this, _structService).check({
        struct: convertStructToString(struct, _classPrivateFieldGet(this, _ketSerializer)),
        types: types
      });
    }
  }, {
    key: "calculate",
    value: function calculate(struct, options) {
      var _options$properties;
      var properties = (_options$properties = options === null || options === void 0 ? void 0 : options.properties) !== null && _options$properties !== void 0 ? _options$properties : defaultCalcProps;
      return _classPrivateFieldGet(this, _structService).calculate({
        struct: convertStructToString(struct, _classPrivateFieldGet(this, _ketSerializer)),
        properties: properties
      });
    }
  }, {
    key: "recognize",
    value: function recognize(image, options) {
      var _options$version;
      var version = (_options$version = options === null || options === void 0 ? void 0 : options.version) !== null && _options$version !== void 0 ? _options$version : '';
      var adapter = new ImagoRecognitionAdapter(_classPrivateFieldGet(this, _structService).recognize.bind(_classPrivateFieldGet(this, _structService)));
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
      var bondThickness = (_options$bondThicknes = options === null || options === void 0 ? void 0 : options.bondThickness) !== null && _options$bondThicknes !== void 0 ? _options$bondThicknes : defaultBondThickness;
      return _classPrivateFieldGet(this, _structService).generateImageAsBase64(convertStructToString(struct, _classPrivateFieldGet(this, _ketSerializer)), {
        outputFormat: outputFormat,
        backgroundColor: backgroundColor,
        bondThickness: bondThickness
      });
    }
  }, {
    key: "toggleExplicitHydrogens",
    value: function toggleExplicitHydrogens(struct) {
      var _this7 = this;
      return _classPrivateFieldGet(this, _structService).toggleExplicitHydrogens({
        struct: convertStructToString(struct, _classPrivateFieldGet(this, _ketSerializer)),
        output_format: ChemicalMimeType.KET
      }).then(function (data) {
        return _classPrivateFieldGet(_this7, _ketSerializer).deserialize(data.struct);
      });
    }
  }, {
    key: "calculateMacromoleculeProperties",
    value: function calculateMacromoleculeProperties(struct) {
      return _classPrivateFieldGet(this, _structService).calculateMacromoleculeProperties({
        struct: struct
      });
    }
  }]);
  return Indigo;
}();

export { Indigo };
//# sourceMappingURL=indigo.modern.js.map
