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
var LayerMap;
(function (LayerMap) {
  LayerMap["background"] = "background";
  LayerMap["images"] = "images";
  LayerMap["selectionPlate"] = "selectionPlate";
  LayerMap["selectionPoints"] = "selectionPoints";
  LayerMap["hovering"] = "hovering";
  LayerMap["atom"] = "atom";
  LayerMap["bondSkeleton"] = "bondSkeleton";
  LayerMap["warnings"] = "warnings";
  LayerMap["data"] = "data";
  LayerMap["additionalInfo"] = "additionalInfo";
  LayerMap["indices"] = "indices";
})(LayerMap || (LayerMap = {}));
var StereoColoringType;
(function (StereoColoringType) {
  StereoColoringType["LabelsOnly"] = "LabelsOnly";
  StereoColoringType["BondsOnly"] = "BondsOnly";
  StereoColoringType["LabelsAndBonds"] = "LabelsAndBonds";
  StereoColoringType["Off"] = "Off";
})(StereoColoringType || (StereoColoringType = {}));
var StereoLabelStyleType;
(function (StereoLabelStyleType) {
  StereoLabelStyleType["IUPAC"] = "Iupac";
  StereoLabelStyleType["Classic"] = "Classic";
  StereoLabelStyleType["On"] = "On";
  StereoLabelStyleType["Off"] = "Off";
})(StereoLabelStyleType || (StereoLabelStyleType = {}));

export { LayerMap, StereoColoringType, StereoLabelStyleType };
//# sourceMappingURL=generalEnumTypes.modern.js.map
