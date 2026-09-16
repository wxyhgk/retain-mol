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
import { type FC } from 'react';
import { type IStructRenderProps } from 'components';
import type { Template } from './TemplateTable';
/**
 * Memoized individual template item component
 * Prevents unnecessary re-renders when parent selection changes
 */
export interface TemplateItemProps {
    tmpl: Template;
    index: number;
    isSelected: boolean;
    shouldRenderPreview: boolean;
    renderOptions?: IStructRenderProps['options'];
    onSelect: (tmpl: Template) => void;
    onDelete?: (tmpl: Template) => void;
    onAttach?: (tmpl: Template) => void;
}
declare const TemplateItem: FC<TemplateItemProps>;
export default TemplateItem;
