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
import { CoreEditor, DeepPartial } from 'ketcher-core';
import { type MacromoleculesUIComponents } from './uiBridge';
import { EditorTheme } from './theming/defaultTheme';
import './theme.less';
interface EditorProps {
    ketcherId: string;
    theme?: DeepPartial<EditorTheme>;
    togglerComponent?: JSX.Element;
    monomersLibraryUpdate?: string | JSON;
    monomersLibraryReplace?: string | JSON;
    onInit?: (editor: CoreEditor) => void;
}
export interface EditorContainerProps extends EditorProps {
    isMacromoleculesEditorTurnedOn?: boolean;
    ui: MacromoleculesUIComponents;
}
declare function EditorContainer({ onInit, ketcherId, theme, togglerComponent, monomersLibraryUpdate, monomersLibraryReplace, isMacromoleculesEditorTurnedOn, ui, }: Readonly<EditorContainerProps>): import("@emotion/react/jsx-runtime").JSX.Element;
export default EditorContainer;
