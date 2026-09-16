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
declare const iconMap: {
    'arrow-down': ReactComponent;
    'arrow-up': ReactComponent;
    bracket: ReactComponent;
    'capital-t': ReactComponent;
    checkmark: ReactComponent;
    chevron: ReactComponent;
    close: ReactComponent;
    copy: ReactComponent;
    'delete-menu': ReactComponent;
    divider: ReactComponent;
    'double-arrow-left': ReactComponent;
    'double-arrow-right': ReactComponent;
    dropdown: ReactComponent;
    erase: ReactComponent;
    ellipse: ReactComponent;
    'file-thumbnail': ReactComponent;
    fullscreen: ReactComponent;
    help: ReactComponent;
    'horizontal-flip': ReactComponent;
    open: ReactComponent;
    'rap-left-link': ReactComponent;
    'rap-middle-link': ReactComponent;
    'rap-right-link': ReactComponent;
    rotate: ReactComponent;
    rectangle: ReactComponent;
    search: ReactComponent;
    'select-lasso': ReactComponent;
    'select-rectangle': ReactComponent;
    'select-fragment': ReactComponent;
    settings: ReactComponent;
    star: ReactComponent;
    'single-bond': ReactComponent;
    'vertical-flip': ReactComponent;
    clear: ReactComponent;
    undo: ReactComponent;
    save: ReactComponent;
    error: ReactComponent;
    expand: ReactComponent;
    'minimize-expansion': ReactComponent;
    'explicit-hydrogens': ReactComponent;
};
type IconNameType = keyof typeof iconMap;
type IconPropsType = {
    name: IconNameType;
    className?: string;
};
declare const Icon: ({ name, className }: IconPropsType) => import("@emotion/react/jsx-runtime").JSX.Element | null;
export { Icon };
export type { IconNameType };
