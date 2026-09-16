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
var svgPath = require('svgpath');
var draw = require('../../draw.js');
var editorSettings = require('../../../editor/editorSettings.js');
var toFixed = require('../../../../utilities/toFixed.js');
require('../../../../utilities/runAsyncAction.js');
require('../../../../utilities/KetcherLogger.js');
require('../../../../utilities/SettingsManager.js');
require('../../../../utilities/keynorm.js');
require('react-device-detect');
require('../../../../utilities/clipboardUtils.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var svgPath__default = /*#__PURE__*/_interopDefaultLegacy(svgPath);

var EquilibriumOpenAngleArrowRenderer = function () {
  function EquilibriumOpenAngleArrowRenderer() {
    _classCallCheck__default["default"](this, EquilibriumOpenAngleArrowRenderer);
  }
  _createClass__default["default"](EquilibriumOpenAngleArrowRenderer, null, [{
    key: "preparePaths",
    value: function preparePaths(start, arrowLength, arrowAngle) {
      var macroModeScale = editorSettings.provideEditorSettings().macroModeScale;
      var arrowHeadLength = draw.ARROW_HEAD_LENGHT * macroModeScale;
      var arrowHeadWidth = draw.ARROW_HEAD_WIDTH * macroModeScale;
      var arrowOffset = draw.ARROW_OFFSET * macroModeScale;
      var endX = start.x + arrowLength;
      var pathParts = [];
      pathParts.push("M".concat(toFixed.toFixed(start.x), ",").concat(toFixed.toFixed(start.y - arrowOffset)) + "L".concat(toFixed.toFixed(endX), ",").concat(toFixed.toFixed(start.y - arrowOffset)) + "L".concat(toFixed.toFixed(endX - arrowHeadLength), ",").concat(toFixed.toFixed(start.y - arrowHeadWidth - arrowOffset)));
      pathParts.push("M".concat(toFixed.toFixed(start.x), ",").concat(toFixed.toFixed(start.y + arrowOffset)) + "L".concat(toFixed.toFixed(endX), ",").concat(toFixed.toFixed(start.y + arrowOffset)) + "M".concat(toFixed.toFixed(start.x), ",").concat(toFixed.toFixed(start.y + arrowOffset)) + "L".concat(toFixed.toFixed(start.x + arrowHeadLength), ",").concat(toFixed.toFixed(start.y + arrowOffset + arrowHeadWidth)));
      var transformedPath = svgPath__default["default"](pathParts.join('')).rotate(arrowAngle, start.x, start.y).toString();
      return [{
        d: transformedPath,
        attrs: {}
      }];
    }
  }]);
  return EquilibriumOpenAngleArrowRenderer;
}();

exports.EquilibriumOpenAngleArrowRenderer = EquilibriumOpenAngleArrowRenderer;
//# sourceMappingURL=EquilibriumOpenAngleArrowRenderer.js.map
