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
import _toConsumableArray from '@babel/runtime/helpers/toConsumableArray';
import _classCallCheck from '@babel/runtime/helpers/classCallCheck';
import _createClass from '@babel/runtime/helpers/createClass';
import _defineProperty from '@babel/runtime/helpers/defineProperty';
import { provideEditorInstance, setEditorRenderingContext } from '../../editor/editorSingleton.modern.js';
import { monomerFactory } from './monomerFactory.modern.js';
import { notifyRenderComplete } from '../notifyRenderComplete.modern.js';
import { PolymerBondRendererFactory } from './PolymerBondRenderer/PolymerBondRendererFactory.modern.js';
import '../../../utilities/runAsyncAction.modern.js';
import '../../../utilities/KetcherLogger.modern.js';
import '../../../utilities/SettingsManager.modern.js';
import '../../../utilities/keynorm.modern.js';
import 'react-device-detect';
import '../../../utilities/clipboardUtils.modern.js';
import { assert } from '../../../utilities/assert.modern.js';
import { LinkerSequenceNode } from '../../../domain/entities/LinkerSequenceNode.modern.js';
import { MonomerSequenceNode } from '../../../domain/entities/MonomerSequenceNode.modern.js';
import { Nucleoside } from '../../../domain/entities/Nucleoside.modern.js';
import { Nucleotide } from '../../../domain/entities/Nucleotide.modern.js';
import { UnsplitNucleotide } from '../../../domain/entities/UnsplitNucleotide.modern.js';
import { Vec2 } from '../../../domain/entities/vec2.modern.js';
import { ChainsCollection } from '../../../domain/entities/monomer-chains/ChainsCollection.modern.js';
import { AmbiguousMonomer } from '../../../domain/entities/AmbiguousMonomer.modern.js';
import { AmbiguousMonomerRenderer } from './AmbiguousMonomerRenderer.modern.js';
import { Atom } from '../../../domain/entities/CoreAtom.modern.js';
import { AtomRenderer } from './AtomRenderer.modern.js';
import { BondRenderer } from './BondRenderer.modern.js';
import { Bond } from '../../../domain/entities/CoreBond.modern.js';
import { MonomerToAtomBondRenderer } from './MonomerToAtomBondRenderer.modern.js';
import { MonomerToAtomBond } from '../../../domain/entities/MonomerToAtomBond.modern.js';
import { MonomerToAtomBondSequenceRenderer } from './sequence/MonomerToAtomBondSequenceRenderer.modern.js';
import { SequenceRenderer } from './sequence/SequenceRenderer.modern.js';
import { PeptideSubChain } from '../../../domain/entities/monomer-chains/PeptideSubChain.modern.js';
import { RnaSubChain } from '../../../domain/entities/monomer-chains/RnaSubChain.modern.js';
import { PhosphateSubChain } from '../../../domain/entities/monomer-chains/PhosphateSubChain.modern.js';
import { RxnArrowRenderer } from './RxnArrowRenderer.modern.js';
import { MultitailArrowRenderer } from './MultitailArrowRenderer.modern.js';
import { RxnPlusRenderer } from './RxnPlusRenderer.modern.js';
import { StereoFlagRenderer } from './StereoFlagRenderer.modern.js';
import { Scale } from '../../../domain/helpers/scale.modern.js';
import '../../../domain/helpers/functionalGroupsProvider.modern.js';
import '../../../domain/helpers/saltsAndSolventsProvider.modern.js';
import '../../../domain/constants/generics.modern.js';
import '../../../domain/helpers/attachmentPointCalculations.modern.js';
import { isValidRnaEnumerationStartMonomer } from '../../../domain/helpers/monomers.modern.js';
import { provideEditorSettings } from '../../editor/editorSettings.modern.js';
import { ZoomTool } from '../../editor/tools/Zoom.modern.js';
import { SGroupRenderer } from './SGroupRenderer.modern.js';

var RenderersManager = function () {
  function RenderersManager(_ref) {
    var theme = _ref.theme;
    _classCallCheck(this, RenderersManager);
    _defineProperty(this, "theme", void 0);
    _defineProperty(this, "zoomTool", void 0);
    _defineProperty(this, "editor", void 0);
    _defineProperty(this, "monomers", new Map());
    _defineProperty(this, "polymerBonds", new Map());
    _defineProperty(this, "atoms", new Map());
    _defineProperty(this, "bonds", new Map());
    _defineProperty(this, "sgroups", new Map());
    _defineProperty(this, "needRecalculateMonomersEnumeration", false);
    this.theme = theme;
  }
  _createClass(RenderersManager, [{
    key: "hoverDrawingEntity",
    value: function hoverDrawingEntity(drawingEntity) {
      assert(drawingEntity.baseRenderer);
      drawingEntity.baseRenderer.redrawHover();
    }
  }, {
    key: "selectDrawingEntity",
    value: function selectDrawingEntity(drawingEntity) {
      assert(drawingEntity.baseRenderer);
      drawingEntity.baseRenderer.drawSelection();
    }
  }, {
    key: "moveDrawingEntity",
    value: function moveDrawingEntity(drawingEntity) {
      assert(drawingEntity.baseRenderer);
      drawingEntity.baseRenderer.moveSelection();
      if (drawingEntity instanceof Atom) {
        drawingEntity.bonds.forEach(function (bond) {
          var _bond$renderer, _connectedAtom$render;
          if (!(bond instanceof Bond)) {
            return;
          }
          (_bond$renderer = bond.renderer) === null || _bond$renderer === void 0 || _bond$renderer.move();
          var connectedAtom = bond.firstAtom === drawingEntity ? bond.secondAtom : bond.firstAtom;
          (_connectedAtom$render = connectedAtom.renderer) === null || _connectedAtom$render === void 0 || _connectedAtom$render.move();
        });
      }
      drawingEntity.baseRenderer.drawSelection();
    }
  }, {
    key: "markForReEnumeration",
    value: function markForReEnumeration() {
      this.needRecalculateMonomersEnumeration = true;
    }
  }, {
    key: "addMonomer",
    value: function addMonomer(monomer, callback) {
      var monomerRenderer;
      if (monomer instanceof AmbiguousMonomer) {
        monomerRenderer = new AmbiguousMonomerRenderer(monomer);
      } else {
        var MonomerRenderer = monomerFactory(monomer.monomerItem)[1];
        monomerRenderer = new MonomerRenderer(monomer);
      }
      this.monomers.set(monomer.id, monomerRenderer);
      monomerRenderer.show(this.theme);
      this.markForReEnumeration();
      if (callback) {
        callback();
      }
    }
  }, {
    key: "moveMonomer",
    value: function moveMonomer(monomer) {
      var _monomer$renderer, _monomer$renderer2;
      (_monomer$renderer = monomer.renderer) === null || _monomer$renderer === void 0 || _monomer$renderer.move();
      (_monomer$renderer2 = monomer.renderer) === null || _monomer$renderer2 === void 0 || _monomer$renderer2.drawSelection();
    }
  }, {
    key: "redrawDrawingEntity",
    value: function redrawDrawingEntity(drawingEntity) {
      var _drawingEntity$baseRe, _drawingEntity$baseRe2;
      var force = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var recalculateEnumeration = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      (_drawingEntity$baseRe = drawingEntity.baseRenderer) === null || _drawingEntity$baseRe === void 0 || _drawingEntity$baseRe.remove();
      (_drawingEntity$baseRe2 = drawingEntity.baseRenderer) === null || _drawingEntity$baseRe2 === void 0 || _drawingEntity$baseRe2.show(this.theme, force);
      if (recalculateEnumeration) {
        this.markForReEnumeration();
      }
    }
  }, {
    key: "deleteAllDrawingEntities",
    value: function deleteAllDrawingEntities() {
      this.monomers.forEach(function (monomerRenderer) {
        monomerRenderer.remove();
      });
      this.polymerBonds.forEach(function (polymerBondRenderer) {
        polymerBondRenderer.remove();
      });
      this.sgroups.forEach(function (sgroupRenderer) {
        sgroupRenderer.remove();
      });
    }
  }, {
    key: "deleteMonomer",
    value: function deleteMonomer(monomer) {
      var _monomer$renderer3;
      (_monomer$renderer3 = monomer.renderer) === null || _monomer$renderer3 === void 0 || _monomer$renderer3.remove();
      this.monomers["delete"](monomer.id);
      this.markForReEnumeration();
    }
  }, {
    key: "addPolymerBond",
    value: function addPolymerBond(polymerBond) {
      var redrawAttachmentPoints = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
      var polymerBondRenderer = PolymerBondRendererFactory.createInstance(polymerBond);
      this.polymerBonds.set(polymerBond.id, polymerBondRenderer);
      polymerBondRenderer.show();
      if (redrawAttachmentPoints) {
        var _polymerBondRenderer$;
        (_polymerBondRenderer$ = polymerBondRenderer.polymerBond.firstMonomer.renderer) === null || _polymerBondRenderer$ === void 0 || _polymerBondRenderer$.redrawAttachmentPoints();
      }
      this.markForReEnumeration();
    }
  }, {
    key: "movePolymerBond",
    value: function movePolymerBond(polymerBond) {
      var _polymerBond$renderer, _polymerBond$renderer2, _polymerBond$renderer3;
      (_polymerBond$renderer = polymerBond.renderer) === null || _polymerBond$renderer === void 0 || _polymerBond$renderer.moveStart();
      (_polymerBond$renderer2 = polymerBond.renderer) === null || _polymerBond$renderer2 === void 0 || _polymerBond$renderer2.moveEnd();
      (_polymerBond$renderer3 = polymerBond.renderer) === null || _polymerBond$renderer3 === void 0 || _polymerBond$renderer3.drawSelection();
      if (polymerBond.firstMonomer.chosenFirstAttachmentPointForBond) {
        var _polymerBond$firstMon;
        (_polymerBond$firstMon = polymerBond.firstMonomer.renderer) === null || _polymerBond$firstMon === void 0 || _polymerBond$firstMon.redrawAttachmentPointsCoordinates();
      }
    }
  }, {
    key: "showPolymerBondInformation",
    value: function showPolymerBondInformation(polymerBond) {
      var _polymerBond$renderer4, _polymerBond$firstMon2, _polymerBond$firstMon3, _polymerBond$secondMo, _polymerBond$secondMo2;
      (_polymerBond$renderer4 = polymerBond.renderer) === null || _polymerBond$renderer4 === void 0 || _polymerBond$renderer4.redrawHover();
      (_polymerBond$firstMon2 = polymerBond.firstMonomer.renderer) === null || _polymerBond$firstMon2 === void 0 || _polymerBond$firstMon2.redrawAttachmentPoints();
      (_polymerBond$firstMon3 = polymerBond.firstMonomer.renderer) === null || _polymerBond$firstMon3 === void 0 || _polymerBond$firstMon3.redrawHover();
      (_polymerBond$secondMo = polymerBond.secondMonomer) === null || _polymerBond$secondMo === void 0 || (_polymerBond$secondMo = _polymerBond$secondMo.renderer) === null || _polymerBond$secondMo === void 0 || _polymerBond$secondMo.redrawAttachmentPoints();
      (_polymerBond$secondMo2 = polymerBond.secondMonomer) === null || _polymerBond$secondMo2 === void 0 || (_polymerBond$secondMo2 = _polymerBond$secondMo2.renderer) === null || _polymerBond$secondMo2 === void 0 || _polymerBond$secondMo2.redrawHover();
    }
  }, {
    key: "deletePolymerBond",
    value: function deletePolymerBond(polymerBond) {
      var _polymerBond$renderer5;
      var recalculateEnumeration = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
      var redrawAttachmentPoints = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
      (_polymerBond$renderer5 = polymerBond.renderer) === null || _polymerBond$renderer5 === void 0 || _polymerBond$renderer5.remove();
      if (redrawAttachmentPoints) {
        var _polymerBond$firstMon4, _polymerBond$firstMon5, _polymerBond$secondMo3, _polymerBond$secondMo4;
        polymerBond === null || polymerBond === void 0 || (_polymerBond$firstMon4 = polymerBond.firstMonomer) === null || _polymerBond$firstMon4 === void 0 || (_polymerBond$firstMon4 = _polymerBond$firstMon4.renderer) === null || _polymerBond$firstMon4 === void 0 || (_polymerBond$firstMon5 = _polymerBond$firstMon4.redrawAttachmentPoints) === null || _polymerBond$firstMon5 === void 0 || _polymerBond$firstMon5.call(_polymerBond$firstMon4);
        polymerBond === null || polymerBond === void 0 || (_polymerBond$secondMo3 = polymerBond.secondMonomer) === null || _polymerBond$secondMo3 === void 0 || (_polymerBond$secondMo3 = _polymerBond$secondMo3.renderer) === null || _polymerBond$secondMo3 === void 0 || (_polymerBond$secondMo4 = _polymerBond$secondMo3.redrawAttachmentPoints) === null || _polymerBond$secondMo4 === void 0 || _polymerBond$secondMo4.call(_polymerBond$secondMo3);
      }
      this.polymerBonds["delete"](polymerBond.id);
      if (recalculateEnumeration) {
        this.markForReEnumeration();
      }
    }
  }, {
    key: "recalculatePeptideChainEnumeration",
    value: function recalculatePeptideChainEnumeration(subChain) {
      var currentEnumeration = 1;
      subChain.nodes.forEach(function (node) {
        var monomerRenderer = node.monomer.renderer;
        var needToDrawTerminalIndicator = node.monomer.monomerItem.isAntisense ? currentEnumeration === subChain.length : currentEnumeration === 1;
        if (!monomerRenderer) {
          return;
        }
        monomerRenderer.setEnumeration(currentEnumeration);
        monomerRenderer.redrawEnumeration(needToDrawTerminalIndicator);
        currentEnumeration++;
      });
    }
  }, {
    key: "isRnaEnumerationNode",
    value: function isRnaEnumerationNode(node) {
      return node instanceof Nucleotide || node instanceof Nucleoside || node.monomer instanceof UnsplitNucleotide;
    }
  }, {
    key: "getRnaEnumerationSegmentLength",
    value: function getRnaEnumerationSegmentLength(subChain, startNodeIndex) {
      var segmentLength = 0;
      for (var index = startNodeIndex; index < subChain.nodes.length && this.isRnaEnumerationNode(subChain.nodes[index]); index++) {
        segmentLength++;
      }
      return segmentLength;
    }
  }, {
    key: "recalculateRnaChainEnumeration",
    value: function recalculateRnaChainEnumeration(subChain, isChainCyclic) {
      var _subChain$nodes$,
        _this = this;
      var startMonomer = (_subChain$nodes$ = subChain.nodes[0]) === null || _subChain$nodes$ === void 0 ? void 0 : _subChain$nodes$.firstMonomerInNode;
      if (isChainCyclic && !isValidRnaEnumerationStartMonomer(startMonomer)) {
        subChain.nodes.forEach(function (node) {
          node.monomers.forEach(function (monomer) {
            var _monomer$renderer4, _monomer$renderer5;
            (_monomer$renderer4 = monomer.renderer) === null || _monomer$renderer4 === void 0 || _monomer$renderer4.setEnumeration(null);
            (_monomer$renderer5 = monomer.renderer) === null || _monomer$renderer5 === void 0 || _monomer$renderer5.redrawEnumeration(false);
          });
        });
        return;
      }
      var currentEnumeration = 1;
      var currentSegmentLength = 0;
      subChain.nodes.forEach(function (node, nodeIndex) {
        if (_this.isRnaEnumerationNode(node) && currentSegmentLength === 0) {
          currentSegmentLength = _this.getRnaEnumerationSegmentLength(subChain, nodeIndex);
        }
        var needToDrawTerminalIndicator = node.monomer.monomerItem.isAntisense ? currentEnumeration === currentSegmentLength : currentEnumeration === 1;
        if (node instanceof Nucleotide || node instanceof Nucleoside) {
          var _node$rnaBase$rendere, _node$rnaBase$rendere2, _node$sugar$renderer, _node$sugar$renderer2;
          (_node$rnaBase$rendere = node.rnaBase.renderer) === null || _node$rnaBase$rendere === void 0 || _node$rnaBase$rendere.setEnumeration(currentEnumeration);
          (_node$rnaBase$rendere2 = node.rnaBase.renderer) === null || _node$rnaBase$rendere2 === void 0 || _node$rnaBase$rendere2.redrawEnumeration(needToDrawTerminalIndicator);
          (_node$sugar$renderer = node.sugar.renderer) === null || _node$sugar$renderer === void 0 || _node$sugar$renderer.setEnumeration(currentEnumeration);
          (_node$sugar$renderer2 = node.sugar.renderer) === null || _node$sugar$renderer2 === void 0 || _node$sugar$renderer2.redrawEnumeration(needToDrawTerminalIndicator);
          currentEnumeration++;
        } else if (node.monomer instanceof UnsplitNucleotide) {
          var _node$monomer$rendere, _node$monomer$rendere2;
          (_node$monomer$rendere = node.monomer.renderer) === null || _node$monomer$rendere === void 0 || _node$monomer$rendere.setEnumeration(currentEnumeration);
          (_node$monomer$rendere2 = node.monomer.renderer) === null || _node$monomer$rendere2 === void 0 || _node$monomer$rendere2.redrawEnumeration(needToDrawTerminalIndicator);
          currentEnumeration++;
        } else if (node instanceof MonomerSequenceNode || node instanceof LinkerSequenceNode) {
          node.monomers.forEach(function (monomer) {
            var _monomer$renderer6, _monomer$renderer7;
            (_monomer$renderer6 = monomer.renderer) === null || _monomer$renderer6 === void 0 || _monomer$renderer6.setEnumeration(null);
            (_monomer$renderer7 = monomer.renderer) === null || _monomer$renderer7 === void 0 || _monomer$renderer7.redrawEnumeration(false);
          });
          currentEnumeration = 1;
          currentSegmentLength = 0;
        }
      });
    }
  }, {
    key: "recalculateMonomersEnumeration",
    value: function recalculateMonomersEnumeration() {
      var _this2 = this;
      var editor = provideEditorInstance();
      var chainsCollection = ChainsCollection.fromMonomers(_toConsumableArray(editor.drawingEntitiesManager.monomers.values()));
      chainsCollection.chains.forEach(function (chain) {
        chain.subChains.forEach(function (subChain) {
          if (subChain instanceof PeptideSubChain) {
            _this2.recalculatePeptideChainEnumeration(subChain);
          } else if (subChain instanceof RnaSubChain || subChain instanceof PhosphateSubChain) {
            _this2.recalculateRnaChainEnumeration(subChain, chain.isCyclic);
          }
        });
      });
      this.needRecalculateMonomersEnumeration = false;
    }
  }, {
    key: "finishPolymerBondCreation",
    value: function finishPolymerBondCreation(polymerBond) {
      var _polymerBond$firstMon6, _polymerBond$firstMon7, _polymerBond$firstMon8, _polymerBond$secondMo5, _polymerBond$secondMo6, _polymerBond$secondMo7, _polymerBond$renderer6;
      assert(polymerBond.secondMonomer);
      var polymerBondRenderer = PolymerBondRendererFactory.createInstance(polymerBond);
      this.polymerBonds.set(polymerBond.id, polymerBondRenderer);
      this.markForReEnumeration();
      (_polymerBond$firstMon6 = polymerBond.firstMonomer.renderer) === null || _polymerBond$firstMon6 === void 0 || _polymerBond$firstMon6.redrawAttachmentPoints();
      (_polymerBond$firstMon7 = polymerBond.firstMonomer.renderer) === null || _polymerBond$firstMon7 === void 0 || _polymerBond$firstMon7.drawSelection();
      (_polymerBond$firstMon8 = polymerBond.firstMonomer.renderer) === null || _polymerBond$firstMon8 === void 0 || _polymerBond$firstMon8.redrawHover();
      (_polymerBond$secondMo5 = polymerBond.secondMonomer.renderer) === null || _polymerBond$secondMo5 === void 0 || _polymerBond$secondMo5.redrawAttachmentPoints();
      (_polymerBond$secondMo6 = polymerBond.secondMonomer.renderer) === null || _polymerBond$secondMo6 === void 0 || _polymerBond$secondMo6.drawSelection();
      (_polymerBond$secondMo7 = polymerBond.secondMonomer.renderer) === null || _polymerBond$secondMo7 === void 0 || _polymerBond$secondMo7.redrawHover();
      (_polymerBond$renderer6 = polymerBond.renderer) === null || _polymerBond$renderer6 === void 0 || _polymerBond$renderer6.show();
    }
  }, {
    key: "cancelPolymerBondCreation",
    value: function cancelPolymerBondCreation(polymerBond, secondMonomer) {
      var _polymerBond$firstMon9, _polymerBond$firstMon0, _polymerBond$firstMon1, _secondMonomer$render, _secondMonomer$render2, _secondMonomer$render3;
      this.deletePolymerBond(polymerBond);
      (_polymerBond$firstMon9 = polymerBond.firstMonomer.renderer) === null || _polymerBond$firstMon9 === void 0 || _polymerBond$firstMon9.redrawAttachmentPoints();
      (_polymerBond$firstMon0 = polymerBond.firstMonomer.renderer) === null || _polymerBond$firstMon0 === void 0 || _polymerBond$firstMon0.drawSelection();
      (_polymerBond$firstMon1 = polymerBond.firstMonomer.renderer) === null || _polymerBond$firstMon1 === void 0 || _polymerBond$firstMon1.redrawHover();
      secondMonomer === null || secondMonomer === void 0 || (_secondMonomer$render = secondMonomer.renderer) === null || _secondMonomer$render === void 0 || _secondMonomer$render.redrawAttachmentPoints();
      secondMonomer === null || secondMonomer === void 0 || (_secondMonomer$render2 = secondMonomer.renderer) === null || _secondMonomer$render2 === void 0 || _secondMonomer$render2.drawSelection();
      secondMonomer === null || secondMonomer === void 0 || (_secondMonomer$render3 = secondMonomer.renderer) === null || _secondMonomer$render3 === void 0 || _secondMonomer$render3.redrawHover();
    }
  }, {
    key: "hoverMonomer",
    value: function hoverMonomer(monomer, needRedrawAttachmentPoints) {
      this.hoverDrawingEntity(monomer);
      if (needRedrawAttachmentPoints) {
        var _monomer$renderer8;
        (_monomer$renderer8 = monomer.renderer) === null || _monomer$renderer8 === void 0 || _monomer$renderer8.redrawAttachmentPoints();
      }
    }
  }, {
    key: "hoverAttachmentPoint",
    value: function hoverAttachmentPoint(monomer, attachmentPointName) {
      var _monomer$renderer9, _monomer$renderer0;
      this.hoverDrawingEntity(monomer);
      (_monomer$renderer9 = monomer.renderer) === null || _monomer$renderer9 === void 0 || _monomer$renderer9.hoverAttachmentPoint(attachmentPointName);
      (_monomer$renderer0 = monomer.renderer) === null || _monomer$renderer0 === void 0 || _monomer$renderer0.updateAttachmentPoints();
    }
  }, {
    key: "reinitializeViewModel",
    value: function reinitializeViewModel() {
      var _this$editor;
      var editor = (_this$editor = this.editor) !== null && _this$editor !== void 0 ? _this$editor : provideEditorInstance();
      var viewModel = editor.viewModel;
      viewModel.initialize(_toConsumableArray(editor.drawingEntitiesManager.bonds.values()));
    }
  }, {
    key: "update",
    value: function update(modelChanges) {
      if (this.zoomTool) ZoomTool.setRenderingContext(this.zoomTool);
      if (this.editor) setEditorRenderingContext(this.editor);
      try {
        this.reinitializeViewModel();
        modelChanges === null || modelChanges === void 0 || modelChanges.execute(this);
        this.runPostRenderMethods();
        notifyRenderComplete();
      } finally {
        if (this.zoomTool) ZoomTool.setRenderingContext(undefined);
        if (this.editor) setEditorRenderingContext(undefined);
      }
    }
  }, {
    key: "addAtom",
    value: function addAtom(atom) {
      if (atom.renderer) {
        atom.renderer.remove();
      }
      var atomRenderer = new AtomRenderer(atom);
      this.atoms.set(atom.id, atomRenderer);
      atomRenderer.show();
    }
  }, {
    key: "deleteAtom",
    value: function deleteAtom(atom) {
      var _atom$renderer;
      this.atoms["delete"](atom.id);
      (_atom$renderer = atom.renderer) === null || _atom$renderer === void 0 || _atom$renderer.remove();
    }
  }, {
    key: "addBond",
    value: function addBond(bond) {
      var _this3 = this;
      if (bond.renderer) {
        bond.renderer.remove();
      }
      var bondRenderer = new BondRenderer(bond);
      this.bonds.set(bond.id, bondRenderer);
      [bond.firstAtom, bond.secondAtom].forEach(function (bondAtom) {
        if (bondAtom.bonds.indexOf(bond) !== -1) return;
        bondAtom.addBond(bond);
        _this3.atoms.forEach(function (atom) {
          var _bondAtom$renderer;
          if (((_bondAtom$renderer = bondAtom.renderer) === null || _bondAtom$renderer === void 0 ? void 0 : _bondAtom$renderer.atom.id) !== atom.atom.id) return;
          atom.redrawLabel();
        });
      });
      bondRenderer.show();
      this.bonds.forEach(function (redrawBondRenderer) {
        var _redrawBondRenderer$b = redrawBondRenderer.bond,
          firstAtom = _redrawBondRenderer$b.firstAtom,
          secondAtom = _redrawBondRenderer$b.secondAtom;
        var monomerToAtomBonds = [].concat(_toConsumableArray(firstAtom.bonds.filter(function (bond) {
          return bond instanceof MonomerToAtomBond;
        })), _toConsumableArray(secondAtom.bonds.filter(function (bond) {
          return bond instanceof MonomerToAtomBond;
        })));
        monomerToAtomBonds.forEach(function (monomerToAtomBond) {
          var _monomerToAtomBond$re;
          return (_monomerToAtomBond$re = monomerToAtomBond.renderer) === null || _monomerToAtomBond$re === void 0 ? void 0 : _monomerToAtomBond$re.move();
        });
        if (firstAtom === bond.secondAtom || secondAtom === bond.firstAtom || firstAtom === bond.firstAtom || secondAtom === bond.secondAtom) {
          redrawBondRenderer.move();
        }
      });
    }
  }, {
    key: "deleteBond",
    value: function deleteBond(bond) {
      var _bond$renderer2;
      this.bonds["delete"](bond.id);
      (_bond$renderer2 = bond.renderer) === null || _bond$renderer2 === void 0 || _bond$renderer2.remove();
    }
  }, {
    key: "addSGroup",
    value: function addSGroup(sgroupDrawingEntity) {
      if (sgroupDrawingEntity.renderer) {
        sgroupDrawingEntity.renderer.remove();
      }
      var sgroupRenderer = new SGroupRenderer(sgroupDrawingEntity);
      this.sgroups.set(sgroupDrawingEntity.id, sgroupRenderer);
      sgroupRenderer.show();
      sgroupRenderer.applyExpandedStateToStructure(this.atoms, this.bonds);
      sgroupRenderer.moveLabelsToFront();
    }
  }, {
    key: "deleteSGroup",
    value: function deleteSGroup(sgroupDrawingEntity) {
      var _sgroupDrawingEntity$;
      this.sgroups["delete"](sgroupDrawingEntity.id);
      (_sgroupDrawingEntity$ = sgroupDrawingEntity.renderer) === null || _sgroupDrawingEntity$ === void 0 || _sgroupDrawingEntity$.remove();
    }
  }, {
    key: "rerenderSGroups",
    value: function rerenderSGroups() {
      var _this4 = this;
      this.atoms.forEach(function (atomRenderer) {
        atomRenderer.setVisibility(true);
      });
      this.bonds.forEach(function (bondRenderer) {
        bondRenderer.setVisibility(true);
      });
      this.sgroups.forEach(function (sgroupRenderer) {
        sgroupRenderer.remove();
        sgroupRenderer.show();
        sgroupRenderer.applyExpandedStateToStructure(_this4.atoms, _this4.bonds);
        sgroupRenderer.moveLabelsToFront();
      });
    }
  }, {
    key: "addMonomerToAtomBond",
    value: function addMonomerToAtomBond(bond) {
      var _bond$renderer3;
      (_bond$renderer3 = bond.renderer) === null || _bond$renderer3 === void 0 || _bond$renderer3.remove();
      this.redrawDrawingEntity(bond.atom);
      var sequenceNode = this.getSequenceNodeForMonomerToAtomBond(bond);
      if (sequenceNode) {
        var _renderer = new MonomerToAtomBondSequenceRenderer(bond, sequenceNode);
        SequenceRenderer.showBondRenderer(_renderer);
        this.redrawMonomerToAtomBondRelatedState(bond);
        return;
      }
      var renderer = new MonomerToAtomBondRenderer(bond);
      renderer.show();
      this.redrawMonomerToAtomBondRelatedState(bond);
    }
  }, {
    key: "getSequenceNodeForMonomerToAtomBond",
    value: function getSequenceNodeForMonomerToAtomBond(bond) {
      var _SequenceRenderer$cha;
      var editor = provideEditorInstance();
      if (editor.mode.modeName !== 'sequence-layout-mode') {
        return;
      }
      return (_SequenceRenderer$cha = SequenceRenderer.chainsCollection) === null || _SequenceRenderer$cha === void 0 ? void 0 : _SequenceRenderer$cha.monomerToNode.get(bond.monomer);
    }
  }, {
    key: "redrawMonomerToAtomBondRelatedState",
    value: function redrawMonomerToAtomBondRelatedState(bond) {
      var _bond$monomer$rendere, _bond$monomer$rendere2;
      (_bond$monomer$rendere = bond.monomer.renderer) === null || _bond$monomer$rendere === void 0 || _bond$monomer$rendere.redrawAttachmentPoints();
      (_bond$monomer$rendere2 = bond.monomer.renderer) === null || _bond$monomer$rendere2 === void 0 || _bond$monomer$rendere2.redrawHover();
    }
  }, {
    key: "deleteMonomerToAtomBond",
    value: function deleteMonomerToAtomBond(bond) {
      var _bond$renderer4;
      (_bond$renderer4 = bond.renderer) === null || _bond$renderer4 === void 0 || _bond$renderer4.remove();
      this.redrawDrawingEntity(bond.atom);
    }
  }, {
    key: "addRxnArrow",
    value: function addRxnArrow(arrow) {
      var arrowRenderer = new RxnArrowRenderer(arrow);
      arrowRenderer.show();
    }
  }, {
    key: "deleteRxnArrow",
    value: function deleteRxnArrow(arrow) {
      var _arrow$renderer;
      (_arrow$renderer = arrow.renderer) === null || _arrow$renderer === void 0 || _arrow$renderer.remove();
    }
  }, {
    key: "addMultitailArrow",
    value: function addMultitailArrow(arrow) {
      var arrowRenderer = new MultitailArrowRenderer(arrow);
      arrowRenderer.show();
    }
  }, {
    key: "deleteMultitailArrow",
    value: function deleteMultitailArrow(arrow) {
      var _arrow$renderer2;
      (_arrow$renderer2 = arrow.renderer) === null || _arrow$renderer2 === void 0 || _arrow$renderer2.remove();
    }
  }, {
    key: "addRxnPlus",
    value: function addRxnPlus(rxnPlus) {
      var rxnPlusRenderer = new RxnPlusRenderer(rxnPlus);
      rxnPlusRenderer.show();
    }
  }, {
    key: "deleteRxnPlus",
    value: function deleteRxnPlus(rxnPlus) {
      var _rxnPlus$renderer;
      (_rxnPlus$renderer = rxnPlus.renderer) === null || _rxnPlus$renderer === void 0 || _rxnPlus$renderer.remove();
    }
  }, {
    key: "addStereoFlag",
    value: function addStereoFlag(stereoFlag) {
      var stereoFlagRenderer = new StereoFlagRenderer(stereoFlag);
      stereoFlagRenderer.show();
    }
  }, {
    key: "deleteStereoFlag",
    value: function deleteStereoFlag(stereoFlag) {
      var _stereoFlag$renderer;
      (_stereoFlag$renderer = stereoFlag.renderer) === null || _stereoFlag$renderer === void 0 || _stereoFlag$renderer.remove();
    }
  }, {
    key: "renderAromaticCircles",
    value: function renderAromaticCircles() {
      var _ZoomTool$instance,
        _this5 = this;
      var editor = provideEditorInstance();
      var viewModel = editor.viewModel;
      var canvas = (_ZoomTool$instance = ZoomTool.instance) === null || _ZoomTool$instance === void 0 ? void 0 : _ZoomTool$instance.canvas;
      if (!(canvas !== null && canvas !== void 0 && canvas.selectAll)) {
        return;
      }
      canvas.selectAll('.aromatic-circle').remove();
      viewModel.loops.forEach(function (loop) {
        if (!loop.aromatic) {
          return;
        }
        if (loop.isConvex) {
          var _this5$calculateLoopC = _this5.calculateLoopCenterAndRadius(loop),
            center = _this5$calculateLoopC.center,
            radius = _this5$calculateLoopC.radius;
          if (radius <= 0) {
            return;
          }
          canvas.append('circle').attr('class', 'aromatic-circle').attr('cx', center.x).attr('cy', center.y).attr('r', radius).attr('stroke', '#000').attr('stroke-width', 1).attr('fill', 'none');
        } else {
          var pathStr = _this5.calculateDashedPolygonPath(loop);
          if (!pathStr) {
            return;
          }
          canvas.append('path').attr('class', 'aromatic-circle').attr('d', pathStr).attr('stroke', '#000').attr('stroke-width', 1).attr('stroke-dasharray', '2,2').attr('fill', 'none');
        }
      });
    }
  }, {
    key: "calculateDashedPolygonPath",
    value: function calculateDashedPolygonPath(loop) {
      var editorSettings = provideEditorSettings();
      var pathStr = '';
      loop.halfEdges.forEach(function (halfEdge, k) {
        var nextHalfEdge = loop.halfEdges[(k + 1) % loop.halfEdges.length];
        var angle = Math.atan2(Vec2.cross(halfEdge.direction, nextHalfEdge.direction), Vec2.dot(halfEdge.direction, nextHalfEdge.direction));
        var halfAngle = (Math.PI - angle) / 2;
        var dir = nextHalfEdge.direction.rotate(halfAngle);
        var pi = Scale.modelToCanvas(nextHalfEdge.firstAtom.position, editorSettings);
        var sin = Math.sin(halfAngle);
        var minSin = 0.1;
        if (Math.abs(sin) < minSin) {
          sin = sin * minSin / Math.abs(sin);
        }
        var bondSpace = 6;
        var offset = bondSpace / sin;
        var qi = pi.addScaled(dir, -offset);
        pathStr += k === 0 ? "M ".concat(qi.x, " ").concat(qi.y) : " L ".concat(qi.x, " ").concat(qi.y);
      });
      pathStr += ' Z';
      return pathStr;
    }
  }, {
    key: "calculateLoopCenterAndRadius",
    value: function calculateLoopCenterAndRadius(loop) {
      var editorSettings = provideEditorSettings();
      var center = new Vec2(0, 0);
      loop.halfEdges.forEach(function (halfEdge) {
        var atomPos = Scale.modelToCanvas(halfEdge.firstAtom.position, editorSettings);
        center = center.add(atomPos);
      });
      center = center.scaled(1.0 / loop.halfEdges.length);
      var radius = -1;
      loop.halfEdges.forEach(function (halfEdge) {
        var apos = Scale.modelToCanvas(halfEdge.firstAtom.position, editorSettings);
        var bpos = Scale.modelToCanvas(halfEdge.secondAtom.position, editorSettings);
        var n = Vec2.diff(bpos, apos).rotateSC(1, 0).normalized();
        var dist = Vec2.dot(Vec2.diff(apos, center), n);
        radius = radius < 0 ? dist : Math.min(radius, dist);
      });
      radius *= 0.7;
      return {
        center: center,
        radius: radius
      };
    }
  }, {
    key: "runPostRenderMethods",
    value: function runPostRenderMethods() {
      if (this.needRecalculateMonomersEnumeration) {
        this.recalculateMonomersEnumeration();
      }
      this.renderAromaticCircles();
    }
  }, {
    key: "rerenderSideConnectionPolymerBonds",
    value: function rerenderSideConnectionPolymerBonds() {
      this.polymerBonds.forEach(function (polymerBondRenderer) {
        if (!polymerBondRenderer.polymerBond.isSideChainConnection && !polymerBondRenderer.polymerBond.isOverlappedByMonomer) {
          return;
        }
        polymerBondRenderer.remove();
        polymerBondRenderer.show(undefined, true);
      });
    }
  }]);
  return RenderersManager;
}();

export { RenderersManager };
//# sourceMappingURL=RenderersManager.modern.js.map
