/**
 * Created by thanosp on 17/4/2017.
 */

import {Router, Request, Response, NextFunction} from 'express';
import {SManager} from "../../models/db-controllers/Project";
import {ApiRouter} from "./ApiRouter";
import {FilesAffectedController} from "../../models/db-controllers/FilesAffectedController";

export class FilesAffectedRouter implements ApiRouter{

    router: Router;
    prjManager;
    /**
     * Initialize the ProjectRouter
     */
    constructor(databaseController) {
        this.router = Router({mergeParams: true});
        this.prjManager = new FilesAffectedController(databaseController);
    }

    /**
     * GET all projects.
     */
    public getAll(req: Request, res: Response, next: NextFunction, routerObject) {
        //let query = parseInt(req.params.id);
        routerObject.prjManager.getAllData(req.params.id)
            .then((result) => {
                res.json(result);
            });

    }

    getSingle() {
        throw new Error('Method not implemented.');
    }

    getPath(): string {
        return "/:id/files_affected";
    }

    /**
     * Take each handler, and attach to one of the Express.Router's
     * endpoints.
     */
    init() {
        this.router.get('/', (req: Request, res: Response, next: NextFunction) => {
            return this.getAll(req, res, next, this);
        });

    }

}