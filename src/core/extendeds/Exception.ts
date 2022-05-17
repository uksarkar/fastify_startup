import HttpResponseCode from "../constants/HttpResponseCode";

export default class Exception extends Error {
    isOperational: boolean;

    constructor(
        name: string,
        isOperational: boolean,
        description: string,
    ) {
        super(description);

        Object.setPrototypeOf(this, new.target.prototype);
        this.name = name;
        this.isOperational = isOperational;
        Error.captureStackTrace(this);
    }
}

export class Api400Exception extends Exception {
    statusCode: number;
    constructor(
        name: string,
        description = "Bad Request",
        isOperational = true,
    ) {
        super(name, isOperational, description);
        this.statusCode = HttpResponseCode.BAD_REQUEST;
    }
}

export class Api401Exception extends Exception {
    statusCode: number;
    constructor(
        name: string,
        description = "Unauthorized",
        isOperational = true,
    ) {
        super(name, isOperational, description);
        this.statusCode = HttpResponseCode.UNAUTHORIZED;
    }
}

export class Api403Exception extends Exception {
    statusCode: number;
    constructor(
        name: string,
        description = "Forbidden",
        isOperational = true,
    ) {
        super(name, isOperational, description);
        this.statusCode = HttpResponseCode.FORBIDDEN;
    }
}

export class Api404Exception extends Exception {
    statusCode: number;
    constructor(
        name: string,
        description = "Not found.",
        isOperational = true,
    ) {
        super(name, isOperational, description);
        this.statusCode = HttpResponseCode.NOT_FOUND;
    }
}

export class Api406Exception extends Exception {
    statusCode: number;
    constructor(
        name: string,
        description = "Unprocessable Entity.",
        isOperational = true,
    ) {
        super(name, isOperational, description);
        this.statusCode = HttpResponseCode.UNPROCURABLE_ENTITY;
    }
}

export class Api500Exception extends Exception {
    statusCode: number;
    constructor(
        name: string,
        description = "Internal Server.",
        isOperational = false,
    ) {
        super(name, isOperational, description);
        this.statusCode = HttpResponseCode.INTERNAL_SERVER;
    }
}