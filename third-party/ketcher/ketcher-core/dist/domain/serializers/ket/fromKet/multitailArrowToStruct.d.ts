import type { Struct } from '../../../entities/struct';
import { type KetFileMultitailArrowNode } from '../../../entities/multitailArrow';
import type { KetFileNode } from '../../../serializers/serializers.types';
export declare function multitailArrowToStruct(ketItem: KetFileNode<KetFileMultitailArrowNode>, struct: Struct): Struct;
