import { PayloadAction } from '@reduxjs/toolkit';
import { AdditionalModalProps } from 'components/modal/modalContainer/types';
import { RootState } from 'state';
interface ModalState {
    name: string | null;
    isOpen: boolean;
    additionalProps: AdditionalModalProps | null;
    errorTooltips: string[];
    errorModalText: string;
    errorModalTitle: string;
}
export type ModalName = 'open' | 'save' | 'delete' | 'updateSequenceInRNABuilder' | 'monomerConnection' | 'confirmationDialog' | 'settings';
export declare const modalSlice: import("@reduxjs/toolkit").Slice<ModalState, {
    openModal: (state: import("immer").WritableDraft<ModalState>, action: PayloadAction<ModalName | {
        name: ModalName;
        additionalProps: AdditionalModalProps;
    }>) => void;
    closeModal: (state: import("immer").WritableDraft<ModalState>) => void;
    openErrorTooltip: (state: import("immer").WritableDraft<ModalState>, action: PayloadAction<string>) => void;
    closeErrorTooltip: (state: import("immer").WritableDraft<ModalState>, action: PayloadAction<string | undefined>) => void;
    openErrorModal: (state: import("immer").WritableDraft<ModalState>, action: PayloadAction<string | {
        errorMessage: string;
        errorTitle: string;
    }>) => void;
    closeErrorModal: (state: import("immer").WritableDraft<ModalState>) => void;
}, "modal", "modal", import("@reduxjs/toolkit").SliceSelectors<ModalState>>;
export declare const openModal: import("@reduxjs/toolkit").ActionCreatorWithPayload<ModalName | {
    name: ModalName;
    additionalProps: AdditionalModalProps;
}, "modal/openModal">, closeModal: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"modal/closeModal">, openErrorTooltip: import("@reduxjs/toolkit").ActionCreatorWithPayload<string, "modal/openErrorTooltip">, closeErrorTooltip: import("@reduxjs/toolkit").ActionCreatorWithOptionalPayload<string | undefined, "modal/closeErrorTooltip">, openErrorModal: import("@reduxjs/toolkit").ActionCreatorWithPayload<string | {
    errorMessage: string;
    errorTitle: string;
}, "modal/openErrorModal">, closeErrorModal: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"modal/closeErrorModal">;
export declare const selectModalName: (state: RootState) => string | null;
export declare const selectModalIsOpen: (state: RootState) => boolean;
export declare const selectAdditionalProps: (state: RootState) => AdditionalModalProps | null;
export declare const selectErrorTooltips: (state: RootState) => string[];
export declare const selectErrorModalText: (state: RootState) => string;
export declare const selectErrorModalTitle: (state: RootState) => string;
export declare const modalReducer: import("redux").Reducer<ModalState>;
export {};
