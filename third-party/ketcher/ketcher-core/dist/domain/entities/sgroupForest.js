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
var pile = require('./pile.js');
var sgroup = require('./sgroup.js');
require('../../utilities/runAsyncAction.js');
var KetcherLogger = require('../../utilities/KetcherLogger.js');
require('../../utilities/SettingsManager.js');
require('../../utilities/keynorm.js');
require('react-device-detect');
require('../../utilities/clipboardUtils.js');
var assert = require('../../utilities/assert.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);

var SGroupForest = function () {
  function SGroupForest() {
    _classCallCheck__default["default"](this, SGroupForest);
    _defineProperty__default["default"](this, "parent", void 0);
    _defineProperty__default["default"](this, "children", void 0);
    _defineProperty__default["default"](this, "atomSets", void 0);
    this.parent = new Map();
    this.children = new Map();
    this.children.set(-1, []);
    this.atomSets = new Map();
  }
  _createClass__default["default"](SGroupForest, [{
    key: "getSGroupsBFS",
    value: function getSGroupsBFS() {
      var order = [];
      var queue = Array.from(this.children.get(-1));
      while (queue.length > 0) {
        var id = queue.shift();
        if (typeof id !== 'number') {
          break;
        }
        var children = this.children.get(id);
        if (typeof children === 'undefined') {
          break;
        }
        children.forEach(function (id) {
          queue.push(id);
        });
        order.push(id);
      }
      return order;
    }
  }, {
    key: "getAtomSetRelations",
    value: function getAtomSetRelations(newId, atoms) {
      var _this = this;
      var isStrictSuperset = new Map();
      var isSubset = new Map();
      this.atomSets["delete"](newId);
      this.atomSets.forEach(function (atomSet, id) {
        isSubset.set(id, atomSet.isSuperset(atoms));
        isStrictSuperset.set(id, atoms.isSuperset(atomSet) && !atomSet.equals(atoms));
      });
      var parents = Array.from(this.atomSets.keys()).filter(function (sgid) {
        if (isSubset.get(sgid) !== true) {
          return false;
        }
        var childs = _this.children.get(sgid);
        return (childs === null || childs === void 0 ? void 0 : childs.findIndex(function (childId) {
          return isSubset.get(childId) === true;
        })) === -1;
      });
      var children = Array.from(this.atomSets.keys()).filter(function (id) {
        var parentId = _this.parent.get(id);
        if (parentId !== undefined && isStrictSuperset.get(parentId) === true) {
          return false;
        }
        return isStrictSuperset.get(id) === true;
      });
      return {
        children: children,
        parent: parents.length === 0 ? -1 : parents[0]
      };
    }
  }, {
    key: "getPathToRoot",
    value: function getPathToRoot(sgid) {
      var path = [];
      var id = sgid;
      while (id !== undefined && id >= 0) {
        path.push(id);
        id = this.parent.get(id);
      }
      return path;
    }
  }, {
    key: "insert",
    value: function insert(_ref, parent, children) {
      var _this2 = this,
        _this$children$get;
      var id = _ref.id,
        atoms = _ref.atoms;
      assert.assert(!this.parent.has(id), 'sgid already present in the forest');
      assert.assert(!this.children.has(id), 'sgid already present in the forest');
      if (!parent || !children) {
        var guess = this.getAtomSetRelations(id, new pile.Pile(atoms));
        parent = guess.parent;
        children = guess.children;
      }
      children.forEach(function (childId) {
        _this2.resetParentLink(childId, id);
      });
      this.children.set(id, children.filter(function (id) {
        return _this2.parent.get(id);
      }));
      this.parent.set(id, parent);
      (_this$children$get = this.children.get(parent)) === null || _this$children$get === void 0 || _this$children$get.push(id);
      this.atomSets.set(id, new pile.Pile(atoms));
      return {
        parent: parent,
        children: children
      };
    }
  }, {
    key: "resetParentLink",
    value: function resetParentLink(childId, id) {
      var parentId = this.parent.get(childId);
      if (typeof parentId === 'undefined') {
        return;
      }
      var childs = this.children.get(parentId);
      if (!childs) {
        return;
      }
      var childIndex = childs.indexOf(childId);
      childs.splice(childIndex, 1);
      this.parent.set(childId, id);
    }
  }, {
    key: "remove",
    value: function remove(id) {
      var _this$children$get2,
        _this3 = this;
      try {
        assert.assert(this.parent.has(id), 'sgid is not in the forest');
        assert.assert(this.children.has(id), 'sgid is not in the forest');
      } catch (e) {
        KetcherLogger.KetcherLogger.error('sgroupForest.ts::SGroupForest::remove', e);
      }
      var parentId = this.parent.get(id);
      if (typeof parentId === 'undefined') return;
      var childs = this.children.get(parentId);
      if (!childs) return;
      (_this$children$get2 = this.children.get(id)) === null || _this$children$get2 === void 0 || _this$children$get2.forEach(function (childId) {
        var _this3$children$get;
        _this3.parent.set(childId, parentId);
        (_this3$children$get = _this3.children.get(parentId)) === null || _this3$children$get === void 0 || _this3$children$get.push(childId);
      });
      var i = childs.indexOf(id);
      childs.splice(i, 1);
      this.children["delete"](id);
      this.parent["delete"](id);
      this.atomSets["delete"](id);
    }
  }]);
  return SGroupForest;
}();
function checkOverlapping(struct, sGroupType) {
  var atoms = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
  var searchFunction = {
    common: function common(sid) {
      var sg = struct.sgroups.get(sid);
      if ((sg === null || sg === void 0 ? void 0 : sg.type) === 'DAT') return false;
      var sgAtoms = sgroup.SGroup.getAtoms(struct, sg);
      return sgAtoms.length < atoms.length ? sgAtoms.findIndex(function (aid) {
        return atoms.indexOf(aid) === -1;
      }) >= 0 : atoms.findIndex(function (aid) {
        return sgAtoms.indexOf(aid) === -1;
      }) >= 0;
    },
    queryComponent: function queryComponent(sid) {
      var sg = struct.sgroups.get(sid);
      if ((sg === null || sg === void 0 ? void 0 : sg.type) !== 'queryComponent') return false;
      var sgAtoms = sgroup.SGroup.getAtoms(struct, sg);
      return atoms.some(function (aid) {
        return sgAtoms.includes(aid);
      });
    }
  };
  var sgroups = atoms.reduce(function (res, aid) {
    var atom = struct.atoms.get(aid);
    return atom ? res.union(atom.sgs) : res;
  }, new pile.Pile());
  return Array.from(sgroups).some(searchFunction[sGroupType]);
}

exports.SGroupForest = SGroupForest;
exports.checkOverlapping = checkOverlapping;
//# sourceMappingURL=sgroupForest.js.map
