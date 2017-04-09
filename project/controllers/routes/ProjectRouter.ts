/// <reference path="../../../_all.d.ts" />
/**
 * Created by thanosp on 9/4/2017.
 */

import {Router, Request, Response, NextFunction} from 'express';
const Projects = require('../../public/assets/data.json');

export class ProjectRouter {
    router: Router

    /**
     * Initialize the ProjectRouter
     */
    constructor() {
        this.router = Router();
        this.init();
    }

    /**
     * GET all projects.
     */
    public getAll(req: Request, res: Response, next: NextFunction) {
        res.send(Projects);
    }

    /**
     * Take each handler, and attach to one of the Express.Router's
     * endpoints.
     */
    init() {
        this.router.get('/', this.getAll);
    }

}

// Create the ProjectRouter, and export its configured Express.Router
const projectRoutes = new ProjectRouter();
projectRoutes.init();

export default projectRoutes.router;