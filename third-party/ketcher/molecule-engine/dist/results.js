/** Freeze owned JSON values; no live model objects cross the public boundary. */
export function freeze(value) {
    if (value !== null && typeof value === 'object' && !Object.isFrozen(value)) {
        for (const child of Object.values(value))
            freeze(child);
        Object.freeze(value);
    }
    return value;
}
export function success(value) {
    return freeze({ ok: true, value });
}
export function failure(code, message, details = {}) {
    return freeze({ ok: false, error: { code, message, ...details } });
}
/** Inputs have already passed the finite, plain-JSON contract validator. */
export function canonicalJson(value) {
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
