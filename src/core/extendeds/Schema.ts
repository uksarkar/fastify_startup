
type DataType = 'object' | 'string' | 'number' | 'integer' | 'boolean' | 'array' | 'null'

interface SchemaItem{
    type: DataType | DataType[],
    required?: string[],
    properties?: Properties,
    nullable?:boolean,
    oneOf?: SchemaItem[],
    maxLength?: number,
    minimum?: number,
    enum?: [],
    not?: SchemaItem,
}

interface Properties{
    [k: string]: SchemaItem
}

export default interface Schema {
    body?: SchemaItem;
    headers?: SchemaItem;
    querystring?: SchemaItem;
    params?: SchemaItem;
    response?: SchemaItem;
}