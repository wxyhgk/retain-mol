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
import React, { type ComponentType } from 'react';
import { type SchemaProperty } from '../../../../contexts';
export type InputSchema = SchemaProperty | unknown[];
type InputComponentProps = {
    schema?: InputSchema;
    value?: unknown;
    onChange?: (val: unknown) => void;
    onSelect?: (ev: React.SyntheticEvent, values?: unknown[]) => void;
    selected?: (testVal: unknown, value: unknown) => boolean;
    multiple?: boolean;
    innerRef?: React.Ref<HTMLInputElement>;
    name?: string;
    className?: string;
    type?: string;
    [key: string]: unknown;
};
type Props = {
    name?: string;
    component?: ComponentType<InputComponentProps>;
    children?: React.ReactNode;
    className?: string;
    type?: string;
    value?: unknown;
    onChange: (val: unknown) => void;
    placeholder?: string;
    isFocused?: boolean;
    innerRef?: React.Ref<HTMLInputElement>;
    schema?: InputSchema;
    multiple?: boolean;
};
export declare function GenericInput({ schema: _schema, value, onChange, innerRef, type, isFocused, ...props }: {
    [x: string]: any;
    schema: any;
    value: any;
    onChange: any;
    innerRef: any;
    type?: string | undefined;
    isFocused?: boolean | undefined;
}): React.JSX.Element;
export declare namespace GenericInput {
    var val: (ev: any, schema: any) => any;
}
declare const _default: React.ForwardRefExoticComponent<Props & React.RefAttributes<HTMLInputElement>>;
export default _default;
