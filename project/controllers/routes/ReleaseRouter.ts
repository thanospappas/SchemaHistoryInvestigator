/**
 * Created by thanosp on 11/4/2017.
 */

import {Router, Request, Response, NextFunction} from 'express';
import * as Promise from "bluebird";
import * as express from 'express';
import {SManager} from "../../models/project/Project";
import {ReleaseManager} from "../../models/project/ReleaseManager";

export class ReleaseRouter{

    rrouter: Router;
    /**
     * Initialize the ProjectRouter
     */
    constructor() {
        this.rrouter = express.Router({mergeParams: true});
    }



    /**
     * GET all projects.
     */
    public getAll1(req: Request, res: Response, next: NextFunction) {
        let query = parseInt(req.params.id);

        let releaseMng = new ReleaseManager();
        releaseMng.getBranchId(req.params.id)
            .then((res) => {
                return releaseMng.getReleases(res[0].BR_ID);
            })
            .then((result) => {
                //console.log("I got your answer");
                //console.log(result);
                res.json(result);
            });

        //res.send('hello items from user you' + req.params.id);
    }

    /**
     * Take each handler, and attach to one of the Express.Router's
     * endpoints.
     */
    init() {
        this.rrouter.get('/', this.getAll1);
        //this.router.get('/:id', this.getSingleProject);
        //this.router.get('/buils', this.getBranches);

    }

}
