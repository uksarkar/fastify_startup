import Policy from "./Policy";

export default class Controller {
    policy?: Policy;
    constructor(policy?: Policy) {
        this.policy = policy;
    }
}