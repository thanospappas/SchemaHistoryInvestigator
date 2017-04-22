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
        let prjId = parseInt(req.params.id);
        let databaseController:AuthorsController = new AuthorsController();
        let groupby = req.query.group_by;

        if(groupby == "release"){
            databaseController.getReleaseAuthors(prjId)
                .then((result) => {
                    res.json(result);
                });
        }
        else{
            databaseController.getAllData(prjId)
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
        this.router.get('/', this.getAll);
        this.router.get('/:id', this.getSingle);

    }
}