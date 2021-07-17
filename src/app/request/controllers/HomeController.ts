import Controller from "../../../core/Controller";
import { FReplay, FRequest } from "../../../core/extendeds/RequestReplay";
import Response from "../../../core/extendeds/Response";
import { Api500Exception } from "../../../core/extendeds/Exception";

export default class HomeController extends Controller {
  constructor() {
    super();
  }

  /**
   * To index the model data.
   * @route /test
   */
  public async index(
    request: FRequest<any>,
    replay: FReplay
  ): Promise<Response<string>> {
    try {
      // ...code
      // must return response
      return Response.file("favicon.ico");
    } catch (error) {
      request.log.error(error);
      throw new Api500Exception("Error:", "Sorry, unable to process.");
    }
  }
}
