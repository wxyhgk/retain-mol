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

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);

function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty__default["default"](e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
var DEFAULT_SETTINGS = {
  resetToSelect: 'paste',
  rotationStep: 15,
  showValenceWarnings: true,
  atomColoring: true,
  font: '30px Arial',
  fontsz: 13,
  fontszUnit: 'px',
  fontszsub: 13,
  fontszsubUnit: 'px',
  showStereoFlags: true,
  stereoLabelStyle: 'IUPAC',
  colorOfAbsoluteCenters: '#ff0000',
  colorOfAndCenters: '#0000cd',
  colorOfOrCenters: '#228b22',
  colorStereogenicCenters: 'LabelsOnly',
  autoFadeOfStereoLabels: true,
  absFlagLabel: 'ABS',
  andFlagLabel: 'AND Enantiomer',
  orFlagLabel: 'OR Enantiomer',
  mixedFlagLabel: 'Mixed',
  ignoreChiralFlag: false,
  carbonExplicitly: false,
  showCharge: true,
  showValence: true,
  showHydrogenLabels: 'Terminal and Hetero',
  aromaticCircle: true,
  bondSpacing: 15,
  bondLength: 40,
  bondLengthUnit: 'px',
  bondThickness: 2,
  bondThicknessUnit: 'px',
  stereoBondWidth: 6,
  stereoBondWidthUnit: 'px',
  hashSpacing: 1.2,
  hashSpacingUnit: 'px',
  imageResolution: 72,
  reactionComponentMarginSize: 20,
  reactionComponentMarginSizeUnit: 'px',
  'smart-layout': true,
  'ignore-stereochemistry-errors': true,
  'mass-skip-error-on-pseudoatoms': false,
  'gross-formula-add-rsites': true,
  'aromatize-skip-superatoms': true,
  'dearomatize-on-load': false,
  'gross-formula-add-isotopes': true,
  'valence-mode': 'default',
  showAtomIds: false,
  showBondIds: false,
  showHalfBondIds: false,
  showLoopIds: false,
  miewMode: 'LN',
  miewTheme: 'light',
  miewAtomLabel: 'bright',
  selectionTool: 'lasso',
  editorLineLength: {
    'sequence-layout-mode': 30,
    'snake-layout-mode': 0
  },
  disableCustomQuery: false,
  monomerLibraryUpdates: [],
  colorPickerCustomColors: []
};
function getDefaultSettings() {
  return _objectSpread({}, DEFAULT_SETTINGS);
}
var PRESETS = {
  acs: {
    atomColoring: false,
    font: '30px Arial',
    fontsz: 10,
    fontszUnit: 'pt',
    fontszsub: 10,
    fontszsubUnit: 'pt',
    bondLength: 14.4,
    bondLengthUnit: 'pt',
    bondSpacing: 18,
    bondThickness: 0.6,
    bondThicknessUnit: 'pt',
    stereoBondWidth: 2,
    stereoBondWidthUnit: 'pt',
    hashSpacing: 2.5,
    hashSpacingUnit: 'pt',
    reactionComponentMarginSize: 1.6,
    reactionComponentMarginSizeUnit: 'pt',
    imageResolution: 600
  }
};
var SCHEMA = {
  title: 'Settings',
  type: 'object',
  properties: {
    resetToSelect: {
      "enum": [true, 'paste', false]
    },
    rotationStep: {
      type: 'integer',
      minimum: 1,
      maximum: 90
    },
    showValenceWarnings: {
      type: 'boolean'
    },
    atomColoring: {
      type: 'boolean'
    },
    font: {
      type: 'string'
    },
    fontsz: {
      type: 'number',
      minimum: 0.1,
      maximum: 96
    },
    fontszUnit: {
      "enum": ['px', 'pt', 'cm', 'inch']
    },
    fontszsub: {
      type: 'number',
      minimum: 0.1,
      maximum: 96
    },
    fontszsubUnit: {
      "enum": ['px', 'pt', 'cm', 'inch']
    },
    showStereoFlags: {
      type: 'boolean'
    },
    stereoLabelStyle: {
      "enum": ['IUPAC', 'classic', 'On-Atoms', 'off']
    },
    colorOfAbsoluteCenters: {
      type: 'string'
    },
    colorOfAndCenters: {
      type: 'string'
    },
    colorOfOrCenters: {
      type: 'string'
    },
    colorStereogenicCenters: {
      "enum": ['LabelsOnly', 'BondsOnly', 'LabelsAndBonds', 'Off']
    },
    autoFadeOfStereoLabels: {
      type: 'boolean'
    },
    absFlagLabel: {
      type: 'string'
    },
    andFlagLabel: {
      type: 'string'
    },
    orFlagLabel: {
      type: 'string'
    },
    mixedFlagLabel: {
      type: 'string'
    },
    ignoreChiralFlag: {
      type: 'boolean'
    },
    carbonExplicitly: {
      type: 'boolean'
    },
    showCharge: {
      type: 'boolean'
    },
    showValence: {
      type: 'boolean'
    },
    showHydrogenLabels: {
      "enum": ['off', 'Hetero', 'Terminal', 'Terminal and Hetero', 'On']
    },
    aromaticCircle: {
      type: 'boolean'
    },
    bondSpacing: {
      type: 'integer',
      minimum: 1,
      maximum: 100
    },
    bondLength: {
      type: 'number',
      minimum: 0.1,
      maximum: 1000
    },
    bondLengthUnit: {
      "enum": ['px', 'pt', 'cm', 'inch']
    },
    bondThickness: {
      type: 'number',
      minimum: 0.1,
      maximum: 96
    },
    bondThicknessUnit: {
      "enum": ['px', 'pt', 'cm', 'inch']
    },
    stereoBondWidth: {
      type: 'number',
      minimum: 0.1,
      maximum: 96
    },
    stereoBondWidthUnit: {
      "enum": ['px', 'pt', 'cm', 'inch']
    },
    hashSpacing: {
      type: 'number',
      minimum: 0.1,
      maximum: 1000
    },
    hashSpacingUnit: {
      "enum": ['px', 'pt', 'cm', 'inch']
    },
    imageResolution: {
      type: 'number'
    },
    reactionComponentMarginSize: {
      type: 'number',
      minimum: 0.1,
      maximum: 1000
    },
    reactionComponentMarginSizeUnit: {
      "enum": ['px', 'pt', 'cm', 'inch']
    },
    'smart-layout': {
      type: 'boolean'
    },
    'ignore-stereochemistry-errors': {
      type: 'boolean'
    },
    'mass-skip-error-on-pseudoatoms': {
      type: 'boolean'
    },
    'gross-formula-add-rsites': {
      type: 'boolean'
    },
    'aromatize-skip-superatoms': {
      type: 'boolean'
    },
    'dearomatize-on-load': {
      type: 'boolean'
    },
    'gross-formula-add-isotopes': {
      type: 'boolean'
    },
    'valence-mode': {
      "enum": ['biovia-2009', 'biovia-2017', 'default']
    },
    showAtomIds: {
      type: 'boolean'
    },
    showBondIds: {
      type: 'boolean'
    },
    showHalfBondIds: {
      type: 'boolean'
    },
    showLoopIds: {
      type: 'boolean'
    },
    miewMode: {
      "enum": ['LN', 'BS', 'LC']
    },
    miewTheme: {
      "enum": ['light', 'dark']
    },
    miewAtomLabel: {
      "enum": ['no', 'bright', 'blackAndWhite', 'black']
    },
    selectionTool: {
      type: 'string'
    },
    editorLineLength: {
      type: 'object'
    },
    disableCustomQuery: {
      type: 'boolean'
    },
    monomerLibraryUpdates: {
      type: 'array',
      items: {
        type: 'string'
      }
    },
    colorPickerCustomColors: {
      type: 'array',
      items: {
        type: 'string'
      }
    }
  }
};

exports.DEFAULT_SETTINGS = DEFAULT_SETTINGS;
exports.PRESETS = PRESETS;
exports.SCHEMA = SCHEMA;
exports.getDefaultSettings = getDefaultSettings;
//# sourceMappingURL=schema.js.map
