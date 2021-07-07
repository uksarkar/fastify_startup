import Controller from "../core/Controller";
import { FastifyRequest } from "fastify";
import Response from "../core/extendeds/Response";
import { Api400Exception } from "../core/extendeds/Exception";

export default class UserController extends Controller {
  constructor(request: FastifyRequest) {
    super(request);
  }

  /**
   * To index the model data.
   * @route /api/user/index/
   * @middleware auth
   * @method POST
   * @schema UserRequestSchema.index
   */
  public async index(): Promise<Response<object>> {
    try {
      // ...code
      // must return response
      return Response.json({ hello: "world" });
    } catch (error) {
      this.request.log.error(error);
      throw new Api400Exception("So bad");
    }
  }

  /**
   * Show model data.
   * @route /api/user/show/:id
   * @middleware auth
   * @method POST
   * @schema UserRequestSchema.show
   */
  public async show(): Promise<Response<object>> {
    try {
      // ...code
      // must return response
      return Response.json({ hello: "world" });
    } catch (error) {
      this.request.log.error(error);
      throw new Api400Exception("So bad");
    }
  }

  /**
   * Store data to database.
   * @route /api/user/store/
   * @middleware auth
   * @method PUT,PATCH
   * @schema UserRequestSchema.store
   */
  public async store(): Promise<Response<object>> {
    try {
      // ...code
      // must return response
      return Response.json({ hello: "world" });
    } catch (error) {
      this.request.log.error(error);
      throw new Api400Exception("So bad");
    }
  }

  /**
   * Update model data.
   * @route /api/user/update/:id
   * @middleware auth
   * @method PUT,PATCH
   * @schema UserRequestSchema.update
   */
  public async update(): Promise<Response<object>> {
    try {
      // ...code
      // must return response
      return Response.json({ hello: "world" });
    } catch (error) {
      this.request.log.error(error);
      throw new Api400Exception("So bad");
    }
  }

  /**
   * Delete data from the database.
   * @route /api/user/destroy/:id
   * @middleware auth
   * @method DELETE
   * @schema UserRequestSchema.destroy
   */
  public async destroy(): Promise<Response<object>> {
    try {
      // ...code
      // must return response
      return Response.json({ hello: "world" });
    } catch (error) {
      this.request.log.error(error);
      throw new Api400Exception("So bad");
    }
  }
}
