/// <reference path="../../../_all.d.ts" />
/**
 * Created by thanosp on 9/4/2017.
 */

import {Router, Request, Response, NextFunction} from 'express';
import * as express from 'express';
import {SManager} from "../../models/db-controllers/Project";
import {BuildRouter} from "./BuildRouter";
import {ApiRouter} from "./ApiRouter";

//const Projects = require('../../public/assets/data.json');

export class ProjectRouter{

    router: Router;
    prjManager;

    /**
     * Initialize the ProjectRouter
     */
    constructor(databaseController) {
        this.router = express.Router();
        this.prjManager = new SManager(databaseController);
    }

    /**
     * GET all projects.
     */
    public getAll(req: Request, res: Response, next: NextFunction, thisObject) {
        thisObject.prjManager.getProjects()
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
        this.router.get('/', (req: Request, res: Response, next: NextFunction) => {
            return this.getAll(req, res, next, this);
        });
    }

}
