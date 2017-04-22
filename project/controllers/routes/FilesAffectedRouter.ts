/**
 * Created by thanosp on 17/4/2017.
 */

import {Router, Request, Response, NextFunction} from 'express';
import {SManager} from "../../models/project/Project";
import {ApiRouter} from "./ApiRouter";

export class FilesAffectedRouter implements ApiRouter{

    router: Router;
    /**
     * Initialize the ProjectRouter
     */
    constructor() {
        this.router = Router({mergeParams: true});
    }

    /**
     * GET all projects.
     */
    public getAll(req: Request, res: Response, next: NextFunction) {
        //let query = parseInt(req.params.id);
        let prjManager = new SManager();

        prjManager.getFilesAffected(req.params.id)
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
        this.router.get('/', this.getAll);

    }

}