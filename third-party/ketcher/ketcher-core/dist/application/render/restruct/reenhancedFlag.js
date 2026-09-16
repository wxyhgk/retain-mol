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

var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var _classCallCheck = require('@babel/runtime/helpers/classCallCheck');
var _createClass = require('@babel/runtime/helpers/createClass');
var _possibleConstructorReturn = require('@babel/runtime/helpers/possibleConstructorReturn');
var _getPrototypeOf = require('@babel/runtime/helpers/getPrototypeOf');
var _assertThisInitialized = require('@babel/runtime/helpers/assertThisInitialized');
var _inherits = require('@babel/runtime/helpers/inherits');
var _classPrivateFieldSet = require('@babel/runtime/helpers/classPrivateFieldSet');
var _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet');
var box2Abs = require('../../../domain/entities/box2Abs.js');
var fragment = require('../../../domain/entities/fragment.js');
var generalEnumTypes = require('./generalEnumTypes.js');
var reobject = require('./reobject.js');
var scale = require('../../../domain/helpers/scale.js');
require('../../../domain/helpers/functionalGroupsProvider.js');
require('../../../domain/helpers/saltsAndSolventsProvider.js');
require('../../../domain/constants/generics.js');
require('../../../domain/helpers/attachmentPointCalculations.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);
var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _possibleConstructorReturn__default = /*#__PURE__*/_interopDefaultLegacy(_possibleConstructorReturn);
var _getPrototypeOf__default = /*#__PURE__*/_interopDefaultLegacy(_getPrototypeOf);
var _assertThisInitialized__default = /*#__PURE__*/_interopDefaultLegacy(_assertThisInitialized);
var _inherits__default = /*#__PURE__*/_interopDefaultLegacy(_inherits);
var _classPrivateFieldSet__default = /*#__PURE__*/_interopDefaultLegacy(_classPrivateFieldSet);
var _classPrivateFieldGet__default = /*#__PURE__*/_interopDefaultLegacy(_classPrivateFieldGet);

function _callSuper(t, o, e) { return o = _getPrototypeOf__default["default"](o), _possibleConstructorReturn__default["default"](t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf__default["default"](t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
function _classPrivateFieldInitSpec(e, t, a) { _checkPrivateRedeclaration(e, t), t.set(e, a); }
function _checkPrivateRedeclaration(e, t) { if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object"); }
var _path = new WeakMap();
var ReEnhancedFlag = function (_ReObject) {
  _inherits__default["default"](ReEnhancedFlag, _ReObject);
  function ReEnhancedFlag() {
    var _this;
    _classCallCheck__default["default"](this, ReEnhancedFlag);
    _this = _callSuper(this, ReEnhancedFlag, ['enhancedFlag']);
    _classPrivateFieldInitSpec(_assertThisInitialized__default["default"](_this), _path, {
      writable: true,
      value: void 0
    });
    return _this;
  }
  _createClass__default["default"](ReEnhancedFlag, [{
    key: "hoverPath",
    value: function hoverPath(render) {
      var box = box2Abs.Box2Abs.fromRelBox(_classPrivateFieldGet__default["default"](this, _path).getBBox());
      var sz = box.p1.sub(box.p0);
      var p0 = box.p0.sub(render.options.offset);
      return render.paper.rect(p0.x, p0.y, sz.x, sz.y);
    }
  }, {
    key: "drawHover",
    value: function drawHover(render) {
      var _classPrivateFieldGet2;
      if (!((_classPrivateFieldGet2 = _classPrivateFieldGet__default["default"](this, _path)) !== null && _classPrivateFieldGet2 !== void 0 && _classPrivateFieldGet2.attrs)) return null;
      var ret = this.hoverPath(render).attr(render.options.hoverStyle);
      render.ctab.addReObjectPath(generalEnumTypes.LayerMap.hovering, this.visel, ret);
      return ret;
    }
  }, {
    key: "makeSelectionPlate",
    value: function makeSelectionPlate(restruct, _paper, options) {
      var _classPrivateFieldGet3;
      if (!((_classPrivateFieldGet3 = _classPrivateFieldGet__default["default"](this, _path)) !== null && _classPrivateFieldGet3 !== void 0 && _classPrivateFieldGet3.attrs)) return null;
      return this.hoverPath(restruct.render).attr(options.selectionStyle);
    }
  }, {
    key: "show",
    value: function show(restruct, fragmentId, options) {
      var render = restruct.render;
      var fragment$1 = restruct.molecule.frags.get(fragmentId);
      if (!(fragment$1 !== null && fragment$1 !== void 0 && fragment$1.enhancedStereoFlag)) {
        return;
      }
      var position = fragment$1.stereoFlagPosition || fragment.Fragment.getDefaultStereoFlagPosition(restruct.molecule, fragmentId);
      if (!position) {
        return;
      }
      var paper = render.paper;
      var ps = scale.Scale.modelToCanvas(position, options);
      var stereoFlagMap = _defineProperty__default["default"](_defineProperty__default["default"](_defineProperty__default["default"](_defineProperty__default["default"]({}, fragment.StereoFlag.Abs, options.absFlagLabel), fragment.StereoFlag.And, options.andFlagLabel), fragment.StereoFlag.Mixed, options.mixedFlagLabel), fragment.StereoFlag.Or, options.orFlagLabel);
      if (options.showStereoFlags && !options.ignoreChiralFlag) {
        _classPrivateFieldSet__default["default"](this, _path, paper.text(ps.x, ps.y, fragment$1.enhancedStereoFlag ? stereoFlagMap[fragment$1.enhancedStereoFlag] : '').attr({
          font: options.font,
          'font-size': options.fontszInPx,
          fill: '#000'
        }));
      }
      render.ctab.addReObjectPath(generalEnumTypes.LayerMap.data, this.visel, _classPrivateFieldGet__default["default"](this, _path), null, true);
    }
  }], [{
    key: "isSelectable",
    value: function isSelectable() {
      return true;
    }
  }]);
  return ReEnhancedFlag;
}(reobject["default"]);

exports["default"] = ReEnhancedFlag;
//# sourceMappingURL=reenhancedFlag.js.map
