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
import _classCallCheck from '@babel/runtime/helpers/classCallCheck';
import _createClass from '@babel/runtime/helpers/createClass';
import _defineProperty from '@babel/runtime/helpers/defineProperty';
import { ZoomTool } from './Zoom.modern.js';
import { select, drag } from 'd3';

var HandTool = function () {
  function HandTool(editor) {
    _classCallCheck(this, HandTool);
    _defineProperty(this, "editor", void 0);
    _defineProperty(this, "dragBehavior", void 0);
    this.editor = editor;
    this.editor.canvas.classList.add('handCursor');
    this.dragBehavior = drag().on('start', this.handleDragStart.bind(this)).on('drag', this.handleDragging.bind(this)).on('end', this.handleDragEnd.bind(this));
    select(this.editor.canvas).call(this.dragBehavior);
  }
  _createClass(HandTool, [{
    key: "handleDragStart",
    value: function handleDragStart() {
      this.editor.canvas.classList.add('handCursorGrabbing');
    }
  }, {
    key: "handleDragging",
    value: function handleDragging(event) {
      ZoomTool.instance.scrollBy(event.dx, event.dy);
    }
  }, {
    key: "handleDragEnd",
    value: function handleDragEnd() {
      this.editor.canvas.classList.remove('handCursorGrabbing');
    }
  }, {
    key: "destroy",
    value: function destroy() {
      this.editor.canvas.classList.remove('handCursor');
      select(this.editor.canvas).on('.drag', null);
    }
  }]);
  return HandTool;
}();

export { HandTool };
//# sourceMappingURL=Hand.modern.js.map
