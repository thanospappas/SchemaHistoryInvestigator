import {ApiRouter} from "./ApiRouter";
import {ProjectRouter} from "./ProjectRouter";
import {BuildRouter} from "./BuildRouter";
import {ReleaseRouter} from "./ReleaseRouter";
import {IndexRouter} from "./IndexRouter";
import {FilesAffectedRouter} from "./FilesAffectedRouter";
import {CommitRouter} from "./CommitRouter";
import * as express from 'express';
import {IssueRouter} from "./IssueRouter";
import {AuthorsRouter} from "./ProjectStatsRouter";
import {TransitionRouter} from "./TransitionRouter";
import {AdminDashboardRouter} from "./AdminDashboardRouter";
import {DatabaseConnection} from "../../models/DatabaseConnection";
/**
 * Created by thanosp on 17/4/2017.
 */

export class RouteManager{

    private routes:Array<ApiRouter>;
    database:DatabaseConnection;

    constructor(db:DatabaseConnection){
        this.routes = new Array<ApiRouter>();
        this.database = db;
    }

    createRoutes(expressApp: express.Application){
        let prouter = new ProjectRouter(this.database);
        let irouter = new IndexRouter();
        let arouter = new AdminDashboardRouter();

        this.routes.push(new BuildRouter(this.database));
        this.routes.push(new ReleaseRouter(this.database));
        this.routes.push(new FilesAffectedRouter(this.database));
        this.routes.push(new CommitRouter(true,this.database));
        this.routes.push(new IssueRouter(this.database));
        this.routes.push(new AuthorsRouter(this.database));
        this.routes.push(new TransitionRouter(this.database));

        prouter.init();
        irouter.init();
        arouter.init();

        for(let r of this.routes) {
            prouter.router.use(r.getPath(), r.router);
            r.init();
        }

        expressApp.use('/', irouter.irouter);
        expressApp.use('/admin', arouter.irouter);
        expressApp.use('/api/v1/projects', prouter.router);


    }

}