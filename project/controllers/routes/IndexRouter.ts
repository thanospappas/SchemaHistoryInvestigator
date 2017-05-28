/**
 * Created by thanosp on 12/4/2017.
 */

import {Router, Request, Response, NextFunction} from 'express';
import * as express from 'express';
import {SManager} from "../../models/db-controllers/Project";

export class IndexRouter{
    irouter: Router;
    /**
     * Initialize the ProjectRouter
     */
    constructor() {
        this.irouter = Router();
    }

    /**
     * Render index.
     */
    public renderIndex(req: Request, res: Response, next: NextFunction) {
        res.render('index.html');
    }

    /**
     * Take each handler, and attach to one of the Express.Router's
     * endpoints.
     */
    init() {
        this.irouter.get('/', this.renderIndex);
    }
}