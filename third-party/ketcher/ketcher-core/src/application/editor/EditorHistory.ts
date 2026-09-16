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

import type { Command } from 'domain/entities/Command';
import type { CoreEditor } from './Editor';
import { assert } from 'utilities';
import { ketcherProvider } from 'application/ketcherProvider';
const HISTORY_SIZE = 32; // put me to options

export type HistoryOperationType = 'undo' | 'redo';

export class EditorHistory {
  historyStack: Command[] | [] = [];
  historyPointer = 0;
  editor!: CoreEditor;

  private static readonly instances = new WeakMap<CoreEditor, EditorHistory>();

  constructor(editor: CoreEditor) {
    this.editor = editor;
    this.historyPointer = 0;
  }

  static getInstance(editor: CoreEditor): EditorHistory {
    const instance = EditorHistory.instances.get(editor);
    if (instance) {
      return instance;
    }

    const createdInstance = new EditorHistory(editor);
    EditorHistory.instances.set(editor, createdInstance);

    return createdInstance;
  }

  update(command: Command, megreWithLatestHistoryCommand?: boolean) {
    const latestCommand = this.historyStack[this.historyStack.length - 1];
    if (megreWithLatestHistoryCommand && latestCommand) {
      latestCommand.merge(command);
    } else {
      this.historyStack.splice(this.historyPointer, HISTORY_SIZE + 1, command);
      if (this.historyStack.length > HISTORY_SIZE) {
        this.historyStack.shift();
      }
      this.historyPointer = this.historyStack.length;
    }
    ketcherProvider.getKetcher(this.editor.ketcherId)?.changeEvent.dispatch();
    // Fire a dedicated model-change signal only when something actually
    // changed, so a no-op command doesn't trigger needless macromolecule
    // properties recalculation.
    if (command.operations.length > 0) {
      this.editor.events.modelChange.dispatch();
    }
  }

  undo() {
    if (this.historyPointer === 0) {
      return;
    }
    ketcherProvider.getKetcher(this.editor.ketcherId)?.changeEvent.dispatch();
    assert(this.editor);

    const nextPointer = this.historyPointer - 1;
    const lastCommand = this.historyStack[nextPointer];
    lastCommand.invert(this.editor.renderersContainer);
    this.historyPointer = nextPointer;
    const turnOffSelectionCommand =
      this.editor?.drawingEntitiesManager.unselectAllDrawingEntities();
    this.editor?.renderersContainer.update(turnOffSelectionCommand);
    // Dispatch after the model has been reverted so subscribers observe the
    // up-to-date structure.
    this.editor.events.modelChange.dispatch();
  }

  redo() {
    if (this.historyPointer === this.historyStack.length) {
      return;
    }
    ketcherProvider.getKetcher(this.editor.ketcherId)?.changeEvent.dispatch();
    assert(this.editor);

    const lastCommand = this.historyStack[this.historyPointer];
    lastCommand.execute(this.editor.renderersContainer);
    this.historyPointer++;
    const turnOffSelectionCommand =
      this.editor?.drawingEntitiesManager.unselectAllDrawingEntities();
    this.editor?.renderersContainer.update(turnOffSelectionCommand);
    // Dispatch after the model has been re-applied so subscribers observe the
    // up-to-date structure.
    this.editor.events.modelChange.dispatch();
  }

  public get previousCommand() {
    return this.historyStack[this.historyPointer - 1];
  }

  destroy() {
    EditorHistory.instances.delete(this.editor);
    this.historyStack = [];
    this.historyPointer = 0;
  }
}
