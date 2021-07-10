import { User } from "models/User";
import Schema, { SchemaItem } from "../core/extendeds/Schema";

const required = ['first_name', 'last_name', 'username', 'age', 'email'];
const commonUserSchema: SchemaItem = {
  type: "object",
  properties: {
    first_name: { type: 'string' },
    last_name: { type: 'string' },
    password: { type: 'string', minLength: 6 },
    username: { type: 'string', minLength: 4 },
    age: { type: 'number' },
    avatar: { type: ['string', 'null'] },
    email: { type: 'string' }
  },
};

const index: Schema = {
  querystring: {
    type: ["object", "null"],
    properties: {
      limit: { type: 'number' },
      page: { type: 'number' },
      q: { type: 'string' }
    }
  }
};
const show: Schema = {
  params: {
    type: "object",
    properties: {
      id: { type: 'string' }
    },
    required: ['id'],
  }
};
const store: Schema = {
  body: { ...commonUserSchema, required: [...required, 'password'] },
};
const update: Schema = {
  body: { ...commonUserSchema, required },
  params: {
    type: "object",
    properties: {
      id: { type: 'string' }
    },
    required: ['id']
  }
};
const destroy: Schema = {
  params: {
    type: "object",
    properties: {
      id: { type: 'string' }
    }
  }
};
export default { index, show, store, update, destroy };

// recieved request's interface
export interface UserIndexRequest {
  Querystring: {
    limit?: number;
    page?: number;
    q?: string;
  }
}

export interface UserShowRequest {
  Params: {
    id: string;
  }
}

export interface UserCreateRequest {
  Body: User
}

export interface UserUpdateRequest {
  Body: User;
  Params: {
    id: string;
  }
}

export interface UserDeleteRequest {
  Params: {
    id: string;
  }
}
