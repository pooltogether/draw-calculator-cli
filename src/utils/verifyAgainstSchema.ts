import AJV from "ajv";
import * as schema from "@pooltogether/prize-api-schema/schema/prize.json";

export function verifyAgainstSchema(data: any): boolean {
    const ajv = new AJV();
    return ajv.validate(schema, data);
}
