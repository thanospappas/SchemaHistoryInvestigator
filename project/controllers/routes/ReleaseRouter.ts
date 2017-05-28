/**
 * Created by thanosp on 11/4/2017.
 */

import {Router, Request, Response, NextFunction} from 'express';
import * as express from 'express';
import {ApiRouter} from "./ApiRouter";
import {ReleaseController} from "../../models/db-controllers/ReleaseController";
import {ReleaseCommitRouter} from "./ReleaseCommitRouter";
import {DatabaseConnection} from "../../models/DatabaseConnection";

export class ReleaseRouter implements ApiRouter{

    router: Router;
    releaseBasedRouters:Array<ApiRouter>;
    databaseController:ReleaseController;
    dbController:DatabaseConnection;

    /**
     * Initialize the ProjectRouter
     */
    constructor(databaseController) {
        this.router = express.Router({mergeParams: true});
        this.releaseBasedRouters = new Array<ApiRouter>();
        this.databaseController = new ReleaseController(databaseController);
        this.dbController = databaseController;
    }

    /**
     * GET all projects.
     */
    public getAll(req: Request, res: Response, next: NextFunction, routerObject) {
        let query = parseInt(req.params.id);

        if(req.query.group_by == "tables"){
            routerObject.databaseController.getReleaseTables(req.params.id)
                .then((result) => {
                    res.json(result);
                });
        }
        else if(req.query.in_range){
            routerObject.databaseController.getReleaseByDateRange(req.params.id, req.query.in_range)
                .then((result) => {
                    res.json(result);
                });
        }
        else if(req.query.generate_summary == "true"){
            routerObject.databaseController.generateSummary(req.params.id)
                .then((result) => {
                    res.json(result);
                });
        }
        else{
            routerObject.databaseController.getAllData(req.params.id)
                .then((result) => {
                    res.json(result);
                });
        }

    }

    getSingle(req: Request, res: Response, next: NextFunction, routerObject) {
       routerObject.databaseController.getReleaseById(req.params.release_id, req.params.id)
            .then((result) => {
                res.json(result);
            });
    }

    updatedSummary(req: Request, res: Response, next: NextFunction, routerObject){
        //let databaseController:ReleaseController = new ReleaseController();
        //console.log(req.body.commitSummary);
        routerObject.databaseController.storeSummary(req.params.id, req.params.release_id,req.body.commitSummary)
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
        this.router.get('/', (req: Request, res: Response, next: NextFunction) => {
            return this.getAll(req, res, next, this);
        });
        this.router.get('/:release_id', (req: Request, res: Response, next: NextFunction) => {
            return this.getSingle(req, res, next, this);
        });
        this.router.put('/:release_id',(req: Request, res: Response, next: NextFunction) => {
            return this.updatedSummary(req, res, next, this);
        });
        /*initialize all nested routers*/
        this.releaseBasedRouters.push(new ReleaseCommitRouter(this.dbController));
        for(let r of this.releaseBasedRouters){
            this.router.use(r.getPath(), r.router);
            r.init();
        }

    }

}
