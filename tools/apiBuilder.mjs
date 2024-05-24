import fs from "fs";
import {swaggerOptions} from "../src/swagger.ts";

const start = `import {ApiBase} from "./ApiBase.mjs";

export class Api extends ApiBase {`;
const end = `
}`;

let result = start;

const pathNames = Object.keys(swaggerOptions.definition.paths);

function constructMethod(path, memberName, parameters, method) {
    return `
    static async ${memberName}(${parameters.map((param) => `${param.name} = ${getParameter(param.default)}`).join(", ")}) {
        return await this.${method}("${path}", {${parameters.map((param) => `${param.name}`).join(", ")}});
    }`;
}

function getParameter(value) {
    if (value === null || value === "null") {
        return "null";
    }
    if (typeof value === "string") {
        return `"${value}"`;
    }
    return value;
}

pathNames.forEach((pathName) => {
    const path = swaggerOptions.definition.paths[pathName];
    const memberName = pathName.split("/").at(-1);
    const method = Object.keys(path)[0];

    // Request body
    const requestBody = path[method].requestBody;
    const requestBodyParameters = requestBody ? requestBody.content["application/json"].schema.properties : {};
    const requestBodyParameterNames = requestBody ? Object.keys(requestBodyParameters) : [];
    const requestBodyParameterDefaults = requestBodyParameterNames.map((name) => requestBodyParameters[name].default ?? "null");

    // Query parameters
    const queryParameters = path[method].parameters?.filter((parameter) => parameter.in === "query") ?? [];
    const queryParameterNames = queryParameters.map((parameter) => parameter.name);
    const queryParameterDefaults = queryParameters.map((parameter) => parameter.default ?? "null");

    // Joined
    const parameters = [
        ...requestBodyParameterNames.map((name, i) => ({name, default: requestBodyParameterDefaults[i]})),
        ...queryParameterNames.map((name, i) => ({name, default: queryParameterDefaults[i]}))
    ];

    result += constructMethod(pathName, memberName, parameters, method);
});

result += end;
fs.writeFileSync("Api.mjs", result);