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
import { IStyledIconProps } from './types';
export declare const SummaryContainer: import("@emotion/styled").StyledComponent<{
    theme?: import("@emotion/react").Theme;
    as?: React.ElementType;
}, import("react").DetailedHTMLProps<import("react").HTMLAttributes<HTMLDivElement>, HTMLDivElement>, {}>;
export declare const SummaryText: import("@emotion/styled").StyledComponent<{
    theme?: import("@emotion/react").Theme;
    as?: React.ElementType;
}, import("react").DetailedHTMLProps<import("react").HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>, {}>;
export declare const StyledIcon: import("@emotion/styled").StyledComponent<{
    name: import("src/uiBridge").MacromoleculesIconName;
    className?: string;
    title?: string;
    onClick?: (e: import("react").MouseEvent) => void;
    onMouseOver?: (e: import("react").MouseEvent) => void;
    onMouseOut?: (e: import("react").MouseEvent) => void;
    onDoubleClick?: (e: import("react").MouseEvent) => void;
    dataTestId?: string;
} & {
    theme?: import("@emotion/react").Theme;
} & IStyledIconProps, {}, {}>;
