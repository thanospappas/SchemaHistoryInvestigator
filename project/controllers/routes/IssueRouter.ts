/**
 * Created by thanosp on 18/4/2017.
 */

import {Router, Request, Response, NextFunction} from 'express';
import * as express from 'express';
import {ApiRouter} from "./ApiRouter";
import {DatabaseController} from "../../models/DatabaseController";
import {IssueController} from "../../models/db-controllers/IssueController";


export class IssueRouter implements ApiRouter{
    router: Router;

    /**
     * Initialize the ProjectRouter
     */
    constructor() {
        this.router = express.Router({mergeParams: true});
    }

    /**
     * GET all builds.
     */
    public getAll(req: Request, res: Response, next: NextFunction) {
        //let query = parseInt(req.params.id);
        let databaseController:DatabaseController = new IssueController();
        databaseController.getAllData(req.params.id)
            .then((result) => {
                res.json(result);
            });
    }

    increaseUsefulness(req: Request, res: Response, next: NextFunction){
        let databaseController:IssueController = new IssueController();
        databaseController.increaseUsefulnessScore(req.params.id)
            .then((result) => {
                res.json(result);
            });
    }

    getSingle() {
        throw new Error('Method not implemented.');
    }

    getPath(): string {
        return "/:id/issues";
    }

    /**
     * Take each handler, and attach to one of the Express.Router's
     * endpoints.
     */
    init() {
        this.router.get('/', this.getAll);
        this.router.get('/:id', this.getSingle);
        this.router.put('/:id', this.increaseUsefulness);

    }
}
