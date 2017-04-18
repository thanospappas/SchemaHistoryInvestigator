/**
 * Created by thanosp on 18/4/2017.
 */


import {Router, Request, Response, NextFunction} from 'express';
import {ApiRouter} from "./ApiRouter";
import {CommitController} from "../../models/db-controllers/CommitController";
import {DatabaseController} from "../../models/DatabaseController";
import {TransitionController} from "../../models/db-controllers/TransitionController";
import {ReleaseController} from "../../models/db-controllers/ReleaseController";


export class TransitionRouter implements ApiRouter{

    router:Router;


    /**
     * Initialize the ProjectRouter
     */
    constructor(){
        this.router = Router({mergeParams: true});

    }

    getPath(): string {
        return "/:id/transitions";
    }

    /**
     * GET all commits.
     */
    public getAll(req: Request, res: Response, next: NextFunction) {

        let query = parseInt(req.params.id);
        console.log();
        let databaseController:TransitionController = new TransitionController();
        if(req.query.release_id){
            databaseController.getTransitionsFromRelease(req.params.id,req.query.release_id)
                .then((result) => {
                    res.json(result);
                });
        }
        else{

            databaseController.getAllData(req.params.id)
                .then((result) => {
                    res.json(result);
                });
        }

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