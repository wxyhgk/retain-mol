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
function blurActiveElement() {
  var activeElement = document.activeElement;
  if (activeElement instanceof HTMLElement || activeElement instanceof SVGElement) {
    activeElement.blur();
  }
}
function isEditableInputTarget(target) {
  if (!(target instanceof HTMLElement)) return false;
  if (target.hasAttribute('data-cliparea')) return false;
  return target.nodeName === 'INPUT' || target.nodeName === 'TEXTAREA' || target.isContentEditable;
}
function guardForMacromoleculesEditor(handler) {
  return function () {
    if (window.isPolymerEditorTurnedOn) {
      return handler.apply(void 0, arguments);
    }
    return undefined;
  };
}
function guardForMicromoleculesEditor(handler) {
  return function () {
    if (!window.isPolymerEditorTurnedOn) {
      return handler.apply(void 0, arguments);
    }
    return undefined;
  };
}

export { blurActiveElement, guardForMacromoleculesEditor, guardForMicromoleculesEditor, isEditableInputTarget };
//# sourceMappingURL=dom.modern.js.map
