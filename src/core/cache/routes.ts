import RouteDefination from "../extendeds/RouteDefination";
import middleware from "../../middlewares";
import schema from "../../schema";
import UserController from "../../controllers/UserController";
const routes: RouteDefination[] = [
  {
    method: ["GET"],
    url: "/web/user/index",
    controller: UserController,
    handler: "index",
    middleware: [middleware.auth],
    schema: schema.UserRequestSchema.index,
  },
  {
    method: ["POST"],
    url: "/web/user/show/:id",
    controller: UserController,
    handler: "show",
    middleware: [middleware.auth],
  },
  {
    method: ["PUT", "PATCH"],
    url: "/web/user/store",
    controller: UserController,
    handler: "store",
    middleware: [middleware.auth],
  },
  {
    method: ["PUT", "PATCH"],
    url: "/web/user/update/:id",
    controller: UserController,
    handler: "update",
    middleware: [middleware.auth],
  },
  {
    method: ["DELETE"],
    url: "/web/user/destroy/:id",
    controller: UserController,
    handler: "destroy",
    middleware: [middleware.auth],
  },
];
export default routes;
