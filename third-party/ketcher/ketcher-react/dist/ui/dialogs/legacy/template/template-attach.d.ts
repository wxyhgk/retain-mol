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
import { Component } from 'react';
import { type FormState } from '../../../primitives/form/form/form';
import { type Editor, type Struct } from 'ketcher-core';
interface AttachPoints {
    atomid: number;
    bondid: number;
}
interface TemplateItem {
    struct: Struct;
    props: {
        atomid?: string | number;
        bondid?: string | number;
        group?: string;
        [key: string]: string | number | undefined;
    };
}
interface NormalizedTemplate {
    struct: Struct;
    props: AttachPoints;
}
interface AttachOwnProps {
    tmpl: TemplateItem;
    ketcherId: string;
    onCancel: () => void;
    onOk: (result: unknown) => void;
}
interface AttachStateProps {
    name: string;
    atomid: number;
    bondid: number;
    templateLib: TemplateItem[];
    formState: FormState;
    globalSettings: Record<string, unknown>;
}
interface AttachDispatchProps {
    onInit: (name: string, ap: AttachPoints) => void;
    onAttachEdit: (ap: AttachPoints) => void;
    onNameEdit: (name: string) => void;
}
type AttachProps = AttachOwnProps & AttachStateProps & AttachDispatchProps;
declare class Attach extends Component<AttachProps> {
    mode: 'save' | 'edit';
    tmpl: NormalizedTemplate;
    oldKetcherEditor: Editor;
    constructor(props: AttachProps);
    componentWillUnmount(): void;
    onResult(): {
        name: string;
        attach: {
            atomid: number;
            bondid: number;
        };
    } | null;
    checkIsValidName(name: string): boolean;
    render(): import("react").JSX.Element;
}
declare const _default: import("react-redux").ConnectedComponent<typeof Attach, {
    ref?: import("react").Ref<Attach> | undefined;
    key?: import("react").Key | null | undefined;
    tmpl: TemplateItem;
    ketcherId: string;
    onCancel: () => void;
    onOk: (result: unknown) => void;
    context?: import("react").Context<import("react-redux").ReactReduxContextValue<any, import("redux").UnknownAction> | null> | undefined;
    store?: import("redux").Store | undefined;
}>;
export default _default;
