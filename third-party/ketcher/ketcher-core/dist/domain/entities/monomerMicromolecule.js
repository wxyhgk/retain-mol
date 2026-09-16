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
var _possibleConstructorReturn = require('@babel/runtime/helpers/possibleConstructorReturn');
var _assertThisInitialized = require('@babel/runtime/helpers/assertThisInitialized');
var _get = require('@babel/runtime/helpers/get');
var _getPrototypeOf = require('@babel/runtime/helpers/getPrototypeOf');
var _inherits = require('@babel/runtime/helpers/inherits');
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var sgroup = require('./sgroup.js');
require('../../utilities/runAsyncAction.js');
require('../../utilities/KetcherLogger.js');
require('../../utilities/SettingsManager.js');
require('../../utilities/keynorm.js');
require('react-device-detect');
require('../../utilities/clipboardUtils.js');
var assert = require('../../utilities/assert.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _possibleConstructorReturn__default = /*#__PURE__*/_interopDefaultLegacy(_possibleConstructorReturn);
var _assertThisInitialized__default = /*#__PURE__*/_interopDefaultLegacy(_assertThisInitialized);
var _get__default = /*#__PURE__*/_interopDefaultLegacy(_get);
var _getPrototypeOf__default = /*#__PURE__*/_interopDefaultLegacy(_getPrototypeOf);
var _inherits__default = /*#__PURE__*/_interopDefaultLegacy(_inherits);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);

function _callSuper(t, o, e) { return o = _getPrototypeOf__default["default"](o), _possibleConstructorReturn__default["default"](t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf__default["default"](t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var MonomerMicromolecule = function (_SGroup) {
  _inherits__default["default"](MonomerMicromolecule, _SGroup);
  function MonomerMicromolecule(type, monomer) {
    var _this;
    _classCallCheck__default["default"](this, MonomerMicromolecule);
    _this = _callSuper(this, MonomerMicromolecule, [type]);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "monomer", void 0);
    _this.monomer = monomer;
    _this.data.absolute = false;
    _this.data.attached = false;
    _this.data.expanded = Boolean(monomer.monomerItem.expanded);
    return _this;
  }
  _createClass__default["default"](MonomerMicromolecule, [{
    key: "isMonomer",
    get: function get() {
      return true;
    }
  }, {
    key: "getContractedPosition",
    value: function getContractedPosition(struct) {
      assert.assert(this.pp);
      var sgroupContractedPosition = _get__default["default"](_getPrototypeOf__default["default"](MonomerMicromolecule.prototype), "getContractedPosition", this).call(this, struct);
      return {
        position: this.pp,
        atomId: sgroupContractedPosition.atomId
      };
    }
  }], [{
    key: "clone",
    value: function clone(monomerMicromolecule, atomIdMap) {
      var needCloneAttachmentPoints = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      var monomerMicromoleculeClone = new MonomerMicromolecule(monomerMicromolecule.type, monomerMicromolecule.monomer);
      monomerMicromoleculeClone.pp = monomerMicromolecule.pp;
      monomerMicromoleculeClone.atoms = atomIdMap ? monomerMicromolecule.atoms.map(function (elem) {
        var mappedAtomId = atomIdMap.get(elem);
        assert.assert(mappedAtomId !== undefined);
        return mappedAtomId;
      }) : monomerMicromolecule.atoms;
      monomerMicromoleculeClone.data.expanded = monomerMicromolecule.isExpanded();
      monomerMicromoleculeClone.data.name = monomerMicromolecule.data.name;
      if (needCloneAttachmentPoints && atomIdMap) {
        monomerMicromoleculeClone.addAttachmentPoints(monomerMicromolecule.cloneAttachmentPoints(atomIdMap), false);
      }
      return monomerMicromoleculeClone;
    }
  }]);
  return MonomerMicromolecule;
}(sgroup.SGroup);

exports.MonomerMicromolecule = MonomerMicromolecule;
//# sourceMappingURL=monomerMicromolecule.js.map
