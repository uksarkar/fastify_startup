import IResponseCode from "../types/IResponseCode";

interface IRCode {
    OK: IResponseCode;
    CREATED: IResponseCode;
    BAD_REQUEST: IResponseCode;
    UNAUTHORIZED: IResponseCode;
    NOT_FOUND: IResponseCode;
    UNPROCESSABLE_ENTITY: IResponseCode;
    INTERNAL_SERVER: IResponseCode;
}

const cods: IRCode = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    NOT_FOUND: 404,
    UNPROCESSABLE_ENTITY: 406,
    INTERNAL_SERVER: 500,
}

export default cods;