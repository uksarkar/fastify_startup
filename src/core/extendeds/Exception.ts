import HttpResponseCode from "../constants/HttpResponseCode";

export default class Exception extends Error {
    statusCode: number;
    isOperational: boolean;

    constructor(
        name: string,
        statusCode: number,
        isOperational: boolean,
        description: string,
    ) {
        super(description)

        Object.setPrototypeOf(this, new.target.prototype)
        this.name = name
        this.statusCode = statusCode
        this.isOperational = isOperational
        Error.captureStackTrace(this)
    }
}

export class Api400Exception extends Exception {
    constructor(
        name: string,
        statusCode: number = HttpResponseCode.BAD_REQUEST,
        description: string = 'Bad Request',
        isOperational: boolean = true
    ) {
        super(name, statusCode, isOperational, description)
    }
}

export class Api401Exception extends Exception {
    constructor(
        name: string,
        statusCode: number = HttpResponseCode.UNAUTHORIZED,
        description: string = 'Unauthorized',
        isOperational: boolean = true
    ) {
        super(name, statusCode, isOperational, description)
    }
}

export class Api404Exception extends Exception {
    constructor(
        name: string,
        statusCode: number = HttpResponseCode.NOT_FOUND,
        description: string = 'Not found.',
        isOperational: boolean = true
    ) {
        super(name, statusCode, isOperational, description)
    }
}

export class Api406Exception extends Exception {
    constructor(
        name: string,
        statusCode: number = HttpResponseCode.UNPROCESSABLE_ENTITY,
        description: string = 'Unprocessable Entity.',
        isOperational: boolean = true
    ) {
        super(name, statusCode, isOperational, description)
    }
}

export class Api500Exception extends Exception {
    constructor(
        name: string,
        statusCode: number = HttpResponseCode.INTERNAL_SERVER,
        description: string = 'Internal Server.',
        isOperational: boolean = false
    ) {
        super(name, statusCode, isOperational, description)
    }
}