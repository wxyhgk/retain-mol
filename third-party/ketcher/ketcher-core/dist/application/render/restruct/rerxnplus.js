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
var _getPrototypeOf = require('@babel/runtime/helpers/getPrototypeOf');
var _assertThisInitialized = require('@babel/runtime/helpers/assertThisInitialized');
var _inherits = require('@babel/runtime/helpers/inherits');
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var box2Abs = require('../../../domain/entities/box2Abs.js');
var generalEnumTypes = require('./generalEnumTypes.js');
var reobject = require('./reobject.js');
var scale = require('../../../domain/helpers/scale.js');
require('../../../domain/helpers/functionalGroupsProvider.js');
require('../../../domain/helpers/saltsAndSolventsProvider.js');
require('../../../domain/constants/generics.js');
require('../../../domain/helpers/attachmentPointCalculations.js');
var draw = require('../draw.js');
var util = require('../util.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _possibleConstructorReturn__default = /*#__PURE__*/_interopDefaultLegacy(_possibleConstructorReturn);
var _getPrototypeOf__default = /*#__PURE__*/_interopDefaultLegacy(_getPrototypeOf);
var _assertThisInitialized__default = /*#__PURE__*/_interopDefaultLegacy(_assertThisInitialized);
var _inherits__default = /*#__PURE__*/_interopDefaultLegacy(_inherits);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);

function _callSuper(t, o, e) { return o = _getPrototypeOf__default["default"](o), _possibleConstructorReturn__default["default"](t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf__default["default"](t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var ReRxnPlus = function (_ReObject) {
  _inherits__default["default"](ReRxnPlus, _ReObject);
  function ReRxnPlus(plus) {
    var _this;
    _classCallCheck__default["default"](this, ReRxnPlus);
    _this = _callSuper(this, ReRxnPlus, ['rxnPlus']);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "item", void 0);
    _this.item = plus;
    return _this;
  }
  _createClass__default["default"](ReRxnPlus, [{
    key: "hoverPath",
    value: function hoverPath(render) {
      var p = scale.Scale.modelToCanvas(this.item.pp, render.options);
      var s = render.options.microModeScale;
      return render.paper.rect(p.x - s / 4, p.y - s / 4, s / 2, s / 2, s / 8);
    }
  }, {
    key: "drawHover",
    value: function drawHover(render) {
      var ret = this.hoverPath(render).attr(render.options.hoverStyle);
      render.ctab.addReObjectPath(generalEnumTypes.LayerMap.hovering, this.visel, ret);
      return ret;
    }
  }, {
    key: "makeSelectionPlate",
    value: function makeSelectionPlate(restruct, _paper, styles) {
      return this.hoverPath(restruct.render).attr(styles.selectionStyle);
    }
  }, {
    key: "show",
    value: function show(restruct, _id, options) {
      var _path$node;
      var render = restruct.render;
      var centre = scale.Scale.modelToCanvas(this.item.pp, options);
      var path = draw["default"].plus(render.paper, centre, options);
      var offset = options.offset;
      if (offset != null) path.translateAbs(offset.x, offset.y);
      this.visel.add(path, box2Abs.Box2Abs.fromRelBox(util["default"].relBox(path.getBBox())));
      (_path$node = path.node) === null || _path$node === void 0 || _path$node.setAttribute('data-testid', 'rxn-plus');
    }
  }], [{
    key: "isSelectable",
    value: function isSelectable() {
      return true;
    }
  }]);
  return ReRxnPlus;
}(reobject["default"]);

exports["default"] = ReRxnPlus;
//# sourceMappingURL=rerxnplus.js.map
