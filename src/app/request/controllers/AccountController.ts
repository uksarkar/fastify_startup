import Controller from "../../../core/Controller";
import { FReplay, FRequest } from "../../../core/extendeds/RequestReplay";
import Response from "../../../core/extendeds/Response";
import { Api500Exception } from "../../../core/extendeds/Exception";
import AccountPolicy from "../../policies/AccountPolicy";

export default class AccountController extends Controller {
  constructor() {
    super(AccountPolicy);
  }

  /**
   * To index the model data.
   * @route /api/account/index
   * @middleware auth
   * @method POST
   * @schema AccountRequestSchema.index
   */
  public async index(
    request: FRequest<any>,
    replay: FReplay
  ): Promise<Response<object>> {
    try {
      // ...code
      // must return response
      return Response.json({ hello: "world" });
    } catch (error) {
      request.log.error(error);
      throw new Api500Exception("Error:", "Sorry, unable to proccess.");
    }
  }

  /**
   * Show model data.
   * @route /api/account/show/:id
   * @middleware auth
   * @method POST
   * @schema AccountRequestSchema.show
   */
  public async show(
    request: FRequest<any>,
    replay: FReplay
  ): Promise<Response<object>> {
    try {
      // ...code
      // must return response
      return Response.json({ hello: "world" });
    } catch (error) {
      request.log.error(error);
      throw new Api500Exception("Error:", "Sorry, unable to proccess.");
    }
  }

  /**
   * Store data to database.
   * @route /api/account/store
   * @middleware auth
   * @method PUT,PATCH
   * @schema AccountRequestSchema.store
   */
  public async store(
    request: FRequest<any>,
    replay: FReplay
  ): Promise<Response<object>> {
    try {
      // ...code
      // must return response
      return Response.json({ hello: "world" });
    } catch (error) {
      request.log.error(error);
      throw new Api500Exception("Error:", "Sorry, unable to proccess.");
    }
  }

  /**
   * Update model data.
   * @route /api/account/update/:id
   * @middleware auth
   * @method PUT,PATCH
   * @schema AccountRequestSchema.update
   */
  public async update(
    request: FRequest<any>,
    replay: FReplay
  ): Promise<Response<object>> {
    try {
      // ...code
      // must return response
      return Response.json({ hello: "world" });
    } catch (error) {
      request.log.error(error);
      throw new Api500Exception("Error:", "Sorry, unable to proccess.");
    }
  }

  /**
   * Delete data from the database.
   * @route /api/account/destroy/:id
   * @middleware auth
   * @method DELETE
   * @schema AccountRequestSchema.destroy
   */
  public async destroy(
    request: FRequest<any>,
    replay: FReplay
  ): Promise<Response<object>> {
    try {
      // ...code
      // must return response
      return Response.json({ hello: "world" });
    } catch (error) {
      request.log.error(error);
      throw new Api500Exception("Error:", "Sorry, unable to proccess.");
    }
  }
}
