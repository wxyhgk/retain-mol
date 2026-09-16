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
import type { D3SvgElementSelection } from '../../../render/types';
import type { Vec2 } from '../../../../domain/entities';
import { TransientView } from './TransientView';
export type RotationViewParams = {
    center: Vec2;
    boundingBox: {
        left: number;
        top: number;
        width: number;
        height: number;
    };
    rotationAngle?: number;
    isRotating?: boolean;
    cursor?: Vec2;
    startAngle?: number;
};
type RotationHandleEvent = {
    type: 'down' | 'drag';
    event: PointerEvent;
};
type RotationCenterEvent = {
    type: 'down' | 'drag';
    event: PointerEvent;
};
export declare class RotationView extends TransientView {
    private static lastSnappingRadius?;
    private static wasRotating;
    private static readonly rotationHandleSubscribers;
    private static readonly rotationCenterSubscribers;
    static subscribeRotationHandle(listener: (payload: RotationHandleEvent) => void): () => boolean;
    static subscribeRotationCenter(listener: (payload: RotationCenterEvent) => void): () => boolean;
    static show(transientLayer: D3SvgElementSelection<SVGGElement, void>, params: RotationViewParams): void;
    static readonly viewName = "RotationView";
}
export {};
