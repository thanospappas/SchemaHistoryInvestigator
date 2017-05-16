/**
 * Created by thanosp on 11/4/2017.
 */

import {Router, Request, Response, NextFunction} from 'express';
import * as express from 'express';
import {ApiRouter} from "./ApiRouter";
import {ReleaseController} from "../../models/db-controllers/ReleaseController";
import {ReleaseCommitRouter} from "./ReleaseCommitRouter";

export class ReleaseRouter implements ApiRouter{

    router: Router;
    releaseBasedRouters:Array<ApiRouter>;

    /**
     * Initialize the ProjectRouter
     */
    constructor() {
        this.router = express.Router({mergeParams: true});
        this.releaseBasedRouters = new Array<ApiRouter>();
    }

    /**
     * GET all projects.
     */
    public getAll(req: Request, res: Response, next: NextFunction) {
        let query = parseInt(req.params.id);

        let databaseController:ReleaseController = new ReleaseController();

        if(req.query.group_by == "tables"){
            databaseController.getReleaseTables(req.params.id)
                .then((result) => {
                    res.json(result);
                });
        }
        else if(req.query.in_range){
            databaseController.getReleaseByDateRange(req.params.id, req.query.in_range)
                .then((result) => {
                    res.json(result);
                });
        }
        else if(req.query.generate_summary == "true"){
            databaseController.generateSummary(req.params.id)
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

    getSingle(req: Request, res: Response, next: NextFunction) {
        //console.log(req.params.release_id);
        let databaseController:ReleaseController = new ReleaseController();

        databaseController.getReleaseById(req.params.release_id, req.params.id)
            .then((result) => {
                res.json(result);
            });


    }

    getPath(): string {
        return "/:id/releases";
    }

    /**
     * Take each handler, and attach to one of the Express.Router's
     * endpoints.
     */
    init() {
        this.router.get('/', this.getAll);
        this.router.get('/:release_id', this.getSingle);

        /*initialize all nested routers*/
        this.releaseBasedRouters.push(new ReleaseCommitRouter());
        for(let r of this.releaseBasedRouters){
            this.router.use(r.getPath(), r.router);
            r.init();
        }

    }

}
