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
var monomers = require('../helpers/monomers.js');
var Chem = require('./Chem.js');
var Phosphate = require('./Phosphate.js');
var RNABase = require('./RNABase.js');
var Sugar = require('./Sugar.js');
var AmbiguousMonomer = require('./AmbiguousMonomer.js');
var monomers$1 = require('../constants/monomers.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);

var LinkerSequenceNode = function () {
  function LinkerSequenceNode(monomer, firstMonomerInChain) {
    _classCallCheck__default["default"](this, LinkerSequenceNode);
    _defineProperty__default["default"](this, "monomer", void 0);
    _defineProperty__default["default"](this, "firstMonomerInChain", void 0);
    this.monomer = monomer;
    this.firstMonomerInChain = firstMonomerInChain;
  }
  _createClass__default["default"](LinkerSequenceNode, [{
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
      var monomers$1 = [this.firstMonomerInNode];
      var firstMonomer = this.firstMonomerInNode;
      var nextMonomer = monomers.getNextMonomerInChain(this.firstMonomerInNode);
      while (nextMonomer !== this.firstMonomerInChain && LinkerSequenceNode.isValidPartForLinker(nextMonomer)) {
        monomers$1.push(nextMonomer);
        nextMonomer = monomers.getNextMonomerInChain(nextMonomer, firstMonomer);
      }
      return monomers$1;
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
      return monomer instanceof Chem.Chem || monomer instanceof Phosphate.Phosphate || monomer instanceof RNABase.RNABase || monomer instanceof Sugar.Sugar && !monomers.isValidNucleotide(monomer) && !monomers.isValidNucleoside(monomer) || monomer instanceof AmbiguousMonomer.AmbiguousMonomer && (monomer.monomerClass === monomers$1.KetMonomerClass.CHEM || monomer.monomerClass === monomers$1.KetMonomerClass.Sugar || monomer.monomerClass === monomers$1.KetMonomerClass.Phosphate || monomer.monomerClass === monomers$1.KetMonomerClass.Base);
    }
  }, {
    key: "isPartOfLinker",
    value: function isPartOfLinker(monomer) {
      if (!monomer) {
        return false;
      }
      var previousMonomerInChain = monomers.getPreviousMonomerInChain(monomer);
      var nextMonomerInChain = monomers.getNextMonomerInChain(monomer);
      return LinkerSequenceNode.isValidPartForLinker(monomer) && (LinkerSequenceNode.isValidPartForLinker(previousMonomerInChain) || LinkerSequenceNode.isValidPartForLinker(nextMonomerInChain));
    }
  }]);
  return LinkerSequenceNode;
}();

exports.LinkerSequenceNode = LinkerSequenceNode;
//# sourceMappingURL=LinkerSequenceNode.js.map
