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
    databaseController:IssueController;
    /**
     * Initialize the ProjectRouter
     */
    constructor(databaseController) {
        this.router = express.Router({mergeParams: true});
        this.databaseController = new IssueController(databaseController);
    }

    /**
     * GET all builds.
     */
    public getAll(req: Request, res: Response, next: NextFunction, routerObject) {
        routerObject.databaseController.getAllData(req.params.id)
            .then((result) => {
                res.json(result);
            });
    }

    increaseUsefulness(req: Request, res: Response, next: NextFunction, routerObject){
        //let databaseController:IssueController = new IssueController();
        routerObject.databaseController.increaseUsefulnessScore(req.params.id)
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
        this.router.get('/', (req: Request, res: Response, next: NextFunction) => {
            return this.getAll(req, res, next, this);
        });
        this.router.get('/:id', (req: Request, res: Response, next: NextFunction) => {
            return this.getSingle();
        });
        this.router.put('/:id', (req: Request, res: Response, next: NextFunction) => {
            return this.increaseUsefulness(req, res, next, this);
        });

    }
}
