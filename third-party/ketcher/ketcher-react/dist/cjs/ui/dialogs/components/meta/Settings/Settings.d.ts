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
import type { BaseCallProps, BaseProps } from '../../../modal.types';
import { type StructService } from 'ketcher-core';
interface SettingsProps extends BaseProps {
    ketcherId: string;
    initState: any;
    appOpts: {
        version: string;
        buildDate: string;
        buildNumber: string;
        indigoVersion: string;
        imagoVersions: Array<string>;
        server: boolean;
        templates: boolean;
    };
    server: StructService;
}
interface SettingsCallProps extends BaseCallProps {
    onOpenFile: (any: any) => void;
    onReset: () => void;
    onACSStyle: (result: any) => void;
}
type Props = SettingsProps & SettingsCallProps;
declare const Settings: import("react-redux").ConnectedComponent<(props: Props) => import("react").JSX.Element, {
    ketcherId: string;
    className: string;
    onCancel: () => void;
    onOk: (result: any) => void;
    context?: import("react").Context<import("react-redux").ReactReduxContextValue<any, import("redux").UnknownAction> | null> | undefined;
    store?: import("redux").Store | undefined;
}>;
export default Settings;
