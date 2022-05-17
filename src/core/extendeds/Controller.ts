import { PolicyFactory } from "@supports/Policy";

export default class Controller {
    policy?: PolicyFactory;

    constructor(policy?: PolicyFactory) {
        this.policy = policy;
    }
}