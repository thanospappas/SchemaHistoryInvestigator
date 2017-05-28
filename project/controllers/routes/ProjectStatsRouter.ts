/**
 * Created by thanosp on 18/4/2017.
 */


import {Router, Request, Response, NextFunction} from 'express';
import * as express from 'express';
import {ApiRouter} from "./ApiRouter";
import {DatabaseController} from "../../models/DatabaseController";
import {IssueController} from "../../models/db-controllers/IssueController";
import {AuthorsController} from "../../models/db-controllers/ProjectStatsController";


export class AuthorsRouter implements ApiRouter{
    router: Router;
    databaseController:AuthorsController;

    /**
     * Initialize the ProjectRouter
     */
    constructor(databaseController) {
        this.router = express.Router({mergeParams: true});
        this.databaseController = new AuthorsController(databaseController);
    }

    /**
     * GET all builds.
     */
    public getAll(req: Request, res: Response, next: NextFunction, routerObject) {
        let prjId = parseInt(req.params.id);

        let groupby = req.query.group_by;

        if(groupby == "release"){
            routerObject.databaseController.getReleaseAuthors(prjId)
                .then((result) => {
                    res.json(result);
                });
        }
        else{
            routerObject.databaseController.getAllData(prjId)
                .then((result) => {
                    res.json(result);
                });
        }

    }

    getSingle() {
        throw new Error('Method not implemented.');
    }

    getPath(): string {
        return "/:id/authors";
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

    }
}