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
var vec2 = require('../../domain/entities/vec2.js');
var utils = require('../editor/shared/utils.js');
var showHydrogenLabels = require('./restruct/showHydrogenLabels.js');
var constants = require('./renderers/constants.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);

function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty__default["default"](e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function defaultOptions(renderOptions) {
  var options = getOptionsWithConvertedUnits(renderOptions);
  var scaleFactorMicro = options.microModeScale || 100;
  var scaleFactorMacro = options.macroModeScale || 200;
  if (options.rotationStep) {
    utils["default"].setFracAngle(options.rotationStep);
  }
  var labelFontSize = Math.ceil(1.9 * (scaleFactorMicro / 6));
  var subFontSize = Math.ceil(0.5 * labelFontSize);
  var defaultOptions = {
    'dearomatize-on-load': false,
    ignoreChiralFlag: false,
    disableQueryElements: null,
    showAtomIds: false,
    showBondIds: false,
    showHalfBondIds: false,
    showLoopIds: false,
    showValenceWarnings: true,
    autoScale: false,
    autoScaleMargin: 0,
    maxBondLength: 0,
    atomColoring: true,
    hideImplicitHydrogen: false,
    hideTerminalLabels: false,
    carbonExplicitly: false,
    showCharge: true,
    showHydrogenLabels: showHydrogenLabels.ShowHydrogenLabels.TerminalAndHetero,
    showValence: true,
    aromaticCircle: true,
    microModeScale: scaleFactorMicro,
    macroModeScale: scaleFactorMacro,
    zoom: 1.0,
    offset: new vec2.Vec2(),
    lineWidth: scaleFactorMicro / 20,
    bondSpace: options.bondSpacingInPx || scaleFactorMicro / 7,
    stereoBond: options.stereoBondWidthInPx || scaleFactorMicro / 7,
    subFontSize: options.fontszsubInPx || subFontSize,
    font: '30px Arial',
    fontszInPx: options.fontszInPx || labelFontSize,
    fontszsubInPx: options.fontszsubInPx || subFontSize,
    fontRLabel: (options.fontszInPx || labelFontSize) * 1.2,
    fontRLogic: (options.fontszInPx || labelFontSize) * 0.7,
    radiusScaleFactor: 0.38,
    lineattr: {
      stroke: '#000',
      'stroke-width': options.bondThicknessInPx || scaleFactorMicro / 20,
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round'
    },
    arrowSnappingStyle: {
      fill: '#365CFF',
      stroke: '#365CFF'
    },
    bondSnappingStyle: {
      fill: '#365CFF',
      stroke: '#365CFF',
      'stroke-width': options.bondThicknessInPx * 1.5
    },
    selectionStyle: {
      fill: constants.SELECTION_COLOR,
      stroke: constants.SELECTION_COLOR
    },
    hoverStyle: {
      stroke: '#0097A8',
      fill: constants.SELECTION_HOVERED_COLOR,
      'stroke-width': 0.6 * scaleFactorMicro / 20
    },
    innerHoverStyle: {
      stroke: constants.SELECTION_HOVERED_COLOR,
      fill: 'none',
      'stroke-width': 4.6 * scaleFactorMicro / 20
    },
    sgroupBracketStyle: {
      stroke: 'darkgray',
      'stroke-width': 0.5 * scaleFactorMicro / 20
    },
    lassoStyle: {
      stroke: 'gray',
      'stroke-width': '1px'
    },
    selectionStyleSimpleObject: {
      stroke: constants.SELECTION_COLOR,
      'stroke-width': scaleFactorMicro / 4,
      'stroke-linecap': 'round'
    },
    movingStyle: {
      cursor: 'all-scroll'
    },
    atomSelectionPlateRadius: options.fontszInPx || labelFontSize,
    contractedFunctionalGroupSize: 50,
    previewOpacity: 0.5,
    viewOnlyMode: false
  };
  return _objectSpread(_objectSpread({}, defaultOptions || {}), options || {});
}
var measureMap = {
  px: 1,
  cm: 37.795278,
  pt: 1.333333,
  inch: 96
};
function convertValue(value, measureFrom, measureTo) {
  var convertedValue = measureTo === 'px' || measureTo === 'pt' ? (value * measureMap[measureFrom] / measureMap[measureTo]).toFixed() : (value * measureMap[measureFrom] / measureMap[measureTo]).toFixed(3);
  return Number(convertedValue);
}
function convertHashSpacingToPx(value, measureFrom) {
  var convertedValue = value * measureMap[measureFrom] / measureMap.px;
  return Number(convertedValue.toFixed(1));
}
function getOptionsWithConvertedUnits(options) {
  var convertedOptions = {};
  var defaultUnit = 'px';
  if (typeof options.fontsz !== 'undefined') {
    convertedOptions.fontszInPx = convertValue(options.fontsz, options.fontszUnit || defaultUnit, defaultUnit);
  }
  if (typeof options.fontszsub !== 'undefined') {
    convertedOptions.fontszsubInPx = convertValue(options.fontszsub, options.fontszsubUnit || defaultUnit, defaultUnit);
  }
  if (typeof options.bondSpacing !== 'undefined' && typeof options.bondLength !== 'undefined') {
    var convertedBondLength = convertValue(options.bondLength, options.bondLengthUnit || defaultUnit, defaultUnit);
    convertedOptions.bondSpacingInPx = options.bondSpacing / 100 * convertedBondLength;
  }
  if (typeof options.bondThickness !== 'undefined') {
    convertedOptions.bondThicknessInPx = convertValue(options.bondThickness, options.bondThicknessUnit || defaultUnit, defaultUnit);
  }
  if (typeof options.stereoBondWidth !== 'undefined') {
    convertedOptions.stereoBondWidthInPx = convertValue(options.stereoBondWidth, options.stereoBondWidthUnit || defaultUnit, defaultUnit);
  }
  if (typeof options.bondLength !== 'undefined' && typeof options.bondLengthUnit !== 'undefined') {
    convertedOptions.microModeScale = convertValue(options.bondLength, options.bondLengthUnit || defaultUnit, defaultUnit);
  }
  if (typeof options.hashSpacing !== 'undefined') {
    convertedOptions.hashSpacingInPx = convertHashSpacingToPx(options.hashSpacing, options.hashSpacingUnit || defaultUnit);
  }
  return _objectSpread(_objectSpread({}, options), convertedOptions);
}

exports["default"] = defaultOptions;
exports.getOptionsWithConvertedUnits = getOptionsWithConvertedUnits;
//# sourceMappingURL=options.js.map
