import { RnaElementsViewProps } from './types';
import { IRnaPreset } from 'ketcher-core';
type Props = RnaElementsViewProps & {
    newPreset: IRnaPreset;
};
declare const _default: import("react").MemoExoticComponent<({ activeRnaBuilderItem, groupsData, newPreset, onNewPresetClick, onSelectItem, duplicatePreset, editPreset, libraryName, }: Props) => import("@emotion/react/jsx-runtime").JSX.Element>;
export default _default;
