/**
 * Created by thanosp on 17/4/2017.
 */


import {Router, Request, Response, NextFunction} from 'express';
import {ApiRouter} from "./ApiRouter";
import {CommitController} from "../../models/db-controllers/CommitController";
import {DatabaseController} from "../../models/DatabaseController";


export class CommitRouter implements ApiRouter{

    router:Router;
    databaseController:CommitController;

    /**
     * Initialize the ProjectRouter
     */
    constructor(mergeParameters:boolean,databaseController){
        this.router = Router({mergeParams: mergeParameters});
        this.databaseController = new CommitController(databaseController);

    }

    getPath(): string {
        return "/:id/commits";
    }

    /**
     * GET all commits.
     */
    public getAll(req: Request, res: Response, next: NextFunction, routerObject) {

        if(req.query.generate_summary == "true"){
            routerObject.databaseController.generateSummary(req.params.id)
                .then((result) => {
                    res.json(result);
                });
        }
        else if(req.query.in_range){
            routerObject.databaseController.getCommitsInRange(req.params.id, req.query.in_range)
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

    public getSingle(req: Request, res: Response, next: NextFunction,routerObject){
        if(req.query.belongs_to == "true"){
            routerObject.databaseController.getCommitRelease(req.params.id, req.params.commit_id)
                .then((result) => {
                //console.log(result);
                    res.json(result);
                });
        }
        else if(req.query.tables_affected == "true"){
            routerObject.databaseController.getTablesChanged(req.params.id, req.params.commit_id)
                .then((result) => {
                    res.json(result);
                });
        }
        else if(req.query.build_info == "true"){
            routerObject.databaseController.getBuildInfo(req.params.id, req.params.commit_id)
                .then((result) => {
                    res.json(result);
                });
        }
        else if(req.query.issues_info == "true"){
            routerObject.databaseController.getIssues(req.params.id, req.params.commit_id)
                .then((result) => {
                    res.json(result);
                });
        }
        else{
            routerObject.databaseController.getSingle(req.params.id,req.params.commit_id)
                .then((result) => {
                    res.json(result);
                });
        }
    }

    updatedSummary(req: Request, res: Response, next: NextFunction,routerObject){
        routerObject.databaseController.storeSummary(req.params.id, req.params.commit_id,req.body.commitSummary)
            .then((result) => {
                res.json(result);
            });
    }

    /**
     * Take each handler, and attach to one of the Express.Router's
     * endpoints.
     */
    init() {
        this.router.get('/', (req: Request, res: Response, next: NextFunction) => {
            return this.getAll(req, res, next, this);
        });
        this.router.get('/:commit_id', (req: Request, res: Response, next: NextFunction) => {
            return this.getSingle(req, res, next, this);
        });
        this.router.put('/:commit_id', (req: Request, res: Response, next: NextFunction) => {
            return this.updatedSummary(req, res, next, this);
        });
    }

}