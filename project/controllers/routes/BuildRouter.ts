/**
 * Created by thanosp on 11/4/2017.
 */
/// <reference path="../../../_all.d.ts" />
/**
 * Created by thanosp on 9/4/2017.
 */

import {Router, Request, Response, NextFunction} from 'express';
import * as express from 'express';
import {SManager} from "../../models/db-controllers/Project";
import {ApiRouter} from "./ApiRouter";
import {DatabaseController} from "../../models/DatabaseController";
import {BuildController} from "../../models/db-controllers/BuildController";
import {DatabaseConnection} from "../../models/DatabaseConnection";


export class BuildRouter implements ApiRouter{
    router: Router;
    databaseController:DatabaseController;
    /**
     * Initialize the ProjectRouter
     */
    constructor(databaseController:DatabaseConnection) {
        this.router = express.Router({mergeParams: true});
        this.databaseController = new BuildController(databaseController);
    }

    /**
     * GET all projects.
     */
    public getAll(req: Request, res: Response, next: NextFunction, routerObject) {
        //let databaseController:DatabaseController = new BuildController();
        routerObject.databaseController.getAllData(req.params.id)
            .then((result) => {
                res.json(result);
            });
    }

    getSingle() {
        throw new Error('Method not implemented.');
    }

    getPath(): string {
        return "/:id/builds";
    }

    /**
     * Take each handler, and attach to one of the Express.Router's
     * endpoints.
     */
    init() {
        this.router.get('/', (req: Request, res: Response, next: NextFunction) => {
            return this.getAll(req, res, next,this);
        });

    }




}
