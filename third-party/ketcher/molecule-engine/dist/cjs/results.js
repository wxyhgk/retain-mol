"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.freeze = freeze;
exports.success = success;
exports.failure = failure;
exports.canonicalJson = canonicalJson;
/** Freeze owned JSON values; no live model objects cross the public boundary. */
function freeze(value) {
    if (value !== null && typeof value === 'object' && !Object.isFrozen(value)) {
        for (const child of Object.values(value))
            freeze(child);
        Object.freeze(value);
    }
    return value;
}
function success(value) {
    return freeze({ ok: true, value });
}
function failure(code, message, details = {}) {
    return freeze({ ok: false, error: { code, message, ...details } });
}
/** Inputs have already passed the finite, plain-JSON contract validator. */
function canonicalJson(value) {
    if (Array.isArray(value))
        return `[${value.map(canonicalJson).join(',')}]`;
    if (value !== null && typeof value === 'object') {
        const record = value;
        return `{${Object.keys(record)
            .sort()
            .map((key) => `${JSON.stringify(key)}:${canonicalJson(record[key])}`)
            .join(',')}}`;
    }
    return JSON.stringify(value);
}
