import type { Render } from '../raphaelRender';
export declare class ScrollbarContainer {
    #private;
    constructor(render: Render);
    destroy(): void;
    /** Specified {@link render} resets scrollbars */
    update(): void;
}
