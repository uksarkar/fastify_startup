import { PolicyFactory } from "./Policy";

export default class Controller {
    policy?: PolicyFactory;
    
    constructor(policy?: PolicyFactory) {
        this.policy = policy;
    }
}