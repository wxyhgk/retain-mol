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
import type { AnyAction } from 'redux';
export type ModalFormErrors = Record<string, unknown>;
export type MoleculeErrors = Record<string, string>;
export interface ModalFormState<TResult = Record<string, unknown>> {
    errors: ModalFormErrors;
    valid?: boolean;
    result?: TResult;
    moleculeErrors?: MoleculeErrors;
}
export type ModalFormsState = Record<string, ModalFormState>;
interface UpdateFormAction<TData = Partial<ModalFormState>> extends AnyAction {
    type: 'UPDATE_FORM';
    data: TData;
}
type ModalReducerAction = UpdateFormAction | AnyAction;
export declare const formsState: ModalFormsState;
export declare function updateFormState<TData extends Partial<ModalFormState>>(data: TData): UpdateFormAction<TData>;
export declare function checkErrors(errors: MoleculeErrors): UpdateFormAction;
export declare function setDefaultSettings(): UpdateFormAction;
export declare function formReducer(state: ModalFormState | undefined, action: ModalReducerAction): ModalFormState;
export {};
