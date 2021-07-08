import RouteDefination from "../extendeds/RouteDefination";
import middleware from "../../middlewares";
import schema from "../../schema";
import UserController from "../../controllers/UserController";
const routes: RouteDefination[] = [
  {
    method: ["GET", "HEAD"],
    url: "/api/user/index",
    controller: UserController,
    handler: "index",
  },
  {
    method: ["POST"],
    url: "/api/user/show/:id",
    controller: UserController,
    handler: "show",
    schema: schema.UserRequestSchema.show,
  },
  {
    method: ["PUT", "PATCH"],
    url: "/api/user/store",
    controller: UserController,
    handler: "store",
    schema: schema.UserRequestSchema.store,
  },
  {
    method: ["PUT", "PATCH"],
    url: "/api/user/update/:id",
    controller: UserController,
    handler: "update",
    schema: schema.UserRequestSchema.update,
  },
  {
    method: ["DELETE"],
    url: "/api/user/destroy/:id",
    controller: UserController,
    handler: "destroy",
    schema: schema.UserRequestSchema.destroy,
  },
];
export default routes;
