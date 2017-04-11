/**
 * Created by thanosp on 11/4/2017.
 */
/// <reference path="../../../_all.d.ts" />
/**
 * Created by thanosp on 9/4/2017.
 */

import {Router, Request, Response, NextFunction} from 'express';
import * as express from 'express';
import {SManager} from "../../models/project/Project";

//const Projects = require('../../public/assets/data.json');

export class BuildRouter{

    brouter: Router;
    /**
     * Initialize the ProjectRouter
     */
    constructor() {
        this.brouter = express.Router({mergeParams: true});
    }

    /**
     * GET all projects.
     */
    public getAll1(req: Request, res: Response, next: NextFunction) {
        let query = parseInt(req.params.id);

        let prjManager = new SManager();
        //var pCust: Promise<any>;
        prjManager.getBuilds(req.params.id)
            .then((result) => {
                res.json(result);
            });

        //res.send('hello items from user you' + req.params.id);
    }

    /**
     * Take each handler, and attach to one of the Express.Router's
     * endpoints.
     */
    init() {
        console.log("iai");
        this.brouter.get('/', this.getAll1);
        //this.router.get('/:id', this.getSingleProject);
        //this.router.get('/buils', this.getBranches);

    }

}

// Create the ProjectRouter, and export its configured Express.Router
//const buildRoutes = new BuildRouter();
//buildRoutes.init();

//export default buildRoutes.brouter;