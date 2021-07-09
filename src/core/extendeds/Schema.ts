type DataType = 'object' | 'string' | 'number' | 'integer' | 'boolean' | 'array' | 'null'

export interface SchemaItem{
    type: DataType | DataType[],
    required?: string[],
    properties?: Properties,
    nullable?:boolean,
    oneOf?: SchemaItem[],
    maxLength?: number,
    minLength?: number,
    length?: number,
    enum?: [],
    not?: SchemaItem,
}

interface Properties{
    [k: string]: SchemaItem
}

interface IResponse{
    [k: number]: SchemaItem
}

export default interface Schema {
    body?: SchemaItem;
    headers?: SchemaItem;
    querystring?: SchemaItem;
    params?: SchemaItem;
    response?: IResponse;
}