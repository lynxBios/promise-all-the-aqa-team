import Ajv from 'ajv';

const ajv = new Ajv({ allErrors: true });

/**
 * Validates data against a JSON Schema.
 * @param {object} schema - JSON Schema describing the expected structure.
 * @param {unknown} data - Parsed response body to validate.
 * @returns {{ valid: boolean, errors: string }} Result with a readable error text.
 */
export function validateSchema(schema, data) {
  const validate = ajv.compile(schema);
  const valid = validate(data);
  return { valid, errors: ajv.errorsText(validate.errors) };
}
