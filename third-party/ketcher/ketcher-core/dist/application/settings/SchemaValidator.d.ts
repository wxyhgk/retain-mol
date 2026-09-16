/**
 * Schema-based validator using jsonschema
 * Validates settings against JSON Schema
 */
import type { ISettingsValidator, ValidationResult } from './types';
export declare class SchemaValidator implements ISettingsValidator {
    private readonly validator;
    private readonly fullSchema;
    private readonly partialSchema;
    constructor();
    /**
     * Validate complete settings object
     */
    validate(settings: unknown): ValidationResult;
    /**
     * Validate partial settings (for updates)
     */
    validatePartial(partial: unknown): ValidationResult;
    /**
     * Convert jsonschema errors to our ValidationError format
     */
    private convertJsonSchemaErrors;
    private getErrorPath;
    private escapeJsonPointerToken;
}
