/**
 * Created by thanosp on 18/4/2017.
 */


import {Router, Request, Response, NextFunction} from 'express';
import {ApiRouter} from "./ApiRouter";
import {CommitController} from "../../models/db-controllers/CommitController";
import {DatabaseController} from "../../models/DatabaseController";


export class ReleaseCommitRouter implements ApiRouter {

    router: Router;
    databaseController: CommitController;

    /**
     * Initialize the ProjectRouter
     */
    constructor(databaseController) {
        this.router = Router({mergeParams: true});
        this.databaseController= new CommitController(databaseController);
    }

    getPath(): string {
        return "/:release_id/commits";
    }

    /**
     * GET all commits.
     */
    public getAll(req: Request, res: Response, next: NextFunction, routerObject) {

        let projectID = parseInt(req.params.id);
        let releaseID = parseInt(req.params.release_id);

        routerObject.databaseController.getCommitsFromRelease(projectID,releaseID)
            .then((result) => {
                res.json(result);
            });

    }

    public getSingle() {

    }

    /**
     * Take each handler, and attach to one of the Express.Router's
     * endpoints.
     */
    init() {
        this.router.get('/', (req: Request, res: Response, next: NextFunction) => {
            this.getAll(req, res, next, this);
        });
        this.router.get('/:id', this.getSingle);
    }

}