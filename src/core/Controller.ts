import { ModeratorFactory } from "./Moderate";

export default class Controller {
    moderator?: ModeratorFactory;
    
    constructor(moderator?: ModeratorFactory) {
        this.moderator = moderator;
    }
}