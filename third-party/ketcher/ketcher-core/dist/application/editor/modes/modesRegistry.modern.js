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
var modesMap = {};
function registerMode(mode, ctor) {
  if (modesMap[mode] && modesMap[mode] !== ctor) {
    throw new Error("Mode \"".concat(mode, "\" is already registered"));
  }
  if (modesMap[mode] === ctor) {
    return;
  }
  modesMap[mode] = ctor;
}
function getModeConstructor(mode) {
  var ctor = modesMap[mode];
  if (!ctor) {
    throw new Error("Mode \"".concat(mode, "\" is not registered"));
  }
  return ctor;
}

export { getModeConstructor, registerMode };
//# sourceMappingURL=modesRegistry.modern.js.map
