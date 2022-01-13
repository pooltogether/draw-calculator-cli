const AJV = require('ajv');
const schema = require('../schema.json');
const testData = require('./data/prizes.json');

describe('validate data against schema', () => {
    it('data is valid', () => {
        const ajv = new AJV();
        expect(ajv.validate(schema, testData)).toBeTruthy();
    });
});
