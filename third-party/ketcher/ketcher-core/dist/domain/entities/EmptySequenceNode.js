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
var EmptySubChain = require('./monomer-chains/EmptySubChain.js');
var EmptyMonomer = require('./EmptyMonomer.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);

var EmptySequenceNode = function () {
  function EmptySequenceNode() {
    _classCallCheck__default["default"](this, EmptySequenceNode);
    _defineProperty__default["default"](this, "renderer", undefined);
    _defineProperty__default["default"](this, "monomer", new EmptyMonomer.EmptyMonomer());
    _defineProperty__default["default"](this, "monomersCache", [this.monomer]);
  }
  _createClass__default["default"](EmptySequenceNode, [{
    key: "SubChainConstructor",
    get: function get() {
      return EmptySubChain.EmptySubChain;
    }
  }, {
    key: "firstMonomerInNode",
    get: function get() {
      return this.monomer;
    }
  }, {
    key: "lastMonomerInNode",
    get: function get() {
      return this.monomer;
    }
  }, {
    key: "hovered",
    get: function get() {
      return false;
    }
  }, {
    key: "selected",
    get: function get() {
      return false;
    }
  }, {
    key: "monomerItem",
    get: function get() {
      return {
        props: {
          MonomerNaturalAnalogCode: null
        }
      };
    }
  }, {
    key: "monomers",
    get: function get() {
      return this.monomersCache;
    }
  }, {
    key: "setRenderer",
    value: function setRenderer(renderer) {
      this.renderer = renderer;
      this.monomer.setRenderer(renderer);
    }
  }, {
    key: "modified",
    get: function get() {
      return false;
    }
  }]);
  return EmptySequenceNode;
}();

exports.EmptySequenceNode = EmptySequenceNode;
//# sourceMappingURL=EmptySequenceNode.js.map
