import {Router, Request, Response, NextFunction} from 'express';
/**
 * Created by thanosp on 13/5/2017.
 */

export class AdminDashboardRouter{
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
    public renderAdminDashboard(req: Request, res: Response, next: NextFunction) {
        res.render('admin.html');
    }

    /**
     * Take each handler, and attach to one of the Express.Router's
     * endpoints.
     */
    init() {
        this.irouter.get('/', this.renderAdminDashboard);
    }
}