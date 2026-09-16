import type { TemplateAttachmentContext, TemplateToolInput } from './template.types';
export type BondTemplateInput = Pick<TemplateToolInput, 'struct' | 'aid' | 'bid'>;
/**
 * Attach a structure template along an existing bond as one async transaction.
 * Errors are reported and consumed so keyboard dispatch cannot create an
 * unhandled rejection.
 */
export declare function attachTemplateToBond(ctx: TemplateAttachmentContext, input: BondTemplateInput, targetBondId: number, flip?: boolean): Promise<boolean>;
