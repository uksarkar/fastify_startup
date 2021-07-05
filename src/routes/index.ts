import TestController from "../controllers/TestController";
import RouteDefination from "core/extendeds/RouteDefination";

const routes: RouteDefination[] = [
    {
        method: ["GET"],
        url: "/api/user",
        controller: TestController,
        handler: "printHello"
    }
]

export default routes;