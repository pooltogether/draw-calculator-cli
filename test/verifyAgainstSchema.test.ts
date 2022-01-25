import * as schema from '@pooltogether/prize-api-schema/schema/prize.json';

const AJV = require('ajv');

const invalidTestData = require('./data/invalidPrizes.json');
const testData = require('./data/prizes.json');

describe('validate data against schema', () => {
    it('data is valid', () => {
        const ajv = new AJV();
        expect(ajv.validate(schema, testData)).toBeTruthy();
    });
    it('data is invalid', () => {
        const ajv = new AJV();
        expect(ajv.validate(schema, invalidTestData)).toBeFalsy();
    });
});
