import Controller from "../../../core/Controller";
import { FReplay, FRequest } from "../../../core/extendeds/RequestReplay";
import Response from "../../../core/extendeds/Response";
import { Api500Exception } from "../../../core/extendeds/Exception";
import UserModerator from "../../moderators/UserModerator";
import User from "../../models/User";
import {
  UserCreateRequest,
  UserDeleteRequest,
  UserIndexRequest,
  UserShowRequest,
  UserUpdateRequest
} from "../schema/UserRequestSchema";
import Notification from "../../../core/extendeds/Notification";
import NewUserRegisterNotification from "../../notifications/NewUserRegisterNotification";

export default class UserController extends Controller {
  constructor() {
    super(UserModerator);
  }

  /**
   * To index the model data.
   * @route /api/user/index
   * @method POST
   * @schema UserRequestSchema.index
   */
  public async index(
    request: FRequest<UserIndexRequest>,
    replay: FReplay
  ): Promise<Response<object>> {
    try {
      const { limit = 10, page = 1, q } = request.query;
      const users = await User.find({}).skip(limit * (page - 1)).limit(limit);
      const total = await User.estimatedDocumentCount();
      // must return response
      return Response.json({users, limit, page, q, total}).msg("Users loaded!");
    } catch (error) {
      request.log.error(error);
      throw new Api500Exception("Request:", "Unable to load users!");
    }
  }

  /**
   * Show model data.
   * @route /api/user/show/:id
   * @method POST
   * @schema UserRequestSchema.show
   */
  public async show(
    request: FRequest<UserShowRequest>,
    replay: FReplay
  ): Promise<Response<object | null>> {
    try {
      const id = request.params.id;
      const user = await User.findById(id);
      // must return response
      return user ? Response.json(user).msg("User found!") : Response.json({}).code(404).msg("User not found!");
    } catch (error) {
      request.log.error(error);
      throw new Api500Exception("Error:", "Sorry, unable to process.");
    }
  }

  /**
   * Store data to database.
   * @route /api/user/store
   * @method PUT,PATCH
   * @schema UserRequestSchema.store
   */
  public async store(
    request: FRequest<UserCreateRequest>,
    replay: FReplay
  ): Promise<Response<object>> {
    try {
      const user = new User(request.body);
      const saved = await user.save();

      // must return response
      return Response.json(saved).code(201).msg("User created!");
    } catch (error) {
      request.log.error(error);
      throw new Api500Exception("Error:", "Sorry, unable to process.");
    }
  }

  /**
   * Update model data.
   * @route /api/user/update/:id
   * @method PUT,PATCH
   * @schema UserRequestSchema.update
   */
  public async update(
    request: FRequest<UserUpdateRequest>,
    replay: FReplay
  ): Promise<Response<object | null>> {
    try {
      const user = await User.findByIdAndUpdate(request.params.id, request.body, { new: true });
      // must return response
      return user ? Response.json(user).code(201).msg("User updated") : Response.json(null).code(404).msg("User Not Found!");
    } catch (error) {
      request.log.error(error);
      throw new Api500Exception("Error:", "Sorry, unable to process.");
    }
  }

  /**
   * Delete data from the database.
   * @route /api/user/destroy/:id
   * @method DELETE
   * @schema UserRequestSchema.destroy
   */
  public async destroy(
    request: FRequest<UserDeleteRequest>,
    replay: FReplay
  ): Promise<Response<object | null>> {
    try {
      const user = await User.findByIdAndDelete(request.params.id);
      // must return response
      return user ? Response.json(user).msg("User deleted") : Response.json(null).msg("User Not Found").code(404);
    } catch (error) {
      request.log.error(error);
      throw new Api500Exception("Error:", "Sorry, unable to process.");
    }
  }
}
