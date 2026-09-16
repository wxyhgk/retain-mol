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

var _toConsumableArray = require('@babel/runtime/helpers/toConsumableArray');
var _classCallCheck = require('@babel/runtime/helpers/classCallCheck');
var _createClass = require('@babel/runtime/helpers/createClass');
var _possibleConstructorReturn = require('@babel/runtime/helpers/possibleConstructorReturn');
var _getPrototypeOf = require('@babel/runtime/helpers/getPrototypeOf');
var _assertThisInitialized = require('@babel/runtime/helpers/assertThisInitialized');
var _inherits = require('@babel/runtime/helpers/inherits');
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var simpleObject = require('../../../domain/entities/simpleObject.js');
var vec2 = require('../../../domain/entities/vec2.js');
var BaseOperation = require('./BaseOperation.js');
var OperationType = require('./OperationType.js');
require('../../render/renderStruct.js');
require('../../render/raphaelRender.js');
require('../../render/restruct/reobject.js');
require('../../render/restruct/reatom.js');
require('../../render/restruct/rebond.js');
require('../../render/restruct/reenhancedFlag.js');
require('../../render/restruct/refrag.js');
require('../../render/restruct/rergroup.js');
require('../../render/restruct/rerxnarrow.js');
require('../../render/restruct/rerxnplus.js');
require('../../render/restruct/resgroup.js');
var resimpleObject = require('../../render/restruct/resimpleObject.js');
require('../../render/restruct/restruct.js');
require('../../render/restruct/retext.js');
require('../../render/restruct/visel.js');
require('../../render/restruct/generalEnumTypes.js');
require('../../render/restruct/showHydrogenLabels.js');
require('../../render/restruct/rergroupAttachmentPoint.js');
require('../../render/restruct/reImage.js');
require('../../render/restruct/remultitailArrow.js');
require('../../render/renderers/BaseRenderer.js');
require('../../render/renderers/BaseMonomerRenderer.js');
require('../../render/renderers/AtomRenderer.js');
require('../../render/renderers/ChemRenderer.js');
require('../../render/renderers/PeptideRenderer.js');
require('../../render/renderers/PhosphateRenderer.js');
require('../../render/renderers/SugarRenderer.js');
require('../../render/renderers/RNABaseRenderer.js');
require('../../render/renderers/UnresolvedMonomerRenderer.js');
require('../../render/renderers/UnsplitNucleotideRenderer.js');
require('../../render/renderers/AmbiguousMonomerRenderer.js');
require('../../render/renderers/SGroupRenderer.js');
require('../../render/renderers/RenderersManager.js');
var toFixed = require('../../../utilities/toFixed.js');
require('../../../utilities/runAsyncAction.js');
require('../../../utilities/KetcherLogger.js');
require('../../../utilities/SettingsManager.js');
require('../../../utilities/keynorm.js');
require('react-device-detect');
require('../../../utilities/clipboardUtils.js');
require('../../render/renderers/sequence/BaseSequenceItemRenderer.js');
require('../../../domain/entities/Chem.js');
require('../../render/renderers/StereoFlagRenderer.js');
require('../../render/renderers/sequence/SequenceRenderer.js');
require('../../render/renderers/sequence/BackBoneBondSequenceRenderer.js');
require('../../render/renderers/sequence/BaseSequenceRenderer.js');
require('../../render/renderers/sequence/ChemSequenceItemRenderer.js');
require('../../render/renderers/sequence/EmptySequenceItemRenderer.js');
require('../../render/renderers/sequence/NucleotideSequenceItemRenderer.js');
require('../../render/renderers/sequence/NucleosideSequenceItemRenderer.js');
require('../../render/renderers/sequence/PeptideSequenceItemRenderer.js');
require('../../render/renderers/sequence/PhosphateSequenceItemRenderer.js');
require('../../render/renderers/sequence/PolymerBondSequenceRenderer.js');
require('../../render/renderers/sequence/RNASequenceItemRenderer.js');
require('../../render/renderers/sequence/SequenceNodeRendererFactory.js');
require('../../render/renderers/sequence/UnresolvedMonomerSequenceItemRenderer.js');
require('../../render/renderers/sequence/UnsplitNucleotideSequenceItemRenderer.js');
var scale = require('../../../domain/helpers/scale.js');
require('../../../domain/helpers/functionalGroupsProvider.js');
require('../../../domain/helpers/saltsAndSolventsProvider.js');
require('../../../domain/constants/generics.js');
require('../../../domain/helpers/attachmentPointCalculations.js');
require('../../render/scrollbar/scrollbar-container.js');
require('../../render/notifyRenderComplete.js');
require('lodash');
require('../../render/renderers/constants.js');
require('../../render/render.types.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _toConsumableArray__default = /*#__PURE__*/_interopDefaultLegacy(_toConsumableArray);
var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _possibleConstructorReturn__default = /*#__PURE__*/_interopDefaultLegacy(_possibleConstructorReturn);
var _getPrototypeOf__default = /*#__PURE__*/_interopDefaultLegacy(_getPrototypeOf);
var _assertThisInitialized__default = /*#__PURE__*/_interopDefaultLegacy(_assertThisInitialized);
var _inherits__default = /*#__PURE__*/_interopDefaultLegacy(_inherits);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);

function _callSuper(t, o, e) { return o = _getPrototypeOf__default["default"](o), _possibleConstructorReturn__default["default"](t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf__default["default"](t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var SimpleObjectAdd = function (_Base) {
  _inherits__default["default"](SimpleObjectAdd, _Base);
  function SimpleObjectAdd() {
    var _this;
    var pos = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    var mode = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : simpleObject.SimpleObjectMode.line;
    var toCircle = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    var id = arguments.length > 3 ? arguments[3] : undefined;
    _classCallCheck__default["default"](this, SimpleObjectAdd);
    _this = _callSuper(this, SimpleObjectAdd, [OperationType.OperationType.SIMPLE_OBJECT_ADD]);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "data", void 0);
    _this.data = {
      pos: pos,
      mode: mode,
      toCircle: toCircle,
      id: id
    };
    return _this;
  }
  _createClass__default["default"](SimpleObjectAdd, [{
    key: "execute",
    value: function execute(restruct) {
      var struct = restruct.molecule;
      var item = new simpleObject.SimpleObject({
        mode: this.data.mode
      });
      var itemId;
      if (this.data.id == null) {
        itemId = struct.simpleObjects.add(item);
        this.data.id = itemId;
      } else {
        itemId = this.data.id;
        struct.simpleObjects.set(itemId, item);
      }
      restruct.simpleObjects.set(itemId, new resimpleObject["default"](item));
      var positions = _toConsumableArray__default["default"](this.data.pos);
      if (this.data.toCircle) {
        positions[1] = makeCircleFromEllipse(positions[0], positions[1]);
      }
      struct.simpleObjectSetPos(itemId, positions.map(function (p) {
        return new vec2.Vec2(p);
      }));
      BaseOperation.BaseOperation.invalidateItem(restruct, 'simpleObjects', itemId, 1);
    }
  }, {
    key: "invert",
    value: function invert() {
      if (this.data.id === undefined) {
        throw new Error('SimpleObjectAdd: cannot invert before execute');
      }
      return new SimpleObjectDelete(this.data.id);
    }
  }]);
  return SimpleObjectAdd;
}(BaseOperation.BaseOperation);
var SimpleObjectDelete = function (_Base2) {
  _inherits__default["default"](SimpleObjectDelete, _Base2);
  function SimpleObjectDelete(id) {
    var _this2;
    _classCallCheck__default["default"](this, SimpleObjectDelete);
    _this2 = _callSuper(this, SimpleObjectDelete, [OperationType.OperationType.SIMPLE_OBJECT_DELETE]);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this2), "data", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this2), "performed", void 0);
    _this2.data = {
      id: id,
      pos: [],
      mode: simpleObject.SimpleObjectMode.line,
      toCircle: false
    };
    _this2.performed = false;
    return _this2;
  }
  _createClass__default["default"](SimpleObjectDelete, [{
    key: "execute",
    value: function execute(restruct) {
      var struct = restruct.molecule;
      var item = struct.simpleObjects.get(this.data.id);
      this.data.pos = item.pos;
      this.data.mode = item.mode;
      this.data.toCircle = item.toCircle;
      this.performed = true;
      restruct.markItemRemoved();
      restruct.clearVisel(restruct.simpleObjects.get(this.data.id).visel);
      restruct.simpleObjects["delete"](this.data.id);
      struct.simpleObjects["delete"](this.data.id);
    }
  }, {
    key: "invert",
    value: function invert() {
      return new SimpleObjectAdd(this.data.pos, this.data.mode, this.data.toCircle, this.data.id);
    }
  }]);
  return SimpleObjectDelete;
}(BaseOperation.BaseOperation);
var SimpleObjectMove = function (_Base3) {
  _inherits__default["default"](SimpleObjectMove, _Base3);
  function SimpleObjectMove(id, d, noinvalidate) {
    var _this3;
    _classCallCheck__default["default"](this, SimpleObjectMove);
    _this3 = _callSuper(this, SimpleObjectMove, [OperationType.OperationType.SIMPLE_OBJECT_MOVE]);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this3), "data", void 0);
    _this3.data = {
      id: id,
      d: d,
      noinvalidate: noinvalidate
    };
    return _this3;
  }
  _createClass__default["default"](SimpleObjectMove, [{
    key: "execute",
    value: function execute(restruct) {
      var struct = restruct.molecule;
      var id = this.data.id;
      var d = this.data.d;
      var item = struct.simpleObjects.get(id);
      item.pos.forEach(function (p) {
        return p.add_(d);
      });
      restruct.simpleObjects.get(id).visel.translate(scale.Scale.modelToCanvas(d, restruct.render.options));
      this.data.d = d.negated();
      if (!this.data.noinvalidate) {
        BaseOperation.BaseOperation.invalidateItem(restruct, 'simpleObjects', id, 1);
      }
    }
  }, {
    key: "invert",
    value: function invert() {
      var move = new SimpleObjectMove(this.data.id, this.data.d, this.data.noinvalidate);
      move.data = this.data;
      return move;
    }
  }, {
    key: "isDummy",
    value: function isDummy() {
      var d = this.data.d;
      return d.x === 0 && d.y === 0;
    }
  }]);
  return SimpleObjectMove;
}(BaseOperation.BaseOperation);
function handleRectangleChangeWithAnchor(item, anchor, current) {
  var previousPos0 = item.pos[0].get_xy0();
  var previousPos1 = item.pos[1].get_xy0();
  if (toFixed.toFixed(anchor.x) === toFixed.toFixed(item.pos[1].x)) {
    item.pos[1].x = anchor.x = current.x;
    current.x = previousPos1.x;
  }
  if (toFixed.toFixed(anchor.y) === toFixed.toFixed(item.pos[1].y)) {
    item.pos[1].y = anchor.y = current.y;
    current.y = previousPos1.y;
  }
  if (toFixed.toFixed(anchor.x) === toFixed.toFixed(item.pos[0].x)) {
    item.pos[0].x = anchor.x = current.x;
    current.x = previousPos0.x;
  }
  if (toFixed.toFixed(anchor.y) === toFixed.toFixed(item.pos[0].y)) {
    item.pos[0].y = anchor.y = current.y;
    current.y = previousPos0.y;
  }
}
var SimpleObjectResize = function (_Base4) {
  _inherits__default["default"](SimpleObjectResize, _Base4);
  function SimpleObjectResize(id, d, current, anchor, noinvalidate, toCircle) {
    var _this4;
    _classCallCheck__default["default"](this, SimpleObjectResize);
    _this4 = _callSuper(this, SimpleObjectResize, [OperationType.OperationType.SIMPLE_OBJECT_RESIZE]);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this4), "data", void 0);
    _this4.data = {
      id: id,
      d: d,
      current: current,
      anchor: anchor,
      noinvalidate: noinvalidate,
      toCircle: toCircle
    };
    return _this4;
  }
  _createClass__default["default"](SimpleObjectResize, [{
    key: "execute",
    value: function execute(restruct) {
      var struct = restruct.molecule;
      var id = this.data.id;
      var d = this.data.d;
      var current = this.data.current;
      var item = struct.simpleObjects.get(id);
      var anchor = this.data.anchor;
      if (item.mode === simpleObject.SimpleObjectMode.ellipse) {
        if (anchor) {
          handleRectangleChangeWithAnchor(item, anchor, current);
        } else if (this.data.toCircle) {
          var previousPos1 = item.pos[1].get_xy0();
          var circlePoint = makeCircleFromEllipse(item.pos[0], current);
          item.pos[1].x = circlePoint.x;
          item.pos[1].y = circlePoint.y;
          this.data.current = previousPos1;
        } else {
          var _previousPos = item.pos[1].get_xy0();
          item.pos[1].x = current.x;
          item.pos[1].y = current.y;
          this.data.current = _previousPos;
        }
      } else if (item.mode === simpleObject.SimpleObjectMode.line && anchor) {
        var previousPos0 = item.pos[0].get_xy0();
        var _previousPos2 = item.pos[1].get_xy0();
        if (toFixed.toFixed(anchor.x) === toFixed.toFixed(item.pos[1].x) && toFixed.toFixed(anchor.y) === toFixed.toFixed(item.pos[1].y)) {
          item.pos[1].x = anchor.x = current.x;
          current.x = _previousPos2.x;
          item.pos[1].y = anchor.y = current.y;
          current.y = _previousPos2.y;
        }
        if (toFixed.toFixed(anchor.x) === toFixed.toFixed(item.pos[0].x) && toFixed.toFixed(anchor.y) === toFixed.toFixed(item.pos[0].y)) {
          item.pos[0].x = anchor.x = current.x;
          current.x = previousPos0.x;
          item.pos[0].y = anchor.y = current.y;
          current.y = previousPos0.y;
        }
      } else if (item.mode === simpleObject.SimpleObjectMode.rectangle && anchor) {
        handleRectangleChangeWithAnchor(item, anchor, current);
      } else item.pos[1].add_(d);
      restruct.simpleObjects.get(id).visel.translate(scale.Scale.modelToCanvas(d, restruct.render.options));
      this.data.d = d.negated();
      if (!this.data.noinvalidate) {
        BaseOperation.BaseOperation.invalidateItem(restruct, 'simpleObjects', id, 1);
      }
    }
  }, {
    key: "invert",
    value: function invert() {
      return new SimpleObjectResize(this.data.id, this.data.d, this.data.current, this.data.anchor, this.data.noinvalidate, this.data.toCircle);
    }
  }, {
    key: "isDummy",
    value: function isDummy() {
      var d = this.data.d;
      return d.x === 0 && d.y === 0;
    }
  }]);
  return SimpleObjectResize;
}(BaseOperation.BaseOperation);
function makeCircleFromEllipse(position0, position1) {
  var diff = vec2.Vec2.diff(position1, position0);
  var min = Math.abs(diff.x) < Math.abs(diff.y) ? diff.x : diff.y;
  return new vec2.Vec2(position0.x + (diff.x > 0 ? 1 : -1) * Math.abs(min), position0.y + (diff.y > 0 ? 1 : -1) * Math.abs(min), 0);
}

exports.SimpleObjectAdd = SimpleObjectAdd;
exports.SimpleObjectDelete = SimpleObjectDelete;
exports.SimpleObjectMove = SimpleObjectMove;
exports.SimpleObjectResize = SimpleObjectResize;
exports.makeCircleFromEllipse = makeCircleFromEllipse;
//# sourceMappingURL=simpleObject.js.map
