const AJV = require('ajv');
import * as schema from '@pooltogether/prize-api-schema/schema/prize.json';
const testData = require('./data/prizes.json');
const invalidTestData = require('./data/invalidPrizes.json');

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
