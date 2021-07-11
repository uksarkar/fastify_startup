import { FastifyRequest } from "fastify";
import Moderate from "../../core/Moderate";

export default class UserModerator extends Moderate {
  constructor(request: FastifyRequest) {
    super(request);
  }
  /**
   * Method name should be the same as you want to apply
   * to the corresponding Controller method.
   *
   * returning `true` will be considered as valid
   * otherwise return `false` or rejection message.
   * @returns boolean | string
   */
  index(): boolean | string {
    return this.proceed();
  }
  /**
   * Method name should be the same as you want to apply
   * to the corresponding Controller method.
   *
   * returning `true` will be considered as valid
   * otherwise return `false` or rejection message.
   * @returns boolean | string
   */
  show(): boolean | string {
    return this.proceed();
  }
  /**
   * Method name should be the same as you want to apply
   * to the corresponding Controller method.
   *
   * returning `true` will be considered as valid
   * otherwise return `false` or rejection message.
   * @returns boolean | string
   */
  store(): boolean | string {
    return this.proceed();
  }
  /**
   * Method name should be the same as you want to apply
   * to the corresponding Controller method.
   *
   * returning `true` will be considered as valid
   * otherwise return `false` or rejection message.
   * @returns boolean | string
   */
  update(): boolean | string {
    return this.proceed();
  }
  /**
   * Method name should be the same as you want to apply
   * to the corresponding Controller method.
   *
   * returning `true` will be considered as valid
   * otherwise return `false` or rejection message.
   * @returns boolean | string
   */
  destroy(): boolean | string {
    return this.reject("The moderator `src/moderates/UserModerator.ts > destroy()` prevented this request. Set `return this.proceed();` to see the magic.");
  }
}
