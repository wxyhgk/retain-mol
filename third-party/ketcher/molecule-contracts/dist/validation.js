import { Validator } from 'jsonschema';
import { moleculeCommitRequestSchema, moleculeDocumentSchema, moleculeEditRequestSchema, moleculeHistoryRequestSchema, } from './schemas.js';
const validator = new Validator();
// Bound hostile in-process input before schema traversal; JSON cannot encode
// cycles, getters, NaN, undefined or class instances without changing meaning.
const MAX_JSON_DEPTH = 32;
const MAX_JSON_NODES = 250_000;
function pointer(parts) {
    return parts
        .map((part) => `/${String(part).replace(/~/g, '~0').replace(/\//g, '~1')}`)
        .join('');
}
function failure(message, parts, limited = false) {
    return {
        code: limited ? 'limit-exceeded' : 'invalid-request',
        message,
        path: pointer(parts),
        ...(parts[0] === 'commands' && typeof parts[1] === 'number'
            ? { commandIndex: parts[1] }
            : {}),
    };
}
function copyJson(input) {
    const ancestors = new Set();
    let visited = 0;
    function visit(value, parts) {
        if (++visited > MAX_JSON_NODES || parts.length > MAX_JSON_DEPTH) {
            return {
                ok: false,
                error: failure('JSON input exceeds the validation size or depth limit.', parts, true),
            };
        }
        if (value === null ||
            typeof value === 'boolean' ||
            typeof value === 'string') {
            return { ok: true, value };
        }
        if (typeof value === 'number' && Number.isFinite(value))
            return { ok: true, value };
        if (typeof value !== 'object' || value === null) {
            return {
                ok: false,
                error: failure('Expected a finite JSON value.', parts),
            };
        }
        if (ancestors.has(value))
            return {
                ok: false,
                error: failure('Cyclic values are not JSON.', parts),
            };
        const array = Array.isArray(value);
        const prototype = Object.getPrototypeOf(value);
        if (array
            ? prototype !== Array.prototype
            : prototype !== Object.prototype && prototype !== null) {
            return {
                ok: false,
                error: failure('Expected a plain JSON object or array.', parts),
            };
        }
        const keys = Reflect.ownKeys(value);
        if (keys.length > MAX_JSON_NODES - visited) {
            return {
                ok: false,
                error: failure('JSON input exceeds the validation size limit.', parts, true),
            };
        }
        if (array &&
            (value.length > MAX_JSON_NODES || keys.length !== value.length + 1)) {
            return {
                ok: false,
                error: failure('Expected a dense JSON array without extra properties.', parts),
            };
        }
        const output = array ? [] : {};
        ancestors.add(value);
        for (const key of keys) {
            if (array && key === 'length')
                continue;
            if (typeof key !== 'string')
                return {
                    ok: false,
                    error: failure('Symbol properties are not JSON.', parts),
                };
            const childParts = [...parts, array ? Number(key) : key];
            const descriptor = Object.getOwnPropertyDescriptor(value, key);
            if (!descriptor || !('value' in descriptor) || !descriptor.enumerable) {
                return {
                    ok: false,
                    error: failure('JSON properties must be enumerable data values.', childParts),
                };
            }
            if (array &&
                (!Number.isSafeInteger(Number(key)) ||
                    Number(key) < 0 ||
                    String(Number(key)) !== key ||
                    Number(key) >= value.length)) {
                return {
                    ok: false,
                    error: failure('Expected only array index properties.', childParts),
                };
            }
            const child = visit(descriptor.value, childParts);
            if (!child.ok)
                return child;
            Object.defineProperty(output, key, {
                value: child.value,
                enumerable: true,
                writable: true,
                configurable: true,
            });
        }
        ancestors.delete(value);
        return { ok: true, value: output };
    }
    try {
        return visit(input, []);
    }
    catch {
        return {
            ok: false,
            error: failure('Could not read input as JSON data.', []),
        };
    }
}
function schemaError(error, prefix = []) {
    const schema = typeof error.schema === 'object' ? error.schema : undefined;
    const alternatives = schema?.oneOf?.map((branch) => Object.keys(branch.properties ?? {}).join(','));
    if (alternatives?.length === 2 &&
        alternatives.includes('id') &&
        alternatives.includes('ref')) {
        return failure('Expected exactly one reference: { id: "existing-id" } or { ref: "request-ref" }; its value must be a nonempty string of at most 128 characters.', [...prefix, ...error.path]);
    }
    if (schema?.anyOf?.some((branch) => branch.type === 'null') &&
        error.instance !== null) {
        const branch = schema.anyOf.find((branch) => branch.type !== 'null');
        if (branch) {
            if (branch.type === 'integer' &&
                branch.minimum !== undefined &&
                branch.maximum !== undefined) {
                return failure(`Expected an integer from ${branch.minimum} to ${branch.maximum}, or null to clear the field.`, [...prefix, ...error.path]);
            }
            const detail = validator.validate(error.instance, branch).errors[0];
            if (detail)
                return schemaError(detail, [...prefix, ...error.path]);
        }
    }
    return failure(error.message, [...prefix, ...error.path]);
}
function validate(input, schema) {
    const copied = copyJson(input);
    if (!copied.ok)
        return copied;
    try {
        const result = validator.validate(copied.value, schema);
        if (result.valid)
            return { ok: true, value: copied.value };
        const error = result.errors[0];
        // Report the failing field of the requested operation rather than an opaque
        // oneOf mismatch. Validation still uses the same published schema branch.
        if (schema === moleculeEditRequestSchema &&
            error.path[0] === 'commands' &&
            typeof error.path[1] === 'number') {
            const input = copied.value;
            const command = input.commands[error.path[1]];
            const itemSchema = schema.properties?.commands.items;
            const branch = itemSchema.oneOf?.find((item) => item.properties?.op.const === command?.op);
            if (branch) {
                const detail = validator.validate(command, branch).errors[0];
                if (detail) {
                    return {
                        ok: false,
                        error: schemaError(detail, ['commands', error.path[1]]),
                    };
                }
            }
            if (!branch) {
                return {
                    ok: false,
                    error: failure(`Expected a command with one of these operations: ${itemSchema.oneOf
                        ?.map((item) => item.properties?.op.const)
                        .join(', ')}.`, [
                        'commands',
                        error.path[1],
                        ...(command !== null && typeof command === 'object'
                            ? ['op']
                            : []),
                    ]),
                };
            }
        }
        return { ok: false, error: schemaError(error) };
    }
    catch {
        return {
            ok: false,
            error: failure('JSON input could not be validated against this protocol.', []),
        };
    }
}
/** Validate and detach JSON input. Graph integrity is the engine's responsibility. */
export function validateEditRequest(input) {
    return validate(input, moleculeEditRequestSchema);
}
export function validateDocumentSnapshot(input) {
    return validate(input, moleculeDocumentSchema);
}
export function validateCommitRequest(input) {
    return validate(input, moleculeCommitRequestSchema);
}
export function validateCancelRequest(input) {
    return validate(input, moleculeCommitRequestSchema);
}
export function validateHistoryRequest(input) {
    return validate(input, moleculeHistoryRequestSchema);
}
