export declare const MODAL_STATES: {
    readonly openOptions: "openOptions";
    readonly textEditor: "textEditor";
};
export type ModalStateValue = typeof MODAL_STATES[keyof typeof MODAL_STATES];
export type MODAL_STATES_VALUES = ModalStateValue;
