/// <reference path="../../../_all.d.ts" />
/**
 * Created by thanosp on 9/4/2017.
 */

import {Router, Request, Response, NextFunction} from 'express';
import * as express from 'express';
import {SManager} from "../../models/project/Project";
import {BuildRouter} from "./BuildRouter";

//const Projects = require('../../public/assets/data.json');

export class ProjectRouter{

    router: Router;
    /**
     * Initialize the ProjectRouter
     */
    constructor() {
        this.router = express.Router();
        //this.router.use('/:id/builds', BuildRouter);
        //this.init();
    }

    /**
     * GET all projects.
     */
    public getAll(req: Request, res: Response, next: NextFunction) {
        let prjManager = new SManager();
        //var pCust: Promise<any>;
        prjManager.getProjects()
            .then((result) => {
                console.log("I got your answer");
                console.log(result);
                res.json(result);
            });


    }

    /**
     * GET all branches using project's id
     */
    public getBranches(req: Request, res: Response, next: NextFunction) {
        let query = parseInt(req.params.id);
        //let hero = Projects.find(hero => hero.id === query);
        let prjManager = new SManager();
        console.log(query);
        console.log("haha");

        prjManager.getBranches(query)
            .then((result) => {
                res.status(200)
                    .send({
                        message: 'Success',
                        status: res.status,
                        result
                    });
                //res.json(result);
            })
            .catch((result) =>{
                res.status(404)
                    .send({
                        message: 'No branches found with the given project id.',
                        status: res.status
                    });
            });
    }


    /**
     * Take each handler, and attach to one of the Express.Router's
     * endpoints.
     */
    init() {
        this.router.get('/', this.getAll);
        //this.router.get('/:id', this.getSingleProject);
        this.router.get('/:id', this.getBranches);

    }

}

// Create the ProjectRouter, and export its configured Express.Router
//const projectRoutes = new ProjectRouter();
//projectRoutes.init();

//export default projectRoutes.router;