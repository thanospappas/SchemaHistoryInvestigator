/**
 * Created by thanosp on 18/4/2017.
 */


import {Router, Request, Response, NextFunction} from 'express';
import {ApiRouter} from "./ApiRouter";
import {CommitController} from "../../models/db-controllers/CommitController";
import {DatabaseController} from "../../models/DatabaseController";


export class ReleaseCommitRouter implements ApiRouter {

    router: Router;


    /**
     * Initialize the ProjectRouter
     */
    constructor() {
        this.router = Router({mergeParams: true});

    }

    getPath(): string {
        return "/:release_id/commits";
    }

    /**
     * GET all commits.
     */
    public getAll(req: Request, res: Response, next: NextFunction) {
        let databaseController: CommitController = new CommitController();
        let projectID = parseInt(req.params.id);
        let releaseID = parseInt(req.params.release_id);

        databaseController.getCommitsFromRelease(projectID,releaseID)
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
        this.router.get('/', this.getAll);
        this.router.get('/:id', this.getSingle);
    }

}