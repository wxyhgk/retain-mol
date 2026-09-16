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

function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
var CORE_ONLY_SETTING_FIELDS = ['selectionTool', 'editorLineLength', 'disableCustomQuery', 'monomerLibraryUpdates'];
function ensureFontSizePrefix(font) {
  return font && !font.match(/^\d+px\s/) ? "30px ".concat(font) : font;
}
function normalizeStereoLabelStyleForCore(stereoLabelStyle) {
  if (!stereoLabelStyle) {
    return undefined;
  }
  var style = stereoLabelStyle.toLowerCase();
  if (style === 'iupac') {
    return 'IUPAC';
  }
  if (style === 'classic') {
    return 'classic';
  }
  if (style === 'on' || style === 'on-atoms') {
    return 'On-Atoms';
  }
  if (style === 'off') {
    return 'off';
  }
  return undefined;
}
function normalizeStereoLabelStyleForForm(stereoLabelStyle) {
  if (stereoLabelStyle === 'IUPAC') {
    return 'Iupac';
  }
  if (stereoLabelStyle === 'classic') {
    return 'Classic';
  }
  if (stereoLabelStyle === 'On-Atoms') {
    return 'On';
  }
  if (stereoLabelStyle === 'off') {
    return 'Off';
  }
  return stereoLabelStyle;
}
function normalizeSettingsForCore(settings) {
  var transformed = _objectSpread({}, settings);
  delete transformed.init;
  var normalizedStereoLabelStyle = normalizeStereoLabelStyleForCore(settings.stereoLabelStyle);
  if (normalizedStereoLabelStyle) {
    transformed.stereoLabelStyle = normalizedStereoLabelStyle;
  }
  var normalizedFont = ensureFontSizePrefix(settings.font);
  if (normalizedFont) {
    transformed.font = normalizedFont;
  }
  if (typeof settings.imageResolution === 'string') {
    transformed.imageResolution = parseInt(settings.imageResolution, 10);
  }
  if (settings.showHydrogenLabels === 'all') {
    transformed.showHydrogenLabels = 'On';
  }
  return transformed;
}
function normalizeSettingsForForm(settings) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var transformed = _objectSpread({}, settings);
  var normalizedStereoLabelStyle = normalizeStereoLabelStyleForForm(settings.stereoLabelStyle);
  if (normalizedStereoLabelStyle) {
    transformed.stereoLabelStyle = normalizedStereoLabelStyle;
  }
  var normalizedFont = ensureFontSizePrefix(settings.font);
  if (normalizedFont) {
    transformed.font = normalizedFont;
  }
  if (typeof settings.imageResolution === 'number') {
    transformed.imageResolution = settings.imageResolution.toString();
  }
  if (options.removeCoreOnlyFields) {
    CORE_ONLY_SETTING_FIELDS.forEach(function (field) {
      delete transformed[field];
    });
  }
  return transformed;
}

export { normalizeSettingsForCore, normalizeSettingsForForm };
//# sourceMappingURL=settingsFormatters.modern.js.map
