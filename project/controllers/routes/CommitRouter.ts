/**
 * Created by thanosp on 17/4/2017.
 */


import {Router, Request, Response, NextFunction} from 'express';
import {ApiRouter} from "./ApiRouter";
import {CommitController} from "../../models/db-controllers/CommitController";
import {DatabaseController} from "../../models/DatabaseController";


export class CommitRouter implements ApiRouter{

    router:Router;


    /**
     * Initialize the ProjectRouter
     */
    constructor(mergeParameters:boolean){
        this.router = Router({mergeParams: mergeParameters});

    }

    getPath(): string {
        return "/:id/commits";
    }

    /**
     * GET all commits.
     */
    public getAll(req: Request, res: Response, next: NextFunction) {
        let databaseController:DatabaseController = new CommitController();

        databaseController.getAllData(req.params.id)
            .then((result) => {
                res.json(result);
            });

    }

    public getSingle(){

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