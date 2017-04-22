/// <reference path="../../../_all.d.ts" />
/**
 * Created by thanosp on 9/4/2017.
 */

import {Router, Request, Response, NextFunction} from 'express';
import * as express from 'express';
import {SManager} from "../../models/project/Project";
import {BuildRouter} from "./BuildRouter";
import {ApiRouter} from "./ApiRouter";

//const Projects = require('../../public/assets/data.json');

export class ProjectRouter implements ApiRouter{

    router: Router;
    /**
     * Initialize the ProjectRouter
     */
    constructor() {
        this.router = express.Router();
    }

    /**
     * GET all projects.
     */
    public getAll(req: Request, res: Response, next: NextFunction) {
        let prjManager = new SManager();

        prjManager.getProjects()
            .then((result) => {
                res.json(result);
            });

    }

    getSingle() {
        throw new Error('Method not implemented.');
    }

    getPath(): string {
        return "/api/v1/projects";
    }


    /**
     * Take each handler, and attach to one of the Express.Router's
     * endpoints.
     */
    init() {
        this.router.get('/', this.getAll);

    }

}
