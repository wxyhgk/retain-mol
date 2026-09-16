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
import { EmptySubChain } from './monomer-chains/EmptySubChain.modern.js';
import { EmptyMonomer } from './EmptyMonomer.modern.js';

var EmptySequenceNode = function () {
  function EmptySequenceNode() {
    _classCallCheck(this, EmptySequenceNode);
    _defineProperty(this, "renderer", undefined);
    _defineProperty(this, "monomer", new EmptyMonomer());
    _defineProperty(this, "monomersCache", [this.monomer]);
  }
  _createClass(EmptySequenceNode, [{
    key: "SubChainConstructor",
    get: function get() {
      return EmptySubChain;
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

export { EmptySequenceNode };
//# sourceMappingURL=EmptySequenceNode.modern.js.map
