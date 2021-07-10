import HttpResponseCode from "../constants/HttpResponseCode";

export default class Exception extends Error {
    isOperational: boolean;

    constructor(
        name: string,
        isOperational: boolean,
        description: string,
    ) {
        super(description)

        Object.setPrototypeOf(this, new.target.prototype)
        this.name = name
        this.isOperational = isOperational
        Error.captureStackTrace(this)
    }
}

export class Api400Exception extends Exception {
    statusCode: number;
    constructor(
        name: string,
        description: string = 'Bad Request',
        isOperational: boolean = true
    ) {
        super(name, isOperational, description);
        this.statusCode = HttpResponseCode.BAD_REQUEST;
    }
}

export class Api401Exception extends Exception {
    statusCode: number;
    constructor(
        name: string,
        description: string = 'Unauthorized',
        isOperational: boolean = true
    ) {
        super(name, isOperational, description);
        this.statusCode = HttpResponseCode.UNAUTHORIZED;
    }
}

export class Api404Exception extends Exception {
    statusCode: number;
    constructor(
        name: string,
        description: string = 'Not found.',
        isOperational: boolean = true
    ) {
        super(name, isOperational, description)
        this.statusCode = HttpResponseCode.NOT_FOUND;
    }
}

export class Api406Exception extends Exception {
    statusCode: number;
    constructor(
        name: string,
        description: string = 'Unprocessable Entity.',
        isOperational: boolean = true
    ) {
        super(name, isOperational, description)
        this.statusCode = HttpResponseCode.UNPROCESSABLE_ENTITY;
    }
}

export class Api500Exception extends Exception {
    statusCode: number;
    constructor(
        name: string,
        description: string = 'Internal Server.',
        isOperational: boolean = false
    ) {
        super(name, isOperational, description)
        this.statusCode = HttpResponseCode.INTERNAL_SERVER;
    }
}