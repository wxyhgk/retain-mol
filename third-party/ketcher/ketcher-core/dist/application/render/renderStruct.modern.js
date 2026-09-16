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
import _defineProperty from '@babel/runtime/helpers/defineProperty';
import _classCallCheck from '@babel/runtime/helpers/classCallCheck';
import _createClass from '@babel/runtime/helpers/createClass';
import { Vec2 } from '../../domain/entities/vec2.modern.js';
import { isEqual } from 'lodash';
import '../../utilities/runAsyncAction.modern.js';
import '../../utilities/KetcherLogger.modern.js';
import '../../utilities/SettingsManager.modern.js';
import '../../utilities/keynorm.modern.js';
import 'react-device-detect';
import '../../utilities/clipboardUtils.modern.js';
import { getOrThrow } from '../../utilities/getOrThrow.modern.js';
import { Render } from './raphaelRender.modern.js';
import { Coordinates } from '../editor/shared/coordinates.modern.js';

function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
var renderCache = new Map();
var previousOptions;
var MIN_ATTACHMENT_POINT_SIZE = 8;
var attachmentPointRegExp = /^R[1-8]$/;
var RenderStruct = function () {
  function RenderStruct() {
    _classCallCheck(this, RenderStruct);
  }
  _createClass(RenderStruct, null, [{
    key: "prepareStruct",
    value:
    function prepareStruct(struct) {
      if (struct.sgroups.size > 0) {
        var _newStruct$sgroups$ge;
        var newStruct = struct.clone();
        convertAllSGroupAttachmentPointsToRGroupAttachmentPoints(newStruct);
        if (!((_newStruct$sgroups$ge = newStruct.sgroups.get(0)) !== null && _newStruct$sgroups$ge !== void 0 && _newStruct$sgroups$ge.isSuperatomWithoutLabel)) {
          newStruct.sgroups["delete"](0);
        }
        return newStruct;
      }
      return struct;
    }
  }, {
    key: "removeSmallAttachmentPointLabelsInModal",
    value: function removeSmallAttachmentPointLabelsInModal(render) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      if (!options.labelInMonomerConnectionsModal) {
        return;
      }
      render.ctab.atoms.forEach(function (atom) {
        if (!atom.label) {
          return;
        }
        var isAttachmentPointAtom = attachmentPointRegExp.test(atom.label.text);
        if (!isAttachmentPointAtom) {
          return;
        }
        var isSmall = atom.label.path.node.getBoundingClientRect().width < MIN_ATTACHMENT_POINT_SIZE;
        if (isSmall) {
          atom.label.path.node.remove();
        }
      });
    }
  }, {
    key: "render",
    value: function render(wrapperElement, struct) {
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      if (wrapperElement && struct) {
        var _options$cachePrefix = options.cachePrefix,
          cachePrefix = _options$cachePrefix === void 0 ? '' : _options$cachePrefix,
          _options$needCache = options.needCache,
          needCache = _options$needCache === void 0 ? true : _options$needCache,
          wrapperDimensions = options.wrapperDimensions;
        var cacheKey = "".concat(cachePrefix).concat(struct.name);
        if (!isEqual(previousOptions, options)) {
          renderCache.clear();
          previousOptions = options;
        }
        if (renderCache.has(cacheKey) && needCache) {
          wrapperElement.innerHTML = renderCache.get(cacheKey);
          return;
        }
        var preparedStruct = this.prepareStruct(struct.clone());
        preparedStruct.initHalfBonds();
        preparedStruct.initNeighbors();
        preparedStruct.setImplicitHydrogen();
        preparedStruct.markFragments();
        var structureSize = preparedStruct.getCoordBoundingBox();
        var structureSizeInPixels = Coordinates.modelToCanvas(new Vec2(structureSize.max.x - structureSize.min.x, structureSize.max.y - structureSize.min.y));
        var wrapperElementBoundingRect = wrapperDimensions || {
          width: wrapperElement.getBoundingClientRect().width,
          height: wrapperElement.getBoundingClientRect().height
        };
        var isStructureLessThanWrapper = structureSizeInPixels.x < wrapperElementBoundingRect.width && structureSizeInPixels.y < wrapperElementBoundingRect.height;
        var structureRectangleSize = Math.max(structureSizeInPixels.x, structureSizeInPixels.y);
        var svgSize = isStructureLessThanWrapper ? Math.min(structureRectangleSize, wrapperElementBoundingRect.width, wrapperElementBoundingRect.height) : undefined;
        var extendedOptions = _objectSpread({
          autoScale: true
        }, options);
        if (window.isPolymerEditorTurnedOn) {
          extendedOptions.fontsz = 30;
          extendedOptions.fontszsub = 20;
          extendedOptions.width = svgSize;
          extendedOptions.height = svgSize;
        }
        var rnd = new Render(wrapperElement, extendedOptions);
        if (!window.isPolymerEditorTurnedOn) {
          preparedStruct.rescale();
        }
        rnd.setMolecule(preparedStruct);
        if (window.isPolymerEditorTurnedOn) {
          rnd.paper.canvas.style.overflow = 'visible';
        }
        this.removeSmallAttachmentPointLabelsInModal(rnd, options);
        if (needCache) {
          renderCache.set(cacheKey, rnd.clientArea.innerHTML);
        }
      }
    }
  }]);
  return RenderStruct;
}();
function convertAllSGroupAttachmentPointsToRGroupAttachmentPoints(struct) {
  struct.sgroups.forEach(function (sgroup) {
    if (sgroup.isSuperatomWithoutLabel) {
      return;
    }
    sgroup.getAttachmentPoints().forEach(function (attachmentPoint) {
      var attachmentPointAtom = getOrThrow(struct.atoms, attachmentPoint.atomId, "Atom with id ".concat(attachmentPoint.atomId, " not found in struct while converting sgroup attachment points"));
      attachmentPointAtom.setRGAttachmentPointForDisplayPurpose();
      var rgroupAttachmentPoint = attachmentPoint.convertToRGroupAttachmentPointForDisplayPurpose(attachmentPoint.atomId);
      struct.rgroupAttachmentPoints.add(rgroupAttachmentPoint);
    });
  });
}

export { RenderStruct };
//# sourceMappingURL=renderStruct.modern.js.map
