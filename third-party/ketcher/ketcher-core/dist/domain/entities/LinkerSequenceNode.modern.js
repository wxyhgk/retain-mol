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
import { getNextMonomerInChain, isValidNucleotide, isValidNucleoside, getPreviousMonomerInChain } from '../helpers/monomers.modern.js';
import { Chem } from './Chem.modern.js';
import { Phosphate } from './Phosphate.modern.js';
import { RNABase } from './RNABase.modern.js';
import { Sugar } from './Sugar.modern.js';
import { AmbiguousMonomer } from './AmbiguousMonomer.modern.js';
import { KetMonomerClass } from '../constants/monomers.modern.js';

var LinkerSequenceNode = function () {
  function LinkerSequenceNode(monomer, firstMonomerInChain) {
    _classCallCheck(this, LinkerSequenceNode);
    _defineProperty(this, "monomer", void 0);
    _defineProperty(this, "firstMonomerInChain", void 0);
    this.monomer = monomer;
    this.firstMonomerInChain = firstMonomerInChain;
  }
  _createClass(LinkerSequenceNode, [{
    key: "SubChainConstructor",
    get: function get() {
      return this.monomer.SubChainConstructor;
    }
  }, {
    key: "firstMonomerInNode",
    get: function get() {
      return this.monomer;
    }
  }, {
    key: "lastMonomerInNode",
    get: function get() {
      return this.monomers[this.monomers.length - 1];
    }
  }, {
    key: "monomers",
    get: function get() {
      var monomers = [this.firstMonomerInNode];
      var firstMonomer = this.firstMonomerInNode;
      var nextMonomer = getNextMonomerInChain(this.firstMonomerInNode);
      while (nextMonomer !== this.firstMonomerInChain && LinkerSequenceNode.isValidPartForLinker(nextMonomer)) {
        monomers.push(nextMonomer);
        nextMonomer = getNextMonomerInChain(nextMonomer, firstMonomer);
      }
      return monomers;
    }
  }, {
    key: "renderer",
    get: function get() {
      return this.monomer.renderer;
    }
  }, {
    key: "modified",
    get: function get() {
      return false;
    }
  }], [{
    key: "isValidPartForLinker",
    value: function isValidPartForLinker(monomer) {
      return monomer instanceof Chem || monomer instanceof Phosphate || monomer instanceof RNABase || monomer instanceof Sugar && !isValidNucleotide(monomer) && !isValidNucleoside(monomer) || monomer instanceof AmbiguousMonomer && (monomer.monomerClass === KetMonomerClass.CHEM || monomer.monomerClass === KetMonomerClass.Sugar || monomer.monomerClass === KetMonomerClass.Phosphate || monomer.monomerClass === KetMonomerClass.Base);
    }
  }, {
    key: "isPartOfLinker",
    value: function isPartOfLinker(monomer) {
      if (!monomer) {
        return false;
      }
      var previousMonomerInChain = getPreviousMonomerInChain(monomer);
      var nextMonomerInChain = getNextMonomerInChain(monomer);
      return LinkerSequenceNode.isValidPartForLinker(monomer) && (LinkerSequenceNode.isValidPartForLinker(previousMonomerInChain) || LinkerSequenceNode.isValidPartForLinker(nextMonomerInChain));
    }
  }]);
  return LinkerSequenceNode;
}();

export { LinkerSequenceNode };
//# sourceMappingURL=LinkerSequenceNode.modern.js.map
