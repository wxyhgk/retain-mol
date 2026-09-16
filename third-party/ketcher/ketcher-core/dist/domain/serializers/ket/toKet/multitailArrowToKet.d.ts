import type { KetFileNode } from '../../../serializers/serializers.types';
export declare function multitailArrowToKet(node: KetFileNode): {
    type: string;
    data: unknown;
    selected: boolean | undefined;
};
