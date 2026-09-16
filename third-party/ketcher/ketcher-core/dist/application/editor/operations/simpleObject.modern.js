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
import _possibleConstructorReturn from '@babel/runtime/helpers/possibleConstructorReturn';
import _getPrototypeOf from '@babel/runtime/helpers/getPrototypeOf';
import _assertThisInitialized from '@babel/runtime/helpers/assertThisInitialized';
import _inherits from '@babel/runtime/helpers/inherits';
import _defineProperty from '@babel/runtime/helpers/defineProperty';
import { SimpleObjectMode, SimpleObject } from '../../../domain/entities/simpleObject.modern.js';
import { Vec2 } from '../../../domain/entities/vec2.modern.js';
import { BaseOperation } from './BaseOperation.modern.js';
import { OperationType } from './OperationType.modern.js';
import '../../render/renderStruct.modern.js';
import '../../render/raphaelRender.modern.js';
import '../../render/restruct/reobject.modern.js';
import '../../render/restruct/reatom.modern.js';
import '../../render/restruct/rebond.modern.js';
import '../../render/restruct/reenhancedFlag.modern.js';
import '../../render/restruct/refrag.modern.js';
import '../../render/restruct/rergroup.modern.js';
import '../../render/restruct/rerxnarrow.modern.js';
import '../../render/restruct/rerxnplus.modern.js';
import '../../render/restruct/resgroup.modern.js';
import ReSimpleObject from '../../render/restruct/resimpleObject.modern.js';
import '../../render/restruct/restruct.modern.js';
import '../../render/restruct/retext.modern.js';
import '../../render/restruct/visel.modern.js';
import '../../render/restruct/generalEnumTypes.modern.js';
import '../../render/restruct/showHydrogenLabels.modern.js';
import '../../render/restruct/rergroupAttachmentPoint.modern.js';
import '../../render/restruct/reImage.modern.js';
import '../../render/restruct/remultitailArrow.modern.js';
import '../../render/renderers/BaseRenderer.modern.js';
import '../../render/renderers/BaseMonomerRenderer.modern.js';
import '../../render/renderers/AtomRenderer.modern.js';
import '../../render/renderers/ChemRenderer.modern.js';
import '../../render/renderers/PeptideRenderer.modern.js';
import '../../render/renderers/PhosphateRenderer.modern.js';
import '../../render/renderers/SugarRenderer.modern.js';
import '../../render/renderers/RNABaseRenderer.modern.js';
import '../../render/renderers/UnresolvedMonomerRenderer.modern.js';
import '../../render/renderers/UnsplitNucleotideRenderer.modern.js';
import '../../render/renderers/AmbiguousMonomerRenderer.modern.js';
import '../../render/renderers/SGroupRenderer.modern.js';
import '../../render/renderers/RenderersManager.modern.js';
import { toFixed } from '../../../utilities/toFixed.modern.js';
import '../../../utilities/runAsyncAction.modern.js';
import '../../../utilities/KetcherLogger.modern.js';
import '../../../utilities/SettingsManager.modern.js';
import '../../../utilities/keynorm.modern.js';
import 'react-device-detect';
import '../../../utilities/clipboardUtils.modern.js';
import '../../render/renderers/sequence/BaseSequenceItemRenderer.modern.js';
import '../../../domain/entities/Chem.modern.js';
import '../../render/renderers/StereoFlagRenderer.modern.js';
import '../../render/renderers/sequence/SequenceRenderer.modern.js';
import '../../render/renderers/sequence/BackBoneBondSequenceRenderer.modern.js';
import '../../render/renderers/sequence/BaseSequenceRenderer.modern.js';
import '../../render/renderers/sequence/ChemSequenceItemRenderer.modern.js';
import '../../render/renderers/sequence/EmptySequenceItemRenderer.modern.js';
import '../../render/renderers/sequence/NucleotideSequenceItemRenderer.modern.js';
import '../../render/renderers/sequence/NucleosideSequenceItemRenderer.modern.js';
import '../../render/renderers/sequence/PeptideSequenceItemRenderer.modern.js';
import '../../render/renderers/sequence/PhosphateSequenceItemRenderer.modern.js';
import '../../render/renderers/sequence/PolymerBondSequenceRenderer.modern.js';
import '../../render/renderers/sequence/RNASequenceItemRenderer.modern.js';
import '../../render/renderers/sequence/SequenceNodeRendererFactory.modern.js';
import '../../render/renderers/sequence/UnresolvedMonomerSequenceItemRenderer.modern.js';
import '../../render/renderers/sequence/UnsplitNucleotideSequenceItemRenderer.modern.js';
import { Scale } from '../../../domain/helpers/scale.modern.js';
import '../../../domain/helpers/functionalGroupsProvider.modern.js';
import '../../../domain/helpers/saltsAndSolventsProvider.modern.js';
import '../../../domain/constants/generics.modern.js';
import '../../../domain/helpers/attachmentPointCalculations.modern.js';
import '../../render/scrollbar/scrollbar-container.modern.js';
import '../../render/notifyRenderComplete.modern.js';
import 'lodash';
import '../../render/renderers/constants.modern.js';
import '../../render/render.types.modern.js';

function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var SimpleObjectAdd = function (_Base) {
  _inherits(SimpleObjectAdd, _Base);
  function SimpleObjectAdd() {
    var _this;
    var pos = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    var mode = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : SimpleObjectMode.line;
    var toCircle = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    var id = arguments.length > 3 ? arguments[3] : undefined;
    _classCallCheck(this, SimpleObjectAdd);
    _this = _callSuper(this, SimpleObjectAdd, [OperationType.SIMPLE_OBJECT_ADD]);
    _defineProperty(_assertThisInitialized(_this), "data", void 0);
    _this.data = {
      pos: pos,
      mode: mode,
      toCircle: toCircle,
      id: id
    };
    return _this;
  }
  _createClass(SimpleObjectAdd, [{
    key: "execute",
    value: function execute(restruct) {
      var struct = restruct.molecule;
      var item = new SimpleObject({
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
      restruct.simpleObjects.set(itemId, new ReSimpleObject(item));
      var positions = _toConsumableArray(this.data.pos);
      if (this.data.toCircle) {
        positions[1] = makeCircleFromEllipse(positions[0], positions[1]);
      }
      struct.simpleObjectSetPos(itemId, positions.map(function (p) {
        return new Vec2(p);
      }));
      BaseOperation.invalidateItem(restruct, 'simpleObjects', itemId, 1);
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
}(BaseOperation);
var SimpleObjectDelete = function (_Base2) {
  _inherits(SimpleObjectDelete, _Base2);
  function SimpleObjectDelete(id) {
    var _this2;
    _classCallCheck(this, SimpleObjectDelete);
    _this2 = _callSuper(this, SimpleObjectDelete, [OperationType.SIMPLE_OBJECT_DELETE]);
    _defineProperty(_assertThisInitialized(_this2), "data", void 0);
    _defineProperty(_assertThisInitialized(_this2), "performed", void 0);
    _this2.data = {
      id: id,
      pos: [],
      mode: SimpleObjectMode.line,
      toCircle: false
    };
    _this2.performed = false;
    return _this2;
  }
  _createClass(SimpleObjectDelete, [{
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
}(BaseOperation);
var SimpleObjectMove = function (_Base3) {
  _inherits(SimpleObjectMove, _Base3);
  function SimpleObjectMove(id, d, noinvalidate) {
    var _this3;
    _classCallCheck(this, SimpleObjectMove);
    _this3 = _callSuper(this, SimpleObjectMove, [OperationType.SIMPLE_OBJECT_MOVE]);
    _defineProperty(_assertThisInitialized(_this3), "data", void 0);
    _this3.data = {
      id: id,
      d: d,
      noinvalidate: noinvalidate
    };
    return _this3;
  }
  _createClass(SimpleObjectMove, [{
    key: "execute",
    value: function execute(restruct) {
      var struct = restruct.molecule;
      var id = this.data.id;
      var d = this.data.d;
      var item = struct.simpleObjects.get(id);
      item.pos.forEach(function (p) {
        return p.add_(d);
      });
      restruct.simpleObjects.get(id).visel.translate(Scale.modelToCanvas(d, restruct.render.options));
      this.data.d = d.negated();
      if (!this.data.noinvalidate) {
        BaseOperation.invalidateItem(restruct, 'simpleObjects', id, 1);
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
}(BaseOperation);
function handleRectangleChangeWithAnchor(item, anchor, current) {
  var previousPos0 = item.pos[0].get_xy0();
  var previousPos1 = item.pos[1].get_xy0();
  if (toFixed(anchor.x) === toFixed(item.pos[1].x)) {
    item.pos[1].x = anchor.x = current.x;
    current.x = previousPos1.x;
  }
  if (toFixed(anchor.y) === toFixed(item.pos[1].y)) {
    item.pos[1].y = anchor.y = current.y;
    current.y = previousPos1.y;
  }
  if (toFixed(anchor.x) === toFixed(item.pos[0].x)) {
    item.pos[0].x = anchor.x = current.x;
    current.x = previousPos0.x;
  }
  if (toFixed(anchor.y) === toFixed(item.pos[0].y)) {
    item.pos[0].y = anchor.y = current.y;
    current.y = previousPos0.y;
  }
}
var SimpleObjectResize = function (_Base4) {
  _inherits(SimpleObjectResize, _Base4);
  function SimpleObjectResize(id, d, current, anchor, noinvalidate, toCircle) {
    var _this4;
    _classCallCheck(this, SimpleObjectResize);
    _this4 = _callSuper(this, SimpleObjectResize, [OperationType.SIMPLE_OBJECT_RESIZE]);
    _defineProperty(_assertThisInitialized(_this4), "data", void 0);
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
  _createClass(SimpleObjectResize, [{
    key: "execute",
    value: function execute(restruct) {
      var struct = restruct.molecule;
      var id = this.data.id;
      var d = this.data.d;
      var current = this.data.current;
      var item = struct.simpleObjects.get(id);
      var anchor = this.data.anchor;
      if (item.mode === SimpleObjectMode.ellipse) {
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
      } else if (item.mode === SimpleObjectMode.line && anchor) {
        var previousPos0 = item.pos[0].get_xy0();
        var _previousPos2 = item.pos[1].get_xy0();
        if (toFixed(anchor.x) === toFixed(item.pos[1].x) && toFixed(anchor.y) === toFixed(item.pos[1].y)) {
          item.pos[1].x = anchor.x = current.x;
          current.x = _previousPos2.x;
          item.pos[1].y = anchor.y = current.y;
          current.y = _previousPos2.y;
        }
        if (toFixed(anchor.x) === toFixed(item.pos[0].x) && toFixed(anchor.y) === toFixed(item.pos[0].y)) {
          item.pos[0].x = anchor.x = current.x;
          current.x = previousPos0.x;
          item.pos[0].y = anchor.y = current.y;
          current.y = previousPos0.y;
        }
      } else if (item.mode === SimpleObjectMode.rectangle && anchor) {
        handleRectangleChangeWithAnchor(item, anchor, current);
      } else item.pos[1].add_(d);
      restruct.simpleObjects.get(id).visel.translate(Scale.modelToCanvas(d, restruct.render.options));
      this.data.d = d.negated();
      if (!this.data.noinvalidate) {
        BaseOperation.invalidateItem(restruct, 'simpleObjects', id, 1);
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
}(BaseOperation);
function makeCircleFromEllipse(position0, position1) {
  var diff = Vec2.diff(position1, position0);
  var min = Math.abs(diff.x) < Math.abs(diff.y) ? diff.x : diff.y;
  return new Vec2(position0.x + (diff.x > 0 ? 1 : -1) * Math.abs(min), position0.y + (diff.y > 0 ? 1 : -1) * Math.abs(min), 0);
}

export { SimpleObjectAdd, SimpleObjectDelete, SimpleObjectMove, SimpleObjectResize, makeCircleFromEllipse };
//# sourceMappingURL=simpleObject.modern.js.map
