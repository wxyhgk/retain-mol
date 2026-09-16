"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.moleculeHistoryRequestSchema = exports.moleculeCommitRequestSchema = exports.moleculeDocumentSchema = exports.moleculeEditRequestSchema = exports.ELEMENT_SYMBOLS = void 0;
const types_js_1 = require("./types.js");
// Symbols match the 118 real elements in ketcher-core's periodic table.
// Query labels, pseudo-atoms and isotope shorthand (D/T) need a future profile.
exports.ELEMENT_SYMBOLS = Object.freeze([
    'H',
    'He',
    'Li',
    'Be',
    'B',
    'C',
    'N',
    'O',
    'F',
    'Ne',
    'Na',
    'Mg',
    'Al',
    'Si',
    'P',
    'S',
    'Cl',
    'Ar',
    'K',
    'Ca',
    'Sc',
    'Ti',
    'V',
    'Cr',
    'Mn',
    'Fe',
    'Co',
    'Ni',
    'Cu',
    'Zn',
    'Ga',
    'Ge',
    'As',
    'Se',
    'Br',
    'Kr',
    'Rb',
    'Sr',
    'Y',
    'Zr',
    'Nb',
    'Mo',
    'Tc',
    'Ru',
    'Rh',
    'Pd',
    'Ag',
    'Cd',
    'In',
    'Sn',
    'Sb',
    'Te',
    'I',
    'Xe',
    'Cs',
    'Ba',
    'La',
    'Ce',
    'Pr',
    'Nd',
    'Pm',
    'Sm',
    'Eu',
    'Gd',
    'Tb',
    'Dy',
    'Ho',
    'Er',
    'Tm',
    'Yb',
    'Lu',
    'Hf',
    'Ta',
    'W',
    'Re',
    'Os',
    'Ir',
    'Pt',
    'Au',
    'Hg',
    'Tl',
    'Pb',
    'Bi',
    'Po',
    'At',
    'Rn',
    'Fr',
    'Ra',
    'Ac',
    'Th',
    'Pa',
    'U',
    'Np',
    'Pu',
    'Am',
    'Cm',
    'Bk',
    'Cf',
    'Es',
    'Fm',
    'Md',
    'No',
    'Lr',
    'Rf',
    'Db',
    'Sg',
    'Bh',
    'Hs',
    'Mt',
    'Ds',
    'Rg',
    'Cn',
    'Nh',
    'Fl',
    'Mc',
    'Lv',
    'Ts',
    'Og',
]);
const identifier = { type: 'string', minLength: 1, maxLength: 128 };
const revision = {
    type: 'integer',
    minimum: 0,
    maximum: Number.MAX_SAFE_INTEGER,
};
const element = { type: 'string', enum: [...exports.ELEMENT_SYMBOLS] };
const charge = { type: 'integer', minimum: -8, maximum: 8 };
const isotope = { type: 'integer', minimum: 1, maximum: 400 };
const coordinate = {
    type: 'number',
    minimum: -1_000_000,
    maximum: 1_000_000,
};
const bondOrder = {
    type: 'string',
    enum: ['single', 'double', 'triple'],
};
function object(properties, required = Object.keys(properties)) {
    return {
        type: 'object',
        properties: Object.assign(Object.create(null), properties),
        required,
        additionalProperties: false,
        // jsonschema 1.5 consults inherited properties when checking additional
        // fields. Explicit names also protect the exported schema after JSON.parse.
        propertyNames: { enum: Object.keys(properties) },
    };
}
const position = object({ x: coordinate, y: coordinate });
const reference = {
    oneOf: [object({ id: identifier }), object({ ref: identifier })],
};
const commandSchemas = [
    object({
        op: { const: 'atom.add' },
        ref: identifier,
        element,
        charge,
        isotope,
        position,
    }, ['op', 'ref', 'element']),
    object({
        op: { const: 'atom.update' },
        target: reference,
        patch: {
            ...object({
                element,
                charge,
                isotope: { anyOf: [isotope, { type: 'null' }] },
                position: { anyOf: [position, { type: 'null' }] },
            }, []),
            minProperties: 1,
        },
    }),
    object({
        op: { const: 'atom.remove' },
        target: reference,
        incidentBonds: { type: 'string', enum: ['reject', 'remove'] },
    }),
    object({
        op: { const: 'bond.add' },
        ref: identifier,
        begin: reference,
        end: reference,
        order: bondOrder,
    }),
    object({
        op: { const: 'bond.update' },
        target: reference,
        patch: object({ order: bondOrder }),
    }),
    object({ op: { const: 'bond.remove' }, target: reference }),
];
function freezeSchema(schema) {
    function freeze(value) {
        if (value !== null &&
            typeof value === 'object' &&
            !Object.isFrozen(value)) {
            Object.values(value).forEach(freeze);
            Object.freeze(value);
        }
    }
    freeze(schema);
    return schema;
}
const draft = 'http://json-schema.org/draft-07/schema#';
exports.moleculeEditRequestSchema = freezeSchema({
    $schema: draft,
    $id: 'https://retainmol.invalid/schemas/molecule-edit-request.v1.json',
    title: 'RetainMol molecule edit request v1',
    ...object({
        schema: { const: types_js_1.EDIT_SCHEMA },
        documentId: identifier,
        baseRevision: revision,
        requestId: identifier,
        commands: {
            type: 'array',
            minItems: 1,
            maxItems: 1000,
            items: { oneOf: commandSchemas },
        },
    }),
});
exports.moleculeDocumentSchema = freezeSchema({
    $schema: draft,
    $id: 'https://retainmol.invalid/schemas/molecule-document.v1.json',
    title: 'RetainMol basic graph document v1',
    ...object({
        schema: { const: types_js_1.DOCUMENT_SCHEMA },
        profile: { const: types_js_1.PROFILE },
        documentId: identifier,
        revision,
        atoms: {
            type: 'array',
            items: object({ id: identifier, element, charge, isotope, position }, [
                'id',
                'element',
                'charge',
            ]),
        },
        bonds: {
            type: 'array',
            items: object({
                id: identifier,
                begin: identifier,
                end: identifier,
                order: bondOrder,
            }),
        },
    }),
});
exports.moleculeCommitRequestSchema = freezeSchema({
    $schema: draft,
    $id: 'https://retainmol.invalid/schemas/molecule-commit-request.v1.json',
    ...object({ preparedId: identifier, requestId: identifier }),
});
exports.moleculeHistoryRequestSchema = freezeSchema({
    $schema: draft,
    $id: 'https://retainmol.invalid/schemas/molecule-history-request.v1.json',
    ...object({
        documentId: identifier,
        baseRevision: revision,
        expectedCommitId: identifier,
    }),
});
