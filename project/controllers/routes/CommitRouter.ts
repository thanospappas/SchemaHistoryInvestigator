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
        let databaseController:CommitController = new CommitController();

        if(req.query.generate_summary == "true"){
            databaseController.generateSummary(req.params.id)
                .then((result) => {
                    res.json(result);
                });
        }
        else if(req.query.in_range){
            databaseController.getCommitsInRange(req.params.id, req.query.in_range)
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

    public getSingle(req: Request, res: Response, next: NextFunction){
        let databaseController:CommitController = new CommitController();

        if(req.query.belongs_to == "true"){
            databaseController.getCommitRelease(req.params.commit_id)
                .then((result) => {
                console.log(result);
                    res.json(result);
                });
        }
        else if(req.query.tables_affected == "true"){
            databaseController.getTablesChanged(req.params.commit_id)
                .then((result) => {
                    res.json(result);
                });
        }
        else if(req.query.build_info == "true"){
            databaseController.getBuildInfo(req.params.commit_id)
                .then((result) => {
                    res.json(result);
                });
        }
        else if(req.query.issues_info == "true"){
            databaseController.getIssues(req.params.commit_id)
                .then((result) => {
                    res.json(result);
                });
        }
        else{
            databaseController.getSingle(req.params.id,req.params.commit_id)
                .then((result) => {
                    res.json(result);
                });
        }

    }

    updatedSummary(req: Request, res: Response, next: NextFunction){

        let databaseController:CommitController = new CommitController();
        databaseController.storeSummary(req.params.commit_id,req.body.commitSummary)
            .then((result) => {
                res.json(result);
            });

        //res.json("Success");
    }


    /**
     * Take each handler, and attach to one of the Express.Router's
     * endpoints.
     */
    init() {
        this.router.get('/', this.getAll);
        this.router.get('/:commit_id', this.getSingle);
        this.router.put('/:commit_id',this.updatedSummary);
    }

}