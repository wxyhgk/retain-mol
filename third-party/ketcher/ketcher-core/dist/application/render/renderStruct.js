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
var vec2 = require('../../domain/entities/vec2.js');
var _ = require('lodash');
require('../../utilities/runAsyncAction.js');
require('../../utilities/KetcherLogger.js');
require('../../utilities/SettingsManager.js');
require('../../utilities/keynorm.js');
require('react-device-detect');
require('../../utilities/clipboardUtils.js');
var getOrThrow = require('../../utilities/getOrThrow.js');
var raphaelRender = require('./raphaelRender.js');
var coordinates = require('../editor/shared/coordinates.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);
var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);

function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty__default["default"](e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
var renderCache = new Map();
var previousOptions;
var MIN_ATTACHMENT_POINT_SIZE = 8;
var attachmentPointRegExp = /^R[1-8]$/;
var RenderStruct = function () {
  function RenderStruct() {
    _classCallCheck__default["default"](this, RenderStruct);
  }
  _createClass__default["default"](RenderStruct, null, [{
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
        if (!_.isEqual(previousOptions, options)) {
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
        var structureSizeInPixels = coordinates.Coordinates.modelToCanvas(new vec2.Vec2(structureSize.max.x - structureSize.min.x, structureSize.max.y - structureSize.min.y));
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
        var rnd = new raphaelRender.Render(wrapperElement, extendedOptions);
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
      var attachmentPointAtom = getOrThrow.getOrThrow(struct.atoms, attachmentPoint.atomId, "Atom with id ".concat(attachmentPoint.atomId, " not found in struct while converting sgroup attachment points"));
      attachmentPointAtom.setRGAttachmentPointForDisplayPurpose();
      var rgroupAttachmentPoint = attachmentPoint.convertToRGroupAttachmentPointForDisplayPurpose(attachmentPoint.atomId);
      struct.rgroupAttachmentPoints.add(rgroupAttachmentPoint);
    });
  });
}

exports.RenderStruct = RenderStruct;
//# sourceMappingURL=renderStruct.js.map
