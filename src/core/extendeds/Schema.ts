type DataType = "object" | "string" | "number" | "integer" | "boolean" | "array" | "null";

export interface SchemaItem {
    type: DataType | DataType[],
    required?: string[] | RequiredErrorMessages,
    properties?: Properties,
    nullable?: boolean,
    oneOf?: SchemaItem[],
    maxLength?: number,
    min?: number,
    minLength?: number,
    length?: number,
    enum?: unknown[],
    not?: SchemaItem,
    errorMessage?: SchemaItem,
    errorMessages?: SchemaItem,
}

interface Properties {
    [k: string]: SchemaItem
}

interface IResponse {
    [k: number]: SchemaItem
}

interface RequiredErrorMessages {
    [k: string]: string
}

export default interface Schema {
    body?: SchemaItem;
    headers?: SchemaItem;
    querystring?: SchemaItem;
    params?: SchemaItem;
    response?: IResponse;
}